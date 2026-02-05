// _middleware.js - Redirects, Meta-Daten, SEO & Sprach-Schutz

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

function translatePath(path, fromLang, toLang, deToEn, enToDe) {
    if (path === "/") return "/";
    const segments = path.replace(/^\/|\/$/g, "").split('/');
    let map = (fromLang === "de") ? deToEn : enToDe;
    const newSegments = segments.map(seg => map[seg] || seg);
    return "/" + newSegments.join("/") + "/";
}

// --- ON REQUEST START ---

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const accept = request.headers.get("accept") || "";
  const ua = request.headers.get("user-agent") || "";
  const isHtmlNav = accept.includes("text/html");
  const assets = env.ASSETS;

  const baseDe = "https://de.ferienwohnung-parndorf.at";
  const baseEn = "https://en.ferienwohnung-parndorf.at";

  // 1. STATISCHE DATEIEN (Sitemap, Robots, Bilder)
  const isAsset = url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|txt|json|xml|pdf|webmanifest|woff2?)$/i);
  if (isAsset || url.pathname.startsWith("/assets/")) {
    return assets.fetch(request);
  }

  // 2. SEO-PFAD NORMALISIERUNG
  const path = normalizePath(url.pathname);
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const currentBase = lang === "de" ? baseDe : baseEn;

  // 3. DICTIONARIES (Wichtig für Sprach-Validierung)
  const deToEn = { "wohnzimmer": "livingroom", "schlafzimmer": "bedroom", "kueche": "kitchen", "badezimmer": "bathroom", "terrasse": "terrace", "eingangsbereich": "entrance", "ausstattung": "facilities", "anfahrt": "directions", "kontakt": "contact", "region": "region", "neusiedlersee": "neusiedlersee", "outlet": "outlet" };
  const enToDe = { "livingroom": "wohnzimmer", "bedroom": "schlafzimmer", "kitchen": "kueche", "bathroom": "badezimmer", "terrace": "terrasse", "entrance": "eingangsbereich", "facilities": "ausstattung", "directions": "anfahrt", "contact": "kontakt", "region": "region", "neusiedlersee": "neusiedlersee", "outlet": "outlet" };

  const metaDataMap = {
    de: { "/": { title: "Startseite", description: "Ferienwohnung Parndorf" }, "/terrasse/": { title: "Terrasse", description: "Unser Außenbereich" } },
    en: { "/": { title: "Home", description: "Apartment Parndorf" }, "/terrace/": { title: "Terrace", description: "Our terrace" } }
  };

  // 4. REDIRECT & SPRACH-SCHUTZ LOGIK
  if (hostname.startsWith("www.")) {
    return Response.redirect(`https://${hostname.replace(/^www\./, "")}${path}`, 301);
  }

  if (path !== "/") {
    const segments = path.replace(/^\/|\/$/g, "").split('/').filter(Boolean);
    let needsRedirect = false;

    // Prüfen, ob deutsche Begriffe auf EN-Domain (oder umgekehrt) genutzt werden
    const correctedSegments = segments.map(seg => {
      const lower = seg.toLowerCase();
      if (lang === "en" && enToDe[lower]) { // Begriff ist eigentlich DE, wir sind auf EN
          needsRedirect = true;
          // Suche das englische Gegenstück in deToEn (umgekehrte Suche)
          return Object.keys(deToEn).find(key => deToEn[key] === lower) || deToEn[lower] || lower;
      }
      if (lang === "de" && deToEn[lower]) { // Begriff ist eigentlich EN, wir sind auf DE
          needsRedirect = true;
          return enToDe[lower] || lower;
      }
      // Spezialfall: terrace (en) vs terrasse (de)
      if (lang === "en" && lower === "terrasse") { needsRedirect = true; return "terrace"; }
      if (lang === "de" && lower === "terrace") { needsRedirect = true; return "terrasse"; }
      
      return lower;
    });

    if (needsRedirect) {
      return Response.redirect(`${currentBase}/${correctedSegments.join("/")}/`, 301);
    }

    // Redundante Segmente (z.B. /kueche/kueche/)
    if (segments.length >= 2 && segments[segments.length - 1] === segments[segments.length - 2]) {
        return Response.redirect(`${currentBase}/${segments.slice(0, -1).join("/")}/`, 301);
    }
  }

  // 5. BOT RESPONSE
  const isBot = /(googlebot|bingbot|yandex|duckduckbot|facebookexternalhit|twitterbot)/i.test(ua);
  
  if (isBot && isHtmlNav) {
    const isKnownPath = metaDataMap[lang][path];
    // Wenn der Pfad für diese Sprache nicht explizit bekannt ist (z.B. Unterseite), 
    // aber die Hauptseite existiert, erlauben wir es, geben aber evtl. noindex falls gewünscht.
    
    const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <title>Ferienwohnung Parndorf</title>
  ${!isKnownPath && path.split('/').length > 3 ? '<meta name="robots" content="noindex, follow">' : ''}
  <link rel="canonical" href="${currentBase + path}">
  <link rel="alternate" hreflang="de" href="${baseDe + translatePath(path, lang, "de", deToEn, enToDe)}">
  <link rel="alternate" hreflang="en" href="${baseEn + translatePath(path, lang, "en", deToEn, enToDe)}">
</head>
<body><main>Pfad: ${path}</main></body></html>`;

    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // 6. SPA FALLBACK
  try {
    const fetchUrl = hostname.startsWith("en.") ? "/en/index.html" : "/de/index.html";
    let response = await assets.fetch(new URL(fetchUrl, request.url));
    if (response.status === 404) response = await assets.fetch(new URL("/index.html", request.url));
    return response;
  } catch (err) {
    return new Response("Not found", { status: 404 });
  }
}
