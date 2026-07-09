// Verbindt met de draaiende Chrome (CDP, poort 9222), opent de Shopify-demo,
// vult het storefront-wachtwoord in en leest design-tokens + screenshots uit.
// Alleen lezen; er wordt niets op hun site gewijzigd.

import { chromium } from 'playwright-core'

const URL = 'https://dt-faryita.myshopify.com/'
const PASSWORD = '1'

const browser = await chromium.connectOverCDP('http://localhost:9222')
const ctx = browser.contexts()[0]
const page = await ctx.newPage()

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(1500)

// Storefront-wachtwoordpagina afhandelen
const pw = page.locator('input[type="password"], input[name="password"]').first()
if (await pw.count().catch(() => 0)) {
  console.error('🔒 Wachtwoordpagina gedetecteerd — vul in...')
  await pw.fill(PASSWORD).catch(() => {})
  const btn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Enter")').first()
  if (await btn.count().catch(() => 0)) await btn.click().catch(() => {})
  else await pw.press('Enter').catch(() => {})
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(2500)
}

await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
console.error('➡️  Huidige URL: ' + page.url())

const data = await page.evaluate(() => {
  const tally = (arr) => {
    const m = {}
    arr.forEach((v) => { if (v) m[v] = (m[v] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }
  const els = [...document.querySelectorAll('body *')]
  const gcs = (e) => getComputedStyle(e)

  const bg = tally(els.map((e) => gcs(e).backgroundColor)
    .filter((c) => c && c !== 'rgba(0, 0, 0, 0)')).slice(0, 20)
  const fg = tally(els.map((e) => gcs(e).color)).slice(0, 12)
  const fonts = tally(els.map((e) => gcs(e).fontFamily)).slice(0, 10)

  const bySize = els
    .filter((e) => e.textContent && e.textContent.trim().length > 0 && e.children.length === 0)
    .map((e) => ({ e, size: parseFloat(gcs(e).fontSize) || 0 }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 8)
    .map(({ e }) => {
      const s = gcs(e)
      return {
        text: e.textContent.trim().slice(0, 40),
        fontSize: s.fontSize, fontFamily: s.fontFamily,
        color: s.color, fontWeight: s.fontWeight, letterSpacing: s.letterSpacing,
      }
    })

  const sections = [...document.querySelectorAll('section, header, footer, [class*="section"], [class*="banner"], [class*="hero"]')]
    .slice(0, 30).map((e) => {
      const s = gcs(e)
      return {
        tag: e.tagName.toLowerCase(),
        cls: (e.className || '').toString().slice(0, 60),
        bg: s.backgroundColor,
        bgImage: s.backgroundImage.slice(0, 80),
        minHeight: s.minHeight,
      }
    })

  const animNames = new Set()
  const animEls = []
  for (const e of els) {
    const s = gcs(e)
    if (s.animationName && s.animationName !== 'none') {
      s.animationName.split(',').forEach((n) => animNames.add(n.trim()))
      animEls.push({ cls: (e.className || '').toString().slice(0, 40), name: s.animationName, duration: s.animationDuration, timing: s.animationTimingFunction })
    }
  }
  const keyframes = []
  for (const ss of document.styleSheets) {
    let rules
    try { rules = ss.cssRules } catch { continue }
    if (!rules) continue
    for (const r of rules) {
      if (r.type === CSSRule.KEYFRAMES_RULE && animNames.has(r.name)) keyframes.push(r.cssText.slice(0, 500))
    }
  }

  // Sectie-koppen (h1/h2) als globaal overzicht van de paginastructuur
  const headings = [...document.querySelectorAll('h1, h2, h3')].slice(0, 20)
    .map((h) => h.textContent.trim().slice(0, 50)).filter(Boolean)

  return { title: document.title, url: location.href, palette: bg, textColors: fg, fonts, biggestText: bySize, headings, sections, animElements: animEls.slice(0, 20), keyframes: keyframes.slice(0, 12) }
})

console.log(JSON.stringify(data, null, 2))

await page.screenshot({ path: '/tmp/shop-viewport.png' }).catch((e) => console.error('shot1', e.message))
await page.screenshot({ path: '/tmp/shop-full.png', fullPage: true }).catch((e) => console.error('shot2', e.message))
console.log('\n📸 /tmp/shop-viewport.png  &  /tmp/shop-full.png')

await browser.close()
