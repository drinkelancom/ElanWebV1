// ÉLAN — tweetalige content (NL = basis, EN = schakelaar).
// Beeld/video staan taal-onafhankelijk in data.js. Alle tekst leeft hier.
//
// Belangrijk (juli 2026):
//  • Voedingswaarden gecorrigeerd volgens het officiële etiket (per 100 ml):
//    12 kcal · 0 g vet · 2,8 g koolhydraten · 2,1 g suikers · 0 g eiwit · 0,07 g zout.
//  • Kalium én magnesium staan NIET op de gedeclareerde voedingstabel en zijn
//    daarom overal uit de claims verwijderd (geen "elektrolyten"-claims meer).
//    Positionering nu op puurheid, hydratatie en laag in calorieën.

export const content = {
  /* ============================== NEDERLANDS ============================== */
  nl: {
    langName: 'NL',
    otherLang: 'EN',

    nav: [
      { label: 'Ons verhaal', href: '#/ons-verhaal' },
      { label: 'Waarom ÉLAN', href: '#why' },
      { label: 'Verkooppunten', href: '#/find-us' },
      { label: 'Contact', href: '#contact' },
    ],

    ui: {
      shop: 'Shop',
      findUs: 'Verkooppunten',
      shopElan: 'Shop ÉLAN',
      scroll: 'Scroll',
      readStory: 'Lees ons verhaal',
      home: 'Home',
      back: 'Terug',
    },

    hero: {
      eyebrow: '100% Puur Kokoswater',
      script: 'puur van nature',
      tagline: '100% puur kokoswater. Meer niet.',
      sub: 'ÉLAN hydrateert je van binnenuit met de zachte, natuurlijke smaak van jong kokoswater.',
      cta: 'Ontdek ÉLAN',
    },

    marquee: [
      '100% puur', 'geen toegevoegde suikers', 'niet uit concentraat',
      'vegan & glutenvrij', 'van nature verfrissend', '12 kcal / 100 ml',
      'één ingrediënt',
    ],

    journey: [
      {
        n: '01', eyebrow: 'Recht uit de kokosnoot',
        title: '100% puur.\nNiets erbij.',
        body: 'Geen concentraat, geen toegevoegde suikers, geen conserveermiddelen. Gewoon puur kokoswater: helder, licht en eerlijk.',
        side: 'center', tint: '#123324',
      },
      {
        n: '02', eyebrow: 'Van nature verfrissend',
        title: 'Licht en\nverfrissend.',
        body: 'ÉLAN hydrateert je van binnenuit met de zachte, natuurlijke smaak van jong kokoswater. Verfrissend na een lange dag, een training of de zon.',
        side: 'right', tint: '#0d4436',
      },
      {
        n: '03', eyebrow: 'Licht & guilt-free',
        title: 'Guilt-free\ndorstlesser.',
        body: 'Slechts 12 kcal per 100 ml. Lichtzoet en verfrissend, een fijn alternatief voor alles wat te zwaar of te zoet is.',
        side: 'left', tint: '#175a33',
      },
      {
        n: '04', eyebrow: 'Altijd bij de hand',
        title: 'Gemaakt\nvoor onderweg.',
        body: 'Een hersluitbaar pak van 500 ml met dop. In de gym, op het festival of onderweg: ÉLAN gaat mee en blijft fris.',
        side: 'center', tint: '#1e6e35',
      },
    ],

    orbit: {
      script: 'puur genieten',
      title: 'Alles wat je wilt. Niets wat je niet wilt.',
      labels: [
        { text: '100% puur', pos: 'p1', arrow: 'r' },
        { text: 'geen vet', pos: 'p2', arrow: 'r' },
        { text: 'geen toegevoegde\nsuikers', pos: 'p3', arrow: 'ru' },
        { text: 'vegan &\nglutenvrij', pos: 'p4', arrow: 'rd' },
        { text: 'slechts 12 kcal\nper 100 ml', pos: 'p5', arrow: 'ld' },
        { text: 'van nature\nverfrissend', pos: 'p6', arrow: 'ld' },
        { text: 'niet uit\nconcentraat', pos: 'p7', arrow: 'l' },
        { text: 'zonder\nconserveermiddelen', pos: 'p8', arrow: 'lu' },
        { text: 'één\ningrediënt', pos: 'p9', arrow: 'lu' },
      ],
    },

    videoBand: {
      script: 'recht uit de bron',
      title: 'Getapt uit jonge groene kokosnoten.',
      body: 'Eén ingrediënt, meer niet. Gebotteld op het moment dat de natuur er klaar voor is.',
    },

    meaning: {
      script: 'de betekenis',
      title: 'Energie, flair & enthousiasme.',
      body: 'ÉLAN staat voor energie, flair en enthousiasme. Het staat voor vitaliteit en een positieve levenshouding, precies waar ons kokoswater voor staat.',
      body2: 'ÉLAN kokoswater is 100% puur en niet uit concentraat, zonder toegevoegde suikers of conserveermiddelen. Vegan en glutenvrij.',
      stats: [
        ['100%', 'Puur kokoswater'],
        ['0g', 'Toegevoegde suikers'],
        ['Vegan', '& glutenvrij'],
      ],
    },

    nutrition: {
      eyebrow: 'Voedingswaarde',
      script: 'puur & transparant',
      title: 'Wat je proeft is precies wat erin zit.',
      lead: 'Recht uit de kokosnoot: puur en transparant.',
      per: 'per 100 ml',
      rows: [
        ['Energie', '50 kJ / 12 kcal'],
        ['Vetten', '0 g'],
        ['Koolhydraten', '2,8 g'],
        ['waarvan suikers', '2,1 g'],
        ['Eiwitten', '0 g'],
        ['Zout', '0,07 g'],
      ],
      stats: [
        ['100%', 'Puur kokoswater'],
        ['0g', 'Toegevoegde suikers'],
        ['12 kcal', 'Per 100 ml'],
      ],
      badge: 'Vegan · Glutenvrij · Zonder conserveermiddelen',
    },

    beach: {
      script: 'zon in een pak',
    },

    fridge: {
      eyebrow: 'Altijd binnen handbereik',
      script: 'je dagelijkse ritueel',
      title: 'Koud. Vers. Klaar.',
      body: 'Van smoothiebowl tot sportfles: ÉLAN hoort thuis in elke koelkast. Puur genoeg voor elke dag, bijzonder genoeg voor elk moment.',
      benefits: [
        '100% puur kokoswater, nooit uit concentraat',
        'Zonder toegevoegde suikers of conserveermiddelen',
        'Hersluitbaar 500 ml pak met dop',
      ],
      cta: 'Vind ÉLAN bij jou in de buurt',
    },

    // Cijfers-blok op de homepage (social proof).
    stats: {
      script: 'in cijfers',
      title: 'ÉLAN in cijfers',
      items: [
        ['150+', 'verkooppunten door heel Nederland'],
        ['100.000+', 'pakjes verkocht in 12 weken'],
        ['100%', 'puur kokoswater'],
        ['500 ml', 'hersluitbaar pak met dop'],
        ['0g', 'toegevoegde suikers. Alleen natuurlijke suikers uit kokoswater'],
      ],
      foot: 'Nederlands premium merk.',
      sub: 'Van sportscholen tot supermarkten: ÉLAN groeit elke maand verder in Nederland.',
    },

    // Verkrijgbaarheid (social proof) — punt 11.
    availability: {
      script: 'Vertrouwd door retailers en speciaalzaken in Nederland.',
      title: 'Verkrijgbaar bij',
      cta: 'Bekijk alle verkooppunten',
    },

    // Klantreviews — de reviews zelf staan in data.js (niet vertaald).
    reviews: {
      script: 'wat anderen zeggen',
      title: 'Reviews',
      body: 'Ervaringen van mensen die ÉLAN drinken.',
      empty: 'Nog geen reviews geplaatst. Wees de eerste — we lezen elke review zelf.',
      summary: (avg, n) => `${avg} van de 5 · ${n} ${n === 1 ? 'review' : 'reviews'}`,
      writeCta: 'Schrijf een review',
      googleCta: 'Review ons op Google',
      cancel: 'Annuleren',
      form: {
        name: 'Naam',
        place: 'Woonplaats (optioneel)',
        email: 'E-mailadres (blijft privé)',
        rating: 'Je waardering',
        message: 'Wat vind je van ÉLAN?',
        send: 'Plaats review',
        sending: 'Versturen…',
        privacy: 'We plaatsen je review na een korte check. Je e-mailadres blijft privé en komt niet op de site.',
        errorPre: 'Er ging iets mis. Probeer het opnieuw of mail ons direct via ',
        okScript: 'bedankt!',
        okTitle: 'Je review is verstuurd.',
        okBody: 'We lezen hem door en plaatsen hem daarna op de site.',
        okAgain: 'Nog een review',
      },
    },

    // Homepage-teaser die naar de Ons verhaal-pagina linkt.
    story: {
      script: 'ons verhaal',
      title: 'Geboren uit een passie voor puurheid.',
      body: 'ÉLAN begon met een eenvoudige vraag: waarom is het zo moeilijk om écht puur kokoswater te vinden dat smaakt zoals recht uit de kokosnoot?',
      cta: 'Lees ons verhaal',
    },

    // Volledige Ons verhaal-pagina.
    ourStory: {
      script: 'ons verhaal',
      title: 'Ons verhaal',
      lead: 'Geboren uit een passie voor puurheid.',
      intro: [
        'ÉLAN begon met een eenvoudige vraag: waarom is het zo moeilijk om écht puur kokoswater te vinden dat smaakt zoals recht uit de kokosnoot?',
        'Tijdens onze zoektocht proefden we veel verschillende merken. Vaak ontbrak de frisse, natuurlijke smaak die kokoswater juist zo bijzonder maakt. Sommige producten waren gemaakt van concentraat of verloren hun pure karakter door het productieproces.',
        'Wij geloofden dat het anders kon.',
        'Daarom besloten we ÉLAN te ontwikkelen: een premium kokoswater dat 100% puur is en de frisse, zachte en natuurlijke smaak van de kokosnoot vasthoudt.',
      ],
      sections: [
        {
          heading: 'Waarom ÉLAN?',
          body: [
            'De naam ÉLAN staat voor energie, flair en enthousiasme. Het symboliseert vitaliteit, een positieve levenshouding en de kracht om bewust te kiezen voor kwaliteit.',
            'Die betekenis vormt de basis van alles wat wij doen.',
            'Wij geloven dat een gezond product niet alleen goed moet zijn voor je lichaam, maar ook plezier moet geven. Een drankje waar je iedere keer weer naar uitkijkt.',
          ],
        },
        {
          heading: 'Onze belofte',
          body: ['ÉLAN bevat slechts één ingrediënt: 100% puur kokoswater.'],
          list: [
            'Nooit uit concentraat',
            'Geen toegevoegde suikers',
            'Geen conserveermiddelen',
            'Een frisse, zachte en natuurlijke smaak',
          ],
          after: ['Precies zoals kokoswater hoort te zijn.'],
        },
        {
          heading: 'Onze visie',
          body: [
            'Wij bouwen aan een Nederlands premiummerk dat staat voor eerlijkheid, kwaliteit en transparantie.',
            'Niet door de meeste ingrediënten toe te voegen, maar juist door niets weg te nemen van wat de natuur al perfect heeft gemaakt.',
            'Wij willen laten zien dat eenvoud de hoogste vorm van kwaliteit is.',
            'Van de kokosnoot tot het pak is iedere keuze die wij maken gericht op één doel: mensen laten genieten van het puurste kokoswater.',
          ],
        },
        {
          heading: 'Over Bryan & Isabel',
          body: [
            'Wij zijn geen multinational. Wij zijn twee ondernemers uit Rotterdam met één missie: het puurste kokoswater toegankelijk maken voor iedereen.',
            'Na maanden zoeken vonden we een fabriek die precies produceerde zoals wij dat voor ogen hadden: 100% puur kokoswater. Niet uit concentraat. Geen toegevoegde suikers. Geen conserveermiddelen.',
            'Zo ontstond ÉLAN.',
          ],
        },
      ],
      outro: [
        'ÉLAN is meer dan kokoswater. Het is een bewuste keuze voor puurheid. Voor kwaliteit. Voor smaak. Voor energie.',
      ],
      closer: 'Born from purity. Driven by ÉLAN.',
      cta: 'Shop ÉLAN',
    },

    contact: {
      title: 'Neem contact op',
      heading: '100% puur kokoswater. Meer niet.',
      company: 'ELAN WORLD BV',
      address: ['Cypresbaan 55', '2908 LT Capelle aan den IJssel'],
      email: 'Info@drinkelan.com',
      phone: '+31 6 4273 0763',
      kvk: 'KVK 97952338',
      form: {
        name: 'Naam',
        email: 'E-mailadres',
        message: 'Bericht',
        send: 'Verstuur bericht',
        sending: 'Versturen…',
        privacy: 'Je gaat akkoord met ons vriendelijke privacybeleid.',
        errorPre: 'Er ging iets mis. Probeer het opnieuw of mail ons direct via ',
        okScript: 'bedankt!',
        okTitle: 'Je bericht is verstuurd.',
        okBody: 'We nemen zo snel mogelijk contact met je op.',
        okAgain: 'Nog een bericht',
      },
    },

    socials: {
      script: 'volg de reis',
      title: 'Volg ÉLAN op social',
      body: 'Volg onze reis. Ontdek nieuwe recepten, inspiratie, sportmomenten en alles over 100% puur kokoswater.',
      instagram: { handle: '@drink.elan', url: 'https://www.instagram.com/drink.elan/' },
      tiktok: { handle: '@drinkelan', url: 'https://www.tiktok.com/@drinkelan' },
      facebook: { handle: 'ÉLAN op Facebook', url: 'https://www.facebook.com/profile.php?id=61580372634885' },
      feed: [
        { cap: 'puur van nature' },
        { cap: 'wat is ÉLAN' },
        { cap: 'doe mee' },
        { cap: 'de betekenis' },
        { cap: 'altijd vers' },
      ],
    },

    footer: {
      tagline: '100% Puur Kokoswater',
      legal: [
        { label: 'Privacybeleid', href: '#/privacy' },
        { label: 'Algemene voorwaarden', href: '#/voorwaarden' },
        { label: 'Retourbeleid', href: '#/retourbeleid' },
        { label: 'Cookiebeleid', href: '#/cookiebeleid' },
      ],
      company: 'ELAN WORLD BV · KVK 97952338',
      copy: (y) => `© ${y} ELAN WORLD BV · 100% Puur Kokoswater`,
    },

    findus: {
      script: 'vind je verfrissing',
      title: 'Vind ÉLAN bij jou',
      viewNL: 'Nederland',
      viewWorld: 'Wereld',
      search: 'Zoek op stad, winkel of adres…',
      nearest: 'Dichtstbij jou',
      route: 'Route',
      locate: 'Gebruik mijn locatie',
      loading: 'De kaart wordt geladen…',
    },

    shop: {
      loading: 'De shop wordt geladen…',
      eyebrow: 'De ÉLAN shop',
      script: 'neem het mee naar huis',
      title: 'Breng de tropen in huis.',
      body: '100% puur kokoswater, los te koop bij onze verkooppunten. Straks ook per case en als maandelijks abonnement rechtstreeks van ÉLAN.',
      resellerScript: 'liever in de winkel?',
      resellerTitle: 'Vind ÉLAN bij jou in de buurt.',
      resellerBody: 'Ontdek op de kaart waar je ÉLAN los kunt kopen: supermarkten, horeca en speciaalzaken door heel Nederland.',
      resellerCta: 'Open de kaart',
      buyResellerLead: 'Nu verkrijgbaar bij onze verkooppunten:',
      buyFindCta: 'Vind ÉLAN bij jou in de buurt',
      preorderLead: 'Binnenkort te bestellen.',
      preorderSub: 'Laat je e-mail achter en wees als eerste op de hoogte.',
      preorderPlaceholder: 'Je e-mailadres',
      preorderBtn: 'Hou me op de hoogte',
      preorderSending: 'Versturen…',
      preorderOkScript: 'op de hoogte!',
      cart: 'In winkelmand',
      backToShop: 'Terug naar de shop',
      view: 'Bekijk',
      buyExternal: 'Bestel bij BGS Nutrition',
      buyExternalLead: 'Nu te bestellen via onze partner:',
      soonBadge: 'Binnenkort',
      soonTeaserCta: 'Meer weten',
    },

    products: [
      {
        slug: 'elan-case-12', name: 'Voordeelcase, 12× 500 ml',
        subtitle: 'Sla je voorraad in met voordeel',
        unit: 'per case (12 stuks)', badge: 'Beste deal',
        short: 'Twaalf pakken ÉLAN in één doos, met casevoordeel. De slimste manier om altijd fris kokoswater in huis te hebben. Binnenkort rechtstreeks te bestellen.',
        highlights: [
          '12 pakken van 500 ml',
          'Voordeel t.o.v. los kopen',
          'Gratis verzending binnen NL vanaf €35',
          'Ideaal voor thuis, sport of kantoor',
        ],
      },
      {
        slug: 'elan-500', name: 'ÉLAN 500 ml',
        subtitle: 'Los pak, 100% puur kokoswater',
        unit: 'per pak', badge: 'Bestseller',
        short: 'Het hersluitbare pak van 500 ml met dop. Niet uit concentraat, zonder toegevoegde suikers. Overal onderweg mee te nemen.',
        highlights: [
          '100% puur kokoswater, nooit uit concentraat',
          'Zonder toegevoegde suikers of conserveermiddelen',
          'Slechts 12 kcal per 100 ml',
          'Vegan en glutenvrij',
        ],
      },
      {
        slug: 'elan-abo', name: 'ÉLAN Abonnement',
        subtitle: 'Elke maand vers thuisbezorgd',
        unit: 'per maand, opzegbaar', badge: 'Binnenkort',
        short: 'Nooit meer zonder. Elke maand een case ÉLAN in de bus, met abonnee-voordeel en altijd opzegbaar. Binnenkort beschikbaar.',
        highlights: [
          'Maandelijkse levering, geen omkijken naar',
          'Abonnee-voordeel op elke case',
          'Op elk moment pauzeren of opzeggen',
          'Gratis verzending inbegrepen',
        ],
      },
      {
        slug: 'elan-1l', name: 'ÉLAN 1 L',
        subtitle: 'Familiepak, 100% puur kokoswater',
        unit: 'per pak', badge: 'Binnenkort',
        note: 'Vanaf januari 2027',
        short: 'Het grote literpak voor thuis. Hetzelfde 100% pure kokoswater, niet uit concentraat en zonder toegevoegde suikers, nu in een handig formaat om te delen. Vanaf januari 2027 verkrijgbaar.',
        highlights: [
          '1 liter, ideaal om te delen of voor thuis',
          '100% puur kokoswater, niet uit concentraat',
          'Zonder toegevoegde suikers of conserveermiddelen',
          'Vegan en glutenvrij',
        ],
      },
    ],

    resellers: [
      { name: 'Wederverkoper 1', url: '#', note: 'Online bestellen' },
      { name: 'Wederverkoper 2', url: '#', note: 'Online bestellen' },
      { name: 'Wederverkoper 3', url: '#', note: 'Online bestellen' },
    ],

    // Juridische mockup-pagina's (definitieve teksten volgen).
    legal: {
      privacy: {
        title: 'Privacybeleid',
        updated: 'Laatst bijgewerkt: juli 2026',
        mock: true,
        intro: 'Dit is een voorlopige versie. De definitieve juridische tekst volgt.',
        sections: [
          ['Wie zijn wij', 'ELAN WORLD BV (KVK 97952338), gevestigd aan de Cypresbaan 55, 2908 LT Capelle aan den IJssel, is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in dit beleid.'],
          ['Welke gegevens verzamelen wij', 'Gegevens die je zelf achterlaat via het contact- of bestelformulier (naam, e-mailadres, bericht), en technische gegevens die nodig zijn om de website te laten werken.'],
          ['Waarvoor gebruiken wij ze', 'Om je vragen te beantwoorden, bestellingen te verwerken en je, met jouw toestemming, op de hoogte te houden.'],
          ['Je rechten', 'Je hebt recht op inzage, correctie en verwijdering van je gegevens. Mail hiervoor naar Info@drinkelan.com.'],
        ],
      },
      voorwaarden: {
        title: 'Algemene voorwaarden',
        updated: 'Laatst bijgewerkt: juli 2026',
        mock: true,
        intro: 'Dit is een voorlopige versie. De definitieve juridische tekst volgt.',
        sections: [
          ['Toepasselijkheid', 'Deze voorwaarden zijn van toepassing op elk aanbod en elke overeenkomst met ELAN WORLD BV.'],
          ['Bestellingen', 'Een overeenkomst komt tot stand na bevestiging van je bestelling. Prijzen zijn inclusief btw, tenzij anders vermeld.'],
          ['Levering', 'Wij streven ernaar bestellingen zo snel mogelijk te leveren binnen Nederland.'],
          ['Aansprakelijkheid', 'ÉLAN is niet aansprakelijk voor schade door onjuist gebruik van het product.'],
        ],
      },
      retourbeleid: {
        title: 'Retourbeleid',
        updated: 'Laatst bijgewerkt: juli 2026',
        mock: true,
        intro: 'Dit is een voorlopige versie. De definitieve juridische tekst volgt.',
        sections: [
          ['Herroepingsrecht', 'Je hebt na ontvangst 14 dagen bedenktijd om je bestelling te retourneren, mits ongeopend en houdbaar.'],
          ['Uitzonderingen', 'Vanwege houdbaarheid en hygiëne kunnen geopende of aangebroken producten niet worden geretourneerd.'],
          ['Terugbetaling', 'Na goedkeuring van de retour betalen we het aankoopbedrag binnen 14 dagen terug.'],
          ['Retour aanmelden', 'Meld je retour aan via Info@drinkelan.com.'],
        ],
      },
      cookiebeleid: {
        title: 'Cookiebeleid',
        updated: 'Laatst bijgewerkt: juli 2026',
        mock: true,
        intro: 'Dit is een voorlopige versie. De definitieve juridische tekst volgt.',
        sections: [
          ['Wat zijn cookies', 'Cookies zijn kleine bestanden die op je apparaat worden opgeslagen om de website goed te laten werken.'],
          ['Welke cookies gebruiken wij', 'Functionele cookies die nodig zijn voor de werking van de site (waaronder je taalvoorkeur), en eventueel analytische cookies.'],
          ['Cookies beheren', 'Je kunt cookies op elk moment beheren of verwijderen via de instellingen van je browser.'],
        ],
      },
    },
  },

  /* ================================ ENGLISH ================================ */
  en: {
    langName: 'EN',
    otherLang: 'NL',

    nav: [
      { label: 'Our Story', href: '#/our-story' },
      { label: 'Why ÉLAN', href: '#why' },
      { label: 'Stockists', href: '#/find-us' },
      { label: 'Contact', href: '#contact' },
    ],

    ui: {
      shop: 'Shop',
      findUs: 'Find us',
      shopElan: 'Shop ÉLAN',
      scroll: 'Scroll',
      readStory: 'Read our story',
      home: 'Home',
      back: 'Back',
    },

    hero: {
      eyebrow: '100% Pure Coconut Water',
      script: 'pure by nature',
      tagline: '100% Pure Coconut Water. Nothing else.',
      sub: 'ÉLAN hydrates you from within with the soft, natural taste of young coconut water.',
      cta: 'Discover ÉLAN',
    },

    marquee: [
      '100% pure', 'no added sugars', 'not from concentrate',
      'vegan & gluten-free', 'naturally refreshing', '12 kcal / 100 ml',
      'one ingredient',
    ],

    journey: [
      {
        n: '01', eyebrow: 'Straight from the coconut',
        title: '100% pure.\nNothing added.',
        body: 'No concentrate, no added sugars, no preservatives. Just pure coconut water: clear, light and honest.',
        side: 'center', tint: '#123324',
      },
      {
        n: '02', eyebrow: 'Naturally refreshing',
        title: 'Light and\nrefreshing.',
        body: 'ÉLAN hydrates you from within with the soft, natural taste of young coconut water. Refreshing after a long day, a workout or the sun.',
        side: 'right', tint: '#0d4436',
      },
      {
        n: '03', eyebrow: 'Light & guilt-free',
        title: 'Guilt-free\nthirst quencher.',
        body: 'Just 12 kcal per 100 ml. Lightly sweet and refreshing, a nice alternative to anything too heavy or too sweet.',
        side: 'left', tint: '#175a33',
      },
      {
        n: '04', eyebrow: 'Always within reach',
        title: 'Made\nfor the go.',
        body: 'A resealable 500 ml carton with cap. At the gym, at the festival or on the move: ÉLAN comes along and stays fresh.',
        side: 'center', tint: '#1e6e35',
      },
    ],

    orbit: {
      script: 'pure goodness',
      title: 'Everything you want. Nothing you don’t.',
      labels: [
        { text: '100% pure', pos: 'p1', arrow: 'r' },
        { text: 'zero fat', pos: 'p2', arrow: 'r' },
        { text: 'no added\nsugars', pos: 'p3', arrow: 'ru' },
        { text: 'vegan &\ngluten-free', pos: 'p4', arrow: 'rd' },
        { text: 'just 12 kcal\nper 100 ml', pos: 'p5', arrow: 'ld' },
        { text: 'naturally\nrefreshing', pos: 'p6', arrow: 'ld' },
        { text: 'not from\nconcentrate', pos: 'p7', arrow: 'l' },
        { text: 'no\npreservatives', pos: 'p8', arrow: 'lu' },
        { text: 'one\ningredient', pos: 'p9', arrow: 'lu' },
      ],
    },

    videoBand: {
      script: 'straight from the source',
      title: 'Tapped from young green coconuts.',
      body: 'One ingredient, nothing else. Bottled the moment nature is ready.',
    },

    meaning: {
      script: 'the meaning',
      title: 'Energy, flair & enthusiasm.',
      body: 'ÉLAN means energy, flair and enthusiasm. It stands for vitality and a positive outlook, exactly what our coconut water represents.',
      body2: 'ÉLAN coconut water is 100% pure and not made from concentrate, with no added sugars or preservatives. Vegan and gluten-free.',
      stats: [
        ['100%', 'Pure coconut water'],
        ['0g', 'Added sugars'],
        ['Vegan', '& gluten-free'],
      ],
    },

    nutrition: {
      eyebrow: 'Nutrition',
      script: 'pure & transparent',
      title: 'What you taste is exactly what’s inside.',
      lead: 'Straight from the coconut: pure and transparent.',
      per: 'per 100 ml',
      rows: [
        ['Energy', '50 kJ / 12 kcal'],
        ['Fat', '0 g'],
        ['Carbohydrates', '2.8 g'],
        ['of which sugars', '2.1 g'],
        ['Protein', '0 g'],
        ['Salt', '0.07 g'],
      ],
      stats: [
        ['100%', 'Pure coconut water'],
        ['0g', 'Added sugars'],
        ['12 kcal', 'Per 100 ml'],
      ],
      badge: 'Vegan · Gluten-free · No preservatives',
    },

    beach: {
      script: 'sunshine in a carton',
    },

    fridge: {
      eyebrow: 'Always within reach',
      script: 'your daily ritual',
      title: 'Cold. Fresh. Ready.',
      body: 'From smoothie bowl to sports bottle: ÉLAN belongs in every fridge. Pure enough for every day, special enough for every moment.',
      benefits: [
        '100% pure coconut water, never from concentrate',
        'No added sugars or preservatives',
        'Resealable 500 ml carton with cap',
      ],
      cta: 'Find ÉLAN near you',
    },

    stats: {
      script: 'by the numbers',
      title: 'ÉLAN by the numbers',
      items: [
        ['150+', 'stockists across the Netherlands'],
        ['100,000+', 'cartons sold in 12 weeks'],
        ['100%', 'pure coconut water'],
        ['500 ml', 'resealable carton with cap'],
        ['0g', 'added sugar. Only natural sugars from coconut water'],
      ],
      foot: 'A Dutch premium brand.',
      sub: 'From gyms to supermarkets: ÉLAN keeps growing across the Netherlands every month.',
    },

    availability: {
      script: 'Trusted by retailers and specialty stores across the Netherlands.',
      title: 'Available at',
      cta: 'See all stockists',
    },

    reviews: {
      script: 'what others say',
      title: 'Reviews',
      body: 'Experiences from people who drink ÉLAN.',
      empty: 'No reviews published yet. Be the first — we read every single one.',
      summary: (avg, n) => `${avg} out of 5 · ${n} ${n === 1 ? 'review' : 'reviews'}`,
      writeCta: 'Write a review',
      googleCta: 'Review us on Google',
      cancel: 'Cancel',
      form: {
        name: 'Name',
        place: 'City (optional)',
        email: 'Email (stays private)',
        rating: 'Your rating',
        message: 'What do you think of ÉLAN?',
        send: 'Post review',
        sending: 'Sending…',
        privacy: 'We publish your review after a quick check. Your email stays private and never appears on the site.',
        errorPre: 'Something went wrong. Please try again or email us directly at ',
        okScript: 'thank you!',
        okTitle: 'Your review has been sent.',
        okBody: 'We’ll read it through and publish it on the site.',
        okAgain: 'Write another',
      },
    },

    story: {
      script: 'our story',
      title: 'Born from a passion for purity.',
      body: 'ÉLAN began with a simple question: why is it so hard to find truly pure coconut water that tastes like it came straight from the coconut?',
      cta: 'Read our story',
    },

    ourStory: {
      script: 'our story',
      title: 'Our story',
      lead: 'Born from a passion for purity.',
      intro: [
        'ÉLAN began with a simple question: why is it so hard to find truly pure coconut water that tastes like it came straight from the coconut?',
        'During our search we tasted many different brands. Too often the fresh, natural taste that makes coconut water so special was missing. Some products were made from concentrate or lost their pure character in the production process.',
        'We believed it could be done differently.',
        'So we set out to create ÉLAN: a premium coconut water that is not only 100% pure, but also keeps the fresh, soft and natural taste nature intended.',
      ],
      sections: [
        {
          heading: 'Why ÉLAN?',
          body: [
            'The name ÉLAN stands for energy, flair and enthusiasm. It symbolizes vitality, a positive outlook and the drive to consciously choose quality.',
            'That meaning is the foundation of everything we do.',
            'We believe a healthy product should not only be good for your body, but also bring joy. A drink you look forward to every time.',
          ],
        },
        {
          heading: 'Our promise',
          body: ['ÉLAN contains just one ingredient: 100% pure coconut water.'],
          list: [
            'Never from concentrate',
            'No added sugars',
            'No preservatives',
            'A fresh, soft and natural taste',
          ],
          after: ['Exactly the way coconut water should be.'],
        },
        {
          heading: 'Our vision',
          body: [
            'We are building a Dutch premium brand that stands for honesty, quality and transparency.',
            'Not by adding the most ingredients, but by taking away nothing from what nature has already made perfect.',
            'We want to show that simplicity is the highest form of quality.',
            'From the coconut to the carton: every choice we make serves one goal: letting people enjoy the purest coconut water.',
          ],
        },
        {
          heading: 'About Bryan & Isabel',
          body: [
            'We are not a multinational. We are two entrepreneurs from Rotterdam with one mission: to make the purest coconut water accessible to everyone.',
            'After months of searching we found a producer that made exactly what we had in mind: 100% pure coconut water. Not from concentrate. No added sugars. No preservatives.',
            'That is how ÉLAN was born.',
          ],
        },
      ],
      outro: [
        'ÉLAN is more than coconut water. It is a conscious choice for purity. For quality. For taste. For energy.',
      ],
      closer: 'Born from purity. Driven by ÉLAN.',
      cta: 'Shop ÉLAN',
    },

    contact: {
      title: 'Get in touch',
      heading: '100% Pure Coconut Water. Nothing else.',
      company: 'ELAN WORLD BV',
      address: ['Cypresbaan 55', '2908 LT Capelle aan den IJssel, NL'],
      email: 'Info@drinkelan.com',
      phone: '+31 6 4273 0763',
      kvk: 'Chamber of Commerce 97952338',
      form: {
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: 'Send message',
        sending: 'Sending…',
        privacy: 'You agree to our friendly privacy policy.',
        errorPre: 'Something went wrong. Please try again or email us directly at ',
        okScript: 'thank you!',
        okTitle: 'Your message has been sent.',
        okBody: 'We’ll get back to you as soon as possible.',
        okAgain: 'Send another',
      },
    },

    socials: {
      script: 'join the journey',
      title: 'Follow ÉLAN on social',
      body: 'Follow our journey. Discover new recipes, inspiration, sporting moments and everything about 100% pure coconut water.',
      instagram: { handle: '@drink.elan', url: 'https://www.instagram.com/drink.elan/' },
      tiktok: { handle: '@drinkelan', url: 'https://www.tiktok.com/@drinkelan' },
      facebook: { handle: 'ÉLAN on Facebook', url: 'https://www.facebook.com/profile.php?id=61580372634885' },
      feed: [
        { cap: 'pure by nature' },
        { cap: 'what is ÉLAN' },
        { cap: 'join in' },
        { cap: 'the meaning' },
        { cap: 'always fresh' },
      ],
    },

    footer: {
      tagline: '100% Pure Coconut Water',
      legal: [
        { label: 'Privacy policy', href: '#/privacy' },
        { label: 'Terms & conditions', href: '#/voorwaarden' },
        { label: 'Return policy', href: '#/retourbeleid' },
        { label: 'Cookie policy', href: '#/cookiebeleid' },
      ],
      company: 'ELAN WORLD BV · CoC 97952338',
      copy: (y) => `© ${y} ELAN WORLD BV · 100% Pure Coconut Water`,
    },

    findus: {
      script: 'find your refreshment',
      title: 'Find ÉLAN near you',
      viewNL: 'Netherlands',
      viewWorld: 'World',
      search: 'Search by city, store or address…',
      nearest: 'Closest to you',
      route: 'Directions',
      locate: 'Use my location',
      loading: 'Loading the map…',
    },

    shop: {
      loading: 'Loading the shop…',
      eyebrow: 'The ÉLAN shop',
      script: 'take it home',
      title: 'Bring the tropics home.',
      body: '100% pure coconut water, available at our stockists. Soon also by the case and as a monthly subscription directly from ÉLAN.',
      resellerScript: 'prefer in-store?',
      resellerTitle: 'Find ÉLAN near you.',
      resellerBody: 'Discover on the map where you can buy ÉLAN by the carton: supermarkets, hospitality and specialty stores across the Netherlands.',
      resellerCta: 'Open the map',
      buyResellerLead: 'Now available at our stockists:',
      buyFindCta: 'Find ÉLAN near you',
      preorderLead: 'Available to order soon.',
      preorderSub: 'Leave your email and be the first to know.',
      preorderPlaceholder: 'Your email address',
      preorderBtn: 'Keep me posted',
      preorderSending: 'Sending…',
      preorderOkScript: 'you’re on the list!',
      cart: 'Add to cart',
      backToShop: 'Back to the shop',
      view: 'View',
      buyExternal: 'Order at BGS Nutrition',
      buyExternalLead: 'Available to order now via our partner:',
      soonBadge: 'Coming soon',
      soonTeaserCta: 'Learn more',
    },

    products: [
      {
        slug: 'elan-case-12', name: 'Value case, 12× 500 ml',
        subtitle: 'Stock up and save',
        unit: 'per case (12 pcs)', badge: 'Best deal',
        short: 'Twelve cartons of ÉLAN in one box, with case savings. The smartest way to always have fresh coconut water at home. Available to order soon.',
        highlights: [
          '12 cartons of 500 ml',
          'Savings versus single purchase',
          'Free shipping within NL from €35',
          'Ideal for home, sport or the office',
        ],
      },
      {
        slug: 'elan-500', name: 'ÉLAN 500 ml',
        subtitle: 'Single carton, 100% pure coconut water',
        unit: 'per carton', badge: 'Bestseller',
        short: 'The resealable 500 ml carton with cap. Not from concentrate, no added sugars. Take it anywhere.',
        highlights: [
          '100% pure coconut water, never from concentrate',
          'No added sugars or preservatives',
          'Just 12 kcal per 100 ml',
          'Vegan and gluten-free',
        ],
      },
      {
        slug: 'elan-abo', name: 'ÉLAN Subscription',
        subtitle: 'Fresh delivery every month',
        unit: 'per month, cancel anytime', badge: 'Coming soon',
        short: 'Never run out. A case of ÉLAN through your door every month, with subscriber savings and always cancellable. Available soon.',
        highlights: [
          'Monthly delivery, nothing to worry about',
          'Subscriber savings on every case',
          'Pause or cancel at any time',
          'Free shipping included',
        ],
      },
      {
        slug: 'elan-1l', name: 'ÉLAN 1 L',
        subtitle: 'Family carton, 100% pure coconut water',
        unit: 'per carton', badge: 'Coming soon',
        note: 'From January 2027',
        short: 'The large one-litre carton for home. The same 100% pure coconut water, not from concentrate and no added sugars, now in a handy size to share. Available from January 2027.',
        highlights: [
          '1 litre, perfect to share or for home',
          '100% pure coconut water, not from concentrate',
          'No added sugars or preservatives',
          'Vegan and gluten-free',
        ],
      },
    ],

    resellers: [
      { name: 'Reseller 1', url: '#', note: 'Order online' },
      { name: 'Reseller 2', url: '#', note: 'Order online' },
      { name: 'Reseller 3', url: '#', note: 'Order online' },
    ],

    legal: {
      privacy: {
        title: 'Privacy policy',
        updated: 'Last updated: July 2026',
        mock: true,
        intro: 'This is a preliminary version. The final legal text will follow.',
        sections: [
          ['Who we are', 'ELAN WORLD BV (CoC 97952338), based at Cypresbaan 55, 2908 LT Capelle aan den IJssel, the Netherlands, is responsible for processing personal data as described in this policy.'],
          ['What data we collect', 'Data you provide via the contact or order form (name, email, message), and technical data needed to run the website.'],
          ['How we use it', 'To answer your questions, process orders and, with your consent, keep you informed.'],
          ['Your rights', 'You have the right to access, correct and delete your data. Email Info@drinkelan.com to do so.'],
        ],
      },
      voorwaarden: {
        title: 'Terms & conditions',
        updated: 'Last updated: July 2026',
        mock: true,
        intro: 'This is a preliminary version. The final legal text will follow.',
        sections: [
          ['Applicability', 'These terms apply to every offer and agreement with ELAN WORLD BV.'],
          ['Orders', 'An agreement is formed once your order is confirmed. Prices include VAT unless stated otherwise.'],
          ['Delivery', 'We aim to deliver orders as quickly as possible within the Netherlands.'],
          ['Liability', 'ÉLAN is not liable for damage caused by improper use of the product.'],
        ],
      },
      retourbeleid: {
        title: 'Return policy',
        updated: 'Last updated: July 2026',
        mock: true,
        intro: 'This is a preliminary version. The final legal text will follow.',
        sections: [
          ['Right of withdrawal', 'You have 14 days after receipt to return your order, provided it is unopened and within its shelf life.'],
          ['Exceptions', 'For shelf-life and hygiene reasons, opened products cannot be returned.'],
          ['Refunds', 'Once a return is approved, we refund the purchase amount within 14 days.'],
          ['Register a return', 'Register your return via Info@drinkelan.com.'],
        ],
      },
      cookiebeleid: {
        title: 'Cookie policy',
        updated: 'Last updated: July 2026',
        mock: true,
        intro: 'This is a preliminary version. The final legal text will follow.',
        sections: [
          ['What are cookies', 'Cookies are small files stored on your device to make the website work properly.'],
          ['Which cookies we use', 'Functional cookies needed for the site to work (including your language preference), and possibly analytical cookies.'],
          ['Managing cookies', 'You can manage or delete cookies at any time through your browser settings.'],
        ],
      },
    },
  },
}

export const euro = (n) => (n == null ? '' : '€' + n.toFixed(2).replace('.', ','))
