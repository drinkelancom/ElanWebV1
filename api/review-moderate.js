/* Goedkeuren of weigeren van een review, via de link in de moderatiemail.
 *
 * De link opent een bevestigingspagina met één knop; pas die knop voert de
 * actie uit. Dat is bewust: mailscanners en 'veilige links'-diensten volgen
 * links in e-mail automatisch, en met een directe GET-actie zou een review
 * daardoor vanzelf gepubliceerd kunnen worden.
 */

import { readAll, mutate, verify } from './_store.js'

export default async function handler(req, res) {
  const { id, action, token } = req.query || {}

  if (!id || (action !== 'approve' && action !== 'reject')) {
    return html(res, 400, page('Ongeldige link', 'Deze link is niet compleet.'))
  }
  if (!verify(id, action, token)) {
    return html(res, 403, page('Link niet geldig', 'Deze link is verlopen of onjuist. Vraag een nieuwe moderatiemail aan.'))
  }

  try {
    const { reviews } = await readAll()
    const review = reviews.find((r) => r.id === id)

    if (!review) {
      return html(res, 404, page('Niet gevonden', 'Deze review bestaat niet meer — mogelijk is hij al afgehandeld.'))
    }

    // Stap 1: bevestiging tonen.
    if (req.method !== 'POST') {
      if (review.approved && action === 'approve') {
        return html(res, 200, page('Al gepubliceerd', `De review van ${esc(review.name)} staat al op de site.`))
      }
      return html(res, 200, confirmPage(review, action, id, token))
    }

    // Stap 2: uitvoeren.
    if (action === 'approve') {
      await mutate((all) => all.map((r) => (r.id === id ? { ...r, approved: true } : r)))
      return html(res, 200, page('Gepubliceerd', `De review van ${esc(review.name)} staat nu op drinkelan.com.`, true))
    }

    await mutate((all) => all.filter((r) => r.id !== id))
    return html(res, 200, page('Verwijderd', `De review van ${esc(review.name)} is weggegooid en komt niet op de site.`))
  } catch (err) {
    console.error('[review-moderate] mislukt:', err)
    return html(res, 500, page('Er ging iets mis', 'Probeer het zo nog eens.'))
  }
}

function html(res, status, body) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(status).send(body)
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

const STYLE = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#fffaee;color:#14130f;
       line-height:1.6;display:grid;place-items:center;min-height:100vh;padding:24px}
  .card{background:#fff;border:1px solid rgba(20,19,15,.12);border-radius:24px;
        padding:36px;max-width:520px;width:100%;
        box-shadow:0 30px 60px -34px rgba(18,40,25,.35)}
  h1{font-family:Georgia,serif;font-size:28px;line-height:1.15;margin-bottom:10px}
  p{color:#6b6a66}
  .quote{background:#fdfaf3;border:1px solid rgba(20,19,15,.12);border-radius:16px;
         padding:20px;margin:22px 0}
  .quote p{color:#2a2521;font-family:Georgia,serif;font-size:17px}
  .meta{font-size:14px;color:#6b6a66;margin-top:10px}
  .stars{color:#f0a53c;font-size:19px;letter-spacing:2px}
  .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
  button{font:inherit;font-weight:700;font-size:15px;padding:14px 28px;border:none;
         border-radius:999px;cursor:pointer;background:#51b83e;color:#fff}
  button.no{background:transparent;color:#14130f;border:1.5px solid rgba(20,19,15,.3)}
  a{color:#3f9430}
`

export function page(title, body, live = false) {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)} — ÉLAN</title><style>${STYLE}</style></head>
<body><div class="card"><h1>${esc(title)}</h1><p>${body}</p>
${live ? '<p style="margin-top:16px"><a href="https://www.drinkelan.com/#reviews">Bekijk de reviews →</a></p>' : ''}
</div></body></html>`
}

export function confirmPage(review, action, id, token) {
  const approving = action === 'approve'
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Review ${approving ? 'goedkeuren' : 'weigeren'} — ÉLAN</title>
<style>${STYLE}</style></head><body><div class="card">
<h1>${approving ? 'Deze review publiceren?' : 'Deze review weggooien?'}</h1>
<p>${approving ? 'Hij komt daarna direct op de site te staan.' : 'Dit kan niet ongedaan gemaakt worden.'}</p>
<div class="quote">
  <div class="stars">${stars}</div>
  <p>${esc(review.text)}</p>
  <div class="meta"><strong>${esc(review.name)}</strong>${review.place ? ' · ' + esc(review.place) : ''} · ${esc(review.date)}</div>
</div>
<form method="POST" action="/api/review-moderate?id=${esc(id)}&amp;action=${esc(action)}&amp;token=${esc(token)}">
  <div class="row">
    <button type="submit">${approving ? 'Ja, publiceren' : 'Ja, weggooien'}</button>
    <button type="button" class="no" onclick="window.close()">Annuleren</button>
  </div>
</form></div></body></html>`
}
