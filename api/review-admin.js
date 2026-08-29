/* Moderatie-overzicht: alle wachtende en gepubliceerde reviews op één pagina,
 * met knoppen om te publiceren of weg te gooien.
 *
 * Waarom dit bestaat: de goedkeur-links zitten in de moderatiemail, en die
 * mail komt niet altijd aan (Web3Forms weigert aanroepen vanaf een server op
 * het gratis plan). Zonder dit overzicht zou een review wél opgeslagen worden
 * maar nooit meer bereikbaar zijn. Dit is dus de bodem onder de moderatie —
 * de mail is er alleen om je een seintje te geven.
 *
 * Beveiliging: één sleutel in de URL, te zetten als REVIEW_ADMIN_KEY in
 * Vercel. Staat die er niet, dan geldt REVIEW_SECRET. Bij een verkeerde of
 * ontbrekende sleutel doet de pagina alsof hij niet bestaat (404) — een 403
 * zou verklappen dát er hier iets te halen valt.
 */

import { readAll, mutate } from './_store.js'
import { timingSafeEqual } from 'node:crypto'
import { shell, page, esc, stars } from './_page.js'

const MELDINGEN = {
  published: 'De review staat nu op drinkelan.com.',
  deleted: 'De review is weggegooid.',
  gone: 'Die review bestond al niet meer.',
}

export default async function handler(req, res) {
  const body = readBody(req)
  const key = req.method === 'POST' ? body.key : req.query?.key

  if (!validKey(key)) {
    // Bewust hetzelfde antwoord als voor een willekeurige onbekende URL.
    return html(res, 404, page('Niet gevonden', 'Deze pagina bestaat niet.'))
  }

  try {
    if (req.method === 'POST') {
      const done = await apply(body.id, body.action)
      // Na een actie doorsturen naar het overzicht, zodat vernieuwen in de
      // browser die actie niet nog een keer uitvoert.
      res.setHeader('Location', `/api/review-admin?key=${encodeURIComponent(key)}&done=${done}`)
      return res.status(303).end()
    }

    const { reviews } = await readAll()
    return html(res, 200, overview(reviews, key, req.query?.done))
  } catch (err) {
    console.error('[review-admin] mislukt:', err)
    return html(res, 500, page('Er ging iets mis', 'De reviews konden niet geladen worden. Probeer het zo nog eens.'))
  }
}

async function apply(id, action) {
  if (!id) return 'gone'
  if (action === 'approve') {
    let found = false
    await mutate((all) =>
      all.map((r) => {
        if (r.id !== id) return r
        found = true
        return { ...r, approved: true }
      }))
    return found ? 'published' : 'gone'
  }
  if (action === 'reject') {
    let found = false
    await mutate((all) => all.filter((r) => {
      if (r.id !== id) return true
      found = true
      return false
    }))
    return found ? 'deleted' : 'gone'
  }
  return 'gone'
}

function validKey(given) {
  const expected = process.env.REVIEW_ADMIN_KEY || process.env.REVIEW_SECRET
  if (!expected) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(String(given || ''))
  return a.length === b.length && timingSafeEqual(a, b)
}

/* Vercel ontleedt een formulierinzending meestal zelf; bij een ruwe string
   doen we het alsnog, zodat de pagina niet stukgaat op een runtime-verschil. */
function readBody(req) {
  const b = req.body
  if (!b) return {}
  if (typeof b === 'string') return Object.fromEntries(new URLSearchParams(b))
  return b
}

function html(res, status, doc) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  return res.status(status).send(doc)
}

const EXTRA = `
  body{display:block;padding:32px 24px 64px}
  .wrap{max-width:720px;margin:0 auto}
  .head{margin-bottom:28px}
  .head h1{font-size:34px}
  .melding{background:#eaf7e6;border:1px solid #51b83e;border-radius:14px;
           padding:14px 18px;margin-bottom:24px;color:#2f5f26}
  h2{font-family:Georgia,serif;font-size:21px;margin:34px 0 14px}
  .leeg{color:#6b6a66;font-style:italic}
  .item{background:#fff;border:1px solid rgba(20,19,15,.12);border-radius:20px;
        padding:24px;margin-bottom:14px;box-shadow:0 18px 40px -34px rgba(18,40,25,.4)}
  .item.wacht{border-color:#f0a53c}
  .item p.tekst{color:#2a2521;font-family:Georgia,serif;font-size:17px;margin-top:8px}
  .row{margin-top:16px}
  button{padding:11px 22px;font-size:14px}
  button.weg{background:transparent;color:#a3341f;border:1.5px solid rgba(163,52,31,.4)}
  form{display:inline}
`

function overview(reviews, key, done) {
  const wachtend = reviews.filter((r) => !r.approved)
  const online = reviews
    .filter((r) => r.approved)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return shell('Reviews beheren', `<div class="wrap">
<div class="head">
  <h1>Reviews beheren</h1>
  <p>${wachtend.length === 0 ? 'Niets wacht op je.'
      : wachtend.length === 1 ? '1 review wacht op je oordeel.'
      : `${wachtend.length} reviews wachten op je oordeel.`}</p>
</div>
${MELDINGEN[done] ? `<div class="melding">${esc(MELDINGEN[done])}</div>` : ''}

<h2>Wachtend</h2>
${wachtend.length === 0
    ? '<p class="leeg">Geen nieuwe reviews.</p>'
    : wachtend.map((r) => item(r, key, true)).join('')}

<h2>Op de site (${online.length})</h2>
${online.length === 0
    ? '<p class="leeg">Er staat nog geen enkele review op de site.</p>'
    : online.map((r) => item(r, key, false)).join('')}
</div>`, EXTRA)
}

function item(r, key, wachtend) {
  return `<div class="item${wachtend ? ' wacht' : ''}">
  <div class="stars">${stars(r.rating)}</div>
  <p class="tekst">${esc(r.text)}</p>
  <div class="meta"><strong>${esc(r.name)}</strong>${r.place ? ' · ' + esc(r.place) : ''} · ${esc(r.date)}</div>
  <div class="row">
    ${wachtend ? knop(r.id, key, 'approve', 'Publiceren') : ''}
    ${knop(r.id, key, 'reject', 'Verwijderen', r.name)}
  </div>
</div>`
}

/* Verwijderen is definitief — ook voor een review die al op de site staat.
   Vandaar de tussenvraag; publiceren is omkeerbaar en krijgt er geen. */
function knop(id, key, action, label, bevestigNaam) {
  const vraag = bevestigNaam
    ? ` onclick="return confirm('De review van ${escJs(bevestigNaam)} definitief weggooien?')"`
    : ''
  return `<form method="POST" action="/api/review-admin">
  <input type="hidden" name="key" value="${esc(key)}">
  <input type="hidden" name="id" value="${esc(id)}">
  <input type="hidden" name="action" value="${esc(action)}">
  <button type="submit" class="${bevestigNaam ? 'weg' : ''}"${vraag}>${esc(label)}</button>
</form> `
}

/* Een naam komt van een bezoeker en belandt hier in een stukje JavaScript
   binnen een HTML-attribuut. Eerst de aanhalingstekens en regeleindes
   onschadelijk maken, daarna pas de gewone HTML-ontsnapping eroverheen. */
function escJs(s) {
  return esc(String(s ?? '').replace(/[\\'"]/g, '').replace(/[\r\n]+/g, ' '))
}
