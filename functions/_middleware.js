// _middleware.js - Fixed Mixed-Language Redirects & Detection

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const origPath = url.pathname || "/";
  const accept = request.headers.get("accept") || "";
  const ua = request.headers.get("user-agent") || "";
  const isHtmlNav = accept.includes("text/html");

  const baseDe = "https://de.ferienwohnung-parndorf.at";
  const baseEn = "https://en.ferienwohnung-parndorf.at";
  const assets = env.ASSETS;

  // Bot detection
  const isBot = /(googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|preview|embed)/i
    .test(ua);

  // Normalize path function
  function normalizePathForMap(p) {
    if (!p || p === "/") return "/";
    let s = p.toLowerCase();
    // Decode URI components to handle umlaute/spaces correctly
    try { s = decodeURIComponent(s); } catch (e) {}
    if (!s.startsWith("/")) s = "/" + s;
    if (!s.endsWith("/")) s = s + "/";
    return s;
  }
  const path = normalizePathForMap(origPath);

  // ----------------------------
  // 1) WWW -> non-www (SEO)
  // ----------------------------
  if (hostname.startsWith("www.")) {
    if (hostname === "www.ferienwohnung-parndorf.at") {
      return Response.redirect(`${baseDe}${path}`, 301);
    }
    const bare = hostname.replace(/^www\./, "");
    return Response.redirect(`https://${bare}${path}`, 301);
  }

  // ----------------------------
  // 2) Root domain -> redirect to de.
  // ----------------------------
  if (hostname === "ferienwohnung-parndorf.at") {
    if (isHtmlNav) {
      return Response.redirect(`${baseDe}${path}`, 301);
    }
    try {
      return await assets.fetch(new URL("/index.html", request.url));
    } catch (e) {
      return new Response("Not found", { status: 404 });
    }
  }

  // ----------------------------
  // 3) Slug translation tables
  // ----------------------------
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
    outlet: "outlet",
    garten: "garden"
  };

  // Umkehr-Map erstellen
  const enToDe = Object.fromEntries(Object.entries(deToEn).map(([k, v]) => [v, k]));

  // Language detection
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const base = lang === "de" ? baseDe : baseEn;

  // ----------------------------
  // 4) CORRECTED: Check ALL path segments for wrong language
  // ----------------------------

  // Definition von Assets (keine Redirects für Bilder/JS/CSS)
  const isAsset = path.startsWith("/assets/") || path.match(/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|txt|json|xml|pdf|webmanifest|woff2?)$/i);

  if (!isAsset && path !== "/") {
    // Pfad in Segmente zerlegen und leere entfernen
    const segments = path.split('/').filter(Boolean);
    let needsRedirect = false;

    const translatedSegments = segments.map(seg => {
      const lower = seg.toLowerCase();
      let translated = lower;

      if (lang === "de") {
        // Wir sind auf DE (de.ferienwohnung...).
        // Prüfen: Ist das Segment eigentlich Englisch? (z.B. "kitchen")
        if (enToDe[lower]) {
          translated = enToDe[lower]; // Übersetze zu "kueche"
        }
      } else {
        // Wir sind auf EN (en.ferienwohnung...).
        // Prüfen: Ist das Segment eigentlich Deutsch? (z.B. "kueche")
        if (deToEn[lower]) {
          translated = deToEn[lower]; // Übersetze zu "kitchen"
        }
      }

      // Prüfen, ob eine Änderung stattgefunden hat UND ob es nicht das gleiche Wort ist
      // (Wichtig: Verhindert Redirects, wenn deToEn['outlet'] == 'outlet')
      if (translated !== lower) {
        needsRedirect = true;
      }

      return translated;
    });

    // Wenn mindestens ein Segment falsch war -> 301 Redirect auslösen
    if (needsRedirect) {
      const newPath = "/" + translatedSegments.join("/") + "/";
      console.log(`[Middleware] Fixing URL: ${origPath} -> ${newPath}`);
      return Response.redirect(`${base}${newPath}`, 301);
    }
  }

  // ----------------------------
  // 5) Serve static assets directly
  // ----------------------------
  if (isAsset) {
    return assets.fetch(request);
  }

  // ----------------------------
  // 6) META map
  // ----------------------------
  const metaDataMap = {
    de: {
      "/": { title: "Ferienwohnung Parndorf – Ihr Zuhause am Neusiedler See", description: "Entdecken Sie ...", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/wohnzimmer/": { title: "Wohnzimmer – Ferienwohnung Parndorf", description: "Gemütliches Wohnzimmer ...", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/schlafzimmer/": { title: "Schlafzimmer – Ferienwohnung Parndorf", description: "Erholsamer Schlaf ...", image: `${baseDe}/assets/images/schlafzimmer.webp` },
      "/kueche/": { title: "Küche & Essbereich – Ferienwohnung Parndorf", description: "Voll ausgestattete Küche ...", image: `${baseDe}/assets/images/kueche.webp` },
      "/badezimmer/": { title: "Badezimmer – Ferienwohnung Parndorf", description: "Modernes Badezimmer ...", image: `${baseDe}/assets/images/badezimmer.webp` },
      "/terrasse/": { title: "Terrasse & Garten – Ferienwohnung Parndorf", description: "Entspannen Sie im Garten ...", image: `${baseDe}/assets/images/terrasse.webp` },
      "/eingangsbereich/": { title: "Eingangsbereich – Ferienwohnung Parndorf", description: "Herzlich willkommen! ...", image: `${baseDe}/assets/images/eingangsbereich.webp` },
      "/ausstattung/": { title: "Ausstattung – Ferienwohnung Parndorf", description: "Alle Details zur Ausstattung ...", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/anfahrt/": { title: "Anfahrt & Lage – Ferienwohnung Parndorf", description: "So finden Sie uns ...", image: `${baseDe}/assets/images/map.webp` },
      "/kontakt/": { title: "Kontakt – Ferienwohnung Parndorf", description: "Kontaktieren Sie uns ...", image: `${baseDe}/assets/images/kontakt.webp` },
      "/region/": { title: "Region Parndorf & Neusiedler See – Sehenswürdigkeiten & Aktivitäten", description: "Entdecken Sie die Region ...", image: `${baseDe}/assets/images/region.webp` },
      "/region/neusiedlersee/": { title: "Region Neusiedler See – Ausflugsziele & Aktivitäten", description: "Alles über den Neusiedler See ...", image: `${baseDe}/assets/images/region-neusiedlersee.jpg` },
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping & Lifestyle", description: "Nur 2 km vom Apartment ...", image: `${baseDe}/assets/images/outlet.webp` },
      "/terrasse/garten/": {
        title: "Terrasse & Garten – Ferienwohnung Parndorf",
        description: "Entspannen Sie im privaten Garten und auf der sonnigen Terrasse.",
        image: `${baseDe}/assets/images/garten.webp`
      }
    },
    en: {
      "/": { title: "Holiday Apartment Parndorf – Your Home at Lake Neusiedl", description: "Discover our cozy apartment ...", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/livingroom/": { title: "Living Room – Holiday Apartment Parndorf", description: "Cozy living room ...", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/bedroom/": { title: "Bedroom – Holiday Apartment Parndorf", description: "Relax and unwind ...", image: `${baseEn}/assets/images/schlafzimmer.webp` },
      "/kitchen/": { title: "Kitchen & Dining Area – Holiday Apartment Parndorf", description: "Fully equipped kitchen ...", image: `${baseEn}/assets/images/kueche.webp` },
      "/bathroom/": { title: "Bathroom – Holiday Apartment Parndorf", description: "Modern bathroom ...", image: `${baseEn}/assets/images/badezimmer.webp` },
      "/terrace/": { title: "Terrace & Garden – Holiday Apartment Parndorf", description: "Enjoy breakfast ...", image: `${baseEn}/assets/images/terrasse.webp` },
      "/entrance/": { title: "Entrance – Holiday Apartment Parndorf", description: "Welcome area ...", image: `${baseEn}/assets/images/eingangsbereich.webp` },
      "/facilities/": { title: "Facilities – Holiday Apartment Parndorf", description: "All apartment amenities ...", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/directions/": { title: "Directions & Location – Holiday Apartment Parndorf", description: "Find us easily ...", image: `${baseEn}/assets/images/map.webp` },
      "/contact/": { title: "Contact – Holiday Apartment Parndorf", description: "Contact us for booking ...", image: `${baseEn}/assets/images/kontakt.webp` },
      "/region/": { title: "Region Parndorf & Lake Neusiedl – Sights & Activities", description: "Discover the Parndorf region ...", image: `${baseEn}/assets/images/region.webp` },
      "/region/neusiedlersee/": { title: "Lake Neusiedl Region – Sights & Activities", description: "All about Lake Neusiedl ...", image: `${baseEn}/assets/images/region-neusiedlersee.jpg` },
      "/terrace/garden/": {
        title: "Terrace & Garden – Holiday Apartment Parndorf",
        description: "Relax in the private garden and on the sunny terrace.",
        image: `${baseEn}/assets/images/garten.webp`
      },
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping & Lifestyle", description: "Just 2 km away ...", image: `${baseEn}/assets/images/outlet.webp` }
    }
  };

  // ----------------------------
  // 7) Auto fallback meta
  // ----------------------------
  function getAutoMeta(p, lang) {
    if (p === "/") {
      return metaDataMap[lang]["/"];
    }
    const clean = p.replace(/^\/|\/$/g, "");
    const parts = clean.split("/");
    const titleParts = parts.map(s => s.charAt(0).toUpperCase() + s.slice(1));
    const title = (lang === "de" ? `${titleParts.join(" – ")} – Ferienwohnung Parndorf` : `${titleParts.join(" – ")} – Holiday Apartment Parndorf`);
    const desc = (lang === "de" ? `Informationen zur Seite ${titleParts.join(" – ")}.` : `Information about ${titleParts.join(" – ")}.`);
    const img = (lang === "de" ? `${baseDe}/assets/images/wohnzimmer.webp` : `${baseEn}/assets/images/wohnzimmer.webp`);
    return { title, description: desc, image: img };
  }

  const meta = metaDataMap[lang][path] || getAutoMeta(path, lang);

  // ----------------------------
  // 8) Bot prerendering
  // ----------------------------
  if (isBot && isHtmlNav) {
    const unifiedJsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "url": base + path,
        "name": meta.title,
        "description": meta.description,
        "primaryImageOfPage": { "@type": "ImageObject", "url": meta.image }
      },
      {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "name": "Ferienwohnung Parndorf",
        "description": meta.description,
        "url": base + "/",
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
  <link rel="canonical" href="${base + path}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:url" content="${base + path}">
  <meta property="og:image" content="${meta.image}">
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

  // ----------------------------
  // 9) SPA fallback for real visitors
  // ----------------------------
  try {
    if (hostname.startsWith("de.")) {
      return await assets.fetch(new URL("/de/index.html", request.url));
    }
    if (hostname.startsWith("en.")) {
      return await assets.fetch(new URL("/en/index.html", request.url));
    }
    return await assets.fetch(new URL("/index.html", request.url));
  } catch (err) {
    return new Response("Not found", { status: 404 });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }
}