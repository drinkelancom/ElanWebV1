import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import {
  images, videos, nav, hero, marquee, orbit, videoBand, meaning,
  nutrition, beach, fridge, story, contact,
} from './data.js'
import BottleScroll from './BottleScroll.jsx'

const FindUs = lazy(() => import('./FindUs.jsx'))

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

/* Scroll-reveal */
function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* Diepte-parallax: elementen met [data-depth] schuiven t.o.v. het schermmidden.
   Positief = achtergrond (beweegt mee), negatief = voorgrond (beweegt tegen —
   voelt dichterbij). data-depth-extra plakt een vaste transform (bv. rotate)
   achter de berekende translatie. */
function useDepth() {
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
  }, [])
}

/* Voortgangsbalk bovenaan de pagina */
function useScrollBar() {
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
  }, [])
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

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`header ${scrolled ? 'solid' : 'transparent'}`}>
      <div className="scrollbar" />
      <div className="container header-inner">
        <a href="#top" className="logo" aria-label="ÉLAN — home">
          <img src={scrolled ? '/elan-logo-black.svg' : '/elan-logo-light.svg'} alt="ÉLAN" />
        </a>
        <nav className={`nav ${open ? 'open' : ''}`}>
          {nav.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <a href="#/find-us" className="btn btn-outline btn-sm">Find us</a>
          <button className="menu-toggle" aria-label="Menu" onClick={() => setOpen((o) => !o)}>☰</button>
        </div>
      </div>
    </header>
  )
}

/* ============ HERO — oceaanvideo + muis/scroll-diepte ============ */
function Hero() {
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
        <video
          src={videos.ocean.src}
          poster={videos.ocean.poster}
          autoPlay muted loop playsInline
        />
        <div className="hero-rays" aria-hidden />
        <div className="hero-overlay" aria-hidden />
      </div>

      {/* Voorgrond-palmen: dichtbij (blurred) en middenlaag — echte diepte */}
      <img src={images.palm} alt="" aria-hidden className="palm hero-palm-a" draggable="false" />
      <img src={images.palm} alt="" aria-hidden className="palm hero-palm-b" draggable="false" />
      <img src={images.palm} alt="" aria-hidden className="palm hero-palm-c palm-blur" draggable="false" />

      <div className="hero-content reveal">
        <span className="hero-eyebrow">100% Pure Coconut Water</span>
        <div className="hero-stage">
          <h1 className="wordmark">
            <img src="/elan-logo-light.svg" alt="ÉLAN" />
          </h1>
          <div className="hero-script">
            <span className="script">{hero.script}</span>
            <Arrow dir="rd" />
          </div>
        </div>
        <p className="hero-tag">{hero.tagline}</p>
        <p className="hero-sub">{hero.sub}</p>
        <div className="hero-cta">
          <a href="#product" className="btn btn-light">{hero.cta}</a>
          <a href="#/find-us" className="btn btn-ghost">Vind ÉLAN →</a>
        </div>
      </div>
      <a href="#product" className="scroll-cue" aria-label="Scroll">
        <span>Scroll</span><i>↓</i>
      </a>
    </section>
  )
}

function Marquee() {
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {[...marquee, ...marquee].map((t, i) => (
          <span key={i} className={i % 2 ? 'script' : 'serif'}>{t}<b>✦</b></span>
        ))}
      </div>
    </div>
  )
}

/* ============ Benefits-constellatie (Insta-stijl) ============ */
function Orbit() {
  return (
    <section className="orbit" id="why">
      <Palm className="orbit-palm-a" depth="-0.10" extra="rotate(148deg) scaleX(-1)" blur />
      <div className="orbit-head reveal">
        <span className="script script-lg">{orbit.script}</span>
        <h2 className="display">{orbit.title}</h2>
      </div>
      <div className="orbit-stage">
        <div className="orbit-bottle-wrap" data-depth="-0.04">
          <img className="orbit-bottle" src={images.bottle} alt="ÉLAN pak met benefits" />
        </div>
        {orbit.labels.map((l, i) => (
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
          <video src={videos.jungle.src} poster={videos.jungle.poster} autoPlay muted loop playsInline />
          <div className="vband-shade" />
          <div className="vband-caption" ref={capRef}>
            <span className="script script-lg">{videoBand.script}</span>
            <h2 className="display light">{videoBand.title}</h2>
            <p className="lead light">{videoBand.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============ The Meaning (plaster/terracotta split) ============ */
function Meaning() {
  return (
    <section className="section sec-meaning" id="meaning">
      <div className="container meaning-grid">
        <div className="meaning-copy reveal">
          <span className="script script-xl">{meaning.script}</span>
          <h2 className="display">{meaning.title}</h2>
          <p className="lead">{meaning.body}</p>
          <p className="lead">{meaning.body2}</p>
          <div className="stats">
            {meaning.stats.map(([a, b]) => (
              <div key={a}><strong>{a}</strong><span>{b}</span></div>
            ))}
          </div>
        </div>
        <div className="meaning-media reveal">
          <div className="frame" data-depth="0.05">
            <img src={images.meaning} alt="ÉLAN — the meaning" />
          </div>
          <Palm className="meaning-palm" depth="-0.09" extra="rotate(-38deg)" />
        </div>
      </div>
    </section>
  )
}

/* ============ Nutrition — donker glas op jungle ============ */
function Nutrition() {
  return (
    <section className="section sec-nutrition">
      <div className="nutrition-bg" aria-hidden data-depth="0.08">
        <img src={images.coconuts} alt="" />
      </div>
      <div className="nutrition-shade" aria-hidden />
      <div className="container nutrition-grid">
        <div className="nutrition-copy reveal">
          <span className="script script-lg">{nutrition.script}</span>
          <h2 className="display light">{nutrition.title}</h2>
          <p className="lead light">Straight from the coconut: pure and transparent in origin — niets meer, niets minder.</p>
          <div className="stats light">
            <div><strong>100%</strong><span>Puur kokoswater</span></div>
            <div><strong>0g</strong><span>Toegevoegde suikers</span></div>
            <div><strong>250mg</strong><span>Kalium / 100 ml</span></div>
          </div>
        </div>
        <div className="glass-card nutrition-card reveal">
          <div className="nc-head">
            <span>{nutrition.eyebrow}</span>
            <small>{nutrition.per}</small>
          </div>
          <ul className="nc-rows">
            {nutrition.rows.map((r) => (
              <li key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></li>
            ))}
          </ul>
          <span className="nc-badge">{nutrition.badge}</span>
        </div>
      </div>
      <Palm className="nutrition-palm" depth="-0.13" extra="rotate(132deg)" blur />
    </section>
  )
}

/* ============ Beach band (hammock) ============ */
function Beach() {
  return (
    <section className="beach">
      <div className="beach-media" aria-hidden data-depth="0.08">
        <video src={videos.coast.src} poster={videos.coast.poster} autoPlay muted loop playsInline />
      </div>
      <div className="beach-shade" aria-hidden />
      <div className="container beach-inner">
        <div className="glass-card beach-card reveal">
          <span className="script script-xl">{beach.script}</span>
          <h2 className="display light">{beach.title}</h2>
          <p className="lead light">{beach.body}</p>
          <a href="#contact" className="btn btn-light">{beach.cta}</a>
        </div>
      </div>
    </section>
  )
}

/* ============ Fridge — dagelijks ritueel ============ */
function Fridge() {
  return (
    <section className="section sec-fridge">
      <div className="container split reverse">
        <div className="fridge-media reveal">
          <div className="frame" data-depth="0.05">
            <img src={images.fridge} alt="ÉLAN in de koelkast" data-depth="0.07" />
          </div>
          <img src={images.coconut} alt="" aria-hidden className="fridge-coconut" data-depth="-0.14" draggable="false" />
        </div>
        <div className="split-text reveal">
          <span className="eyebrow">{fridge.eyebrow}</span>
          <span className="script script-lg clay">{fridge.script}</span>
          <h2 className="display">{fridge.title}</h2>
          <p className="lead">{fridge.body}</p>
          <ul className="benefits">
            {fridge.benefits.map((b) => (
              <li key={b}><span className="tick">✓</span>{b}</li>
            ))}
          </ul>
          <a href="#/find-us" className="btn btn-primary" style={{ marginTop: 28 }}>{fridge.cta}</a>
        </div>
      </div>
    </section>
  )
}

/* ============ Story ============ */
function Story() {
  return (
    <section className="section sec-story" id="story">
      <div className="story-bg" aria-hidden>
        <img src="/poster-jungle2.jpg" alt="" data-depth="0.08" />
      </div>
      <div className="container story-inner reveal">
        <span className="script script-xl">{story.script}</span>
        <h2 className="display center light">{story.title}</h2>
        <p className="lead center narrow light">{story.body}</p>
      </div>
    </section>
  )
}

// Web3Forms access key (drinkelan.com → Info@drinkelan.com)
const WEB3FORMS_KEY = '25c97098-16a2-42ba-ad85-603bf65fc024'

function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | ok | error

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    // honeypot tegen spam
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
          <span className="eyebrow">{contact.title}</span>
          <h2 className="display">{hero.tagline}</h2>
          <div className="contact-details">
            <p><strong>{contact.company}</strong></p>
            {contact.address.map((l) => <p key={l}>{l}</p>)}
            <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
            <p><a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></p>
          </div>
        </div>
        {status === 'ok' ? (
          <div className="contact-form contact-sent">
            <span className="script script-lg">bedankt!</span>
            <h3>Je bericht is verstuurd.</h3>
            <p>We nemen zo snel mogelijk contact met je op.</p>
            <button className="btn btn-outline" onClick={() => setStatus('idle')}>Nog een bericht</button>
          </div>
        ) : (
          <form className="contact-form reveal" onSubmit={onSubmit}>
            <input type="text" name="name" placeholder="Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <textarea name="message" placeholder="Message" rows="4" required />
            <input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} />
            <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Versturen…' : 'Send message'}
            </button>
            {status === 'error' && (
              <span className="form-note form-error">Er ging iets mis — probeer het opnieuw of mail ons direct.</span>
            )}
            {status !== 'error' && (
              <span className="form-note">You agree to our friendly privacy policy.</span>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a href="#top" className="logo" aria-label="ÉLAN — home">
          <img src="/elan-logo-light.svg" alt="ÉLAN" />
        </a>
        <nav className="footer-nav">
          {nav.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}
          <a href="#">Privacy policy</a>
        </nav>
        <p className="footer-copy">© 2026 ELAN WORLD BV — 100% Pure Coconut Water</p>
      </div>
    </footer>
  )
}

export default function App() {
  const hash = useHashRoute()
  useScrollReveal()
  useDepth()
  useScrollBar()

  if (hash.startsWith('#/find-us')) {
    return (
      <Suspense fallback={<div className="globe-loading">De globe wordt geladen…</div>}>
        <FindUs />
      </Suspense>
    )
  }

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
        <Story />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
