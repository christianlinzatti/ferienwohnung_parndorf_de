// functions/_middleware.js
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const host = (url.hostname || "").toLowerCase();
  const ua = request.headers.get("user-agent") || "";
  const langHeader = (request.headers.get("accept-language") || "").toLowerCase();
  const accept = request.headers.get("accept") || "";
  const isNavigation = accept.includes("text/html") || request.headers.get("sec-fetch-mode") === "navigate";

  // DEBUG endpoint: /?debug=1 -> zeigt Host, Path, env.ASSETS-Status (temporär beim Testen)
  if (url.searchParams.get("debug") === "1") {
    return new Response(JSON.stringify({
      host, pathname: url.pathname, isNavigation,
      hasASSETS: !!(env && env.ASSETS && typeof env.ASSETS.fetch === "function")
    }, null, 2), { headers: { "Content-Type": "application/json" }});
  }

if (url.searchParams.get("debug") === "2") {
  let r1Status = "error", r2Status = "error";
  try {
    const r1 = await env.ASSETS.fetch("/de/index.html");
    r1Status = r1 ? r1.status : "null";
  } catch (e) {
    r1Status = "exception";
  }
  try {
    const r2 = await env.ASSETS.fetch("/index.html");
    r2Status = r2 ? r2.status : "null";
  } catch (e) {
    r2Status = "exception";
  }
  return new Response(JSON.stringify({ deIndex: r1Status, rootIndex: r2Status }, null, 2),
    { headers: { "content-type": "application/json" } });
}

  // 1) Normalisiere: wenn kein Dateiname und kein Slash -> Slash anfügen
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // 2) Bot-Erkennung
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou)/i.test(ua);

  // Helper: sichere Asset-Fetches (fängt Fehler)
  async function safeFetchAsset(path) {
    if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      console.error("safeFetchAsset: ASSETS binding missing");
      return null;
    }
    try {
      const resp = await env.ASSETS.fetch(path);
      if (resp && resp.status !== 404) return resp;
      return null;
    } catch (err) {
      console.error("safeFetchAsset: env.ASSETS.fetch failed for", path, err);
      return null;
    }
  }

  // Robustes Parsing des bevorzugten Spracheintrags
    const primaryLang = (langHeader.split(",")[0] || "").split(";")[0].trim().split("-")[0];

  // 3) Root domain -> redirect je nach Browser-Sprache (Bots bleiben auf Root)
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const target = primaryLang === "de" ? "de.ferienwohnung-parndorf.at" : "en.ferienwohnung-parndorf.at";
      // Verwende 302 für Sprache, damit Browser die Sprache bei Änderungen neu prüfen
      return Response.redirect(`https://${target}${url.pathname}`, 302);
    }
    // Bots oder nicht-Navigation-Requests gehen an next() und Pages serviert Root-Inhalt
    return next();
  }

  // 4) Handler für Subdomains (Minimalistisches SPA-Fallback)
  async function handleLangSubdomain(lang) {
    if (!isNavigation) {
      // WICHTIG: Assets (JS/CSS/Bilder) übergeben wir IMMER an Cloudflare Pages.
      // Pages ist besser darin, Pfade aufzulösen (z.B. /bild.jpg oder /de/bild.jpg).
      return next();
    }

    // Für Navigationsanfragen (SPA-Routing):

    // Die physische Datei, die immer geladen werden muss (unabhängig von der URL).
    const spaIndexFile = `/${lang}/index.html`;

    // Teste den Asset-Fetch nur für die Index-Datei.
    const resp = await safeFetchAsset(spaIndexFile);

    if (resp) {
      // Wenn gefunden, liefere die Index-Datei aus.
      return resp;
    }

    // Fallback: Sollte nur bei Fehlkonfiguration des ASSETS Bindings eintreten.
    console.error(`SPA Index ${spaIndexFile} konnte nicht geladen werden.`)
    return next();
  }

  // Hier wird die Logik angewendet:
  if (host.startsWith("de.")) {
    // Erzwinge /de/index.html für alle Routen auf der de. Subdomain
    return handleLangSubdomain("de");
  }
  if (host.startsWith("en.")) {
    // Erzwinge /en/index.html für alle Routen auf der en. Subdomain
    return handleLangSubdomain("en");
  }

  // Fallback
  return next();
}

async function handleLangSubdomain(lang) {
    const prefix = `/${lang}`;

    // 1. Wenn es KEINE Navigations-Anfrage ist (d.h. es ist ein Asset-Request: css, js, image),
    // soll Pages den Asset-Fetch standardmäßig durchführen.
    if (!isNavigation) {
        // VERSUCHE den Asset-Fetch mit Prefix.
        // Beispiel: Request für de.host/app.js -> /de/app.js
        const assetResp = await safeFetchAsset(`${prefix}${url.pathname}`);
        if (assetResp) return assetResp;

        // Wenn das Asset mit Prefix nicht existiert, gehe zum Pages-Handler (z.B. für globale Assets /app.js)
        return next();
    }

    // 2. Navigations-Anfrage (text/html): Dies ist die eigentliche SPA-Route.
    // Wir müssen IMMER die Haupt-Index-Datei der entsprechenden Sprache laden.

    // Das ist die tatsächliche physische Datei im Deployment.
    const spaIndexFile = `${prefix}/index.html`;

    const resp = await safeFetchAsset(spaIndexFile);

    if (resp) {
      // WICHTIG: Pages serviert die SPA-Datei und das JavaScript übernimmt das Routing
      return resp;
    }

    // Fallback: Wenn ASSETS.fetch fehlschlägt (sollte bei korrekter Struktur nicht passieren),
    // dann übergebe an Cloudflare Pages' Standard-Handler (liefert wahrscheinlich /index.html oder 404).
    return next();
  }

  if (host.startsWith("de.")) return handleLangSubdomain("de");
  if (host.startsWith("en.")) return handleLangSubdomain("en");

  // Fallback
  return next();
}
