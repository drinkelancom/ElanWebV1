// Hergeocodeert de ÉLAN verkooplocaties via de PDOK Locatieserver (BAG).
// Strategie: geldige bron-postcode is LEIDEND (bepaalt het juiste straatdeel/kant),
// mits de straatnaam klopt. Binnen die postcode pakken we het exacte huisnummer of
// het dichtstbijzijnde. Anders terugval op straat+plaats-matching. Output: /tmp/elan_pdok.json
import { readFileSync, writeFileSync } from 'fs'

const locs = JSON.parse(readFileSync('/tmp/elan_locs.json', 'utf8'))
const BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const parsePoint = (wkt) => {
  const m = /POINT\(([-\d.]+)\s+([-\d.]+)\)/.exec(wkt || '')
  return m ? { lng: +m[1], lat: +m[2] } : null
}
const houseNum = (street) => {
  const t = (street || '').replace(/^\s*\d+e?\.?\s+/i, '')
  const m = t.match(/\d+/); return m ? +m[0] : null
}
const streetName = (s) => (s || '')
  .replace(/^\s*\d+e?\.?\s+/i, '').replace(/\d.*$/, '')
  .toLowerCase().replace(/[^a-zà-ÿ]/g, '')
const normPC = (pc) => (pc || '').toUpperCase().replace(/\s+/g, '')
const validPC = (pc) => /^[1-9]\d{3}[A-Z]{2}$/.test(normPC(pc))
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[m][n]
}
const sim = (a, b) => (!a || !b) ? 0 : 1 - lev(a, b) / Math.max(a.length, b.length)
// Betekenisvolle woorden uit een straatnaam (>=4 letters), zonder huisnummer.
const streetTokens = (s) => (s || '')
  .replace(/^\s*\d+e?\.?\s+/i, '').replace(/\d.*$/, '')
  .toLowerCase().split(/[^a-zà-ÿ]+/).filter((w) => w.length >= 4)
// Straatnamen matchen als ze een woord delen (vangt "Burg." vs "Burgemeester")
// of als de volledige genormaliseerde naam genoeg lijkt (vangt typefouten).
function streetMatch(srcStreet, pdokStreet) {
  const a = streetTokens(srcStreet), b = streetTokens(pdokStreet)
  if (a.some((t) => b.includes(t))) return true
  return sim(streetName(srcStreet), streetName(pdokStreet)) >= 0.75
}

async function query(q, fq, rows = 30) {
  const params = new URLSearchParams({ q, rows: String(rows), fl: 'weergavenaam,centroide_ll,score,huisnummer,straatnaam,woonplaatsnaam,postcode,type' })
  if (fq) (Array.isArray(fq) ? fq : [fq]).forEach((f) => params.append('fq', f))
  const res = await fetch(`${BASE}?${params}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return (await res.json()).response?.docs || []
}
const SIM_OK = 0.6

const out = []
for (let i = 0; i < locs.length; i++) {
  const l = locs[i]
  const want = houseNum(l.street)
  const reqName = streetName(l.street)
  const cityL = (l.city || '').toLowerCase().replace("s-gravenhage", 'gravenhage')
  let doc = null, tier = '', strSim = null

  // 1) Postcode leidend (als geldig)
  let deferToStreet = false
  if (validPC(l.postcode)) {
    let docs = []
    try { docs = await query([l.street || l.city, l.city].filter(Boolean).join(' '), `postcode:${normPC(l.postcode)}`) } catch (e) { console.error(e.message) }
    await sleep(110)
    const adres = docs.filter((d) => d.type === 'adres' && d.huisnummer != null)
    if (adres.length && streetMatch(l.street, adres[0].straatnaam)) {
      strSim = sim(reqName, streetName(adres[0].straatnaam))
      const exact = adres.find((d) => +d.huisnummer === want)
      const nearest = want != null
        ? adres.slice().sort((a, b) => Math.abs(+a.huisnummer - want) - Math.abs(+b.huisnummer - want))[0]
        : null
      // Grote afstand tussen bron-nummer en dichtstbijzijnde in de postcode →
      // de postcode hoort niet bij dit huisnummer; laat het over aan huisnummer-matching.
      const farOff = exact == null && want != null && nearest != null && Math.abs(+nearest.huisnummer - want) > 15
      if (exact) { doc = exact; tier = 'pc-exact' }
      else if (want == null) { doc = adres[0]; tier = 'pc-straat' }
      else if (!farOff) { doc = nearest; tier = 'pc-nabij' }
      else deferToStreet = true
    } else if (adres.length) {
      deferToStreet = true // postcode wijst naar een andere straat → vertrouw straat+huisnummer
    }
    if (!doc && !deferToStreet) {
      const centroid = docs.find((d) => d.type === 'postcode')
      if (centroid) { doc = centroid; tier = 'pc-centroid' }
    }
  }

  // 2) Terugval: straat + plaats (postcode onbruikbaar/ver weg of straat klopt niet)
  if (!doc) {
    let pool = []
    try { pool = pool.concat(await query([l.street, l.city].filter(Boolean).join(' '), 'type:adres', 15)) } catch {}
    await sleep(110)
    try { pool = pool.concat(await query([l.street, l.postcode, l.city].filter(Boolean).join(' '), 'type:adres', 15)) } catch {}
    await sleep(110)
    const scored = pool.filter((d) => d.type === 'adres').map((d) => {
      const s = sim(reqName, streetName(d.straatnaam))
      const hn = +d.huisnummer === want, cityOk = cityL && (d.woonplaatsnaam || '').toLowerCase().includes(cityL)
      return { d, s, score: s * 100 + (hn ? 40 : 0) + (cityOk ? 12 : 0) }
    }).sort((a, b) => b.score - a.score)
    if (scored.length && scored[0].s >= SIM_OK) {
      doc = scored[0].d; strSim = scored[0].s
      tier = +doc.huisnummer === want ? 'straat-exact' : 'straat-nabij'
    } else {
      let pc = []
      try { pc = await query([l.postcode, l.city].filter(Boolean).join(' '), 'type:postcode', 3) } catch {}
      await sleep(110)
      if (pc.length) { doc = pc[0]; tier = 'postcode-fallback' }
      else if (scored.length) { doc = scored[0].d; tier = 'zwak'; strSim = scored[0].s }
    }
  }

  const pt = doc ? parsePoint(doc.centroide_ll) : null
  out.push({
    name: l.name, street: l.street, postcode: l.postcode, city: l.city,
    lat: pt?.lat ?? null, lng: pt?.lng ?? null, tier,
    pdokAddr: doc?.weergavenaam ?? null, pdokCity: doc?.woonplaatsnaam ?? null,
    pdokPostcode: doc?.postcode ?? null,
    wantHouse: want, gotHouse: doc?.huisnummer ?? null, streetSim: strSim != null ? +strSim.toFixed(2) : null,
  })
  const mark = /exact/.test(tier) ? '✓' : /nabij|straat/.test(tier) ? '≈' : /centroid|fallback/.test(tier) ? '◻' : '?'
  console.log(`${String(i + 1).padStart(2)}/${locs.length} ${mark} ${l.name} → ${pt ? pt.lat.toFixed(5) + ',' + pt.lng.toFixed(5) : 'GEEN'} | ${doc?.weergavenaam || ''} [${tier}${strSim != null ? ' sim ' + strSim.toFixed(2) : ''}]`)
}
writeFileSync('/tmp/elan_pdok.json', JSON.stringify(out, null, 1))
const sum = (f) => out.filter(f).length
console.log(`\nKlaar. exact: ${sum((o) => /exact/.test(o.tier))} | nabij: ${sum((o) => /nabij/.test(o.tier))} | centroid/fallback: ${sum((o) => /centroid|fallback/.test(o.tier))} | overig: ${sum((o) => o.tier === 'zwak' || !o.lat)}`)
