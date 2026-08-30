/* Bouwt een paar echte HTML-pagina's naast de app. Draait na `vite build`.
 *
 * Waarom dit bestaat
 * ------------------
 * De site is een React-app in één HTML-bestand. Wie hem opvraagt zonder
 * JavaScript uit te voeren krijgt vijf kilobyte met een lege div. Googlebot
 * rendert wel, maar de crawlers waar het bij AI-zoekmachines om draait
 * (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot) doen dat niet of nauwelijks.
 * Voor die crawlers bestaat drinkelan.com dus uit niets.
 *
 * Deze generator zet de informatie die anders alleen achter JavaScript zit in
 * platte HTML op eigen URL's. Geen tweede website: het zijn de feiten die de
 * app ook toont, uit dezelfde bronbestanden, zodat ze niet uit elkaar kunnen
 * lopen. content.js, locations.js en faq.js blijven de enige waarheid.
 *
 * Bewust géén hash-routes in de sitemap: alles achter een # is voor een
 * zoekmachine dezelfde pagina.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { content } from './src/content.js'
import { locations } from './src/locations.js'
import { faq } from './src/faq.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE = 'https://www.drinkelan.com'

/* Plaatsnamen zoals ze in de BAG staan zijn niet de plaatsnamen waarop mensen
   zoeken. Niemand typt 's-Gravenhage. */
const PLAATSNAAM = {
  "'s-Gravenhage": 'Den Haag',
  "'s-Hertogenbosch": 'Den Bosch',
}

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const winkels = locations.filter((l) => l.type !== 'hq' && l.country === 'Netherlands')

/* ---------------------------------------------------------------- layout -- */

/* Eén sjabloon voor alle pagina's. De stijl staat inline: het gaat om vier
   documenten, een los stylesheet is een extra verzoek voor niets. De fonts
   komen van dezelfde bron als de app, zodat een bezoeker die hier uit Google
   binnenvalt niet op een ander merk lijkt te landen. */
function pagina({ lang, title, description, path, alternates = [], schema, body }) {
  const url = `${SITE}${path}`
  const hreflang = alternates
    .map((a) => `\n    <link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.path}" />`)
    .join('')

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />${hreflang}
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="#0c2c1b" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="ÉLAN" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/og-image.jpg" />
    <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
    <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,800&f[]=zodiak@400,700&display=swap" rel="stylesheet" />
    <style>
      :root { --ivoor:#fffaee; --groen:#51b83e; --diep:#0c2c1b; --grijs:#53565a; }
      *,*::before,*::after { box-sizing:border-box; }
      body { margin:0; background:var(--ivoor); color:var(--diep);
             font-family:'Cabinet Grotesk',system-ui,-apple-system,sans-serif;
             line-height:1.65; -webkit-font-smoothing:antialiased; }
      .wrap { max-width:44rem; margin:0 auto; padding:0 1.5rem; }
      header.top { border-bottom:1px solid rgba(12,44,27,.12); }
      header.top .wrap { display:flex; align-items:center; justify-content:space-between;
                         gap:1rem; padding-block:1.25rem; }
      .mark { font-weight:800; letter-spacing:.28em; font-size:.8rem; text-decoration:none; color:var(--diep); }
      .top nav a { margin-left:1.25rem; font-size:.85rem; color:var(--grijs); text-decoration:none; }
      .top nav a:hover { color:var(--groen); }
      /* main.wrap en niet main: .wrap zet padding-block op 0 en wint van een
         losse elementselector. */
      main.wrap { padding-block:3.5rem 4rem; }
      h1 { font-family:Zodiak,Georgia,serif; font-weight:700; line-height:1.1;
           font-size:clamp(2rem,5.5vw,3rem); margin:0 0 1rem; }
      h2 { font-family:Zodiak,Georgia,serif; font-weight:700; line-height:1.2;
           font-size:clamp(1.3rem,3.5vw,1.7rem); margin:3rem 0 .75rem; }
      h3 { font-size:1rem; margin:2rem 0 .5rem; letter-spacing:.02em; }
      .lead { font-size:1.15rem; color:var(--grijs); margin:0 0 2rem; max-width:38ch; }
      p { margin:0 0 1rem; }
      a { color:var(--diep); text-decoration-color:var(--groen); text-underline-offset:3px; }
      table { border-collapse:collapse; width:100%; margin:1rem 0 .5rem; font-size:.95rem; }
      th,td { text-align:left; padding:.55rem 0; border-bottom:1px solid rgba(12,44,27,.1); }
      th { font-weight:500; color:var(--grijs); }
      td { text-align:right; font-variant-numeric:tabular-nums; }
      caption { text-align:left; font-size:.85rem; color:var(--grijs); padding-bottom:.5rem; }
      ul { padding-left:1.1rem; margin:0 0 1rem; }
      li { margin-bottom:.35rem; }
      .plaats { margin:2.25rem 0 0; }
      .plaats h3 { margin:0 0 .35rem; font-size:1.05rem; font-family:Zodiak,Georgia,serif; }
      .plaats ul { list-style:none; padding:0; margin:0; }
      .plaats li { padding:.4rem 0; border-bottom:1px solid rgba(12,44,27,.08); font-size:.95rem; }
      .plaats .adres { color:var(--grijs); }
      .vraag { border-bottom:1px solid rgba(12,44,27,.1); padding:1.1rem 0; }
      .vraag h3 { margin:0 0 .4rem; font-size:1.02rem; font-weight:500; }
      .vraag p { margin:0; color:var(--grijs); }
      .cta { display:inline-block; margin-top:1rem; padding:.7rem 1.4rem; border-radius:999px;
             background:var(--diep); color:var(--ivoor); text-decoration:none; font-size:.9rem; }
      footer.bot { border-top:1px solid rgba(12,44,27,.12); padding-block:2rem 3rem;
                   font-size:.85rem; color:var(--grijs); }
      footer.bot p { margin:0 0 .4rem; }
    </style>
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
    </script>
  </head>
  <body>
    <header class="top">
      <div class="wrap">
        <a class="mark" href="/">ÉLAN</a>
        <nav>
          <a href="/kokoswater/">Product</a>
          <a href="/verkooppunten/">Verkooppunten</a>
          <a href="/ons-verhaal/">Verhaal</a>
        </nav>
      </div>
    </header>
    <main class="wrap">
${body}
    </main>
    <footer class="bot">
      <div class="wrap">
        <p>ELAN WORLD BV · KVK 97952338 · Cypresbaan 55, 2908 LT Capelle aan den IJssel</p>
        <p>Vestigingsadres, geen winkel. <a href="mailto:Info@drinkelan.com">Info@drinkelan.com</a> · +31 6 4273 0763</p>
      </div>
    </footer>
  </body>
</html>
`
}

const ORG = { '@id': `${SITE}/#org` }

function faqSchema(items) {
  return items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  }))
}

function faqHtml(items) {
  return items
    .map((f) => `      <div class="vraag">\n        <h3>${esc(f.q)}</h3>\n        <p>${esc(f.a)}</p>\n      </div>`)
    .join('\n')
}

/* ------------------------------------------------------ productpagina's -- */

function productPagina(lang) {
  const t = content[lang]
  const nl = lang === 'nl'
  const path = nl ? '/kokoswater/' : '/coconut-water/'
  const alternates = [
    { lang: 'nl-NL', path: '/kokoswater/' },
    { lang: 'en', path: '/coconut-water/' },
    { lang: 'x-default', path: '/kokoswater/' },
  ]

  const rows = t.nutrition.rows
    .map(([k, v]) => `        <tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join('\n')

  const body = nl
    ? `      <h1>Kokoswater van ÉLAN</h1>
      <p class="lead">Eén ingrediënt, 500 ml, en een etiket dat je in één oogopslag uitleest.</p>

      <p>ÉLAN is kokoswater dat uit jonge groene kokosnoten wordt getapt en als
      kokoswater het pak in gaat. Niet uit concentraat, dus er wordt geen water
      uit gehaald om er later weer bij te doen. Er gaan geen suikers,
      conserveermiddelen of aroma's bij. Op de ingrediëntendeclaratie staat één
      regel: kokoswater.</p>

      <p>Het pak is 500 ml en heeft een schroefdop, zodat je het halverwege kunt
      wegzetten. Vegan en glutenvrij, 12 kcal per 100 ml. Een literpak staat
      gepland voor januari 2027.</p>

      <h2>Voedingswaarde</h2>
      <table>
        <caption>Per 100 ml, zoals gedeclareerd op het etiket.</caption>
        <tbody>
${rows}
        </tbody>
      </table>
      <p>De 2,1 gram suikers zijn de suikers die van nature in kokoswater
      zitten. Kalium en magnesium staan niet op deze tabel en ÉLAN doet er
      daarom geen claims over.</p>

      <h2>Waar te koop</h2>
      <p>ÉLAN ligt in ${winkels.length} winkels, sportscholen en horecazaken in
      Nederland. Het zwaartepunt ligt in Rotterdam en Den Haag, maar de lijst
      loopt van Alblasserdam tot Zoetermeer.</p>
      <a class="cta" href="/verkooppunten/">Bekijk alle verkooppunten</a>

      <h2>Veelgestelde vragen</h2>
${faqHtml(faq.nl)}`
    : `      <h1>Coconut water by ÉLAN</h1>
      <p class="lead">One ingredient, 500 ml, and a label you can read in a glance.</p>

      <p>ÉLAN is coconut water tapped from young green coconuts that goes into
      the carton as coconut water. Not from concentrate, so it is never reduced
      and reconstituted. No sugars, preservatives or flavourings are added. The
      ingredient list is one line long: coconut water.</p>

      <p>The carton holds 500 ml and has a screw cap, so you can put it away
      half finished. Vegan and gluten-free, 12 kcal per 100 ml. A one-litre
      carton is planned for January 2027.</p>

      <h2>Nutrition</h2>
      <table>
        <caption>Per 100 ml, as declared on the label.</caption>
        <tbody>
${rows}
        </tbody>
      </table>
      <p>The 2.1 grams of sugar are the sugars that occur naturally in coconut
      water. Potassium and magnesium are not on this table, so ÉLAN makes no
      claims about them.</p>

      <h2>Where to buy</h2>
      <p>ÉLAN is stocked by ${winkels.length} shops, gyms and cafés across the
      Netherlands, most of them in Rotterdam and The Hague.</p>
      <a class="cta" href="/verkooppunten/">See all stockists</a>

      <h2>Frequently asked questions</h2>
${faqHtml(faq.en)}`

  return {
    path,
    html: pagina({
      lang: nl ? 'nl' : 'en',
      path,
      alternates,
      title: nl
        ? 'Kokoswater van ÉLAN: voedingswaarde, ingrediënten en vragen'
        : 'ÉLAN coconut water: nutrition, ingredients and questions',
      description: nl
        ? `100% puur kokoswater in een pak van 500 ml. Voedingswaarde per 100 ml, ingrediënten en antwoord op de vragen die het vaakst gesteld worden. Te koop bij ${winkels.length} verkooppunten in Nederland.`
        : `100% pure coconut water in a 500 ml carton. Nutrition per 100 ml, ingredients and answers to the questions people ask most. Stocked by ${winkels.length} outlets across the Netherlands.`,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Product',
            '@id': `${SITE}/#product`,
            name: 'ÉLAN 100% Pure Coconut Water 500 ml',
            sku: 'elan-500',
            brand: { '@id': `${SITE}/#brand` },
            manufacturer: ORG,
            image: `${SITE}/elan-bottle.png`,
            url: `${SITE}${path}`,
            category: nl ? 'Kokoswater' : 'Coconut water',
            description: nl
              ? '100% puur kokoswater uit jonge groene kokosnoten, in een hersluitbaar pak van 500 ml. Niet uit concentraat, zonder toegevoegde suikers of conserveermiddelen.'
              : '100% pure coconut water from young green coconuts, in a resealable 500 ml carton. Not from concentrate, no added sugars or preservatives.',
            additionalProperty: t.nutrition.rows.map(([k, v]) => ({
              '@type': 'PropertyValue',
              name: `${k} ${nl ? 'per 100 ml' : 'per 100 ml'}`,
              value: v,
            })),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              price: '2.95',
              availability: 'https://schema.org/InStoreOnly',
              url: `${SITE}/verkooppunten/`,
              seller: ORG,
            },
          },
          {
            '@type': 'FAQPage',
            '@id': `${SITE}${path}#faq`,
            inLanguage: nl ? 'nl-NL' : 'en',
            mainEntity: faqSchema(nl ? faq.nl : faq.en),
          },
        ],
      },
      body,
    }),
  }
}

/* ------------------------------------------------- verkooppuntenpagina -- */

function verkooppuntenPagina() {
  const perPlaats = new Map()
  for (const w of winkels) {
    const stad = PLAATSNAAM[w.city] || w.city
    if (!perPlaats.has(stad)) perPlaats.set(stad, [])
    perPlaats.get(stad).push(w)
  }

  // Grootste plaatsen bovenaan: dat is ook de volgorde waarin mensen zoeken.
  const gesorteerd = [...perPlaats.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'nl'),
  )

  const blokken = gesorteerd
    .map(([stad, lijst]) => {
      const items = lijst
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'nl'))
        .map(
          (w) =>
            `          <li>${esc(w.name)}<span class="adres"> — ${esc(w.address)} ${esc(stad)}</span></li>`,
        )
        .join('\n')
      return `      <section class="plaats">
        <h3>${esc(stad)} <span class="adres">(${lijst.length})</span></h3>
        <ul>
${items}
        </ul>
      </section>`
    })
    .join('\n')

  const top = gesorteerd.slice(0, 8).map(([s]) => s)
  const steden = `${top.slice(0, -1).join(', ')} en ${top.at(-1)}`

  const body = `      <h1>Waar koop je ÉLAN?</h1>
      <p class="lead">${winkels.length} verkooppunten in Nederland, op alfabet per plaats.</p>

      <p>ÉLAN ligt bij supermarkten, toko's, sportscholen, lunchrooms en
      speciaalzaken. De meeste adressen staan in ${esc(steden)}. Losse pakken
      koop je in de winkel; een 12-pack bestel je online bij BGS Nutrition.</p>

      <p>Deze lijst komt uit hetzelfde bestand als de kaart op de site. Staat
      jouw winkel er niet bij of klopt een adres niet meer? Laat het weten via
      <a href="mailto:Info@drinkelan.com">Info@drinkelan.com</a>.</p>

      <p><a class="cta" href="/#/find-us">Open de kaart</a></p>

      <h2>Alle verkooppunten</h2>
${blokken}`

  return {
    path: '/verkooppunten/',
    html: pagina({
      lang: 'nl',
      path: '/verkooppunten/',
      title: `Waar koop je ÉLAN kokoswater? ${winkels.length} verkooppunten`,
      description: `Alle ${winkels.length} winkels, sportscholen en horecazaken in Nederland die ÉLAN kokoswater verkopen, gesorteerd per plaats. Met adres, van Rotterdam en Den Haag tot Dordrecht en Amsterdam.`,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${SITE}/verkooppunten/#page`,
            url: `${SITE}/verkooppunten/`,
            name: 'Verkooppunten van ÉLAN',
            inLanguage: 'nl-NL',
            about: { '@id': `${SITE}/#product` },
            publisher: ORG,
          },
          {
            '@type': 'ItemList',
            '@id': `${SITE}/verkooppunten/#lijst`,
            name: 'Verkooppunten van ÉLAN in Nederland',
            numberOfItems: winkels.length,
            itemListElement: winkels.map((w, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Place',
                name: w.name,
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: w.address,
                  addressLocality: PLAATSNAAM[w.city] || w.city,
                  addressCountry: 'NL',
                },
                geo: { '@type': 'GeoCoordinates', latitude: w.lat, longitude: w.lng },
              },
            })),
          },
        ],
      },
      body,
    }),
  }
}

/* ---------------------------------------------------- ons-verhaalpagina -- */

function verhaalPagina() {
  const s = content.nl.ourStory
  const alinea = (a) => `      <p>${esc(a)}</p>`

  const secties = s.sections
    .map((sec) => {
      const stukken = [`      <h2>${esc(sec.heading)}</h2>`]
      for (const b of sec.body || []) stukken.push(alinea(b))
      if (sec.list) {
        stukken.push('      <ul>')
        for (const li of sec.list) stukken.push(`        <li>${esc(li)}</li>`)
        stukken.push('      </ul>')
      }
      for (const a of sec.after || []) stukken.push(alinea(a))
      return stukken.join('\n')
    })
    .join('\n')

  const body = `      <h1>${esc(s.title)}</h1>
      <p class="lead">${esc(s.lead)}</p>
${s.intro.map(alinea).join('\n')}
${secties}
${s.outro.map(alinea).join('\n')}

      <p><a class="cta" href="/kokoswater/">Wat er in het pak zit</a></p>`

  return {
    path: '/ons-verhaal/',
    html: pagina({
      lang: 'nl',
      path: '/ons-verhaal/',
      title: 'Ons verhaal — ÉLAN kokoswater uit Rotterdam',
      description:
        'Bryan en Isabel begonnen ÉLAN omdat puur kokoswater in Nederland moeilijk te vinden was. Hoe het merk is ontstaan, wat de naam betekent en waar het bedrijf staat.',
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'AboutPage',
            '@id': `${SITE}/ons-verhaal/#page`,
            url: `${SITE}/ons-verhaal/`,
            name: 'Ons verhaal',
            inLanguage: 'nl-NL',
            about: ORG,
            publisher: ORG,
          },
        ],
      },
      body,
    }),
  }
}

/* ------------------------------------------------------------ uitvoeren -- */

const paginas = [
  productPagina('nl'),
  productPagina('en'),
  verkooppuntenPagina(),
  verhaalPagina(),
]

for (const p of paginas) {
  const map = join(DIST, p.path)
  await mkdir(map, { recursive: true })
  await writeFile(join(map, 'index.html'), p.html, 'utf8')
  console.log(`[prerender] ${p.path.padEnd(20)} ${(p.html.length / 1024).toFixed(1)} kB`)
}

console.log(`[prerender] ${paginas.length} pagina's, ${winkels.length} verkooppunten`)
