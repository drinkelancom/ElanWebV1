/* Server voor de Orbit-deploy op de NAS.
 *
 * Op Vercel doet het platform twee dingen die in een eigen container niemand
 * doet: de statische build uitserveren en elk bestand in api/ als functie
 * draaien. Dit bestand neemt allebei over, zodat dezelfde repo op de NAS
 * hetzelfde gedrag geeft als op www.drinkelan.com.
 *
 * De handlers in api/ blijven ongewijzigd. Ze spreken de Node-signatuur
 * (req, res) die Vercel ook gebruikt; wat Vercel er zelf omheen zet —
 * req.query, req.body, res.status().json() — wordt hieronder aangevuld.
 *
 * Vercel merkt hier niets van: dit bestand wordt alleen door de Dockerfile
 * gestart en staat verder niemand in de weg.
 */

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)))
const DIST = join(ROOT, 'dist')
const PORT = Number(process.env.PORT) || 3000

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.geojson': 'application/geo+json',
}

/* Vite zet een hash in de bestandsnaam van alles onder /assets/, dus die
   bestanden veranderen nooit van inhoud en mogen een jaar blijven staan.
   HTML juist niet: dat is de enige plek waar een nieuwe deploy zichtbaar
   wordt. */
function cacheFor(pad) {
  if (pad.startsWith('/assets/')) return 'public, max-age=31536000, immutable'
  if (pad.endsWith('.html') || pad.endsWith('/')) return 'no-cache'
  return 'public, max-age=3600'
}

/* ------------------------------------------------------------------ api -- */

/* De vier endpoints, met de bestandsnaam als route. Bestanden die met een
   liggend streepje beginnen zijn gedeelde code (_store, _page) en horen geen
   eigen URL te hebben — vandaar een vaste lijst in plaats van een blik in de
   map. */
const ENDPOINTS = new Set(['reviews', 'google-reviews', 'review-admin'])

/* Vercel kent een limiet op de body van een functie; hier staat hij er zelf
   in, anders kan iemand het geheugen van de container volschrijven met één
   POST. Reviews zijn hooguit een paar kilobyte. */
const MAX_BODY = 1024 * 1024

function leesBody(req) {
  return new Promise((klaar, faal) => {
    const delen = []
    let lengte = 0
    req.on('data', (d) => {
      lengte += d.length
      if (lengte > MAX_BODY) {
        faal(Object.assign(new Error('Body te groot'), { code: 'TE_GROOT' }))
        req.destroy()
        return
      }
      delen.push(d)
    })
    req.on('end', () => klaar(Buffer.concat(delen).toString('utf8')))
    req.on('error', faal)
  })
}

/* Vercel parseert de body op basis van het content-type en geeft bij JSON een
   object terug. Faalt dat parsen daar, dan krijgt de handler geen object maar
   een string; hier houden we hetzelfde aan: bij twijfel een leeg object, zodat
   de validatie in de handler zijn werk doet in plaats van dat de server met
   een 500 klapt. */
function parseBody(ruw, type = '') {
  if (!ruw) return {}
  if (type.includes('application/json')) {
    try {
      return JSON.parse(ruw)
    } catch {
      return {}
    }
  }
  if (type.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(ruw))
  }
  return ruw
}

/* res.status().json() en res.setHeader() zijn wat de handlers gebruiken. Meer
   heeft Vercel's res voor deze endpoints niet nodig, dus meer bouwen we niet
   na. */
function maakRes(res) {
  const uit = res
  uit.status = (code) => {
    res.statusCode = code
    return uit
  }
  uit.json = (data) => {
    const body = JSON.stringify(data)
    if (!res.hasHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Length', Buffer.byteLength(body))
    res.end(body)
    return uit
  }
  uit.send = (data) => {
    if (data === undefined || data === null) return uit.end()
    const body = typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data)
    if (!res.hasHeader('Content-Type')) res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(body)
    return uit
  }
  return uit
}

async function api(req, res, url) {
  const naam = url.pathname.slice('/api/'.length).replace(/\/$/, '')
  if (!ENDPOINTS.has(naam)) {
    return maakRes(res).status(404).json({ error: 'Not found' })
  }

  const shim = maakRes(res)
  req.query = Object.fromEntries(url.searchParams)

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      req.body = parseBody(await leesBody(req), req.headers['content-type'] || '')
    } catch (err) {
      const code = err?.code === 'TE_GROOT' ? 413 : 400
      return shim.status(code).json({ error: 'Ongeldige aanvraag' })
    }
  }

  const { default: handler } = await import(`./api/${naam}.js`)
  return handler(req, shim)
}

/* --------------------------------------------------------------- static -- */

async function bestand(pad) {
  try {
    const s = await stat(pad)
    return s.isFile() ? s : null
  } catch {
    return null
  }
}

async function statisch(req, res, url) {
  // Geen ../ uit dist weg kunnen lopen: normalize eerst, dan pas samenvoegen.
  const gevraagd = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  let pad = join(DIST, gevraagd)
  if (!pad.startsWith(DIST)) return niks(res)

  let info = await bestand(pad)

  // /verkooppunten -> /verkooppunten/index.html, en zonder slash netjes door-
  // verwijzen zodat relatieve links in die pagina blijven kloppen.
  if (!info) {
    const alsMap = await bestand(join(pad, 'index.html'))
    if (alsMap) {
      if (!url.pathname.endsWith('/')) {
        res.statusCode = 301
        res.setHeader('Location', `${url.pathname}/${url.search}`)
        return res.end()
      }
      pad = join(pad, 'index.html')
      info = alsMap
    }
  }

  if (!info) return niks(res)

  const type = TYPES[extname(pad).toLowerCase()] || 'application/octet-stream'
  res.setHeader('Content-Type', type)
  res.setHeader('Content-Length', info.size)
  res.setHeader('Cache-Control', cacheFor(url.pathname))
  if (req.method === 'HEAD') return res.end()
  res.end(await readFile(pad))
}

/* De site draait op hash-routes (#/ons-verhaal) plus een handvol echte mappen
   die de prerender wegschrijft. Alles daarbuiten bestaat niet, en dat mag een
   404 zijn — de index terugsturen zou een crawler laten denken dat elke
   verzonnen URL een pagina is. */
async function niks(res) {
  const pagina = await bestand(join(DIST, 'index.html'))
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(pagina ? await readFile(join(DIST, 'index.html')) : 'Niet gevonden')
}

/* ---------------------------------------------------------------- start -- */

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  try {
    if (url.pathname === '/healthz') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      return res.end('ok')
    }
    if (url.pathname.startsWith('/api/')) return await api(req, res, url)
    return await statisch(req, res, url)
  } catch (err) {
    // Eén regel in de containerlog is genoeg om het terug te vinden; de
    // bezoeker krijgt niets van de fout te zien.
    console.error(`[server] ${req.method} ${url.pathname}:`, err?.message || err)
    if (res.headersSent || res.writableEnded) return res.end()
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Serverfout' }))
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] ÉLAN draait op poort ${PORT}`)
})

// De container krijgt van Docker een SIGTERM bij een deploy. Zonder deze twee
// regels wacht Docker tien seconden en schiet hem daarna alsnog af.
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => server.close(() => process.exit(0)))
}
