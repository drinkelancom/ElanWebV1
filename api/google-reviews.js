/* GET /api/google-reviews?lang=nl → de reviews van het Google Bedrijfsprofiel.
 *
 * Waarom via de server en niet rechtstreeks vanuit de browser: de API-sleutel
 * zou dan in de paginabron staan en door iedereen te gebruiken zijn. Hier
 * blijft hij op de server en krijgt de bezoeker alleen het resultaat.
 *
 * Nodig in Vercel:
 *   GOOGLE_PLACE_ID      — het plaats-id van het bedrijfsprofiel
 *   GOOGLE_MAPS_API_KEY  — sleutel met de Places API (New) aangezet
 *
 * Ontbreekt er één, dan geeft dit endpoint {configured:false} terug en laat de
 * site het Google-blok gewoon weg. De rest van de pagina blijft werken.
 *
 * Let op: Google geeft maximaal vijf reviews terug en er is geen manier om er
 * meer op te halen. Het is dus een greep uit de reviews, geen volledig
 * overzicht — vandaar de link naar het profiel voor de rest.
 */

const PLACES = 'https://places.googleapis.com/v1/places'
const VELDEN = 'rating,userRatingCount,googleMapsUri,reviews'

/* Zes uur cachen aan de rand van het netwerk. Reviews veranderen zelden, en
   dit scheelt het overgrote deel van de aanroepen — die worden per stuk
   afgerekend. Bij een storing juist niets cachen, anders blijft de fout
   uren hangen. */
const CACHE = 's-maxage=21600, stale-while-revalidate=86400'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const placeId = process.env.GOOGLE_PLACE_ID
  const key = process.env.GOOGLE_MAPS_API_KEY

  if (!placeId || !key) {
    /* Net als X-Review-Store bij de eigen reviews: van buitenaf te zien wat
       er scheelt, zonder de sleutel zelf prijs te geven. */
    res.setHeader('X-Google-Reviews', 'off')
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ configured: false, reviews: [] })
  }

  // Google vertaalt de reviewtekst mee als je een taal meegeeft.
  const lang = req.query?.lang === 'en' ? 'en' : 'nl'

  try {
    const url = `${PLACES}/${encodeURIComponent(placeId)}?languageCode=${lang}`
    const antwoord = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': VELDEN,
      },
    })

    if (!antwoord.ok) {
      // De melding van Google bevat de reden (verkeerd id, API niet aangezet,
      // sleutel geweigerd). Die hoort in de logs, niet in het antwoord.
      const tekst = await antwoord.text().catch(() => '')
      console.error(`[google-reviews] Google gaf ${antwoord.status}:`, tekst.slice(0, 500))
      res.setHeader('X-Google-Reviews', `error:${antwoord.status}`)
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ configured: true, error: true, reviews: [] })
    }

    const data = await antwoord.json()
    const reviews = (Array.isArray(data.reviews) ? data.reviews : [])
      .map(normaliseer)
      .filter((r) => r.text)

    res.setHeader('X-Google-Reviews', `ok:${reviews.length}`)
    res.setHeader('Cache-Control', CACHE)
    return res.status(200).json({
      configured: true,
      rating: typeof data.rating === 'number' ? data.rating : null,
      total: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
      url: data.googleMapsUri || null,
      writeUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
      reviews,
    })
  } catch (err) {
    console.error('[google-reviews] ophalen mislukt:', err)
    res.setHeader('X-Google-Reviews', `error:${err?.name || 'Onbekend'}`)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ configured: true, error: true, reviews: [] })
  }
}

/* Alleen doorgeven wat de site echt toont. De naam van de schrijver en de link
   naar zijn review zijn geen extraatje: Google verplicht die bronvermelding
   bij het tonen van reviews. */
function normaliseer(r) {
  return {
    id: r.name || null,
    author: r.authorAttribution?.displayName || 'Google-gebruiker',
    authorUrl: r.authorAttribution?.uri || null,
    photo: r.authorAttribution?.photoUri || null,
    rating: Number(r.rating) || 0,
    text: (r.text?.text || r.originalText?.text || '').trim(),
    when: r.relativePublishTimeDescription || null,
    url: r.googleMapsUri || null,
  }
}
