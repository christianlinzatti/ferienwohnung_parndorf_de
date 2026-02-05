// _middleware.js - Komplettlösung für Redirects, SEO & Sprach-Schutz

// --- 1. HILFSFUNKTIONEN ---

function normalizePath(p) {
  if (!p || p === "/") return "/";
  let s = p.toLowerCase();
  try { s = decodeURIComponent(s); } catch (e) {}
  if (!s.startsWith("/")) s = "/" + s;
  
  // WICHTIG: Dateien (jpg, webp, css etc.) dürfen KEINEN Slash am Ende bekommen!
  const isFile = /\.[a-z0-9]{2,4}$/.test(s);
  if (!s.endsWith("/") && !isFile) s = s + "/";
  
  return s;
}

function escapeHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function translatePath(path, fromLang, toLang, deToEn, enToDe) {
  if (path === "/") return "/";
  const segments = path.replace(/^\/|\/$/g, "").split('/').filter(Boolean);
  let map = (fromLang === "de") ? deToEn : enToDe;
  const newSegments = segments.map(seg => map[seg] || seg);
  return "/" + newSegments.join("/") + "/";
}

function generateBreadcrumbSchema(currentPath, currentLang, currentBase, map) {
  if (currentPath === "/" || currentPath === "") return null;
  const segments = currentPath.replace(/^\/|\/$/g, "").split('/').filter(Boolean);
  const itemListElement = [];
  
  // Fix: Sicherstellen, dass Basis-URL sauber mit Slash beginnt
  let url = currentBase.endsWith('/') ? currentBase : currentBase + '/';

  // Startseite
  const homeMeta = map["/"] || {};
  itemListElement.push({
    "@type": "ListItem",
    "position": 1,
    "name": homeMeta.breadcrumbName || (currentLang === "de" ? "Startseite" : "Home"),
    "item": url
  });

  // Unterseiten
  segments.forEach((segment, index) => {
    url += `${segment}/`;
    const pathKey = normalizePath(url.replace(currentBase, ""));
    const segmentMeta = map[pathKey] || {};
    const breadcrumbName = segmentMeta.breadcrumbName || (segment.charAt(0).toUpperCase() + segment.slice(1));

    itemListElement.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": breadcrumbName,
      "item": url
    });
  });

  return { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": itemListElement };
}

// --- 2. ON REQUEST START ---

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const ua = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  const isHtmlNav = accept.includes("text/html");
  const assets = env.ASSETS;

  const baseDe = "https://de.ferienwohnung-parndorf.at";
  const baseEn = "https://en.ferienwohnung-parndorf.at";

  // --- A. STATISCHE DATEIEN (Wichtig: Vor den Redirects abfangen!) ---
  const isAsset = url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|txt|json|xml|pdf|webmanifest|woff2?)$/i);
  if (isAsset || url.pathname.startsWith("/assets/")) {
    return assets.fetch(request);
  }

  // --- B. SEO-NORMALISIERUNG ---
  const path = normalizePath(url.pathname);
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const currentBase = lang === "de" ? baseDe : baseEn;

  // Umleitung bei falschem Pfad-Format (z.B. fehlender Slash am Ende)
  if (url.pathname !== path) {
    return Response.redirect(`${url.protocol}//${url.host}${path}`, 301);
  }

  // --- C. DICTIONARIES ---
  const deToEn = { "wohnzimmer": "livingroom", "schlafzimmer": "bedroom", "kueche": "kitchen", "badezimmer": "bathroom", "terrasse": "terrace", "eingangsbereich": "entrance", "ausstattung": "facilities", "anfahrt": "directions", "kontakt": "contact", "region": "region", "neusiedlersee": "neusiedlersee", "outlet": "outlet" };
  const enToDe = { "livingroom": "wohnzimmer", "bedroom": "schlafzimmer", "kitchen": "kueche", "bathroom": "badezimmer", "terrace": "terrasse", "entrance": "eingangsbereich", "facilities": "ausstattung", "directions": "anfahrt", "contact": "kontakt", "region": "region", "neusiedlersee": "neusiedlersee", "outlet": "outlet" };

 const metaDataMap = {

    de: {

      "/": { title: "Ferienwohnung Parndorf – Ihr Zuhause am Neusiedler See", description: "Entdecken Sie unsere komfortable Ferienwohnung in Parndorf – ideal gelegen zwischen Outlet und Neusiedler See.", image: `${baseDe}/assets/images/wohnzimmer.webp` },

      "/wohnzimmer/": { title: "Wohnzimmer – Ferienwohnung Parndorf", description: "Gemütliches Wohnzimmer mit bequemer Couch.", image: `${baseDe}/assets/images/wohnzimmer.webp` },

      "/schlafzimmer/": { title: "Schlafzimmer – Ferienwohnung Parndorf", description: "Erholsamer Schlaf in stilvollem Ambiente.", image: `${baseDe}/assets/images/schlafzimmer.webp` },

      "/kueche/": { title: "Küche & Essbereich – Ferienwohnung Parndorf", description: "Voll ausgestattete Küche für gemütliche Mahlzeiten.", image: `${baseDe}/assets/images/kueche.webp` },

      "/badezimmer/": { title: "Badezimmer – Ferienwohnung Parndorf", description: "Modernes Badezimmer mit Dusche und WC.", image: `${baseDe}/assets/images/badezimmer.webp` },

      "/terrasse/": { title: "Terrasse & Garten – Ferienwohnung Parndorf", description: "Entspannen Sie im Garten oder auf der sonnigen Terrasse.", image: `${baseDe}/assets/images/terrasse.webp` },

      "/eingangsbereich/": { title: "Eingangsbereich – Ferienwohnung Parndorf", description: "Herzlich willkommen in Parndorf.", image: `${baseDe}/assets/images/eingangsbereich.webp` },

      "/ausstattung/": { title: "Ausstattung – Ferienwohnung Parndorf", description: "Details: WLAN, Küche, Terrasse, Parkplatz.", image: `${baseDe}/assets/images/wohnzimmer.webp` },

      "/anfahrt/": { title: "Anfahrt & Lage – Ferienwohnung Parndorf", description: "Zentrale Lage zwischen See und Outlet.", image: `${baseDe}/assets/images/map.webp` },

      "/kontakt/": { title: "Kontakt – Ferienwohnung Parndorf", description: "Kontaktieren Sie uns für Buchungen.", image: `${baseDe}/assets/images/kontakt.webp` },

      "/region/": { title: "Region Parndorf – Entdecken Sie das Burgenland", description: "Region rund um den Neusiedler See.", image: `${baseDe}/assets/images/region.webp` },

      "/region/neusiedlersee/": { title: "Region Neusiedler See – Ausflugsziele", description: "Tipps für den Neusiedler See.", image: `${baseDe}/assets/images/region-neusiedlersee.jpg` },

      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping", description: "Nur 2 km vom Apartment entfernt.", image: `${baseDe}/assets/images/outlet.webp` }

    },

    en: {

      "/": { title: "Holiday Apartment Parndorf – Lake Neusiedl", description: "Discover our cozy apartment in Parndorf.", image: `${baseEn}/assets/images/wohnzimmer.webp` },

      "/livingroom/": { title: "Living Room – Holiday Apartment Parndorf", description: "Cozy living room with a comfortable couch.", image: `${baseEn}/assets/images/wohnzimmer.webp` },

      "/bedroom/": { title: "Bedroom – Holiday Apartment Parndorf", description: "Relax and unwind in our stylish bedroom.", image: `${baseEn}/assets/images/schlafzimmer.webp` },

      "/kitchen/": { title: "Kitchen & Dining – Holiday Apartment Parndorf", description: "Fully equipped kitchen for your stay.", image: `${baseEn}/assets/images/kueche.webp` },

      "/bathroom/": { title: "Bathroom – Holiday Apartment Parndorf", description: "Modern bathroom with shower.", image: `${baseEn}/assets/images/badezimmer.webp` },

      "/terrace/": { title: "Terrace & Garden – Holiday Apartment Parndorf", description: "Enjoy the sunny terrace or the garden.", image: `${baseEn}/assets/images/terrasse.webp` },

      "/entrance/": { title: "Entrance – Holiday Apartment Parndorf", description: "Welcome to your home away from home.", image: `${baseEn}/assets/images/eingangsbereich.webp` },

      "/facilities/": { title: "Facilities – Holiday Apartment Parndorf", description: "Amenities: WiFi, kitchen, terrace, parking.", image: `${baseEn}/assets/images/wohnzimmer.webp` },

      "/directions/": { title: "Directions – Holiday Apartment Parndorf", description: "Easy to find between Lake Neusiedl and Outlet.", image: `${baseEn}/assets/images/map.webp` },

      "/contact/": { title: "Contact – Holiday Apartment Parndorf", description: "Get in touch for bookings.", image: `${baseEn}/assets/images/kontakt.webp` },

      "/region/": { title: "Parndorf Region – Discover Burgenland", description: "Explore the Lake Neusiedl region.", image: `${baseEn}/assets/images/region.webp` },

      "/region/neusiedlersee/": { title: "Lake Neusiedl – Sights & Activities", description: "Best travel tips for Lake Neusiedl.", image: `${baseEn}/assets/images/region-neusiedlersee.jpg` },

      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping", description: "Just 2 km from the apartment.", image: `${baseEn}/assets/images/outlet.webp` }

    }

  };



  // --- D. WWW- & SPRACH-REDIRECTS ---
  if (hostname.startsWith("www.")) {
    return Response.redirect(`https://${hostname.replace(/^www\./, "")}${path}`, 301);
  }

  if (isHtmlNav && path !== "/") {
    const segments = path.replace(/^\/|\/$/g, "").split('/').filter(Boolean);
    let needsLangRedirect = false;

    const correctedSegments = segments.map(seg => {
      const lower = seg.toLowerCase();
      if (lang === "en" && enToDe[lower]) { needsLangRedirect = true; return lower === "terrasse" ? "terrace" : (Object.keys(deToEn).find(k => deToEn[k] === lower) || lower); }
      if (lang === "de" && deToEn[lower]) { needsLangRedirect = true; return enToDe[lower] || lower; }
      if (lang === "en" && lower === "terrasse") { needsLangRedirect = true; return "terrace"; }
      if (lang === "de" && lower === "terrace") { needsLangRedirect = true; return "terrasse"; }
      return lower;
    });

    if (needsLangRedirect) {
      return Response.redirect(`${currentBase}/${correctedSegments.join("/")}/`, 301);
    }
  }

  // --- E. BOT RESPONSE (SEO OPTIMIERUNG) ---
  const isBot = /(googlebot|bingbot|yandex|duckduckbot|facebookexternalhit|twitterbot)/i.test(ua);
  if (isBot && isHtmlNav) {
    const meta = metaDataMap[lang][path] || { title: "Ferienwohnung Parndorf", description: "Apartment nähe Outlet", image: `${currentBase}/assets/images/wohnzimmer.webp` };
    const breadcrumbSchema = generateBreadcrumbSchema(path, lang, currentBase, metaDataMap[lang]);
    
    const jsonLd = [
      { "@context": "https://schema.org", "@type": "WebPage", "url": currentBase + path, "name": meta.title, "description": meta.description, "primaryImageOfPage": { "@type": "ImageObject", "url": meta.image } }
    ];
    if (breadcrumbSchema) jsonLd.push(breadcrumbSchema);

    const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <meta name="robots" content="max-image-preview:large">
  <link rel="canonical" href="${currentBase + path}">
  <link rel="alternate" hreflang="de" href="${baseDe + translatePath(path, lang, "de", deToEn, enToDe)}">
  <link rel="alternate" hreflang="en" href="${baseEn + translatePath(path, lang, "en", deToEn, enToDe)}">
  <meta property="og:image" content="${meta.image}">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body><main><h1>${escapeHtml(meta.title)}</h1><p>${escapeHtml(meta.description)}</p></main></body></html>`;

    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // --- F. SPA FALLBACK ---
  try {
    const fetchUrl = hostname.startsWith("en.") ? "/en/index.html" : "/de/index.html";
    let response = await assets.fetch(new URL(fetchUrl, request.url));
    if (response.status === 404) response = await assets.fetch(new URL("/index.html", request.url));
    return response;
  } catch (err) {
    return new Response("Not found", { status: 404 });
  }
}
