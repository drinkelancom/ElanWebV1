// Verbindt met een al draaiende Chrome (remote-debugging-port=9222) via CDP,
// vindt het Faryita-tabblad, en leest design-tokens + screenshots uit.
// Niets wordt gewijzigd op hun site; alleen lezen.

import { chromium } from 'playwright-core'

const TARGET = 'faryita'

const browser = await chromium.connectOverCDP('http://localhost:9222')
const contexts = browser.contexts()
let page = null
for (const ctx of contexts) {
  for (const p of ctx.pages()) {
    if (p.url().includes(TARGET)) { page = p; break }
  }
}
if (!page) {
  console.error('❌ Geen tabblad met "' + TARGET + '" gevonden. Open de demo-URL in het Chrome-venster met de debug-poort.')
  console.error('Open tabbladen:')
  for (const ctx of contexts) for (const p of ctx.pages()) console.error('  - ' + p.url())
  await browser.close()
  process.exit(1)
}

await page.bringToFront().catch(() => {})
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

const data = await page.evaluate(() => {
  const tally = (arr) => {
    const m = {}
    arr.forEach((v) => { if (v) m[v] = (m[v] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }
  const els = [...document.querySelectorAll('body *')]
  const gcs = (e) => getComputedStyle(e)

  // Kleurenpalet (achtergronden + tekst), meest voorkomend
  const bg = tally(els.map((e) => gcs(e).backgroundColor)
    .filter((c) => c && c !== 'rgba(0, 0, 0, 0)')).slice(0, 18)
  const fg = tally(els.map((e) => gcs(e).color)).slice(0, 12)

  // Fonts
  const fonts = tally(els.map((e) => gcs(e).fontFamily)).slice(0, 10)

  // Grootste tekst (waarschijnlijk de hero-titel)
  const bySize = els
    .filter((e) => e.textContent && e.textContent.trim().length > 0 && e.children.length === 0)
    .map((e) => ({ e, size: parseFloat(gcs(e).fontSize) || 0 }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 6)
    .map(({ e }) => {
      const s = gcs(e)
      return {
        text: e.textContent.trim().slice(0, 40),
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
        color: s.color,
        fontWeight: s.fontWeight,
        letterSpacing: s.letterSpacing,
      }
    })

  // Secties: achtergrond + hoogte
  const sections = [...document.querySelectorAll('section, header, footer')].slice(0, 25).map((e) => {
    const s = gcs(e)
    return {
      tag: e.tagName.toLowerCase(),
      cls: (e.className || '').toString().slice(0, 50),
      bg: s.backgroundColor,
      bgImage: s.backgroundImage.slice(0, 60),
      minHeight: s.minHeight,
    }
  })

  // CSS-animaties: verzamel keyframe-namen + elementen met animation/transition
  const animNames = new Set()
  const animEls = []
  for (const e of els) {
    const s = gcs(e)
    if (s.animationName && s.animationName !== 'none') {
      s.animationName.split(',').forEach((n) => animNames.add(n.trim()))
      animEls.push({
        cls: (e.className || '').toString().slice(0, 40),
        name: s.animationName,
        duration: s.animationDuration,
        timing: s.animationTimingFunction,
      })
    }
  }
  // Keyframe-definities uit stylesheets
  const keyframes = []
  for (const ss of document.styleSheets) {
    let rules
    try { rules = ss.cssRules } catch { continue }
    if (!rules) continue
    for (const r of rules) {
      if (r.type === CSSRule.KEYFRAMES_RULE && animNames.has(r.name)) {
        keyframes.push(r.cssText.slice(0, 400))
      }
    }
  }

  return {
    title: document.title,
    palette: bg,
    textColors: fg,
    fonts,
    biggestText: bySize,
    sections,
    animElements: animEls.slice(0, 20),
    keyframes: keyframes.slice(0, 12),
  }
})

console.log(JSON.stringify(data, null, 2))

// Screenshots
await page.screenshot({ path: '/tmp/fary-viewport.png' }).catch((e) => console.error('shot1', e.message))
await page.screenshot({ path: '/tmp/fary-full.png', fullPage: true }).catch((e) => console.error('shot2', e.message))
console.log('\n📸 Screenshots: /tmp/fary-viewport.png  &  /tmp/fary-full.png')

await browser.close()
