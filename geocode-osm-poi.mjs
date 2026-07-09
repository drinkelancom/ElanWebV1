// Verfijnt de PDOK-coördinaten met echte winkel-POI's uit OpenStreetMap (Nominatim).
// OSM-POI leidend wanneer naam klopt én pin dicht bij PDOK ligt; anders PDOK behouden.
// Output: /tmp/elan_final.json
import { readFileSync, writeFileSync } from 'fs'

const pdok = JSON.parse(readFileSync('/tmp/elan_pdok.json', 'utf8'))
const UA = 'ELAN-findus-geocoder/1.0 (baseaiworks@gmail.com)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const MAX_M = 350 // max afstand POI↔PDOK om OSM te vertrouwen

const R = 6371000
const dist = (a, b) => {
  const t = (x) => (x * Math.PI) / 180
  const dLat = t(b.lat - a.lat), dLng = t(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
const tokens = (s) => (s || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4)
const GENERIC = new Set(['supermarkt', 'avondwinkel', 'shop', 'store', 'markt', 'slijterij', 'tabak', 'toko', 'import', 'export', 'group', 'foods', 'nutrition', 'studio', 'lounge', 'horeca', 'catering', 'service', 'global', 'delight'])

async function search(q) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=nl&limit=8&addressdetails=1&namedetails=1&extratags=1&q=' + encodeURIComponent(q)
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'nl' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

// Lijkt de OSM-kandidaat op deze winkel qua naam?
function nameOk(storeName, cand) {
  const nd = cand.namedetails?.name || cand.name || ''
  const hay = norm(nd) + ' ' + norm(cand.display_name)
  const toks = tokens(storeName).filter((t) => !GENERIC.has(t))
  if (!toks.length) return norm(storeName) && hay.includes(norm(storeName).slice(0, 6))
  return toks.some((t) => hay.includes(t))
}
const isPOI = (c) => c.osm_type === 'node' || ['shop', 'amenity', 'office', 'leisure', 'craft'].includes(c.class)

const out = []
let moved = 0, used = 0
for (let i = 0; i < pdok.length; i++) {
  const p = pdok[i]
  const base = { lat: p.lat, lng: p.lng }
  let chosen = base, source = 'pdok', d = 0, osmName = null
  if (p.lat != null) {
    const queries = [
      [p.name, p.street, p.city].filter(Boolean).join(', '),
      [p.name, p.city].filter(Boolean).join(', '),
    ]
    let best = null
    for (const q of queries) {
      let res = []
      try { res = await search(q) } catch (e) { console.error(e.message) }
      await sleep(1100)
      const cands = res
        .filter((c) => isPOI(c) && nameOk(p.name, c))
        .map((c) => ({ c, d: dist(base, { lat: +c.lat, lng: +c.lon }) }))
        .filter((x) => x.d <= MAX_M)
        .sort((a, b) => a.d - b.d)
      if (cands.length) { best = cands[0]; break }
    }
    if (best) {
      chosen = { lat: +best.c.lat, lng: +best.c.lon }
      source = 'osm'; d = best.d; osmName = best.c.namedetails?.name || best.c.name || best.c.display_name?.split(',')[0]
      used++; if (d > 15) moved++
    }
  }
  out.push({ ...p, lat: +chosen.lat.toFixed(6), lng: +chosen.lng.toFixed(6), source, osmName, movedMeters: Math.round(d) })
  console.log(`${String(i + 1).padStart(2)}/${pdok.length} ${source === 'osm' ? '🟢' : '·'} ${p.name}${source === 'osm' ? ` → OSM "${osmName}" (+${Math.round(d)}m)` : ' (PDOK)'}`)
}
writeFileSync('/tmp/elan_final.json', JSON.stringify(out, null, 1))
console.log(`\nKlaar. OSM-POI gebruikt: ${used}/${pdok.length} | daarvan verplaatst >15m: ${moved}`)
