import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { images, videos, socialFeedImages, WEB3FORMS_KEY, reviews, GOOGLE_REVIEW_URL, SITE_URL } from './data.js'
import { useLang } from './lang.jsx'
import BottleScroll from './BottleScroll.jsx'

/* Social iconen */
function IgIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" />
    </svg>
  )
}
function TtIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 3c.3 2.2 1.7 3.9 3.9 4.2v2.8c-1.4.1-2.7-.3-3.9-1v5.9c0 3.4-2.6 5.9-5.9 5.9-3 0-5.6-2.3-5.6-5.5 0-3.4 3-6 6.5-5.4v2.9c-.4-.1-.9-.2-1.3-.2-1.6 0-2.6 1.3-2.4 2.9.2 1.3 1.4 2 2.5 2 1.5 0 2.6-1.1 2.6-2.7V3h3.1z" />
    </svg>
  )
}
function FbIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  )
}

/* Google "G" in de officiële vier kleuren — blijft leesbaar op ivoor. */
function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.56-5.15 3.56-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3a7.2 7.2 0 0 1-10.72-3.78H1.4v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.35 14.3a7.1 7.1 0 0 1 0-4.6V6.62H1.4a12 12 0 0 0 0 10.77l3.95-3.08z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.4 6.62l3.95 3.08A7.16 7.16 0 0 1 12 4.75z" />
    </svg>
  )
}

const FindUs = lazy(() => import('./FindUs.jsx'))
const Shop = lazy(() => import('./Shop.jsx'))

/* Lichte hash-routing */
function useHashRoute() {
  const [hash, setHash] = useState(typeof window !== 'undefined' ? window.location.hash : '')
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

/* Scroll-reveal. `route` als dependency zodat de observer na een route-wissel
   (bijv. terug van Find Us/Shop) de opnieuw ge-mounte .reveal-elementen weer
   observeert — anders blijven die op opacity:0 hangen (onzichtbare hero). */
function useScrollReveal(route) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    const observe = (node) => {
      if (node.nodeType !== 1) return
      if (node.classList.contains('reveal') && !node.classList.contains('in')) io.observe(node)
      node.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    }
    observe(document.body)

    /* Elementen die later pas verschijnen — de reviews komen van /api/reviews
       en zijn er dus nog niet bij het opzetten hierboven — moeten alsnog
       aangemeld worden. Zonder deze bewaking blijven ze op opacity:0 staan:
       wel in de pagina, maar onzichtbaar. */
    const mo = new MutationObserver((mutaties) => {
      mutaties.forEach((m) => m.addedNodes.forEach(observe))
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => { io.disconnect(); mo.disconnect() }
  }, [route])
}

/* Diepte-parallax: elementen met [data-depth] schuiven t.o.v. het schermmidden. */
function useDepth(route) {
  useEffect(() => {
    const els = [...document.querySelectorAll('[data-depth]')]
    let ticking = false
    const update = () => {
      const vh = window.innerHeight
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.bottom < -500 || r.top > vh + 500) continue
        const prev = parseFloat(el.dataset.dt || '0')
        const center = r.top - prev + r.height / 2 - vh / 2
        const speed = parseFloat(el.dataset.depth)
        const t = center * speed
        el.style.transform = `translate3d(0, ${t.toFixed(1)}px, 0) ${el.dataset.depthExtra || ''}`
        el.dataset.dt = t
      }
      ticking = false
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [route])
}

/* Voortgangsbalk bovenaan de pagina */
function useScrollBar(route) {
  useEffect(() => {
    const bar = document.querySelector('.scrollbar')
    if (!bar) return
    let ticking = false
    const update = () => {
      const h = document.documentElement
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)
      bar.style.transform = `scaleX(${p})`
      ticking = false
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [route])
}

/* Naar boven scrollen bij routewissel (subpagina's). */
function useScrollTop(dep) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }) }, [dep])
}

/* Handgetekende pijl (Insta-stijl) */
function Arrow({ dir = 'r', className = '' }) {
  return (
    <svg className={`arrow arrow-${dir} ${className}`} viewBox="0 0 120 60" fill="none">
      <path d="M6 10 C 52 2, 26 52, 98 44" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M98 44 l -12 -9 M98 44 l -14 4" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/* Palmblad-asset met diepte */
function Palm({ className, depth, extra, blur }) {
  return (
    <img
      src={images.palm}
      alt=""
      aria-hidden
      className={`palm ${className || ''} ${blur ? 'palm-blur' : ''}`}
      data-depth={depth}
      data-depth-extra={extra}
      draggable="false"
    />
  )
}

/* Taal-schakelaar NL / EN */
function LangToggle({ solid }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`lang-toggle ${solid ? 'solid' : 'light'}`} role="group" aria-label="Taal / Language">
      <button className={lang === 'nl' ? 'active' : ''} onClick={() => setLang('nl')} aria-pressed={lang === 'nl'}>NL</button>
      <span aria-hidden>/</span>
      <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
    </div>
  )
}

export function Header({ forceSolid = false }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (forceSolid) { setScrolled(true); return }
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [forceSolid])
  const solid = forceSolid || scrolled
  return (
    <header className={`header ${solid ? 'solid' : 'transparent'}`}>
      <div className="scrollbar" />
      <div className="container header-inner">
        <a href="#top" className="logo" aria-label="ÉLAN home">
          <img src={solid ? '/elan-logo-black.svg' : '/elan-logo-light.svg'} alt="ÉLAN" />
        </a>
        <nav className={`nav ${open ? 'open' : ''}`}>
          {t.nav.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <LangToggle solid={solid} />
          <a href="#/shop" className="btn btn-primary btn-sm">{t.ui.shop}</a>
          <a href="#/find-us" className="btn btn-outline btn-sm">{t.ui.findUs}</a>
          <button className="menu-toggle" aria-label="Menu" onClick={() => setOpen((o) => !o)}>☰</button>
        </div>
      </div>
    </header>
  )
}

/* ============ HERO — oceaanvideo + muis/scroll-diepte ============ */
function Hero() {
  const { t } = useLang()
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return
    let raf = 0
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', x.toFixed(3))
        el.style.setProperty('--my', y.toFixed(3))
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-media">
        <video src={videos.ocean.src} poster={videos.ocean.poster} autoPlay muted loop playsInline />
        <div className="hero-rays" aria-hidden />
        <div className="hero-overlay" aria-hidden />
      </div>

      <img src={images.palm} alt="" aria-hidden className="palm hero-palm-a" draggable="false" />
      <img src={images.palm} alt="" aria-hidden className="palm hero-palm-b" draggable="false" />
      <img src={images.palm} alt="" aria-hidden className="palm hero-palm-c palm-blur" draggable="false" />

      <div className="hero-content reveal">
        <span className="hero-eyebrow">{t.hero.eyebrow}</span>
        <div className="hero-stage">
          <h1 className="wordmark">
            <img src="/elan-logo-light.svg" alt="ÉLAN" />
          </h1>
          <div className="hero-script">
            <span className="script">{t.hero.script}</span>
            <Arrow dir="rd" />
          </div>
        </div>
        <p className="hero-tag">{t.hero.tagline}</p>
        <p className="hero-sub">{t.hero.sub}</p>
        <div className="hero-cta">
          <a href="#/shop" className="btn btn-light">{t.ui.shopElan}</a>
          <a href="#product" className="btn btn-ghost">{t.hero.cta} →</a>
        </div>
      </div>
      <a href="#product" className="scroll-cue" aria-label={t.ui.scroll}>
        <span>{t.ui.scroll}</span><i>↓</i>
      </a>
    </section>
  )
}

function Marquee() {
  const { t } = useLang()
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {[...t.marquee, ...t.marquee].map((txt, i) => (
          <span key={i} className={i % 2 ? 'script' : 'serif'}>{txt}<b>✦</b></span>
        ))}
      </div>
    </div>
  )
}

/* ============ Benefits-constellatie (Insta-stijl) ============ */
function Orbit() {
  const { t } = useLang()
  return (
    <section className="orbit" id="why">
      <Palm className="orbit-palm-a" depth="-0.10" extra="rotate(148deg) scaleX(-1)" blur />
      <div className="orbit-head reveal">
        <span className="script script-lg">{t.orbit.script}</span>
        <h2 className="display">{t.orbit.title}</h2>
      </div>
      <div className="orbit-stage">
        <div className="orbit-bottle-wrap" data-depth="-0.04">
          <img className="orbit-bottle" src={images.bottle} alt="ÉLAN pak met benefits" />
        </div>
        {t.orbit.labels.map((l, i) => (
          <div key={l.pos} className={`orbit-label ${l.pos} reveal`} style={{ '--d': `${i * 90}ms` }}>
            <span className="script">
              {l.text.split('\n').map((line, k) => <span key={k}>{line}</span>)}
            </span>
            <Arrow dir={l.arrow} />
          </div>
        ))}
        <img src={images.coconut} alt="" aria-hidden className="orbit-coconut" data-depth="-0.12" draggable="false" />
      </div>
    </section>
  )
}

/* ============ Video-band die uitvouwt tijdens scroll ============ */
function VideoBand() {
  const { t } = useLang()
  const secRef = useRef(null)
  const frameRef = useRef(null)
  const capRef = useRef(null)
  useEffect(() => {
    const sec = secRef.current, frame = frameRef.current, cap = capRef.current
    if (!sec || !frame) return
    let ticking = false
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const update = () => {
      const r = sec.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = clamp(-r.top / Math.max(1, total), 0, 1)
      const g = ease(clamp(p * 1.5, 0, 1))
      const scale = 0.55 + g * 0.45
      const radius = 36 * (1 - g)
      frame.style.transform = `scale(${scale.toFixed(4)})`
      frame.style.borderRadius = `${radius.toFixed(1)}px`
      if (cap) {
        const cv = clamp((p - 0.45) * 3.2, 0, 1)
        cap.style.opacity = cv.toFixed(3)
        cap.style.transform = `translateY(${((1 - cv) * 28).toFixed(1)}px)`
      }
      ticking = false
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <section className="vband" ref={secRef}>
      <div className="vband-sticky">
        <div className="vband-frame" ref={frameRef}>
          <video src={videos.coconut.src} poster={videos.coconut.poster} autoPlay muted loop playsInline />
          <div className="vband-shade" />
          <div className="vband-caption" ref={capRef}>
            <span className="script script-lg">{t.videoBand.script}</span>
            <h2 className="display light">{t.videoBand.title}</h2>
            <p className="lead light">{t.videoBand.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============ The Meaning (plaster/terracotta split) ============ */
function Meaning() {
  const { t } = useLang()
  return (
    <section className="section sec-meaning" id="meaning">
      <div className="container meaning-grid">
        <div className="meaning-copy reveal">
          <span className="script script-xl">{t.meaning.script}</span>
          <h2 className="display">{t.meaning.title}</h2>
          <p className="lead">{t.meaning.body}</p>
          <p className="lead">{t.meaning.body2}</p>
          <div className="stats">
            {t.meaning.stats.map(([a, b]) => (
              <div key={a}><strong>{a}</strong><span>{b}</span></div>
            ))}
          </div>
        </div>
        <div className="meaning-media meaning-media-logo reveal">
          <img src="/elan-logo-black.svg" alt="ÉLAN" className="meaning-logo" data-depth="0.05" />
        </div>
      </div>
    </section>
  )
}

/* ============ Nutrition — donker glas op jungle ============ */
function Nutrition() {
  const { t } = useLang()
  const n = t.nutrition
  return (
    <section className="section sec-nutrition">
      <div className="nutrition-bg" aria-hidden data-depth="0.08">
        <img src={images.coconuts} alt="" />
      </div>
      <div className="nutrition-shade" aria-hidden />
      <div className="container nutrition-grid">
        <div className="nutrition-copy reveal">
          <span className="script script-lg">{n.script}</span>
          <h2 className="display light">{n.title}</h2>
          <p className="lead light">{n.lead}</p>
          <div className="stats light">
            {n.stats.map(([a, b]) => (
              <div key={a}><strong>{a}</strong><span>{b}</span></div>
            ))}
          </div>
        </div>
        <div className="glass-card nutrition-card reveal">
          <div className="nc-head">
            <span>{n.eyebrow}</span>
            <small>{n.per}</small>
          </div>
          <ul className="nc-rows">
            {n.rows.map((r) => (
              <li key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></li>
            ))}
          </ul>
          <span className="nc-badge">{n.badge}</span>
        </div>
      </div>
      <Palm className="nutrition-palm" depth="-0.13" extra="rotate(132deg)" blur />
    </section>
  )
}

/* ============ Beach band (hammock) — met ÉLAN in cijfers ============ */
function Beach() {
  const { t } = useLang()
  return (
    <section className="beach">
      <div className="beach-media" aria-hidden data-depth="0.08">
        <video src={videos.movement.src} poster={videos.movement.poster} autoPlay muted loop playsInline />
      </div>
      <div className="beach-shade" aria-hidden />
      <div className="container beach-inner">
        <div className="glass-card beach-card beach-figures reveal">
          <span className="script script-xl">{t.beach.script}</span>
          <h2 className="display light">{t.stats.title}</h2>
          <div className="figures-grid">
            {t.stats.items.map(([a, b], i) => (
              <div key={i} className="figure" style={{ '--d': `${i * 90}ms` }}>
                <strong>{a}</strong><span>{b}</span>
              </div>
            ))}
          </div>
          <p className="figures-foot">{t.stats.foot}</p>
          {t.stats.sub && <p className="figures-sub">{t.stats.sub}</p>}
        </div>
      </div>
    </section>
  )
}

/* ============ Fridge — dagelijks ritueel ============ */
function Fridge() {
  const { t } = useLang()
  return (
    <section className="section sec-fridge">
      <div className="container split reverse">
        <div className="fridge-media reveal">
          <div className="frame" data-depth="0.05">
            <img src={images.fridge} alt="ÉLAN in de koelkast" data-depth="0.07" />
          </div>
          <img src={images.coconut} alt="" aria-hidden className="fridge-coconut" data-depth="-0.05" draggable="false" />
        </div>
        <div className="split-text reveal">
          <span className="eyebrow">{t.fridge.eyebrow}</span>
          <span className="script script-lg clay">{t.fridge.script}</span>
          <h2 className="display">{t.fridge.title}</h2>
          <p className="lead">{t.fridge.body}</p>
          <ul className="benefits">
            {t.fridge.benefits.map((b) => (
              <li key={b}><span className="tick">✓</span>{b}</li>
            ))}
          </ul>
          <a href="#/find-us" className="btn btn-primary" style={{ marginTop: 28 }}>{t.fridge.cta}</a>
        </div>
      </div>
    </section>
  )
}

/* Verkooppunt-logo's (taal-onafhankelijk). Zwarte line-art én full-color logo's
   staan op de lichte ivoor-tegels. */
const availabilityLogos = [
  { src: '/logos/plus.png', alt: 'PLUS' },
  { src: '/logos/spar.png', alt: 'SPAR' },
  { src: '/logos/boons-markt.svg', alt: "Boon's Markt" },
  { src: '/logos/warung-mini.png', alt: 'Warung Mini' },
  { src: '/logos/supergym.png', alt: 'SuperGym' },
  { src: '/logos/ballinfit.png', alt: 'Ballin Fit' },
  { src: '/logos/bgs-nutrition.avif', alt: 'BGS Nutrition' },
]

/* ============ Verkrijgbaarheid — Beschikbaar bij ============ */
function Availability() {
  const { t } = useLang()
  return (
    <section className="section sec-availability">
      <div className="container availability-inner reveal">
        <span className="script script-lg">{t.availability.script}</span>
        <h2 className="display">{t.availability.title}</h2>
        <ul className="availability-logos">
          {availabilityLogos.map((logo, i) => (
            <li key={logo.alt} style={{ '--d': `${i * 70}ms` }}>
              <img src={logo.src} alt={logo.alt} loading="lazy" />
            </li>
          ))}
        </ul>
        <a href="#/find-us" className="btn btn-primary">{t.availability.cta} →</a>
      </div>
    </section>
  )
}

/* ============ Reviews — klantbeoordelingen + eigen reviewformulier ============ */

const STAR_PATH = 'M10 0.6l2.72 5.9 6.42.72-4.79 4.36 1.3 6.33L10 14.65 4.35 17.9l1.3-6.32L.86 7.22l6.42-.72z'

/* Vaste 5-sterrenweergave (read-only). */
function Stars({ value, className = '' }) {
  return (
    <span className={`stars ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 18" className={`star${n <= Math.round(value) ? ' on' : ''}`}>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  )
}

/* Sterren als radiogroep — toetsenbord-toegankelijk via de echte inputs.
   Bewust géén `required`: de inputs zijn visueel verborgen, en de browser kan
   zijn foutmelding niet tonen bij een veld dat hij niet kan aanwijzen. Het
   versturen zou dan zonder zichtbare reden geblokkeerd worden. De controle
   gebeurt daarom in onSubmit, met een eigen melding. */
function RatingInput({ label, value, onChange, hint }) {
  return (
    <fieldset className="rating-input">
      <legend>{label}</legend>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= value ? 'on' : ''}>
            <input
              type="radio" name="rating" value={n}
              checked={value === n} onChange={() => onChange(n)}
            />
            <svg viewBox="0 0 20 18" aria-hidden="true"><path d={STAR_PATH} /></svg>
            <span className="sr-only">{n} / 5</span>
          </label>
        ))}
      </div>
      {hint && <span className="rating-hint" role="alert">{hint}</span>}
    </fieldset>
  )
}

function ReviewCard({ review, locale, style }) {
  const when = review.date
    ? new Date(review.date).toLocaleDateString(locale, { year: 'numeric', month: 'long' })
    : null
  return (
    <li className="review-card reveal" style={style}>
      <Stars value={review.rating} />
      <p className="review-text">{review.text}</p>
      <p className="review-meta">
        <strong>{review.name}</strong>
        {review.place && <span> · {review.place}</span>}
        {when && <span> · {when}</span>}
      </p>
    </li>
  )
}

function Reviews() {
  const { t, lang } = useLang()
  const r = t.reviews
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hint, setHint] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | ok | error

  /* Goedgekeurde reviews komen van /api/reviews. De lijst uit data.js is de
     val-terug voor als de API onbereikbaar is. Een geslaagd antwoord is altijd
     leidend, ook als het leeg is — anders blijven verwijderde reviews staan. */
  const [list, setList] = useState(reviews)
  useEffect(() => {
    let alive = true
    fetch('/api/reviews')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (alive && json && Array.isArray(json.reviews)) setList(json.reviews)
      })
      .catch(() => { /* stil: val terug op data.js */ })
    return () => { alive = false }
  }, [])

  const count = list.length
  const avg = count
    ? Math.round((list.reduce((sum, x) => sum + x.rating, 0) / count) * 10) / 10
    : 0

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    if (payload.botcheck) return
    if (!rating) { setHint(r.form.ratingRequired); return }
    setHint('')
    setStatus('sending')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) { setStatus('ok'); form.reset(); setRating(0) }
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const pickRating = (n) => { setRating(n); setHint('') }

  /* Koppelt de reviews aan het bestaande Product-knooppunt uit index.html
     (zelfde @id → schema.org voegt de knopen samen). Alleen renderen als er
     écht reviews op de pagina staan: Google eist dat de markup overeenkomt
     met wat de bezoeker ziet. */
  const jsonLd = count ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/#product`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg,
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    },
    review: list.map((x) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: x.name },
      reviewRating: { '@type': 'Rating', ratingValue: x.rating, bestRating: 5, worstRating: 1 },
      reviewBody: x.text,
      ...(x.date ? { datePublished: x.date } : {}),
    })),
  } : null

  return (
    <section className="section sec-reviews" id="reviews">
      <div className="container reviews-inner">
        <div className="reviews-head reveal">
          <span className="script script-lg">{r.script}</span>
          <h2 className="display">{r.title}</h2>
          {count > 0 ? (
            <p className="reviews-summary">
              <Stars value={avg} className="stars-lg" />
              <span>{r.summary(avg.toFixed(1).replace('.', lang === 'nl' ? ',' : '.'), count)}</span>
            </p>
          ) : (
            <p className="lead center narrow">{r.body}</p>
          )}
        </div>

        {count > 0 ? (
          <ul className="review-grid">
            {list.map((x, i) => (
              <ReviewCard
                key={`${x.name}-${i}`}
                review={x}
                locale={lang === 'nl' ? 'nl-NL' : 'en-GB'}
                style={{ '--d': `${i * 80}ms` }}
              />
            ))}
          </ul>
        ) : (
          <p className="reviews-empty reveal">{r.empty}</p>
        )}

        <div className="reviews-actions reveal">
          {!open && status !== 'ok' && (
            <button className="btn btn-primary" onClick={() => setOpen(true)}>{r.writeCta}</button>
          )}
          {GOOGLE_REVIEW_URL && (
            <a className="btn btn-outline" href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
              <GoogleIcon className="g-ico" /> {r.googleCta}
            </a>
          )}
        </div>

        {status === 'ok' ? (
          <div className="review-form review-sent">
            <span className="script script-lg">{r.form.okScript}</span>
            <h3>{r.form.okTitle}</h3>
            <p>{r.form.okBody}</p>
            <button className="btn btn-outline" onClick={() => { setStatus('idle'); setOpen(true) }}>
              {r.form.okAgain}
            </button>
          </div>
        ) : open && (
          <form className="review-form" onSubmit={onSubmit}>
            <RatingInput label={r.form.rating} value={rating} onChange={pickRating} hint={hint} />
            <div className="review-row">
              <input type="text" name="name" placeholder={r.form.name} required />
              <input type="text" name="place" placeholder={r.form.place} />
            </div>
            <input type="email" name="email" placeholder={r.form.email} required />
            <textarea name="message" placeholder={r.form.message} rows="4" required />
            <input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} />
            <div className="review-row review-row-btns">
              <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? r.form.sending : r.form.send}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setOpen(false)}>
                {r.cancel}
              </button>
            </div>
            {status === 'error' ? (
              <span className="form-note form-error">
                {r.form.errorPre}<a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>.
              </span>
            ) : (
              <span className="form-note">{r.form.privacy}</span>
            )}
          </form>
        )}
      </div>

      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </section>
  )
}

/* ============ Story-teaser → linkt naar Ons verhaal ============ */
function StoryTeaser() {
  const { t } = useLang()
  return (
    <section className="section sec-story" id="story">
      <div className="story-bg" aria-hidden>
        <img src="/story-plantation.jpg" alt="" data-depth="0.08" />
      </div>
      <div className="container story-inner reveal">
        <span className="script script-xl">{t.story.script}</span>
        <h2 className="display center light">{t.story.title}</h2>
        <p className="lead center narrow light">{t.story.body}</p>
        <a href="#/ons-verhaal" className="btn btn-light" style={{ marginTop: 26 }}>{t.story.cta} →</a>
      </div>
    </section>
  )
}

function Contact() {
  const { t } = useLang()
  const c = t.contact
  const [status, setStatus] = useState('idle') // idle | sending | ok | error

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    if (payload.botcheck) return
    payload.access_key = WEB3FORMS_KEY
    payload.subject = 'Nieuw bericht via drinkelan.com'
    payload.from_name = 'ÉLAN website'
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) { setStatus('ok'); form.reset() }
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section sec-contact" id="contact">
      <div className="container split">
        <div className="split-text reveal">
          <span className="eyebrow">{c.title}</span>
          <h2 className="display">{c.heading}</h2>
          <div className="contact-details">
            <p><strong>{c.company}</strong></p>
            {c.address.map((l) => <p key={l}>{l}</p>)}
            <p><a href={`mailto:${c.email}`}>{c.email}</a></p>
            <p><a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a></p>
            <p className="contact-legal">{c.kvk}</p>
          </div>
          <div className="contact-socials">
            <a href={t.socials.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IgIcon className="social-ico" /></a>
            <a href={t.socials.tiktok.url} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TtIcon className="social-ico" /></a>
            <a href={t.socials.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FbIcon className="social-ico" /></a>
          </div>
        </div>
        {status === 'ok' ? (
          <div className="contact-form contact-sent">
            <span className="script script-lg">{c.form.okScript}</span>
            <h3>{c.form.okTitle}</h3>
            <p>{c.form.okBody}</p>
            <button className="btn btn-outline" onClick={() => setStatus('idle')}>{c.form.okAgain}</button>
          </div>
        ) : (
          <form className="contact-form reveal" onSubmit={onSubmit}>
            <input type="text" name="name" placeholder={c.form.name} required />
            <input type="email" name="email" placeholder={c.form.email} required />
            <textarea name="message" placeholder={c.form.message} rows="4" required />
            <input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} />
            <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? c.form.sending : c.form.send}
            </button>
            {status === 'error' && (
              <span className="form-note form-error">
                {c.form.errorPre}<a href={`mailto:${c.email}`}>{c.email}</a>.
              </span>
            )}
            {status !== 'error' && (
              <span className="form-note">{c.form.privacy}</span>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

function Social() {
  const { t } = useLang()
  const s = t.socials
  return (
    <section className="sec-social" id="social">
      <div className="container social-head reveal">
        <span className="script script-lg">{s.script}</span>
        <h2 className="display light">{s.title}</h2>
        <p className="lead light">{s.body}</p>
        <div className="social-handles">
          <a className="social-btn" href={s.instagram.url} target="_blank" rel="noopener noreferrer">
            <IgIcon className="social-ico" /> {s.instagram.handle}
          </a>
          <a className="social-btn" href={s.tiktok.url} target="_blank" rel="noopener noreferrer">
            <TtIcon className="social-ico" /> {s.tiktok.handle}
          </a>
          <a className="social-btn" href={s.facebook.url} target="_blank" rel="noopener noreferrer">
            <FbIcon className="social-ico" /> {s.facebook.handle}
          </a>
        </div>
      </div>

      <div className="social-feed reveal">
        {s.feed.map((post, i) => (
          <a
            key={i}
            className="social-post"
            href={s.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ '--d': `${i * 80}ms` }}
          >
            <img src={socialFeedImages[i]} alt={`ÉLAN op Instagram: ${post.cap}`} loading="lazy" />
            <span className="social-post-ig"><IgIcon /></span>
          </a>
        ))}
      </div>
    </section>
  )
}

export function Footer() {
  const { t } = useLang()
  const f = t.footer
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a href="#top" className="logo" aria-label="ÉLAN home">
          <img src="/elan-logo-light.svg" alt="ÉLAN" />
        </a>
        <div className="footer-socials">
          <a href={t.socials.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <IgIcon /> <span>{t.socials.instagram.handle}</span>
          </a>
          <a href={t.socials.tiktok.url} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <TtIcon /> <span>{t.socials.tiktok.handle}</span>
          </a>
          <a href={t.socials.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FbIcon /> <span>{t.socials.facebook.handle}</span>
          </a>
        </div>
        <nav className="footer-nav">
          {t.nav.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}
          <a href="#reviews">{t.reviews.title}</a>
          <a href="#social">Social</a>
        </nav>
        <nav className="footer-legal">
          {f.legal.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <p className="footer-company">{f.company}</p>
        <p className="footer-copy">{f.copy(year)}</p>
      </div>
    </footer>
  )
}

/* ============ Ons verhaal — aparte pagina ============ */
function OurStory() {
  const { t } = useLang()
  const o = t.ourStory
  useScrollTop('story')
  return (
    <>
      <div className="grain" aria-hidden />
      <Header forceSolid />
      <main className="story-page">
        <section className="story-hero">
          <div className="story-hero-media" aria-hidden>
            <img src={images.story} alt="Bryan & Isabel, ÉLAN" />
            <div className="story-hero-shade" />
          </div>
          <img src={images.palm} alt="" aria-hidden className="palm story-hero-palm" draggable="false" />
          <div className="container story-hero-inner reveal">
            <span className="script script-xl">{o.script}</span>
            <h1 className="display light">{o.lead}</h1>
          </div>
        </section>

        <section className="section story-body">
          <div className="container narrow-col">
            {o.intro.map((p, i) => (
              <p key={i} className={`story-para reveal ${i === 2 ? 'story-accent' : ''}`}>{p}</p>
            ))}

            {o.sections.map((sec, i) => (
              <div key={i} className="story-block reveal">
                <h2 className="story-h2">{sec.heading}</h2>
                {sec.body.map((p, k) => <p key={k} className="story-para">{p}</p>)}
                {sec.list && (
                  <ul className="benefits story-list">
                    {sec.list.map((li) => <li key={li}><span className="tick">✓</span>{li}</li>)}
                  </ul>
                )}
                {sec.after && sec.after.map((p, k) => <p key={k} className="story-para story-accent">{p}</p>)}
              </div>
            ))}

            <div className="story-block reveal">
              {o.outro.map((p, k) => <p key={k} className="story-para">{p}</p>)}
              <p className="story-closer script script-lg">{o.closer}</p>
              <a href="#/shop" className="btn btn-primary" style={{ marginTop: 8 }}>{o.cta} →</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

/* ============ Juridische mockup-pagina ============ */
function LegalPage({ data }) {
  const { t } = useLang()
  useScrollTop(data.title)
  return (
    <>
      <div className="grain" aria-hidden />
      <Header forceSolid />
      <main className="legal-page">
        <section className="section">
          <div className="container narrow-col">
            <a href="#top" className="shop-back">← {t.ui.home}</a>
            <h1 className="display legal-title">{data.title}</h1>
            <p className="legal-updated">{data.updated}</p>
            {data.mock && <p className="legal-mock">{data.intro}</p>}
            {data.sections.map(([h, body], i) => (
              <div key={i} className="legal-block reveal">
                <h2 className="story-h2">{h}</h2>
                <p className="story-para">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

const LEGAL_ROUTES = {
  '#/privacy': 'privacy',
  '#/voorwaarden': 'voorwaarden',
  '#/retourbeleid': 'retourbeleid',
  '#/cookiebeleid': 'cookiebeleid',
}

export default function App() {
  const { t } = useLang()
  const hash = useHashRoute()
  const base = hash.split('?')[0]
  const isStory = base.startsWith('#/ons-verhaal') || base.startsWith('#/our-story')
  const legalKey = LEGAL_ROUTES[base]

  const route = hash.startsWith('#/find-us') ? 'findus'
    : hash.startsWith('#/shop') ? 'shop'
    : isStory ? 'story'
    : legalKey ? 'legal'
    : 'main'

  useScrollReveal(route)
  useDepth(route)
  useScrollBar(route)

  if (hash.startsWith('#/find-us')) {
    return (
      <Suspense fallback={<div className="globe-loading">{t.findus.loading}</div>}>
        <FindUs />
      </Suspense>
    )
  }

  if (hash.startsWith('#/shop')) {
    return (
      <Suspense fallback={<div className="globe-loading">{t.shop.loading}</div>}>
        <Shop hash={hash} />
      </Suspense>
    )
  }

  if (isStory) return <OurStory />
  if (legalKey) return <LegalPage data={t.legal[legalKey]} />

  return (
    <>
      <div className="grain" aria-hidden />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <div id="product"><BottleScroll /></div>
        <Orbit />
        <VideoBand />
        <Meaning />
        <Nutrition />
        <Beach />
        <Fridge />
        <Availability />
        <Reviews />
        <StoryTeaser />
        <Contact />
        <Social />
      </main>
      <Footer />
    </>
  )
}
