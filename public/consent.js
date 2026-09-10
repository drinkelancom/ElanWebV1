/* ÉLAN — cookietoestemming.
 *
 * Bewust geen React-component: de statische pagina's uit prerender.mjs
 * (/kokoswater/, /verkooppunten/, …) laden de app helemaal niet, en juist
 * daar komt organisch verkeer binnen. Eén bestand dat overal werkt is beter
 * dan twee implementaties die uit elkaar gaan lopen.
 *
 * Werking: Google Consent Mode v2 staat in de <head> op 'denied'. GA4 stuurt
 * dan wel signalen, maar zonder cookies en zonder herkenbare bezoeker. Pas na
 * een klik op Accepteren gaat analytics_storage open. De keuze staat in
 * localStorage, en de <head> leest hem bij een volgend bezoek meteen uit —
 * vóór de eerste hit, anders mis je die.
 */
(function () {
  var SLEUTEL = 'elan-cookie-consent'
  var TAAL_SLEUTEL = 'elan-lang' // gezet door src/lang.jsx

  function lees(sleutel) {
    try { return window.localStorage.getItem(sleutel) } catch (e) { return null }
  }
  function schrijf(sleutel, waarde) {
    try { window.localStorage.setItem(sleutel, waarde) } catch (e) { /* privémodus */ }
  }
  function gtag() {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(arguments)
  }

  var TEKST = {
    nl: {
      titel: 'Cookies',
      body: 'We gebruiken analytische cookies om te zien welke pagina’s bezocht worden. Alleen als je daar toestemming voor geeft. Functionele cookies, zoals je taalkeuze, staan er altijd.',
      lees: 'Cookiebeleid',
      ja: 'Accepteren',
      nee: 'Weigeren',
      sluit: 'Sluiten zonder te accepteren',
    },
    en: {
      titel: 'Cookies',
      body: 'We use analytics cookies to see which pages get visited, and only if you agree to it. Functional cookies, such as your language choice, are always on.',
      lees: 'Cookie policy',
      ja: 'Accept',
      nee: 'Decline',
      sluit: 'Close without accepting',
    },
  }

  function taal() {
    var t = lees(TAAL_SLEUTEL)
    if (t === 'nl' || t === 'en') return t
    var htmlLang = (document.documentElement.lang || 'nl').slice(0, 2).toLowerCase()
    return htmlLang === 'en' ? 'en' : 'nl'
  }

  function toestaan() {
    gtag('consent', 'update', { analytics_storage: 'granted' })
    schrijf(SLEUTEL, 'granted')
    /* De eerste page_view van dit bezoek ging cookieloos de deur uit (gcs=G100).
       Direct na de consent-update stuurt GA opnieuw, nu met gcs=G101, en deze
       page_view rijdt in diezelfde hit mee — nagemeten op de gebouwde site.
       Los aanroepen heeft geen zin: een tweede page_view binnen dezelfde
       paginalading wordt door GA4 onderdrukt. */
    gtag('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
    })
  }

  function weigeren() {
    schrijf(SLEUTEL, 'denied')
    // consent blijft op 'denied' uit de <head>; niets verder te doen.
  }

  var stijlGezet = false
  function zetStijl() {
    if (stijlGezet) return
    stijlGezet = true
    var s = document.createElement('style')
    s.textContent = [
      '.elan-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;',
      'max-width:520px;margin:0 auto;background:#fffaee;color:#14130f;',
      'border:1px solid rgba(20,19,15,.14);border-radius:16px;',
      'box-shadow:0 18px 48px -18px rgba(18,40,25,.45);padding:20px 22px;',
      'font-family:"Cabinet Grotesk",system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.55;}',
      '.elan-consent h2{margin:0 0 6px;font-size:16px;font-weight:800;letter-spacing:-.01em;}',
      '.elan-consent p{margin:0 0 14px;color:#3f3b34;}',
      '.elan-consent a{color:#3f9430;text-decoration:underline;}',
      '.elan-consent-knoppen{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}',
      '.elan-consent button{font:inherit;font-weight:700;cursor:pointer;border-radius:999px;',
      'padding:10px 20px;border:1px solid transparent;}',
      '.elan-consent .ja{background:#51b83e;color:#fff;}',
      '.elan-consent .ja:hover{background:#3f9430;}',
      '.elan-consent .nee{background:transparent;color:#14130f;border-color:rgba(20,19,15,.22);}',
      '.elan-consent .nee:hover{background:rgba(20,19,15,.06);}',
      '.elan-consent button:focus-visible{outline:2px solid #123a24;outline-offset:2px;}',
      '@media (max-width:420px){.elan-consent{padding:16px 16px 18px;}',
      '.elan-consent-knoppen button{flex:1 1 auto;}}',
    ].join('')
    document.head.appendChild(s)
  }

  function toon() {
    zetStijl()
    var t = TEKST[taal()]
    var doos = document.createElement('div')
    doos.className = 'elan-consent'
    doos.setAttribute('role', 'dialog')
    doos.setAttribute('aria-live', 'polite')
    doos.setAttribute('aria-label', t.titel)
    doos.innerHTML =
      '<h2>' + t.titel + '</h2>' +
      '<p>' + t.body + ' <a href="/#/cookiebeleid">' + t.lees + '</a></p>' +
      '<div class="elan-consent-knoppen">' +
      '<button type="button" class="ja">' + t.ja + '</button>' +
      '<button type="button" class="nee" aria-label="' + t.sluit + '">' + t.nee + '</button>' +
      '</div>'

    doos.querySelector('.ja').addEventListener('click', function () {
      toestaan(); doos.remove()
    })
    doos.querySelector('.nee').addEventListener('click', function () {
      weigeren(); doos.remove()
    })

    document.body.appendChild(doos)
    doos.querySelector('.ja').focus()
  }

  /* Vanaf het cookiebeleid kun je je keuze herzien — intrekken moet net zo
     makkelijk zijn als geven. */
  window.elanCookievoorkeur = function () {
    try { window.localStorage.removeItem(SLEUTEL) } catch (e) {}
    if (!document.querySelector('.elan-consent')) toon()
  }

  function start() {
    var keuze = lees(SLEUTEL)
    if (keuze === 'granted' || keuze === 'denied') return // al beslist
    toon()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }
})()
