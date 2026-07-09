// Knipt de transparante rand rond het ÉLAN-pak weg, zodat de PNG strak om het
// product zit en op de juiste verhouding rendert.
import { PNG } from 'pngjs'
import { readFileSync, writeFileSync } from 'fs'

const SRC = 'public/elan-bottle-original.png'
const OUT = 'public/elan-bottle.png'
const ALPHA_MIN = 10 // pixels met alpha hieronder gelden als transparant
const PAD = 8 // kleine marge eromheen

const png = PNG.sync.read(readFileSync(SRC))
const { width, height, data } = png

let minX = width, minY = height, maxX = 0, maxY = 0
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const a = data[(y * width + x) * 4 + 3]
    if (a > ALPHA_MIN) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}

minX = Math.max(0, minX - PAD)
minY = Math.max(0, minY - PAD)
maxX = Math.min(width - 1, maxX + PAD)
maxY = Math.min(height - 1, maxY + PAD)

const w = maxX - minX + 1
const h = maxY - minY + 1
const out = new PNG({ width: w, height: h })
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const si = ((y + minY) * width + (x + minX)) * 4
    const di = (y * w + x) * 4
    out.data[di] = data[si]
    out.data[di + 1] = data[si + 1]
    out.data[di + 2] = data[si + 2]
    out.data[di + 3] = data[si + 3]
  }
}
writeFileSync(OUT, PNG.sync.write(out))
console.log(`Origineel ${width}x${height} → bijgesneden ${w}x${h} (ratio ${(w / h).toFixed(3)})`)
