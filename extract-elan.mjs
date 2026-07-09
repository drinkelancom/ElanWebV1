// Haalt echte afbeeldingen + sectie-teksten van drinkelan.com (eigen site) via CDP.
import { chromium } from 'playwright-core'

const browser = await chromium.connectOverCDP('http://localhost:9222')
const ctx = browser.contexts()[0]
const page = await ctx.newPage()
await page.goto('https://drinkelan.com/', { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => {})
await page.waitForTimeout(3000)
await page.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120))} window.scrollTo(0,0) })
await page.waitForTimeout(1500)

const out = await page.evaluate(() => {
  const abs = (u) => { try { return new URL(u, location.href).href } catch { return u } }
  // <img> bronnen (grootste eerst)
  const imgs = [...document.querySelectorAll('img')]
    .map((i) => ({ src: abs(i.currentSrc || i.src), w: i.naturalWidth, alt: (i.alt||'').slice(0,50) }))
    .filter((i) => i.src && !i.src.startsWith('data:'))
    .sort((a,b)=>b.w-a.w)
  const uniq = []; const seen = new Set()
  for (const i of imgs) { const k=i.src.split('?')[0]; if(!seen.has(k)){seen.add(k);uniq.push(i)} }

  // background-images
  const bgs = [...document.querySelectorAll('*')].map(e=>getComputedStyle(e).backgroundImage)
    .filter(b=>b&&b!=='none'&&b.includes('url('))
    .map(b=>abs(b.slice(b.indexOf('url(')+4).replace(/^["']?/,'').replace(/["']?\).*$/,'')))
  const bgUniq = [...new Set(bgs)]

  // sectie-teksten
  const sections = [...document.querySelectorAll('section, .section_hero, .nav_component')].map((s)=>({
    cls: (s.className||'').toString().slice(0,60),
    text: s.innerText.replace(/\s+/g,' ').trim().slice(0,400),
  })).filter(s=>s.text)

  return { images: uniq.slice(0,30), backgrounds: bgUniq.slice(0,20), sections }
})

console.log(JSON.stringify(out, null, 2))
await page.close(); await browser.close()
