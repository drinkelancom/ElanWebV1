// ÉLAN — Shop-catalogus (Fase 0).
//
// Beheeropzet: in Fase 0 leeft de catalogus hier als config. Zodra Stripe live
// gaat (Fase 1) wordt Stripe de bron voor producten/prijzen/voorraad en leest de
// shop die uit via /api/products. De structuur hieronder is daar al op voorbereid.
//
// Per product bepaalt `buyMode` de koopknop:
//   'reseller' → knop stuurt naar wederverkopers (+ tie-in met de Find Us-kaart)
//   'preorder' → "hou me op de hoogte" via Web3Forms (zelfde patroon als Contact)
//   'live'     → Stripe Checkout (pas actief in Fase 1; stripePriceId invullen)
//
// Strategie: reseller-first. Losse pakken lopen via wederverkopers; cases en het
// abonnement verkopen we straks zelf via Stripe. Prijzen hieronder zijn PLACEHOLDER
// om de UI realistisch te vullen — pas ze aan of vervang door de Stripe-prijs.

// Globale val-terug-modus. Op 'live' schakel je pas als /api/* + Stripe klaar zijn.
export const SHOP_MODE = 'prelaunch' // 'prelaunch' | 'live'

// Web3Forms access key (gedeeld met het contactformulier) — voor pre-order/notify.
export const WEB3FORMS_KEY = '25c97098-16a2-42ba-ad85-603bf65fc024'

// Wederverkopers. TODO: echte links invullen. De Find Us-kaart blijft de
// volledige, geografische lijst; dit is de korte "online te koop bij"-selectie.
export const resellers = [
  { name: 'Wederverkoper 1', url: '#', note: 'Online bestellen' },
  { name: 'Wederverkoper 2', url: '#', note: 'Online bestellen' },
  { name: 'Wederverkoper 3', url: '#', note: 'Online bestellen' },
]

export const shop = {
  eyebrow: 'The ÉLAN shop',
  script: 'take it home',
  title: 'Breng de tropen in huis.',
  body:
    '100% puur kokoswater — los te koop bij onze wederverkopers, of straks per case ' +
    'en als maandelijks abonnement rechtstreeks van ÉLAN.',
  // Vertrouwens-strip onder de hero.
  trust: [
    ['iDEAL & creditcard', 'Veilig afrekenen via Stripe'],
    ['Vers gegarandeerd', 'Recht uit de kokosnoot'],
    ['Verzending NL', 'Gratis vanaf €35'],
  ],
}

// De catalogus. Nutrition/beeld hergebruiken de bestaande merk-assets.
export const products = [
  {
    slug: 'elan-500',
    name: 'ÉLAN 500 ml',
    subtitle: 'Los pak — 100% puur kokoswater',
    price: 2.95,
    unit: 'per pak',
    image: '/elan-bottle.webp',
    badge: 'Bestseller',
    buyMode: 'reseller',
    stripePriceId: null,
    short:
      'Het hersluitbare pak van 500 ml met dop. Niet uit concentraat, zonder ' +
      'toegevoegde suikers. Overal onderweg mee te nemen.',
    highlights: [
      '100% puur kokoswater — nooit uit concentraat',
      'Van nature rijk aan kalium en magnesium',
      'Slechts 19 kcal per 100 ml',
      'Vegan, glutenvrij, zonder conserveermiddelen',
    ],
  },
  {
    slug: 'elan-case-12',
    name: 'Voordeelcase — 12× 500 ml',
    subtitle: 'Sla je voorraad in met voordeel',
    price: 29.95,
    priceCompare: 35.4,
    unit: 'per case (12 stuks)',
    image: '/elan-bottle.webp',
    badge: 'Beste deal',
    buyMode: 'preorder',
    stripePriceId: null,
    short:
      'Twaalf pakken ÉLAN in één doos, met casevoordeel. De slimste manier om ' +
      'altijd fris kokoswater in huis te hebben. Binnenkort rechtstreeks te bestellen.',
    highlights: [
      '12 pakken van 500 ml',
      'Voordeel t.o.v. los kopen',
      'Gratis verzending binnen NL vanaf €35',
      'Ideaal voor thuis, sport of kantoor',
    ],
  },
  {
    slug: 'elan-abo',
    name: 'ÉLAN Abonnement',
    subtitle: 'Elke maand vers thuisbezorgd',
    price: 27.95,
    unit: 'per maand — opzegbaar',
    image: '/elan-bottle.webp',
    badge: 'Nieuw',
    buyMode: 'preorder',
    stripePriceId: null,
    short:
      'Nooit meer zonder. Elke maand een case ÉLAN in de bus, met abonnee-voordeel ' +
      'en altijd opzegbaar. Binnenkort beschikbaar.',
    highlights: [
      'Maandelijkse levering — geen omkijken naar',
      'Abonnee-voordeel op elke case',
      'Op elk moment pauzeren of opzeggen',
      'Gratis verzending inbegrepen',
    ],
  },
]

export const getProduct = (slug) => products.find((p) => p.slug === slug)

// Prijsweergave in euro's, NL-notatie.
export const euro = (n) =>
  n == null ? '' : '€' + n.toFixed(2).replace('.', ',')
