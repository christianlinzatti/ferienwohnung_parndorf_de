export const onRequest = async (context) => {
  const request = context.request;
  const url = new URL(request.url);
  const { pathname, hostname } = url;

  const baseDe = "https://de.ferienwohnung-parndorf.at";
  const baseEn = "https://en.ferienwohnung-parndorf.at";

  const isBot = /googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|whatsapp|telegrambot|slackbot|discordbot/i
                .test(request.headers.get("user-agent") || "");

  const assets = context.env.ASSETS;

  // -----------------------------------------------
  // NORMALIZE PATH
  // -----------------------------------------------
  let path = pathname;
  if (!path.endsWith("/")) path = path + "/";

  // -----------------------------------------------
  // WWW REDIRECT
  // -----------------------------------------------
  if (hostname.startsWith("www.")) {
    const target =
      hostname === "www.ferienwohnung-parndorf.at"
        ? baseDe + path
        : `https://${hostname.replace("www.", "")}${path}`;
    return Response.redirect(target, 301);
  }

  // -----------------------------------------------
  // LANGUAGE DETECTION
  // -----------------------------------------------
  let lang = hostname.startsWith("de.") ? "de" : "en";
  const base = lang === "de" ? baseDe : baseEn;
  const otherBase = lang === "de" ? baseEn : baseDe;

  // -----------------------------------------------
  // SLUG TRANSLATION TABLES
  // -----------------------------------------------
  const deToEn = {
    wohnzimmer: "livingroom",
    schlafzimmer: "bedroom",
    kueche: "kitchen",
    badezimmer: "bathroom",
    terrasse: "terrace",
    eingangsbereich: "entrance",
    ausstattung: "facilities",
    anfahrt: "directions",
    kontakt: "contact",
    region: "region",
    neusiedlersee: "neusiedlersee",
    outlet: "outlet"
  };
  const enToDe = Object.fromEntries(
    Object.entries(deToEn).map(([k, v]) => [v, k])
  );

  const firstSeg = path.replace(/^\/|\/$/g, "").split("/")[0] || "";

  // -----------------------------------------------
  // WRONG LANGUAGE SLUG FIX (DE-Domain but EN slug)
  // -----------------------------------------------
  if (lang === "de" && enToDe[firstSeg]) {
    const rest = path.replace(/^\/|\/$/g, "").split("/").slice(1).join("/");
    const newPath = "/" + enToDe[firstSeg] + (rest ? "/" + rest + "/" : "/");
    return Response.redirect(baseDe + newPath, 301);
  }

  // -----------------------------------------------
  // WRONG LANGUAGE SLUG FIX (EN-Domain but DE slug)
  // -----------------------------------------------
  if (lang === "en" && deToEn[firstSeg]) {
    const rest = path.replace(/^\/|\/$/g, "").split("/").slice(1).join("/");
    const newPath = "/" + deToEn[firstSeg] + (rest ? "/" + rest + "/" : "/");
    return Response.redirect(baseEn + newPath, 301);
  }

  // -----------------------------------------------
  // META MAP (ERGÄNZT + VOLLSTÄNDIG)
  // -----------------------------------------------
  const metaDataMap = {
    de: {
      '/': {
        title: 'Ferienwohnung Parndorf – Ihr Zuhause am Neusiedler See',
        description: 'Entdecken Sie unsere komfortable Ferienwohnung in Parndorf – ideal gelegen zwischen Outlet und Neusiedler See.',
        image: baseDe + '/assets/images/wohnzimmer.webp'
      },
      '/wohnzimmer/': {
        title: 'Wohnzimmer – Ferienwohnung Parndorf',
        description: 'Gemütliches Wohnzimmer mit bequemer Couch – Ihr Rückzugsort in Parndorf.',
        image: baseDe + '/assets/images/wohnzimmer.webp'
      },
      '/schlafzimmer/': {
        title: 'Schlafzimmer – Ferienwohnung Parndorf',
        description: 'Erholsamer Schlaf in stilvollem Ambiente – entdecken Sie unser Schlafzimmer.',
        image: baseDe + '/assets/images/schlafzimmer.webp'
      },
      '/kueche/': {
        title: 'Küche & Essbereich – Ferienwohnung Parndorf',
        description: 'Voll ausgestattete Küche und Essbereich für gemütliche Mahlzeiten in Parndorf.',
        image: baseDe + '/assets/images/kueche.webp'
      },
      '/badezimmer/': {
        title: 'Badezimmer – Ferienwohnung Parndorf',
        description: 'Modernes Badezimmer mit Dusche und WC – Wohlfühlen leicht gemacht.',
        image: baseDe + '/assets/images/badezimmer.webp'
      },
      '/terrasse/': {
        title: 'Terrasse & Garten – Ferienwohnung Parndorf',
        description: 'Entspannen Sie im Garten oder genießen Sie Ihren Kaffee auf der sonnigen Terrasse.',
        image: baseDe + '/assets/images/terrasse.webp'
      },
      '/eingangsbereich/': {
        title: 'Eingangsbereich – Ferienwohnung Parndorf',
        description: 'Herzlich willkommen! Einladender Eingangsbereich für Ihren Aufenthalt.',
        image: baseDe + '/assets/images/eingangsbereich.webp'
      },
      '/ausstattung/': {
        title: 'Ausstattung – Ferienwohnung Parndorf',
        description: 'Alle Details zur Ausstattung: WLAN, Küche, Terrasse, Parkplatz, und mehr.',
        image: baseDe + '/assets/images/wohnzimmer.webp'
      },
      '/anfahrt/': {
        title: 'Anfahrt & Lage – Ferienwohnung Parndorf',
        description: 'So finden Sie uns – zentrale Lage zwischen Neusiedler See und Outlet-Center.',
        image: baseDe + '/assets/images/map.webp'
      },
      '/kontakt/': {
        title: 'Kontakt – Ferienwohnung Parndorf',
        description: 'Kontaktieren Sie uns für Buchungen oder Fragen zur Unterkunft.',
        image: baseDe + '/assets/images/kontakt.webp'
      },
      '/region/': {
        title: 'Region Parndorf & Neusiedler See – Sehenswürdigkeiten & Aktivitäten',
        description: 'Entdecken Sie die Region rund um Parndorf: Neusiedler See, Designer Outlet, Radwege, Ausflugsziele und mehr.',
        image: baseDe + '/assets/images/region.webp'
      },
      '/region/neusiedlersee/': {
        title: 'Region Neusiedler See – Ausflugsziele & Aktivitäten',
        description: 'Alles über den Neusiedler See: Sehenswürdigkeiten, Natur, Freizeit und Tipps für Ihren Aufenthalt in Parndorf.',
        image: baseDe + '/assets/images/region-neusiedlersee.jpg'
      },
      '/region/outlet/': {
        title: 'Designer Outlet Parndorf – Shopping & Lifestyle',
        description: 'Nur 2 km vom Apartment entfernt: Designer Outlet Parndorf mit über 160 Shops.',
        image: baseDe + '/assets/images/outlet.webp'
      }
    },

    en: {
      '/': {
        title: 'Holiday Apartment Parndorf – Your Home at Lake Neusiedl',
        description: 'Discover our cozy apartment in Parndorf – perfectly located between the outlet center and Lake Neusiedl.',
        image: baseEn + '/assets/images/wohnzimmer.webp'
      },
      '/livingroom/': {
        title: 'Living Room – Holiday Apartment Parndorf',
        description: 'Cozy living room with a comfortable couch – your retreat in Parndorf.',
        image: baseEn + '/assets/images/wohnzimmer.webp'
      },
      '/bedroom/': {
        title: 'Bedroom – Holiday Apartment Parndorf',
        description: 'Relax and unwind in our stylish bedroom.',
        image: baseEn + '/assets/images/schlafzimmer.webp'
      },
      '/kitchen/': {
        title: 'Kitchen & Dining Area – Holiday Apartment Parndorf',
        description: 'Fully equipped kitchen and dining area for your stay in Parndorf.',
        image: baseEn + '/assets/images/kueche.webp'
      },
      '/bathroom/': {
        title: 'Bathroom – Holiday Apartment Parndorf',
        description: 'Modern bathroom with shower and toilet.',
        image: baseEn + '/assets/images/badezimmer.webp'
      },
      '/terrace/': {
        title: 'Terrace & Garden – Holiday Apartment Parndorf',
        description: 'Enjoy breakfast on the sunny terrace or relax in the garden.',
        image: baseEn + '/assets/images/terrasse.webp'
      },
      '/entrance/': {
        title: 'Entrance – Holiday Apartment Parndorf',
        description: 'Welcome area of the apartment – feel at home.',
        image: baseEn + '/assets/images/eingangsbereich.webp'
      },
      '/facilities/': {
        title: 'Facilities – Holiday Apartment Parndorf',
        description: 'All apartment amenities: WiFi, kitchen, terrace, parking, and more.',
        image: baseEn + '/assets/images/wohnzimmer.webp'
      },
      '/directions/': {
        title: 'Directions & Location – Holiday Apartment Parndorf',
        description: 'Find us easily – between Lake Neusiedl and the Designer Outlet.',
        image: baseEn + '/assets/images/map.webp'
      },
      '/contact/': {
        title: 'Contact – Holiday Apartment Parndorf',
        description: 'Contact us for booking or inquiries.',
        image: baseEn + '/assets/images/kontakt.webp'
      },
      '/region/': {
        title: 'Region Parndorf & Lake Neusiedl – Sights & Activities',
        description: 'Discover the Parndorf region: Lake Neusiedl, Designer Outlet, cycling routes, local attractions and more.',
        image: baseEn + '/assets/images/region.webp'
      },
      '/region/neusiedlersee/': {
        title: 'Lake Neusiedl Region – Sights & Activities',
        description: 'All about Lake Neusiedl: attractions, nature, leisure, and travel tips.',
        image: baseEn + '/assets/images/region-neusiedlersee.jpg'
      },
      '/region/outlet/': {
        title: 'Designer Outlet Parndorf – Shopping & Lifestyle',
        description: 'Just 2 km away – 160 designer shops for the perfect shopping experience.',
        image: baseEn + '/assets/images/outlet.webp'
      }
    }
  };

  // -----------------------------------------------
  // AUTOMATIC FALLBACK META
  // -----------------------------------------------
  function getAutoMeta(p, lang) {
    const clean = p.replace(/^\/|\/$/g, "");
    const parts = clean.split("/");
    const text = parts.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" – ");

    const base = lang === "de" ? baseDe : baseEn;

    return {
      title: lang === "de"
        ? `${text} – Ferienwohnung Parndorf`
        : `${text} – Holiday Apartment Parndorf`,

      description: lang === "de"
        ? `Informationen zur Seite ${text}.`
        : `Information about the page ${text}.`,

      image: base + "/assets/images/wohnzimmer.webp"
    };
  }

  const meta =
    metaDataMap[lang][path] ||
    getAutoMeta(path, lang);

  // -----------------------------------------------
  // BOT PRERENDERING
  // -----------------------------------------------
  if (isBot) {
    return prerenderResponse({
      base,
      path,
      meta,
      lang,
      baseDe,
      baseEn
    });
  }

  // -----------------------------------------------
  // STATIC ASSETS
  // -----------------------------------------------
  if (/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|txt|json|xml|pdf|woff2?)$/i.test(path)) {
    return assets.fetch(request);
  }

  // -----------------------------------------------
  // SPA FALLBACK
  // -----------------------------------------------
  return assets.fetch(new Request(`https://${hostname}/index.html`, request));
};

// ====================================================================
// PRERENDER FUNCTION
// ====================================================================
function prerenderResponse({ base, path, meta, lang, baseDe, baseEn }) {
  const canonical = base + path;

  const otherLangPath =
    lang === "de"
      ? path.replace(/^\/([^/]+)/, (_, seg) => "/" + (deToEn[seg] || seg))
      : path.replace(/^\/([^/]+)/, (_, seg) => "/" + (enToDe[seg] || seg));

  const alternateDe = baseDe + path;
  const alternateEn = baseEn + otherLangPath;

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="de" href="${alternateDe}">
<link rel="alternate" hreflang="en" href="${alternateEn}">
<meta property="og:type" content="website">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:image" content="${meta.image}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${meta.title}">
<meta name="twitter:description" content="${meta.description}">
<meta name="twitter:image" content="${meta.image}">
</head>
<body>
<h1>${meta.title}</h1>
<p>${meta.description}</p>
<img src="${meta.image}" style="max-width:100%;height:auto">
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "x-prerendered": "1"
    }
  });
}
