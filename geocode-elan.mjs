// Geocodeert de ÉLAN verkooplocaties (NL) via OpenStreetMap Nominatim.
// Respecteert het 1 req/sec gebruiksbeleid. Output: /tmp/elan_geocoded.json
import { readFileSync, writeFileSync } from 'fs'

const locs = JSON.parse(readFileSync('/tmp/elan_locs.json', 'utf8'))
const UA = 'ELAN-findus-geocoder/1.0 (baseaiworks@gmail.com)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function geocode(q) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=nl&q=' + encodeURIComponent(q)
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'nl' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const data = await res.json()
  return data[0] ? { lat: +data[0].lat, lng: +data[0].lon, display: data[0].display_name } : null
}

const out = []
for (let i = 0; i < locs.length; i++) {
  const l = locs[i]
  const tries = [
    [l.street, l.postcode, l.city, 'Netherlands'].filter(Boolean).join(', '),
    [l.street, l.city, 'Netherlands'].filter(Boolean).join(', '),
    [l.postcode, 'Netherlands'].filter(Boolean).join(', '),
  ]
  let hit = null, used = ''
  for (const q of tries) {
    if (!q) continue
    try { hit = await geocode(q) } catch (e) { console.error('err', e.message) }
    used = q
    await sleep(1100)
    if (hit) break
  }
  out.push({ ...l, lat: hit?.lat ?? null, lng: hit?.lng ?? null, matched: hit?.display ?? null, query: used })
  console.log(`${i + 1}/${locs.length}`, l.name, hit ? `→ ${hit.lat.toFixed(4)},${hit.lng.toFixed(4)}` : 'GEEN MATCH')
}
writeFileSync('/tmp/elan_geocoded.json', JSON.stringify(out, null, 1))
console.log('Klaar. Geen match:', out.filter((o) => o.lat == null).length)
