import { chromium } from 'playwright-core'
const b = await chromium.connectOverCDP('http://localhost:9222')
const ctx = b.contexts()[0]
const p = await ctx.newPage()
await p.setViewportSize({ width: 1440, height: 900 })
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle', timeout: 20000 }).catch(()=>{})
await p.waitForTimeout(1200)
await p.screenshot({ path: '/tmp/mine-viewport.png' })
await p.evaluate(async () => { for (let y=0; y<document.body.scrollHeight; y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,120)) } window.scrollTo(0,0) })
await p.waitForTimeout(600)
await p.screenshot({ path: '/tmp/mine-full.png', fullPage: true })
await p.close(); await b.close(); console.log('done')
