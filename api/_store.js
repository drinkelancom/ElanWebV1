/* Gedeelde opslag- en beveiligingslaag voor de reviews.
 *
 * Reviews staan als één JSON-bestand in Vercel Blob (private). Bij dit volume
 * — een paar honderd reviews maximaal — is dat ruim voldoende en scheelt het
 * een complete database. Wil je later toch naar Postgres/Supabase, dan is dít
 * het enige bestand dat verandert; de endpoints blijven gelijk.
 *
 * Benodigde environment variables in Vercel:
 *   BLOB_READ_WRITE_TOKEN  — komt automatisch als je een Blob-store koppelt
 *   REVIEW_SECRET          — zelfverzonnen lange string, ondertekent de
 *                            goedkeur-links in de mail
 *   WEB3FORMS_KEY          — optioneel; valt terug op de key uit src/data.js
 */

import { get, put } from '@vercel/blob'
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto'

const BLOB_PATH = 'reviews/reviews.json'

/* Zelfde key als het contactformulier (src/data.js). Web3Forms-keys zijn
   publiek van opzet — ze mogen alleen mailen naar het geregistreerde adres. */
const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY || '25c97098-16a2-42ba-ad85-603bf65fc024'

export const hasStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

/* @vercel/blob geeft afhankelijk van de runtime een web- of Node-stream terug.
   Beide afhandelen scheelt verrassingen bij een runtime-upgrade. */
async function streamToString(stream) {
  if (typeof stream?.getReader === 'function') return new Response(stream).text()
  const chunks = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

/* Leest alle reviews (ook de nog niet goedgekeurde) plus de etag, die we bij
   het schrijven gebruiken om elkaars wijzigingen niet te overschrijven. */
export async function readAll() {
  if (!hasStorage()) return { reviews: [], etag: null }
  const result = await get(BLOB_PATH, { access: 'private' })
  if (!result) return { reviews: [], etag: null }
  try {
    const parsed = JSON.parse(await streamToString(result.stream))
    return { reviews: Array.isArray(parsed) ? parsed : [], etag: result.blob?.etag ?? null }
  } catch {
    // Corrupte JSON nooit stilletjes wegschrijven — dan liever hard falen.
    throw new Error('reviews.json is onleesbaar')
  }
}

async function write(reviews, etag) {
  await put(BLOB_PATH, JSON.stringify(reviews, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    ...(etag ? { ifMatch: etag } : {}),
  })
}

/* Lees-wijzig-schrijf met optimistische vergrendeling. Twee gelijktijdige
   goedkeuringen zouden elkaar anders kunnen overschrijven. */
export async function mutate(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    const { reviews, etag } = await readAll()
    const next = fn(reviews)
    if (next === null) return null
    try {
      await write(next, etag)
      return next
    } catch (err) {
      const conflict = err?.status === 412 || /precondition|if-match/i.test(err?.message || '')
      if (!conflict || i === attempts - 1) throw err
    }
  }
}

export const newId = () => randomUUID()

/* Ondertekent de goedkeur- en weiger-links. Zonder geldige handtekening kan
   niemand anders reviews publiceren, ook al kent hij het id. */
function secret() {
  const s = process.env.REVIEW_SECRET
  if (!s) throw new Error('REVIEW_SECRET ontbreekt')
  return s
}

export function sign(id, action) {
  return createHmac('sha256', secret()).update(`${id}:${action}`).digest('hex')
}

export function verify(id, action, token) {
  let expected
  try { expected = sign(id, action) } catch { return false }
  const a = Buffer.from(expected)
  const b = Buffer.from(String(token || ''))
  return a.length === b.length && timingSafeEqual(a, b)
}

/* Stuurt de moderatiemail via Web3Forms — dezelfde dienst als het
   contactformulier, dus geen extra leverancier erbij. */
export async function sendModerationMail({ review, origin }) {
  let links = {}
  try {
    links = {
      'GOEDKEUREN — klik om te publiceren': `${origin}/api/review-moderate?id=${review.id}&action=approve&token=${sign(review.id, 'approve')}`,
      'WEIGEREN — klik om te verwijderen': `${origin}/api/review-moderate?id=${review.id}&action=reject&token=${sign(review.id, 'reject')}`,
    }
  } catch {
    links = { Let_op: 'REVIEW_SECRET ontbreekt in Vercel — goedkeuren via een link werkt nog niet.' }
  }

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `Nieuwe review (${review.rating}/5) van ${review.name}`,
      from_name: 'ÉLAN reviews',
      Naam: review.name,
      Woonplaats: review.place || '—',
      Waardering: `${review.rating} van de 5`,
      Review: review.text,
      'E-mail reviewer': review.email || '—',
      ...links,
    }),
  })
  if (!res.ok) throw new Error(`Web3Forms gaf ${res.status}`)
}
