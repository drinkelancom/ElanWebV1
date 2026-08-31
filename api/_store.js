/* Gedeelde opslaglaag voor de reviews.
 *
 * Reviews staan als één JSON-bestand in Vercel Blob (private). Bij dit volume
 * — een paar honderd reviews maximaal — is dat ruim voldoende en scheelt het
 * een complete database. Wil je later toch naar Postgres/Supabase, dan is dít
 * het enige bestand dat verandert; de endpoints blijven gelijk.
 *
 * Benodigde environment variables in Vercel:
 *   BLOB_READ_WRITE_TOKEN  — komt automatisch als je een Blob-store koppelt
 *   REVIEW_SECRET          — zelfverzonnen lange string; de sleutel waarmee je
 *                            /api/review-admin opent (of REVIEW_ADMIN_KEY)
 */

import { get, put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'

const BLOB_PATH = 'reviews/reviews.json'

export const hasStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

/* @vercel/blob zet op geen van zijn foutklassen een eigen `name`, dus elke
   Blob-fout komt binnen als "Error". Alleen de melding zegt wat er misging.
   Die melding mag naar buiten — hij bevat geen sleutels — maar we halen er
   voor de zekerheid alles uit wat op een token lijkt, want deze tekst belandt
   in het antwoord van een publiek endpoint. */
export function veiligeMelding(err) {
  const tekst = String(err?.message || err || 'onbekende fout')
  return tekst.replace(/vercel_blob_[a-z]{2}_[A-Za-z0-9_-]+/g, '[token]').slice(0, 300)
}

/* @vercel/blob geeft afhankelijk van de runtime een web- of Node-stream terug.
   Beide afhandelen scheelt verrassingen bij een runtime-upgrade. */
async function streamToString(stream) {
  if (typeof stream?.getReader === 'function') return new Response(stream).text()
  const chunks = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

/* get() haalt de etag uit de HTTP-header van het bestand, en daar staat hij
   volgens de HTTP-standaard tussen aanhalingstekens, eventueel met W/ ervoor
   voor een zwakke etag. put() en head() halen hem uit het JSON-antwoord van de
   Blob-API en geven hem kaal terug — en dat is de vorm die x-if-match verwacht.
   Zonder deze strip wordt élke schrijfactie op een bestaand reviews.json
   geweigerd met "Precondition failed: ETag mismatch", wat iedere ingezonden
   review een 500 opleverde. */
function normaliseerEtag(waarde) {
  if (!waarde) return null
  return String(waarde).replace(/^W\//, '').replace(/^"|"$/g, '') || null
}

/* Leest alle reviews (ook de nog niet goedgekeurde) plus de etag, die we bij
   het schrijven gebruiken om elkaars wijzigingen niet te overschrijven. */
export async function readAll() {
  if (!hasStorage()) return { reviews: [], etag: null }
  const result = await get(BLOB_PATH, { access: 'private' })
  if (!result) return { reviews: [], etag: null }
  try {
    const parsed = JSON.parse(await streamToString(result.stream))
    return {
      reviews: Array.isArray(parsed) ? parsed : [],
      etag: normaliseerEtag(result.blob?.etag),
    }
  } catch (err) {
    // Corrupte JSON nooit stilletjes wegschrijven — dan liever hard falen.
    if (err instanceof SyntaxError) throw new Error('reviews.json is onleesbaar')
    throw err
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

const isConflict = (err) =>
  err?.status === 412 || /precondition|if-match|etag/i.test(err?.message || '')

/* Lees-wijzig-schrijf met optimistische vergrendeling. Twee gelijktijdige
   goedkeuringen zouden elkaar anders kunnen overschrijven. */
export async function mutate(fn, attempts = 3) {
  let laatste
  for (let i = 0; i < attempts; i++) {
    const { reviews, etag } = await readAll()
    const next = fn(reviews)
    if (next === null) return null
    try {
      await write(next, etag)
      return next
    } catch (err) {
      laatste = err
      if (!isConflict(err)) throw err
    }
  }

  /* Alle pogingen liepen op een etag-conflict stuk. Bij dit volume is een
     échte gelijktijdige schrijfactie zo goed als uitgesloten, dus een conflict
     dat drie keer terugkomt wijst op iets structureels en niet op een race.
     Dan liever één keer zonder slot schrijven dan de review van een bezoeker
     weggooien — dat is precies wat hiervoor gebeurde. De waarschuwing staat er
     zodat het in de logs opvalt als het tóch structureel wordt. */
  console.warn('[store] etag-conflict bleef terugkomen, laatste poging zonder slot:', laatste?.message)
  const { reviews } = await readAll()
  const next = fn(reviews)
  if (next === null) return null
  await write(next, null)
  return next
}

export const newId = () => randomUUID()
