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

// Globale val-terug-modus. Op 'live' schakel je pas als /api/* + Stripe klaar zijn.
export const SHOP_MODE = 'prelaunch' // 'prelaunch' | 'live'

// Taal-onafhankelijke productmeta (prijs, beeld, koopmodus). Tekst per taal in
// content.js → products, samengevoegd op `slug` in de shop.
export const productMeta = {
  'elan-500':     { price: 2.95,  image: '/elan-bottle.webp', buyMode: 'reseller', stripePriceId: null },
  'elan-case-12': { price: 29.95, priceCompare: 35.4, image: '/elan-bottle.webp', buyMode: 'preorder', stripePriceId: null },
  'elan-abo':     { price: 27.95, image: '/elan-bottle.webp', buyMode: 'preorder', stripePriceId: null },
}
