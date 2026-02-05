// _middleware.js - Alles in einer Datei: Redirects, Meta-Daten, SEO & SPA-Fallback

// --- HILFSFUNKTIONEN (VOR onRequest) ---

/**
 * Normalisiert einen Pfad für SEO-Seiten (kleingeschrieben, mit Slashes).
 * Wird NICHT auf Dateien wie .xml oder .jpg angewendet.
 */
function normalizePath(p) {
  if (!p || p === "/") return "/";
  let s = p.toLowerCase();
  try { s = decodeURIComponent(s); } catch (e) {}
  if (!s.startsWith("/")) s = "/" + s;
  if (!s.endsWith("/")) s = s + "/";
  return s;
}

/**
 * Führt grundlegendes HTML-Escaping durch.
 */
function escapeHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

/**
 * Übersetzt einen Pfad für hreflang.
 */
function translatePath(path, fromLang, toLang, deToEn, enToDe) {
    if (path === "/") return "/";
    const segments = path.replace(/^\/|\/$/g, "").split('/');

    let map;
    if (fromLang === "de" && toLang === "en") {
        map = deToEn;
    } else if (fromLang === "en" && toLang === "de") {
        map = enToDe;
    } else {
        return path;
    }

    const newSegments = segments.map(seg => {
        return map[seg] || seg;
    });

    return "/" + newSegments.join("/") + "/";
}

/**
 * Generiert das Schema.org BreadcrumbList JSON-LD.
 */
function generateBreadcrumbSchema(currentPath, currentLang, currentBase, map) {
    if (currentPath === "/") return null;

    const segments = currentPath.replace(/^\/|\/$/g, "").split('/').filter(Boolean);
    const itemListElement = [];
    let url = currentBase;

    const homeMeta = map[normalizePath("/")];
    itemListElement.push({
      "@type": "ListItem",
      "position": 1,
      "name": homeMeta.breadcrumbName || (currentLang === "de" ? "Startseite" : "Home"),
      "item": currentBase + "/"
    });

    segments.forEach((segment, index) => {
      url += `${segment}/`;
      const pathKey = normalizePath(url.replace(currentBase, ""));
      const segmentMeta = map[pathKey] || {};
      const breadcrumbName = segmentMeta.breadcrumbName || segment.charAt(0).toUpperCase() + segment.slice(1);

      itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": breadcrumbName,
        "item": url
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };
  }

// --- ON REQUEST START ---

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

  const isBot = /(googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|preview|embed)/i
    .test(ua);

  // 1. STATISCHE DATEIEN PRÜFEN (WICHTIG: Bevor Normalisierung stattfindet!)
  // Hier werden sitemap.xml, robots.txt, Bilder etc. direkt abgefangen.
  const isAsset = url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|txt|json|xml|pdf|webmanifest|woff2?)$/i);

  if (isAsset || url.pathname.startsWith("/assets/")) {
    return assets.fetch(request);
  }

  // 2. PFAD-NORMALISIERUNG (Nur für HTML-Seiten)
  const path = normalizePath(url.pathname);
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const currentBase = lang === "de" ? baseDe : baseEn;

  // -------------------------------------------------------
  // 3. DICTIONARIES & META-DATA
  // -------------------------------------------------------

  const deToEn = {
    "wohnzimmer": "livingroom", "schlafzimmer": "bedroom", "kueche": "kitchen",
    "badezimmer": "bathroom", "terrasse": "terrasse", "eingangsbereich": "entrance",
    "ausstattung": "facilities", "anfahrt": "directions", "kontakt": "contact",
    "region": "region", "neusiedlersee": "neusiedlersee", "outlet": "outlet"
  };

  const enToDe = {
    "livingroom": "wohnzimmer", "bedroom": "schlafzimmer", "kitchen": "kueche",
    "bathroom": "badezimmer", "terrasse": "terrasse", "entrance": "eingangsbereich",
    "facilities": "ausstattung", "directions": "anfahrt", "contact": "kontakt",
    "region": "region", "neusiedlersee": "neusiedlersee", "outlet": "outlet"
  };

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
      "/region/": { title: "Region Parndorf – Entdecken Sie das Burgenland", description: "Entdecken Sie die region rund um Parndorf und den Neusiedler See.", image: `${baseDe}/assets/images/region.webp` },
      "/region/neusiedlersee/": { title: "Region Neusiedler See – Ausflugsziele & Aktivitäten", description: "Alles über den Neusiedler See: Sehenswürdigkeiten, Natur, Freizeit und Tipps für Ihren Aufenthalt in Parndorf.", image: `${baseDe}/assets/images/region-neusiedlersee.jpg` },
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping & Lifestyle", description: "Nur 2 km vom Apartment entfernt: Designer Outlet Parndorf mit über 160 Shops.", image: `${baseDe}/assets/images/outlet.webp` }
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
      "/region/": { title: "Parndorf Region – Discover Burgenland", description: "Discover the Parndorf region and Lake Neusiedl.", image: `${baseEn}/assets/images/region.webp` },
      "/region/neusiedlersee/": { title: "Lake Neusiedl Region – Sights & Activities", description: "All about Lake Neusiedl: attractions, nature, leisure, and travel tips.", image: `${baseEn}/assets/images/region-neusiedlersee.jpg` },
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping & Lifestyle", description: "Just 2 km away – 160 designer shops for the perfect shopping experience.", image: `${baseEn}/assets/images/outlet.webp` }
    }
  };

  const currentMetaDataMap = metaDataMap[lang];

  // -------------------------------------------------------
  // 4. REDIRECT LOGIC
  // -------------------------------------------------------

  if (hostname.startsWith("www.")) {
    const bare = hostname.replace(/^www\./, "");
    return Response.redirect(`https://${bare}${path}`, 301);
  }
  if (hostname === "ferienwohnung-parndorf.at") {
    if (isHtmlNav) return Response.redirect(`${baseDe}${path}`, 301);
  }

  if (path !== "/") {
    const segments = path.replace(/^\/|\/$/g, "").split('/').filter(Boolean);
    let needsRedirect = false;

    // Redundante Segmente
    if (segments.length >= 2 && segments[segments.length - 1] === segments[segments.length - 2]) {
        return Response.redirect(`${currentBase}/${segments.slice(0, -1).join("/")}/`, 301);
    }

    const newSegments = segments.map(seg => {
      const lower = seg.toLowerCase();
      if (lang === "de" && enToDe[lower] && enToDe[lower] !== lower) {
          needsRedirect = true; return enToDe[lower];
      }
      if (lang === "en" && deToEn[lower] && deToEn[lower] !== lower) {
          needsRedirect = true; return deToEn[lower];
      }
      return lower;
    });

    if (needsRedirect) {
      return Response.redirect(`${currentBase}/${newSegments.join("/")}/`, 301);
    }
  }

  // -------------------------------------------------------
  // 5. META-DATA & BOT RESPONSE
  // -------------------------------------------------------

  function getAutoMeta(p, currentLang) {
    const clean = p.replace(/^\/|\/$/g, "");
    const parts = clean.split("/");
    const titleParts = parts.map(s => s.charAt(0).toUpperCase() + s.slice(1));
    const title = (currentLang === "de" ? `${titleParts.join(" – ")} – Ferienwohnung Parndorf` : `${titleParts.join(" – ")} – Holiday Apartment Parndorf`);
    const desc = (currentLang === "de" ? `Informationen zu ${titleParts.join(" – ")}.` : `Information about ${titleParts.join(" – ")}.`);
    return { title, description: desc, image: `${currentBase}/assets/images/wohnzimmer.webp` };
  }

  let meta = currentMetaDataMap[path] || getAutoMeta(path, lang);
  if (!meta.breadcrumbName) {
      meta.breadcrumbName = meta.title.split(" – ")[0].trim() || (lang === "de" ? "Seite" : "Page");
  }

  if (isBot && isHtmlNav) {
    const alternateLang = lang === "de" ? "en" : "de";
    const alternateBase = lang === "de" ? baseEn : baseDe;
    const alternatePath = translatePath(path, lang, alternateLang, deToEn, enToDe);
    
    const unifiedJsonLd = [
      { "@context": "https://schema.org", "@type": "WebPage", "url": currentBase + path, "name": meta.title, "description": meta.description, "primaryImageOfPage": { "@type": "ImageObject", "url": meta.image } },
      { "@context": "https://schema.org", "@type": "LodgingBusiness", "name": "Ferienwohnung Parndorf", "description": meta.description, "url": currentBase + "/", "image": [meta.image], "telephone": "+436504124810", "address": { "@type": "PostalAddress", "streetAddress": "Obere Wunkau 38", "postalCode": "7111", "addressLocality": "Parndorf", "addressCountry": "AT" }, "geo": { "@type": "GeoCoordinates", "latitude": 48.0007115, "longitude": 16.8640465 } }
    ];

    const breadcrumbSchema = generateBreadcrumbSchema(path, lang, currentBase, currentMetaDataMap);
    if (breadcrumbSchema) unifiedJsonLd.push(breadcrumbSchema);

    const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="canonical" href="${currentBase + path}">
  <link rel="alternate" hreflang="de" href="${lang === "de" ? currentBase + path : alternateBase + alternatePath}">
  <link rel="alternate" hreflang="en" href="${lang === "en" ? currentBase + path : alternateBase + alternatePath}">
  <link rel="alternate" hreflang="x-default" href="${baseDe + translatePath(path, lang, "de", deToEn, enToDe)}">
  <meta property="og:title" content="${escapeHtml(meta.title)}"><meta property="og:image" content="${meta.image}">
  <script type="application/ld+json">${JSON.stringify(unifiedJsonLd)}</script>
</head>
<body><main><h1>${escapeHtml(meta.title)}</h1><p>${escapeHtml(meta.description)}</p></main></body></html>`;

    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "x-prerendered": "1" } });
  }

  // -------------------------------------------------------
  // 6. REGULAR USER (SPA Load)
  // -------------------------------------------------------
  try {
    const fetchUrl = hostname.startsWith("en.") ? "/en/index.html" : "/de/index.html";
    let response = await assets.fetch(new URL(fetchUrl, request.url));
    if (response.status === 404) response = await assets.fetch(new URL("/index.html", request.url));
    return response;
  } catch (err) {
    return new Response("Not found", { status: 404 });
  }
}
