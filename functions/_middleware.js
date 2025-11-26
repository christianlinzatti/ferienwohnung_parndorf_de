// _middleware.js (korrigiert, loopfrei, prerender für Bots)

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

  // Bot detection (simple but practical)
  const isBot = /(googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|preview|embed)/i
    .test(ua);

  // normalize path to ensure leading + trailing slash style used in meta map
  function normalizePathForMap(p) {
    if (!p || p === "/") return "/";
    let s = p.toLowerCase();
    if (!s.startsWith("/")) s = "/" + s;
    if (!s.endsWith("/")) s = s + "/";
    return s;
  }
  const path = normalizePathForMap(origPath);

  // ----------------------------
  // 1) WWW -> non-www (SEO)
  // ----------------------------
  if (hostname.startsWith("www.")) {
    // Directly point canonical host (we prefer the language subdomain)
    if (hostname === "www.ferienwohnung-parndorf.at") {
      return Response.redirect(`${baseDe}${path}`, 301);
    }
    const bare = hostname.replace(/^www\./, "");
    return Response.redirect(`https://${bare}${path}`, 301);
  }

  // ----------------------------
  // 2) Root domain -> redirect to de. (single deterministic redirect)
  // ----------------------------
  if (hostname === "ferienwohnung-parndorf.at") {
    // Only redirect real navigations (not assets/json/xml/etc.)
    if (isHtmlNav) {
      return Response.redirect(`${baseDe}${path}`, 301);
    }
    // Non navigation requests (robots/sitemap) - serve from assets root if present
    // Try to serve /index.html from assets to be safe
    try {
      return await assets.fetch(new URL("/index.html", request.url));
    } catch (e) {
      return new Response("Not found", { status: 404 });
    }
  }

  // ----------------------------
  // 3) Slug translation tables (global for usage below)
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
    outlet: "outlet"
  };
  const enToDe = Object.fromEntries(Object.entries(deToEn).map(([k, v]) => [v, k]));

  // language detection from subdomain
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const base = lang === "de" ? baseDe : baseEn;
  const otherBase = lang === "de" ? baseEn : baseDe;

  // first path segment (without slashes)
  const firstSeg = path.replace(/^\/|\/$/g, "").split("/")[0] || "";

  // ----------------------------
  // 4) Wrong-language slug redirects (301)
  //    de.* domain seeing english slug -> redirect to de slug
  //    en.* domain seeing german slug  -> redirect to en slug
  // ----------------------------
  if (lang === "de" && enToDe[firstSeg]) {
    const rest = path.replace(/^\/|\/$/g, "").split("/").slice(1).join("/");
    const newPath = "/" + enToDe[firstSeg] + (rest ? "/" + rest + "/" : "/");
    return Response.redirect(`${baseDe}${newPath}`, 301);
  }
  if (lang === "en" && deToEn[firstSeg]) {
    const rest = path.replace(/^\/|\/$/g, "").split("/").slice(1).join("/");
    const newPath = "/" + deToEn[firstSeg] + (rest ? "/" + rest + "/" : "/");
    return Response.redirect(`${baseEn}${newPath}`, 301);
  }

  // ----------------------------
  // 5) Serve static assets directly (no redirects, no prerender)
  // ----------------------------
  if (path.startsWith("/assets/") || path.match(/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|txt|json|xml|pdf|webmanifest|woff2?)$/i)) {
    return assets.fetch(request);
  }

  // ----------------------------
  // 6) META map (with trailing slashes) - your full map (abridged here; use your full map)
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
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping & Lifestyle", description: "Nur 2 km vom Apartment ...", image: `${baseDe}/assets/images/outlet.webp` }
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
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping & Lifestyle", description: "Just 2 km away ...", image: `${baseEn}/assets/images/outlet.webp` }
    }
  };

  // ----------------------------
  // 7) Auto fallback meta if not in map
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
  // 8) Bot prerendering: produce fully rendered HTML
  // ----------------------------
  if (isBot && isHtmlNav) {
    // local helper to translate path for alternate
    function translateFirstSegmentForOtherLang(p, fromLang) {
      if (!p || p === "/") return "/";
      const seg = p.replace(/^\/|\/$/g, "").split("/")[0];
      if (fromLang === "de") return "/" + (deToEn[seg] || seg) + "/";
      return "/" + (enToDe[seg] || seg) + "/";
    }

    const otherLangPath = translateFirstSegmentForOtherLang(path, lang);
    const alternateDe = `${baseDe}${lang === "de" ? path : otherLangPath}`;
    const alternateEn = `${baseEn}${lang === "en" ? path : otherLangPath}`;

    // build simple JSON-LD (WebPage + Breadcrumb + LodgingBusiness)
    const breadcrumbParts = path === "/" ? [] : path.replace(/^\/|\/$/g, "").split("/");
    const breadcrumbList = [
      { "@type": "ListItem", position: 1, name: (lang === "en" ? "Home" : "Startseite"), item: base + "/" }
    ];
    breadcrumbParts.forEach((seg, i) => {
      breadcrumbList.push({
        "@type": "ListItem",
        position: i + 2,
        name: seg.charAt(0).toUpperCase() + seg.slice(1),
        item: base + "/" + breadcrumbParts.slice(0, i + 1).join("/") + "/"
      });
    });

    const unifiedJsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "url": base + path,
        "name": meta.title,
        "description": meta.description,
        "primaryImageOfPage": { "@type": "ImageObject", "url": meta.image }
      },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbList },
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
        "geo": { "@type": "GeoCoordinates", "latitude": 48.0007115, "longitude": 16.8640465 },
        "sameAs": ["https://www.booking.com/hotel/at/ferienwohnung-parndorf.de.html", "https://www.airbnb.at/rooms/24131580"]
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
  <link rel="alternate" hreflang="de" href="${alternateDe}">
  <link rel="alternate" hreflang="en" href="${alternateEn}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:url" content="${base + path}">
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
    <figure><img src="${meta.image}" alt="${escapeHtml(meta.title)}" style="max-width:100%;height:auto"></figure>
  </main>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
        "x-prerendered": "1"
      }
    });
  }

  // ----------------------------
  // 9) SPA fallback for real visitors (NO external absolute fetch — use ASSETS.fetch with path)
  //    Serve the right index.html for the subdomain without causing the worker to re-enter.
  // ----------------------------
  try {
    if (hostname.startsWith("de.")) {
      return await assets.fetch(new URL("/de/index.html", request.url));
    }
    if (hostname.startsWith("en.")) {
      return await assets.fetch(new URL("/en/index.html", request.url));
    }
    // fallback: serve root index
    return await assets.fetch(new URL("/index.html", request.url));
  } catch (err) {
    // if asset missing, return a small friendly error rather than redirecting
    return new Response("Not found", { status: 404 });
  }

  // helper escape
  function escapeHtml(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }
}
