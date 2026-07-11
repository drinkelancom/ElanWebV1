import { useState, useEffect } from 'react'
import { Header, Footer } from './App.jsx'
import { productMeta, WEB3FORMS_KEY } from './data.js'
import { euro } from './content.js'
import { useLang } from './lang.jsx'

/* Voegt taal-onafhankelijke productmeta (prijs, beeld, koopmodus) samen met
   de vertaalde producttekst uit de content. */
function withMeta(p) { return { ...p, ...productMeta[p.slug] } }

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

function useScrollTop(dep) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }) }, [dep])
}

/* ---------- Koopblok: gedrag hangt af van product.buyMode ---------- */
function ResellerBlock() {
  const { t } = useLang()
  const active = t.resellers.filter((r) => r.url && r.url !== '#')
  return (
    <div className="buy-block reveal">
      {active.length > 0 && (
        <>
          <p className="buy-lead">{t.shop.buyResellerLead}</p>
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
      <a href="#/find-us" className="btn btn-primary btn-block">{t.shop.buyFindCta} →</a>
    </div>
  )
}

function PreorderBlock({ product }) {
  const { t } = useLang()
  const [status, setStatus] = useState('idle')
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
        <span className="script script-lg">{t.shop.preorderOkScript}</span>
        <p>{t.shop.preorderSub}</p>
      </div>
    )
  }
  return (
    <form className="buy-block reveal" onSubmit={onSubmit}>
      <p className="buy-lead"><strong>{t.shop.preorderLead}</strong> {t.shop.preorderSub}</p>
      <div className="notify-row">
        <input type="email" name="email" placeholder={t.shop.preorderPlaceholder} required />
        <input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} />
        <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? t.shop.preorderSending : t.shop.preorderBtn}
        </button>
      </div>
      {status === 'error' && (
        <span className="form-note form-error">{t.contact.form.errorPre}<a href="mailto:Info@drinkelan.com">Info@drinkelan.com</a>.</span>
      )}
    </form>
  )
}

function BuyBlock({ product }) {
  const { t } = useLang()
  if (product.buyMode === 'reseller') return <ResellerBlock />
  if (product.buyMode === 'preorder') return <PreorderBlock product={product} />
  if (!product.stripePriceId) return <PreorderBlock product={product} />
  return (
    <div className="buy-block reveal">
      <a href={`#/checkout/${product.slug}`} className="btn btn-primary btn-block">{t.shop.cart} — {euro(product.price)}</a>
    </div>
  )
}

/* ---------- Productkaart in het grid ---------- */
function ProductCard({ product, i }) {
  const { t } = useLang()
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
          <span className="product-card-cta">{t.shop.view} →</span>
        </div>
      </div>
    </a>
  )
}

/* ---------- Shop-landing ---------- */
function ShopLanding() {
  const { t } = useLang()
  const products = t.products.map(withMeta)
  return (
    <>
      <section className="shop-hero">
        <div className="shop-hero-media" aria-hidden>
          <img src="/poster-coconut-trailer.jpg" alt="" />
          <div className="shop-hero-shade" />
        </div>
        <img src="/palm-leaf.png" alt="" aria-hidden className="palm shop-hero-palm" draggable="false" />
        <div className="container shop-hero-inner reveal">
          <span className="eyebrow light">{t.shop.eyebrow}</span>
          <span className="script script-xl">{t.shop.script}</span>
          <h1 className="display light">{t.shop.title}</h1>
          <p className="lead light narrow">{t.shop.body}</p>
        </div>
      </section>

      <div className="shop-trust">
        <div className="container shop-trust-inner">
          {t.shop.trust.map(([a, b]) => (
            <div key={a} className="shop-trust-item reveal">
              <strong>{a}</strong><span>{b}</span>
            </div>
          ))}
        </div>
        <div className="shop-trust-marquee" aria-hidden>
          <div className="shop-trust-track">
            {[...t.shop.trust, ...t.shop.trust].map(([a, b], i) => (
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
          <span className="script script-lg clay">{t.shop.resellerScript}</span>
          <h2 className="display">{t.shop.resellerTitle}</h2>
          <p className="lead">{t.shop.resellerBody}</p>
          <a href="#/find-us" className="btn btn-primary">{t.shop.resellerCta} →</a>
        </div>
      </section>
    </>
  )
}

/* ---------- Productdetail ---------- */
function ProductDetail({ product }) {
  const { t } = useLang()
  return (
    <section className="section shop-detail-sec">
      <div className="container">
        <a href="#/shop" className="shop-back">← {t.shop.backToShop}</a>
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
  const { t } = useLang()
  const slug = hash.replace(/^#\/shop\/?/, '').split('?')[0]
  const base = slug ? t.products.find((p) => p.slug === slug) : null
  const product = base ? withMeta(base) : null
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
