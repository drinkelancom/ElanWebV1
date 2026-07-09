// Inspecteert de live ÉLAN-site (drinkelan.com) via de draaiende Chrome (CDP).
// Detecteert platform, leest structuur/navigatie/secties en maakt screenshots.

import { chromium } from 'playwright-core'

const URL = 'https://drinkelan.com/'
const browser = await chromium.connectOverCDP('http://localhost:9222')
const ctx = browser.contexts()[0]
const page = await ctx.newPage()

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 40000 }).catch((e) => console.error('goto:', e.message))
await page.waitForTimeout(3000)
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
console.error('➡️  URL: ' + page.url())

const data = await page.evaluate(() => {
  const txt = (el) => (el ? el.textContent.trim().replace(/\s+/g, ' ').slice(0, 80) : '')

  // Platform-detectie
  const platform = {
    shopify: !!(window.Shopify || document.querySelector('script[src*="cdn.shopify"]') || document.querySelector('link[href*="cdn.shopify"]')),
    shopifyTheme: window.Shopify?.theme?.name || null,
    wordpress: !!document.querySelector('meta[name="generator"][content*="WordPress"]') || !!document.querySelector('link[href*="wp-content"]'),
    generator: document.querySelector('meta[name="generator"]')?.content || null,
    react: !!document.querySelector('#__next, [data-reactroot]') || !!window.React,
    nextjs: !!document.querySelector('#__next'),
  }

  const nav = [...document.querySelectorAll('header a, nav a')]
    .map((a) => txt(a)).filter(Boolean).filter((t, i, arr) => arr.indexOf(t) === i).slice(0, 25)

  const headings = [...document.querySelectorAll('h1, h2, h3')].map(txt).filter(Boolean).slice(0, 40)

  const sections = [...document.querySelectorAll('section, [class*="section"], main > div')]
    .slice(0, 40).map((e) => ({
      tag: e.tagName.toLowerCase(),
      cls: (e.className || '').toString().slice(0, 70),
      h: txt(e.querySelector('h1,h2,h3')),
    })).filter((s) => s.cls || s.h)

  // Producten (Shopify-achtige kaarten)
  const products = [...document.querySelectorAll('[class*="product"] a, [class*="card"] a, [href*="/products/"]')]
    .map((a) => txt(a)).filter(Boolean).filter((t, i, arr) => arr.indexOf(t) === i).slice(0, 20)

  // Kleuren & fonts
  const gcs = (e) => getComputedStyle(e)
  const els = [...document.querySelectorAll('body *')]
  const tally = (arr) => { const m = {}; arr.forEach(v => v && (m[v] = (m[v]||0)+1)); return Object.entries(m).sort((a,b)=>b[1]-a[1]) }
  const fonts = tally(els.map(e => gcs(e).fontFamily)).slice(0, 8)
  const bg = tally(els.map(e => gcs(e).backgroundColor).filter(c => c && c !== 'rgba(0, 0, 0, 0)')).slice(0, 14)

  return {
    title: document.title,
    metaDesc: document.querySelector('meta[name="description"]')?.content?.slice(0, 160) || '',
    platform, nav, headings, sections, products,
    fonts, palette: bg,
    bodyTextSample: document.body.innerText.replace(/\s+/g, ' ').slice(0, 600),
  }
})

console.log(JSON.stringify(data, null, 2))

await page.screenshot({ path: '/tmp/elan-viewport.png' }).catch((e) => console.error('shot1', e.message))
await page.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,150))} window.scrollTo(0,0) })
await page.waitForTimeout(800)
await page.screenshot({ path: '/tmp/elan-full.png', fullPage: true }).catch((e) => console.error('shot2', e.message))
console.error('📸 /tmp/elan-viewport.png & /tmp/elan-full.png')

await page.close(); await browser.close()
