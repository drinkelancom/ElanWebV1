// ÉLAN — content voor drinkelan.com.
// Lokale assets staan in /public (Insta-fotografie, palmblad, kokosnoot, video's).

export const images = {
  jungle: '/poster-jungle.jpg',
  jungleInsta: '/insta-jungle.jpg',
  coconuts: '/insta-coconuts.jpg',
  beach: '/insta-beach.jpg',
  meaning: '/meaning-yoga.jpg',
  fridge: '/insta-fridge.jpg',
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
  coconut: { src: '/video-coconut-palms.mp4', poster: '/poster-coconut-palms.jpg' },
}

export const nav = [
  { label: 'Why ÉLAN', href: '#why' },
  { label: 'The Meaning', href: '#meaning' },
  { label: 'The Story', href: '#story' },
  { label: 'Contact', href: '#contact' },
]

export const hero = {
  wordmark: 'ÉLAN',
  script: 'born from purity',
  tagline: 'The pure refreshment of today.',
  sub: 'Hydration with flavor, without compromise. ÉLAN hydrates your body from within, with visible results on the outside.',
  cta: 'Discover ÉLAN',
}

export const marquee = [
  '100% Pure', 'no added sugars', 'Vol elektrolyten', 'vegan & gluten-free',
  'Niet uit concentraat', 'naturally hydrating', '19 kcal / 100 ml',
]

// Scroll-gedreven productreis (sticky pak).
export const journey = [
  {
    n: '01',
    eyebrow: 'Recht uit de kokosnoot',
    title: '100% puur.\nNiets erbij.',
    body: 'Geen concentraat, geen toegevoegde suikers, geen conserveermiddelen. Alleen kokoswater zoals de natuur het bedoelde — helder, licht en eerlijk.',
    side: 'center',
    tint: '#123324',
  },
  {
    n: '02',
    eyebrow: 'Van nature in balans',
    title: 'Vol\nelektrolyten.',
    body: 'Rijk aan kalium en magnesium. ÉLAN hydrateert je van binnenuit en herstelt wat een lange dag, een training of de zon van je vraagt.',
    side: 'right',
    tint: '#0d4436',
  },
  {
    n: '03',
    eyebrow: 'Licht & verfrissend',
    title: 'Guilt-free\ndorstlesser.',
    body: 'Slechts 19 kcal per 100 ml. Lichtzoet, verfrissend en laag in calorieën — het heldere alternatief voor alles wat te zwaar of te zoet is.',
    side: 'left',
    tint: '#175a33',
  },
  {
    n: '04',
    eyebrow: 'Altijd bij de hand',
    title: 'Gemaakt\nvoor onderweg.',
    body: 'Een hersluitbaar pak van 500 ml met dop. In de gym, op het festival of onderweg — ÉLAN gaat mee en blijft fris.',
    side: 'center',
    tint: '#1e6e35',
  },
]

// Benefits-constellatie rond het pak (Insta-stijl, script + pijlen).
export const orbit = {
  script: 'pure goodness',
  title: 'Everything your body needs. Nothing it doesn’t.',
  labels: [
    { text: 'naturally rich\nin electrolytes', pos: 'p1', arrow: 'r' },
    { text: 'zero fat', pos: 'p2', arrow: 'r' },
    { text: 'no added\nsugars', pos: 'p3', arrow: 'ru' },
    { text: 'vegan &\ngluten-free', pos: 'p4', arrow: 'rd' },
    { text: 'source of\nnatural vitamins', pos: 'p5', arrow: 'ld' },
    { text: 'naturally\nhydrating', pos: 'p6', arrow: 'ld' },
    { text: 'rich in potassium\n& magnesium', pos: 'p7', arrow: 'l' },
    { text: 'low in\ncalories', pos: 'p8', arrow: 'lu' },
    { text: 'not from\nconcentrate', pos: 'p9', arrow: 'lu' },
  ],
}

export const videoBand = {
  script: 'straight from the source',
  title: 'Tapped from young green coconuts.',
  body: 'Eén ingrediënt. Nul concessies. Gebotteld op het moment dat de natuur er klaar voor is.',
}

export const meaning = {
  id: 'meaning',
  script: 'the meaning',
  title: 'Energy, flair & enthusiasm.',
  body: 'ÉLAN means energy, flair, and enthusiasm. It symbolizes vitality and a zest for life — exactly what our coconut water represents.',
  body2: 'ÉLAN coconut water is 100% pure and not made from concentrates, with no added sugars or preservatives. Vegan, gluten-free and naturally rich in electrolytes.',
  stats: [
    ['100%', 'Puur kokoswater'],
    ['0g', 'Toegevoegde suikers'],
    ['Vegan', '& glutenvrij'],
  ],
}

export const nutrition = {
  eyebrow: 'Voedingswaarde',
  script: 'pure & transparent',
  title: 'Wat je proeft is precies wat erin zit.',
  per: 'per 100 ml',
  rows: [
    ['Energie', '19 kcal'],
    ['Koolhydraten', '4.5 g'],
    ['— waarvan suikers', '4.5 g'],
    ['Eiwitten', '0 g'],
    ['Zout', '0.04 g'],
    ['Kalium', '250 mg'],
  ],
  badge: 'Vegan · Glutenvrij · Zonder conserveermiddelen',
}

export const beach = {
  script: 'sunshine in a carton',
  title: 'Join the movement.',
  body: 'For those who choose to live consciously, stylishly and full of energy. Also for children.',
  cta: 'Join us today',
}

export const fridge = {
  eyebrow: 'Always within reach',
  script: 'your daily ritual',
  title: 'Cold. Fresh. Ready.',
  body: 'Van smoothiebowl tot sportfles: ÉLAN hoort thuis in elke koelkast. Puur genoeg voor elke dag, bijzonder genoeg voor elk moment.',
  benefits: [
    '100% puur kokoswater — nooit uit concentraat',
    'Van nature rijk aan kalium en magnesium',
    'Hersluitbaar 500 ml pak met dop',
  ],
  cta: 'Find ÉLAN near you',
}

export const story = {
  eyebrow: 'The Story',
  script: 'our story',
  title: 'What started as a simple drink became our story.',
  body: 'From a single sip of pure coconut water to a brand built on clarity, energy and conscious living — this is the beginning of ÉLAN.',
}

export const contact = {
  title: 'Contact us',
  company: 'ELAN WORLD BV',
  address: ['Cypresbaan 55', '2908 LT Capelle a/d IJssel'],
  email: 'Info@drinkelan.com',
  phone: '+31 6 4273 0763',
}

export const socials = {
  script: 'join the journey',
  title: 'Volg ÉLAN op social',
  body: 'Proef de tropen mee — je dagelijkse dosis frisheid, kokoswater en zon.',
  instagram: { handle: '@drink.elan', url: 'https://www.instagram.com/drink.elan/' },
  tiktok: { handle: '@drinkelan', url: 'https://www.tiktok.com/@drinkelan' },
  // Echte Instagram-posts als "feed"
  feed: [
    { img: '/insta-jungle.jpg', cap: 'born from purity' },
    { img: '/insta-coconuts.jpg', cap: 'what is ÉLAN' },
    { img: '/insta-beach.jpg', cap: 'also for children' },
    { img: '/insta-meaning.jpg', cap: 'the meaning' },
    { img: '/insta-fridge.jpg', cap: 'always fresh' },
  ],
}
