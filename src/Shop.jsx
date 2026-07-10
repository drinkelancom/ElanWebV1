import { useState, useEffect } from 'react'
import { Header, Footer } from './App.jsx'
import {
  shop, products, resellers, getProduct, euro, WEB3FORMS_KEY,
} from './shop.js'

/* Lokale scroll-reveal (de globale hook in App draait al vóór deze lazy route
   mount, dus we observeren hier onze eigen .reveal-elementen). */
function useLocalReveal(dep) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}

/* Boven aan de subpagina scrollen bij routewissel. */
function useScrollTop(dep) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }) }, [dep])
}

/* ---------- Koopblok: gedrag hangt af van product.buyMode ---------- */
function ResellerBlock() {
  // Alleen wederverkopers met een echte link tonen; zolang die er niet zijn,
  // tonen we enkel de knop naar de Find Us-kaart.
  const active = resellers.filter((r) => r.url && r.url !== '#')
  return (
    <div className="buy-block reveal">
      {active.length > 0 && (
        <>
          <p className="buy-lead">Nu verkrijgbaar bij onze wederverkopers:</p>
          <ul className="reseller-list">
            {active.map((r) => (
              <li key={r.name}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <span>{r.name}</span>
                  <small>{r.note} →</small>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      <a href="#/find-us" className="btn btn-primary btn-block">Vind ÉLAN bij jou in de buurt →</a>
    </div>
  )
}

function PreorderBlock({ product }) {
  const [status, setStatus] = useState('idle') // idle | sending | ok | error
  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    if (payload.botcheck) return
    payload.access_key = WEB3FORMS_KEY
    payload.subject = `ÉLAN pre-order interesse — ${product.name}`
    payload.from_name = 'ÉLAN shop'
    payload.product = product.name
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
    } catch { setStatus('error') }
  }

  if (status === 'ok') {
    return (
      <div className="buy-block buy-notified reveal">
        <span className="script script-lg">op de hoogte!</span>
        <p>Je staat op de lijst. We laten het je als eerste weten zodra <strong>{product.name}</strong> te bestellen is.</p>
      </div>
    )
  }
  return (
    <form className="buy-block reveal" onSubmit={onSubmit}>
      <p className="buy-lead"><strong>Binnenkort te bestellen.</strong> Laat je e-mail achter en wees als eerste op de hoogte.</p>
      <div className="notify-row">
        <input type="email" name="email" placeholder="Je e-mailadres" required />
        <input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} />
        <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Versturen…' : 'Hou me op de hoogte'}
        </button>
      </div>
      {status === 'error' && (
        <span className="form-note form-error">Er ging iets mis — probeer het opnieuw of mail ons via <a href="mailto:Info@drinkelan.com">Info@drinkelan.com</a>.</span>
      )}
    </form>
  )
}

function BuyBlock({ product }) {
  if (product.buyMode === 'reseller') return <ResellerBlock />
  if (product.buyMode === 'preorder') return <PreorderBlock product={product} />
  // 'live' (Fase 1): hier komt de Stripe Checkout-knop. Zolang er geen prijs-id is,
  // vallen we terug op pre-order zodat de knop nooit dood is.
  if (!product.stripePriceId) return <PreorderBlock product={product} />
  return (
    <div className="buy-block reveal">
      <a href={`#/checkout/${product.slug}`} className="btn btn-primary btn-block">In winkelmand — {euro(product.price)}</a>
    </div>
  )
}

/* ---------- Productkaart in het grid ---------- */
function ProductCard({ product, i }) {
  return (
    <a href={`#/shop/${product.slug}`} className="product-card reveal" style={{ '--d': `${i * 90}ms` }}>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <div className="product-card-media">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p>{product.subtitle}</p>
        <div className="product-card-foot">
          <span className="product-price">
            {euro(product.price)} <small>{product.unit}</small>
          </span>
          <span className="product-card-cta">Bekijk →</span>
        </div>
      </div>
    </a>
  )
}

/* ---------- Shop-landing ---------- */
function ShopLanding() {
  return (
    <>
      <section className="shop-hero">
        <div className="shop-hero-media" aria-hidden>
          <img src="/poster-coconut-trailer.jpg" alt="" />
          <div className="shop-hero-shade" />
        </div>
        <img src="/palm-leaf.png" alt="" aria-hidden className="palm shop-hero-palm" draggable="false" />
        <div className="container shop-hero-inner reveal">
          <span className="eyebrow light">{shop.eyebrow}</span>
          <span className="script script-xl">{shop.script}</span>
          <h1 className="display light">{shop.title}</h1>
          <p className="lead light narrow">{shop.body}</p>
        </div>
      </section>

      <div className="shop-trust">
        {/* Desktop/tablet: nette 3-koloms strip */}
        <div className="container shop-trust-inner">
          {shop.trust.map(([a, b]) => (
            <div key={a} className="shop-trust-item reveal">
              <strong>{a}</strong><span>{b}</span>
            </div>
          ))}
        </div>
        {/* Mobiel: auto-scroll marquee (content verdubbeld voor naadloze loop) */}
        <div className="shop-trust-marquee" aria-hidden>
          <div className="shop-trust-track">
            {[...shop.trust, ...shop.trust].map(([a, b], i) => (
              <span key={i} className="tw-item">
                <strong>{a}</strong><em>{b}</em><b>✦</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="section shop-grid-sec">
        <div className="container">
          <div className="product-grid">
            {products.map((p, i) => <ProductCard key={p.slug} product={p} i={i} />)}
          </div>
        </div>
      </section>

      <section className="shop-reseller">
        <div className="container shop-reseller-inner reveal">
          <span className="script script-lg clay">liever in de winkel?</span>
          <h2 className="display">Vind ÉLAN bij jou in de buurt.</h2>
          <p className="lead">Ontdek op de kaart waar je ÉLAN los kunt kopen — supermarkten, horeca en speciaalzaken door heel Nederland.</p>
          <a href="#/find-us" className="btn btn-primary">Open de kaart →</a>
        </div>
      </section>
    </>
  )
}

/* ---------- Productdetail ---------- */
function ProductDetail({ product }) {
  return (
    <section className="section shop-detail-sec">
      <div className="container">
        <a href="#/shop" className="shop-back">← Terug naar de shop</a>
        <div className="shop-detail">
          <div className="shop-detail-media reveal">
            <div className="shop-detail-frame">
              <img src={product.image} alt={product.name} />
            </div>
            <img src="/coconut.png" alt="" aria-hidden className="shop-detail-coconut" draggable="false" />
          </div>
          <div className="shop-detail-info reveal">
            {product.badge && <span className="eyebrow">{product.badge}</span>}
            <h1 className="display">{product.name}</h1>
            <p className="shop-detail-sub">{product.subtitle}</p>
            <div className="shop-detail-price">
              <span className="product-price">{euro(product.price)}</span>
              {product.priceCompare && <s>{euro(product.priceCompare)}</s>}
              <small>{product.unit}</small>
            </div>
            <p className="lead">{product.short}</p>
            <ul className="benefits">
              {product.highlights.map((h) => (
                <li key={h}><span className="tick">✓</span>{h}</li>
              ))}
            </ul>
            <BuyBlock product={product} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Root ---------- */
export default function Shop({ hash = '' }) {
  // '#/shop' → landing, '#/shop/<slug>' → detail
  const slug = hash.replace(/^#\/shop\/?/, '').split('?')[0]
  const product = slug ? getProduct(slug) : null
  useScrollTop(hash)
  useLocalReveal(hash)

  return (
    <>
      <div className="grain" aria-hidden />
      <Header forceSolid={!!product} />
      <main className="shop-main">
        {product ? <ProductDetail product={product} /> : <ShopLanding />}
      </main>
      <Footer />
    </>
  )
}
