import { useEffect, useRef, useState } from 'react'
import { images, videos } from './data.js'
import { useLang } from './lang.jsx'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)

// Hex -> rgb helper voor het interpoleren van de sfeerkleur.
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Horizontale rustplek van het pak per chapter (in vw, 0 = midden).
const sideX = { center: 0, right: 20, left: -20 }
// Bij gecentreerde chapters staat het pak wat hoger, zodat het bijschrift
// eronder ruimte krijgt zonder te overlappen.
const sideY = { center: -11, right: 0, left: 0 }

/**
 * Scroll-gedreven productreis. Het pak (elan-bottle.png) is één doorlopend
 * element: het begint in de hero (links van het logo, licht gekanteld),
 * reist tijdens het scrollen naar het midden en gaat daar naadloos over in
 * de sticky journey-bottle die de vier hoofdstukken doorloopt.
 */
export default function BottleScroll() {
  const { t } = useLang()
  const journey = t.journey
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const bottleRef = useRef(null)
  const travelRef = useRef(null)
  const glowRef = useRef(null)
  const bgRef = useRef(null)
  const panelRefs = useRef([])
  const progRef = useRef(0)
  const topRef = useRef(Infinity)
  const bottomRef = useRef(Infinity)

  // Achtergrondvideo wisselt tussen landschap (desktop) en portret (mobiel).
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const on = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const jv = isMobile ? videos.journeyMobile : videos.journeyDesktop

  useEffect(() => {
    const section = sectionRef.current
    const bottle = bottleRef.current
    const travel = travelRef.current
    const glow = glowRef.current
    const stage = stageRef.current
    if (!section || !bottle) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const N = journey.length
    // Sfeerkleur per hoofdstuk (taal-onafhankelijk).
    const TINTS = journey.map((c) => hexToRgb(c.tint))
    // Ankers buiten de sectie: hero (start) en orbit-bottle (eindbestemming).
    const heroStage = document.querySelector('.hero-stage')
    const orbitImg = document.querySelector('.orbit-bottle')
    const orbitWrap = orbitImg?.closest('[data-depth]')
    // Voorkom een flits van de journey-bottle vóór de overdracht.
    bottle.style.opacity = '0'

    // Geometrie één keer meten (document-coördinaten) i.p.v. elke frame een
    // getBoundingClientRect — per-frame layout-reads veroorzaken jank op mobiel.
    const geo = { secTop: 0, secH: 1, heroCX: 0, heroCY: 0, orbCX: 0, orbCY: 0, orbH: 1, baseH: 1 }
    const measure = () => {
      const sy = window.scrollY
      const sr = section.getBoundingClientRect()
      geo.secTop = sr.top + sy
      geo.secH = sr.height
      if (heroStage) {
        const hr = heroStage.getBoundingClientRect()
        geo.heroCX = hr.left + hr.width / 2
        geo.heroCY = hr.top + sy + hr.height / 2
      }
      if (orbitImg) {
        const or = orbitImg.getBoundingClientRect()
        // huidige diepte-translatie eruit rekenen: die telt per frame apart mee
        const dt0 = orbitWrap ? parseFloat(orbitWrap.dataset.dt || '0') : 0
        geo.orbCX = or.left + or.width / 2
        geo.orbCY = or.top + sy + or.height / 2 - dt0
        geo.orbH = or.height
      }
      const ti = travel?.querySelector('img')
      geo.baseH = ti ? ti.offsetHeight : 1
      updateProgress()
    }

    const updateProgress = () => {
      const top = geo.secTop - window.scrollY
      topRef.current = top
      bottomRef.current = top + geo.secH
      progRef.current = clamp(-top / Math.max(1, geo.secH - window.innerHeight), 0, 1)
    }
    measure()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('load', measure)
    const remeasureT = setTimeout(measure, 1500)

    // Doel-x/-y per chapter (rustplek van het pak).
    const stops = journey.map((c) => sideX[c.side] ?? 0)
    const stopsY = journey.map((c) => sideY[c.side] ?? 0)

    let raf
    // Startwaarden = pose van chapter 0, zodat de overdracht naadloos is.
    let cx = 0, cy = sideY.center, cscale = 1, crot = 0
    // Gedempte pose van het reizende pak (px). Demping maakt schokkerige
    // (mobiele) scroll-events vloeiend; seeding bij fase-wissels houdt de
    // overdrachten naadloos.
    let tx = 0, ty = 0, tr = 0, ts = 1, seeded = false
    let mode = null // 'hero' | 'journey' | 'end' | 'orbit'
    let t0 = performance.now()

    const tick = (now) => {
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now
      const p = progRef.current
      const vw = window.innerWidth
      const vh = window.innerHeight
      // 0 = pak nog in de hero, 1 = journey-stage staat vast (sticky)
      const stickT = clamp(1 - topRef.current / vh, 0, 1)
      // 0 = journey nog bezig, 1 = journey volledig uit beeld (orbit bereikt)
      const endT = clamp((vh - bottomRef.current) / vh, 0, 1)
      const floatIdle = reduce ? 0 : Math.sin(now * 0.0011) * 10
      const mobile = vw <= 860
      // actuele scrollpositie, afgeleid — geen DOM-read in de frame-loop
      const sy = geo.secTop - topRef.current
      const kFast = reduce ? 1 : 1 - Math.pow(0.0008, dt)

      // Fase bepalen + pose doorzetten bij een wissel (naadloze overdracht).
      const m = stickT < 1 ? 'hero' : endT >= 1 ? 'orbit' : endT > 0 ? 'end' : 'journey'
      if (m !== mode) {
        const prev = mode
        mode = m
        if (m === 'journey' && (prev === 'hero' || prev === 'end')) {
          cx = (tx / vw) * 100
          cy = ((ty - floatIdle) / vh) * 100
          cscale = ts
          crot = tr
        } else if ((m === 'hero' || m === 'end') && prev === 'journey') {
          tx = (cx * vw) / 100
          ty = (cy * vh) / 100 + floatIdle
          ts = cscale
          tr = crot
          seeded = true
        } else if (m === 'end' && prev === 'orbit') {
          tx = geo.orbCX - vw / 2
          ty = geo.orbCY - sy - vh / 2
          ts = geo.orbH / Math.max(1, geo.baseH)
          tr = 0
          seeded = true
        }
      }

      if (travel) {
        if (m === 'hero' && heroStage) {
          // ── Fase 1: reis van hero naar journey ──
          // Op mobiel gecentreerd óver het logo (subtiele kanteling);
          // op desktop links ernaast met -30°.
          const heroOffX = (mobile ? -0.02 : -0.26) * vw
          const hx = geo.heroCX - vw / 2 + heroOffX
          const hy = geo.heroCY - sy - vh / 2 + (mobile ? -0.13 : 0.09) * vh
          const jy = topRef.current + sideY.center * vh / 100
          const e = smooth(stickT)
          const gx = lerp(hx, 0, e)
          const gy = lerp(hy, jy, e) + floatIdle
          const grot = lerp(mobile ? -14 : -30, 0, e)
          // in de hero iets kleiner; groeit tijdens de reis naar vol formaat
          const gs = lerp(mobile ? 0.56 : 0.68, 1.0, e)
          if (!seeded) { tx = gx; ty = gy; tr = grot; ts = gs; seeded = true }
          tx = lerp(tx, gx, kFast); ty = lerp(ty, gy, kFast)
          tr = lerp(tr, grot, kFast); ts = lerp(ts, gs, kFast)
          travel.style.opacity = '1'
          travel.style.transform =
            `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${tr.toFixed(2)}deg) scale(${ts.toFixed(3)})`
          bottle.style.opacity = '0'
          if (orbitImg) orbitImg.style.opacity = '0'
        } else if (m === 'orbit') {
          // ── Aangekomen: de orbit-bottle neemt het over ──
          travel.style.opacity = '0'
          bottle.style.opacity = '0'
          if (orbitImg) orbitImg.style.opacity = '1'
        } else if (m === 'end' && orbitImg) {
          // ── Fase 3: reis van journey-einde naar de orbit-sectie ──
          const wrapDt = orbitWrap ? parseFloat(orbitWrap.dataset.dt || '0') : 0
          const ox = geo.orbCX - vw / 2
          const oy = geo.orbCY - sy - vh / 2 + wrapDt
          const oscale = geo.orbH / Math.max(1, geo.baseH)
          const stageTop = bottomRef.current - vh // top van de (losgelaten) stage
          const e = smooth(endT)
          const gx = lerp(0, ox, e)
          const gy = lerp(stageTop + sideY.center * vh / 100, oy, e) + floatIdle * (1 - e)
          const gs = lerp(1.0, oscale, e)
          if (!seeded) { tx = gx; ty = gy; tr = 0; ts = gs; seeded = true }
          tx = lerp(tx, gx, kFast); ty = lerp(ty, gy, kFast)
          tr = lerp(tr, 0, kFast); ts = lerp(ts, gs, kFast)
          travel.style.opacity = '1'
          travel.style.transform =
            `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${tr.toFixed(2)}deg) scale(${ts.toFixed(3)})`
          bottle.style.opacity = '0'
          orbitImg.style.opacity = '0'
        } else {
          // ── Fase 2 actief: journey-bottle zichtbaar ──
          travel.style.opacity = '0'
          bottle.style.opacity = '1'
          if (orbitImg) orbitImg.style.opacity = '0'
        }
      }

      // ── Fase 2: de journey zelf ──
      // Chapter-positie (0..N-1) langs de reis.
      const fpos = p * (N - 1)
      const idx = clamp(Math.floor(fpos), 0, N - 1)
      const next = clamp(idx + 1, 0, N - 1)
      const frac = smooth(fpos - idx)

      // Doelwaarden voor het pak. Op mobiel staat het pak bij zij-chapters
      // iets hoger, zodat de tekst onderin vrij blijft.
      const yAt = (i) => (mobile && journey[i].side !== 'center') ? -6 : stopsY[i]
      const targetX = lerp(stops[idx], stops[next], frac)
      const targetY = lerp(yAt(idx), yAt(next), frac)
      // groeit naar het midden van elk chapter, krimpt op de overgang
      const breathe = Math.sin(fpos * Math.PI) * 0.5 + 0.5
      const targetScale = lerp(0.92, 1.08, breathe)
      // kantelt licht in de richting waarin het beweegt
      const targetRot = clamp((stops[next] - stops[idx]) * 0.12, -7, 7) * (0.3 + 0.7 * Math.sin(frac * Math.PI))
      const floatY = floatIdle

      const k = reduce ? 1 : 1 - Math.pow(0.002, dt)
      cx = lerp(cx, targetX, k)
      cy = lerp(cy, targetY, k)
      cscale = lerp(cscale, targetScale, k)
      crot = lerp(crot, targetRot, k)

      bottle.style.transform =
        `translate3d(calc(-50% + ${cx.toFixed(2)}vw), calc(-50% + ${cy.toFixed(2)}vh + ${floatY.toFixed(1)}px), 0) rotate(${crot.toFixed(2)}deg) scale(${cscale.toFixed(3)})`
      if (glow) {
        glow.style.transform = `translate3d(calc(-50% + ${cx.toFixed(2)}vw), calc(-50% + ${cy.toFixed(2)}vh), 0) scale(${cscale.toFixed(3)})`
      }
      // Achtergrond zoomt traag en drijft licht tegen de scrollrichting in.
      // bgRef vers uitlezen zodat het ook klopt na een desktop/mobiel-wissel.
      const bgEl = bgRef.current
      if (bgEl) {
        bgEl.style.transform = `scale(${(1.12 + p * 0.10).toFixed(4)}) translateY(${(p * -3).toFixed(2)}%)`
      }

      // Sfeerkleur interpoleren tussen twee chapters.
      const a = TINTS[idx], b = TINTS[next]
      const r = Math.round(lerp(a[0], b[0], frac))
      const g = Math.round(lerp(a[1], b[1], frac))
      const bl = Math.round(lerp(a[2], b[2], frac))
      if (stage) stage.style.setProperty('--tint', `${r}, ${g}, ${bl}`)

      // Panelen faden op basis van afstand tot hun chapter-centrum. Het basis-
      // centreren (translate) blijft behouden, anders springt het paneel weg.
      // Tekst van chapter 0 fade-t pas in als het pak is aangekomen.
      const gate = stickT < 1 ? stickT * stickT * stickT : 1
      panelRefs.current.forEach((el, i) => {
        if (!el) return
        const side = journey[i].side
        const d = Math.abs(fpos - i)
        const vis = clamp(1 - d * 1.6, 0, 1) * gate
        const rev = (1 - vis) * 26
        el.style.opacity = vis.toFixed(3)
        // Op mobiel staan alle panelen onderin gecentreerd (zie media query).
        if (side === 'center' || mobile) {
          el.style.transform = `translate(-50%, ${rev.toFixed(1)}px)`
        } else {
          const from = side === 'right' ? -1 : 1
          const x = (1 - vis) * from * 26
          el.style.transform = `translateY(calc(-50% + ${rev.toFixed(1)}px)) translateX(${x.toFixed(1)}px)`
        }
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(remeasureT)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', measure)
      window.removeEventListener('load', measure)
    }
  }, [])

  return (
    <>
      {/* Reizend pak: hero → journey (fixed, achter de teksten langs) */}
      <div className="travel-bottle" ref={travelRef} aria-hidden>
        <img src={images.bottle} alt="" draggable="false" />
      </div>
      <section className="journey" ref={sectionRef}>
      <div className="journey-stage" ref={stageRef}>
        {/* Kokospalmen-landschap: landschap op desktop, portret op mobiel */}
        <div className="journey-bg">
          <video
            key={isMobile ? 'm' : 'd'}
            ref={bgRef}
            src={jv.src}
            poster={jv.poster}
            autoPlay muted loop playsInline
          />
        </div>
        <div className="journey-tint" aria-hidden />
        <div className="journey-atmos" aria-hidden />

        {/* Voorgrond-palmen — dichtbij, licht geblurd voor diepte */}
        <img src={images.palm} alt="" aria-hidden className="palm j-palm-a palm-blur" draggable="false" />
        <img src={images.palm} alt="" aria-hidden className="palm j-palm-b" draggable="false" />

        <div className="journey-glow" ref={glowRef} aria-hidden />
        <img
          ref={bottleRef}
          className="journey-bottle"
          src={images.bottle}
          alt="ÉLAN 100% Pure Coconut Water"
        />

        <div className="journey-panels">
          {journey.map((c, i) => (
            <article
              key={c.n}
              className={`journey-panel side-${c.side}`}
              ref={(el) => (panelRefs.current[i] = el)}
            >
              <span className="j-num">{c.n}</span>
              <span className="eyebrow light">{c.eyebrow}</span>
              <h2 className="j-title">{c.title.replace(/\n/g, ' ')}</h2>
              <p className="j-body">{c.body}</p>
            </article>
          ))}
        </div>

        <div className="journey-progress" aria-hidden>
          {journey.map((c) => <i key={c.n} />)}
        </div>
      </div>
      </section>
    </>
  )
}
