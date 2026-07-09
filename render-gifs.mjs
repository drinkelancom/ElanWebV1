// Rendert de ÉLAN Giphy-scènes (giphy.html) frame-voor-frame naar loop-GIFs.
// Gebruik: node render-gifs.mjs [scene ...]  (zonder args: alle scènes)
import { chromium } from 'playwright-core'
import { execSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'

const FPS = 15
const OUT = 'giphy'
const EXEC = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const b = await chromium.launch({ executablePath: EXEC, headless: true })
const p = await b.newPage()
await p.setViewportSize({ width: 480, height: 480 })

// scène-lijst ophalen
await p.goto('http://localhost:5173/giphy.html', { waitUntil: 'networkidle' })
const all = await p.evaluate(() => window.SCENE_LIST)
const scenes = process.argv.slice(2).length ? process.argv.slice(2) : all

mkdirSync(OUT, { recursive: true })

for (const name of scenes) {
  await p.goto(`http://localhost:5173/giphy.html?scene=${name}`, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(400)
  const dur = await p.evaluate(() => window.SCENE_DUR)
  const transparent = await p.evaluate(() => window.SCENE_TRANSPARENT)
  const frames = Math.round((dur / 1000) * FPS)
  const dir = `/tmp/gif-${name}`
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  for (let f = 0; f < frames; f++) {
    const t = (f / frames) * dur
    await p.evaluate((t) => window.seek(t), t)
    await p.waitForTimeout(20)
    await p.screenshot({
      path: `${dir}/f${String(f).padStart(3, '0')}.png`,
      clip: { x: 0, y: 0, width: 480, height: 480 },
      omitBackground: transparent,
    })
  }
  execSync(
    `ffmpeg -v error -framerate ${FPS} -i ${dir}/f%03d.png ` +
    `-vf "split[a][b];[a]palettegen[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" ` +
    `-loop 0 -y ${OUT}/elan-${name}.gif`
  )
  rmSync(dir, { recursive: true, force: true })
  console.log(`✓ ${OUT}/elan-${name}.gif (${frames} frames, ${(dur / 1000).toFixed(1)}s loop)`)
}

await b.close()
console.log('done')
