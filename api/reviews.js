/* GET  /api/reviews  → de goedgekeurde reviews, voor de site
 * POST /api/reviews  → nieuwe review; wordt opgeslagen als 'pending' en
 *                      gemaild naar Info@drinkelan.com met een goedkeur-link.
 *
 * Een review wordt nooit direct gepubliceerd. Zonder die drempel komt spam
 * rechtstreeks op de homepage terecht.
 */

import { readAll, mutate, newId, sendModerationMail, hasStorage } from './_store.js'

const LIMITS = { name: 60, place: 60, email: 120, text: 1500 }

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/* Alleen de velden die publiek mogen. Het e-mailadres van de reviewer blijft
   bewust achter — dat gaat alleen mee in de moderatiemail. */
function publicView(r) {
  return { name: r.name, place: r.place || undefined, rating: r.rating, date: r.date, text: r.text }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    /* X-Review-Store maakt van buitenaf controleerbaar of de opslag werkt:
       'off'   = geen BLOB_READ_WRITE_TOKEN in de omgeving
       'ok'    = opslag gelezen
       'error' = opslag gekoppeld maar het lezen faalde (met het type fout)
       Bevat bewust geen tokens of andere gevoelige waarden. */
    if (!hasStorage()) {
      res.setHeader('X-Review-Store', 'off')
      return res.status(200).json({ reviews: [] })
    }
    try {
      const { reviews } = await readAll()
      const approved = reviews
        .filter((r) => r.approved)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .map(publicView)
      res.setHeader('X-Review-Store', 'ok')
      // Kort cachen: reviews veranderen zelden, maar een goedkeuring moet
      // wel binnen een minuut zichtbaar zijn.
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res.status(200).json({ reviews: approved })
    } catch (err) {
      console.error('[reviews] GET mislukt:', err)
      res.setHeader('X-Review-Store', `error:${err?.name || 'Onbekend'}`)
      return res.status(200).json({ reviews: [] })
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {}

  // Honeypot: bots vullen elk veld in, mensen zien dit veld niet.
  if (body.botcheck) return res.status(200).json({ success: true })

  const rating = Number(body.rating)
  const review = {
    id: newId(),
    name: clean(body.name, LIMITS.name),
    place: clean(body.place, LIMITS.place),
    email: clean(body.email, LIMITS.email),
    text: clean(body.message ?? body.text, LIMITS.text),
    rating,
    date: new Date().toISOString().slice(0, 10),
    approved: false,
  }

  if (!review.name || !review.text || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Vul je naam, een waardering en een review in.' })
  }

  // Opslaan gaat vóór het versturen van de melding. De review bewaren is het
  // enige dat écht niet mis mag gaan; een mislukte melding is vervelend maar
  // mag een bezoeker nooit zijn review kosten.
  try {
    if (!hasStorage()) {
      console.warn('[reviews] BLOB_READ_WRITE_TOKEN ontbreekt — review kan niet worden opgeslagen.')
      return res.status(503).json({ error: 'Opslag niet beschikbaar', stage: 'geen-opslag' })
    }
    // Het e-mailadres bewust niet bewaren: het is alleen nodig om de
    // inzender te kunnen beantwoorden en gaat mee in de melding (AVG).
    const { email, ...stored } = review
    await mutate((all) => [...all, stored])
  } catch (err) {
    console.error('[reviews] opslaan mislukt:', err)
    return res.status(500).json({ error: 'Opslaan mislukt', stage: 'opslag', type: err?.name || 'Error' })
  }

  // Melding is een extraatje: faalt hij, dan staat de review er nog steeds en
  // is hij zichtbaar op de moderatiepagina.
  let notified = true
  try {
    await sendModerationMail({ review, origin: siteOrigin(req) })
  } catch (err) {
    notified = false
    console.error('[reviews] melding versturen mislukt:', err)
  }

  return res.status(200).json({ success: true, notified })
}

function safeParse(s) {
  try { return JSON.parse(s) } catch { return {} }
}

function siteOrigin(req) {
  if (process.env.SITE_ORIGIN) return process.env.SITE_ORIGIN
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}
