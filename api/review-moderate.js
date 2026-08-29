/* Goedkeuren of weigeren van een review, via de link in de moderatiemail.
 *
 * De link opent een bevestigingspagina met één knop; pas die knop voert de
 * actie uit. Dat is bewust: mailscanners en 'veilige links'-diensten volgen
 * links in e-mail automatisch, en met een directe GET-actie zou een review
 * daardoor vanzelf gepubliceerd kunnen worden.
 *
 * Zie ook review-admin.js: hetzelfde goedkeuren, maar dan vanuit één
 * overzicht in plaats van per mail.
 */

import { readAll, mutate, verify } from './_store.js'
import { page, confirmPage, esc } from './_page.js'

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
