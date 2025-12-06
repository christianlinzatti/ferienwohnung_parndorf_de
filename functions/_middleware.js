// _middleware.js - Alles in einer Datei: Redirects, Meta-Daten, SEO & SPA-Fallback

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const accept = request.headers.get("accept") || "";
  const ua = request.headers.get("user-agent") || "";
  const isHtmlNav = accept.includes("text/html");

  const baseDe = "https://de.ferienwohnung-parndorf.at";
  const baseEn = "https://en.ferienwohnung-parndorf.at";
  const assets = env.ASSETS;

  // Bot detection
  const isBot = /(googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|preview|embed)/i
    .test(ua);

  // -------------------------------------------------------
  // 1. MANUELLE WORTERBÜCHER (Pfad-Übersetzung)
  // -------------------------------------------------------

  // Deutsch -> Englisch Map
  const deToEn = {
    "wohnzimmer": "livingroom",
    "schlafzimmer": "bedroom",
    "kueche": "kitchen",
    "badezimmer": "bathroom",
    "terrasse": "terrace",
    "eingangsbereich": "entrance",
    "ausstattung": "facilities",
    "anfahrt": "directions",
    "kontakt": "contact",
    "region": "region",
    "neusiedlersee": "neusiedlersee",
    "outlet": "outlet",
    "garten": "garden"
  };

  // Englisch -> Deutsch Map (Umkehrung manuell definiert)
  const enToDe = {
    "livingroom": "wohnzimmer",
    "bedroom": "schlafzimmer",
    "kitchen": "kueche",
    "bathroom": "badezimmer",
    "terrace": "terrasse",
    "entrance": "eingangsbereich",
    "facilities": "ausstattung",
    "directions": "anfahrt",
    "contact": "kontakt",
    "region": "region",
    "neusiedlersee": "neusiedlersee",
    "outlet": "outlet",
    "garden": "garten"
  };

  // -------------------------------------------------------
  // 2. META-DATEN MAP (Titel, Beschreibung, Bilder)
  // -------------------------------------------------------
  const metaDataMap = {
    de: {
      "/": { title: "Ferienwohnung Parndorf – Ihr Zuhause am Neusiedler See", description: "Entdecken Sie unsere komfortable Ferienwohnung in Parndorf – ideal gelegen zwischen Outlet und Neusiedler See.", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/wohnzimmer/": { title: "Wohnzimmer – Ferienwohnung Parndorf", description: "Gemütliches Wohnzimmer mit bequemer Couch – Ihr Rückzugsort in Parndorf.", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/schlafzimmer/": { title: "Schlafzimmer – Ferienwohnung Parndorf", description: "Erholsamer Schlaf in stilvollem Ambiente – entdecken Sie unser Schlafzimmer.", image: `${baseDe}/assets/images/schlafzimmer.webp` },
      "/kueche/": { title: "Küche & Essbereich – Ferienwohnung Parndorf", description: "Voll ausgestattete Küche und Essbereich für gemütliche Mahlzeiten in Parndorf.", image: `${baseDe}/assets/images/kueche.webp` },
      "/badezimmer/": { title: "Badezimmer – Ferienwohnung Parndorf", description: "Modernes Badezimmer mit Dusche und WC – Wohlfühlen leicht gemacht.", image: `${baseDe}/assets/images/badezimmer.webp` },
      "/terrasse/": { title: "Terrasse & Garten – Ferienwohnung Parndorf", description: "Entspannen Sie im Garten oder genießen Sie Ihren Kaffee auf der sonnigen Terrasse.", image: `${baseDe}/assets/images/terrasse.webp` },
      "/eingangsbereich/": { title: "Eingangsbereich – Ferienwohnung Parndorf", description: "Herzlich willkommen! Einladender Eingangsbereich für Ihren Aufenthalt.", image: `${baseDe}/assets/images/eingangsbereich.webp` },
      "/ausstattung/": { title: "Ausstattung – Ferienwohnung Parndorf", description: "Alle Details zur Ausstattung: WLAN, Küche, Terrasse, Parkplatz, und mehr.", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/anfahrt/": { title: "Anfahrt & Lage – Ferienwohnung Parndorf", description: "So finden Sie uns – zentrale Lage zwischen Neusiedler See und Outlet-Center.", image: `${baseDe}/assets/images/map.webp` },
      "/kontakt/": { title: "Kontakt – Ferienwohnung Parndorf", description: "Kontaktieren Sie uns für Buchungen oder Fragen zur Unterkunft.", image: `${baseDe}/assets/images/kontakt.webp` },
      "/region/": { title: "Region Parndorf & Neusiedler See – Sehenswürdigkeiten & Aktivitäten", description: "Entdecken Sie die Region rund um Parndorf und den Neusiedler See.", image: `${baseDe}/assets/images/region.webp` },
      "/region/neusiedlersee/": { title: "Region Neusiedler See – Ausflugsziele & Aktivitäten", description: "Alles über den Neusiedler See: Sehenswürdigkeiten, Natur, Freizeit und Tipps für Ihren Aufenthalt in Parndorf.", image: `${baseDe}/assets/images/region-neusiedlersee.jpg` },
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping & Lifestyle", description: "Nur 2 km vom Apartment entfernt: Designer Outlet Parndorf mit über 160 Shops.", image: `${baseDe}/assets/images/outlet.webp` },
      "/terrasse/garten/": { title: "Terrasse & Garten – Ferienwohnung Parndorf", description: "Entspannen Sie im privaten Garten und auf der sonnigen Terrasse.", image: `${baseDe}/assets/images/garten.webp` }
    },
    en: {
      "/": { title: "Holiday Apartment Parndorf – Your Home at Lake Neusiedl", description: "Discover our cozy apartment in Parndorf – perfectly located between the outlet center and Lake Neusiedl.", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/livingroom/": { title: "Living Room – Holiday Apartment Parndorf", description: "Cozy living room with a comfortable couch – your retreat in Parndorf.", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/bedroom/": { title: "Bedroom – Holiday Apartment Parndorf", description: "Relax and unwind in our stylish bedroom.", image: `${baseEn}/assets/images/schlafzimmer.webp` },
      "/kitchen/": { title: "Kitchen & Dining Area – Holiday Apartment Parndorf", description: "Fully equipped kitchen and dining area for your stay in Parndorf.", image: `${baseEn}/assets/images/kueche.webp` },
      "/bathroom/": { title: "Bathroom – Holiday Apartment Parndorf", description: "Modern bathroom with shower and toilet.", image: `${baseEn}/assets/images/badezimmer.webp` },
      "/terrace/": { title: "Terrace & Garden – Holiday Apartment Parndorf", description: "Enjoy breakfast on the sunny terrace or relax in the garden.", image: `${baseEn}/assets/images/terrasse.webp` },
      "/entrance/": { title: "Entrance – Holiday Apartment Parndorf", description: "Welcome area of the apartment – feel at home.", image: `${baseEn}/assets/images/eingangsbereich.webp` },
      "/facilities/": { title: "Facilities – Holiday Apartment Parndorf", description: "All apartment amenities: WiFi, kitchen, terrace, parking, and more.", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/directions/": { title: "Directions & Location – Holiday Apartment Parndorf", description: "Find us easily – between Lake Neusiedl and the Designer Outlet.", image: `${baseEn}/assets/images/map.webp` },
      "/contact/": { title: "Contact – Holiday Apartment Parndorf", description: "Contact us for booking or inquiries.", image: `${baseEn}/assets/images/kontakt.webp` },
      "/region/": { title: "Region Parndorf & Lake Neusiedl – Sights & Activities", description: "Discover the Parndorf region and Lake Neusiedl.", image: `${baseEn}/assets/images/region.webp` },
      "/region/neusiedlersee/": { title: "Lake Neusiedl Region – Sights & Activities", description: "All about Lake Neusiedl: attractions, nature, leisure, and travel tips.", image: `${baseEn}/assets/images/region-neusiedlersee.jpg` },
      "/terrace/garden/": { title: "Terrace & Garden – Holiday Apartment Parndorf", description: "Relax in the private garden and on the sunny terrace.", image: `${baseEn}/assets/images/garten.webp` },
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping & Lifestyle", description: "Just 2 km away – 160 designer shops for the perfect shopping experience.", image: `${baseEn}/assets/images/outlet.webp` }
    }
  };

  // --- HILFSFUNKTIONEN ---

  function normalizePath(p) {
    if (!p || p === "/") return "/";
    let s = p.toLowerCase();
    try { s = decodeURIComponent(s); } catch (e) {}
    if (!s.startsWith("/")) s = "/" + s;
    if (!s.endsWith("/")) s = s + "/";
    return s;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  // --- LOGIK START ---

  const path = normalizePath(url.pathname);
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const currentBase = lang === "de" ? baseDe : baseEn;

  // -------------------------------------------------------
  // 3. CHECK: DOMAIN & PATH REDIRECTS (301)
  // -------------------------------------------------------

  // WWW -> non-WWW
  if (hostname.startsWith("www.")) {
    const bare = hostname.replace(/^www\./, "");
    return Response.redirect(`https://${bare}${path}`, 301);
  }
  // Root Domain -> de Subdomain
  if (hostname === "ferienwohnung-parndorf.at") {
    if (isHtmlNav) return Response.redirect(`${baseDe}${path}`, 301);
  }

  // Pfad-Übersetzung prüfen
  const isAsset = path.startsWith("/assets/") || path.match(/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|txt|json|xml|pdf|webmanifest|woff2?)$/i);

  if (!isAsset && path !== "/") {
    const segments = path.split('/').filter(Boolean);
    let needsRedirect = false;

    const newSegments = segments.map(seg => {
      const lower = seg.toLowerCase();

      if (lang === "de") {
        // Wir sind auf DE -> Prüfe auf englische Begriffe (z.B. "kitchen")
        if (enToDe[lower] && enToDe[lower] !== lower) {
          needsRedirect = true;
          return enToDe[lower];
        }
      } else {
        // Wir sind auf EN -> Prüfe auf deutsche Begriffe (z.B. "kueche")
        if (deToEn[lower] && deToEn[lower] !== lower) {
          needsRedirect = true;
          return deToEn[lower];
        }
      }
      return lower;
    });

    if (needsRedirect) {
      // 301 Redirect zur korrekten URL
      return Response.redirect(`${currentBase}/${newSegments.join("/")}/`, 301);
    }
  }

  // -------------------------------------------------------
  // 4. META-DATEN GENERIERUNG (Fallback)
  // -------------------------------------------------------

  if (isAsset) {
    return assets.fetch(request);
  }

  // Fallback-Funktion, falls der Pfad nicht in der Map ist
  function getAutoMeta(p, currentLang) {
    const clean = p.replace(/^\/|\/$/g, "");
    const parts = clean.split("/");
    const titleParts = parts.map(s => s.charAt(0).toUpperCase() + s.slice(1));
    const title = (currentLang === "de" ? `${titleParts.join(" – ")} – Ferienwohnung Parndorf` : `${titleParts.join(" – ")} – Holiday Apartment Parndorf`);
    const desc = (currentLang === "de" ? `Informationen zur Seite ${titleParts.join(" – ")}.` : `Information about ${titleParts.join(" – ")}.`);
    const img = (currentLang === "de" ? `${baseDe}/assets/images/wohnzimmer.webp` : `${baseEn}/assets/images/wohnzimmer.webp`);
    return { title, description: desc, image: img };
  }

  // Meta-Daten abrufen (Map oder Fallback)
  const meta = metaDataMap[lang] && metaDataMap[lang][path] ? metaDataMap[lang][path] : getAutoMeta(path, lang);

  // -------------------------------------------------------
  // 5. BOT RESPONSE (Prerendered HTML für SEO)
  // -------------------------------------------------------
  if (isBot && isHtmlNav) {
    const unifiedJsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "url": currentBase + path,
        "name": meta.title,
        "description": meta.description,
        "primaryImageOfPage": { "@type": "ImageObject", "url": meta.image }
      },
      {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "name": "Ferienwohnung Parndorf",
        "description": meta.description,
        "url": currentBase + "/",
        "image": [meta.image],
        "telephone": "+436504124810",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Obere Wunkau 38",
          "postalCode": "7111",
          "addressLocality": "Parndorf",
          "addressCountry": "AT"
        },
        "geo": { "@type": "GeoCoordinates", "latitude": 48.0007115, "longitude": 16.8640465 }
      }
    ];

    const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="canonical" href="${currentBase + path}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:url" content="${currentBase + path}">
  <meta property="og:image" content="${meta.image}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(meta.description)}">
  <meta name="twitter:image" content="${meta.image}">

  <script type="application/ld+json">${JSON.stringify(unifiedJsonLd)}</script>
</head>
<body>
  <main>
    <h1>${escapeHtml(meta.title)}</h1>
    <p>${escapeHtml(meta.description)}</p>
    <figure><img src="${meta.image}" alt="${escapeHtml(meta.title)}"></figure>
  </main>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600",
        "x-prerendered": "1"
      }
    });
  }

  // -------------------------------------------------------
  // 6. REGULAR USER (SPA Load)
  // -------------------------------------------------------
  try {
    let fetchUrl = "/index.html";
    if (hostname.startsWith("de.")) fetchUrl = "/de/index.html";
    if (hostname.startsWith("en.")) fetchUrl = "/en/index.html";

    // Versuchen, die sprachspezifische index.html zu laden (falls generiert), sonst fallback auf root
    let response = await assets.fetch(new URL(fetchUrl, request.url));
    if (response.status === 404) {
       response = await assets.fetch(new URL("/index.html", request.url));
    }
    return response;

  } catch (err) {
    return new Response("Not found", { status: 404 });
  }
}