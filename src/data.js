// ÉLAN — taal-onafhankelijke assets & meta.
// Alle tekst staat tweetalig in content.js (NL = basis, EN = schakelaar).

export const images = {
  jungle: '/poster-jungle.jpg',
  jungleInsta: '/insta-jungle.jpg',
  coconuts: '/insta-coconuts.jpg',
  beach: '/insta-beach.jpg',
  meaning: '/story-gym.jpg',      // Bryan & Isabel — eigen lifestyle-beeld
  fridge: '/insta-fridge.jpg',    // TODO: echte koelkastfoto volgt
  story: '/story-gym.jpg',        // Ons verhaal-pagina
  palm: '/palm-leaf.webp',
  coconut: '/coconut.webp',
  kokosnoot: '/kokosnoot.png',
  bottle: '/elan-bottle.webp',
}

// Web-geoptimaliseerd: H.264 mp4 met bitrate-cap (klein én universeel compatibel).
export const videos = {
  ocean:    { src: '/video-ocean.mp4',         poster: '/poster-ocean.jpg' },
  coconut:  { src: '/video-coconut-palms.mp4', poster: '/poster-coconut-palms.jpg' },
  movement: { src: '/movement.mp4',            poster: '/movement-poster.jpg' },
  journeyDesktop: { src: '/journey-desktop.mp4', poster: '/journey-desktop-poster.jpg' },
  journeyMobile:  { src: '/journey-mobile.mp4',  poster: '/journey-mobile-poster.jpg' },
}

// Instagram-feed beelden (captions staan per taal in content.js → socials.feed).
export const socialFeedImages = [
  '/insta-jungle.jpg',
  '/insta-coconuts.jpg',
  '/insta-beach.jpg',
  '/insta-meaning.jpg',
  '/insta-fridge.jpg',
]

// Web3Forms access key (drinkelan.com → Info@drinkelan.com). Gedeeld door
// contactformulier én shop pre-order/notify.
export const WEB3FORMS_KEY = '25c97098-16a2-42ba-ad85-603bf65fc024'

// Canonieke site-URL — moet gelijk blijven aan <link rel="canonical"> in
// index.html. Wordt gebruikt om het review-schema aan het bestaande
// Product-knooppunt (#product) te koppelen.
export const SITE_URL = 'https://www.drinkelan.com'

// Handmatige uitwijk voor de "laat een review achter op Google"-knop, vorm:
// https://g.page/r/XXXXXXXXXXXX/review
//
// Normaal hoeft dit niet ingevuld te worden: staat GOOGLE_PLACE_ID in Vercel,
// dan stelt /api/google-reviews deze link zelf samen en heeft die voorrang.
// Vul dit alleen als je géén Places API gebruikt maar wél de knop wilt tonen.
// Leeg laten verbergt de knop; de rest van de sectie blijft gewoon werken.
export const GOOGLE_REVIEW_URL = ''

// Goedgekeurde klantreviews. Bewust taal-onafhankelijk: dit zijn letterlijke
// citaten van klanten, die vertalen we niet mee met de NL/EN-schakelaar.
// Nieuwe reviews komen via het formulier binnen op Info@drinkelan.com; zet ze
// hier pas neer nadat je ze hebt gelezen en goedgekeurd.
//
// Vorm: { name: 'Sanne V.', place: 'Rotterdam', rating: 5,
//         date: '2026-08-14', text: 'Echt het frisste kokoswater dat ik ken.' }
//
// Vul hier nooit verzonnen reviews in. De sterrenwaardering die naar Google
// gaat (Product-schema) wordt hieruit berekend — verzonnen reviews zijn in
// strijd met Google's richtlijnen én verboden onder de Nederlandse
// consumentenwetgeving (misleidende handelspraktijk).
export const reviews = []

// Globale val-terug-modus. Op 'live' schakel je pas als /api/* + Stripe klaar zijn.
export const SHOP_MODE = 'prelaunch' // 'prelaunch' | 'live'

// Taal-onafhankelijke productmeta (prijs, beeld, koopmodus). Tekst per taal in
// content.js → products, samengevoegd op `slug` in de shop.
export const productMeta = {
  'elan-500':     { price: 2.95,  image: '/elan-bottle.webp', buyMode: 'reseller', stripePriceId: null },
  'elan-case-12': { price: 29.95, priceCompare: 35.4, image: '/elan-case.webp', mediaFit: 'cover', buyMode: 'external', buyUrl: 'https://bgsnutrition.nl/products/elan-kokoswater?_pos=1&_psq=elan&_psid=abc91343a&_ss=e', stripePriceId: null },
  'elan-abo':     { price: 27.95, image: '/elan-bottle.webp', buyMode: 'preorder', teaser: true, comingSoon: true, stripePriceId: null },
  'elan-1l':      { price: null, image: '/elan-1l.webp', buyMode: 'preorder', comingSoon: true, mediaFit: 'cover', stripePriceId: null },
}
