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

  // Debug 2 wird entfernt, da env.ASSETS.fetch eine Exception wirft.

  // 1) Normalisiere: wenn kein Dateiname und kein Slash -> Slash anfügen
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // 2) Bot-Erkennung
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou)/i.test(ua);

  // Helper: sichere Asset-Fetches (Beibehalten, aber wird in der Hauptlogik vermieden)
  async function safeFetchAsset(path) {
    if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      console.error("safeFetchAsset: ASSETS binding missing");
      return null;
    }
    try {
      const resp = await env.ASSETS.fetch(path);
      // Wir suchen nach der Datei selbst, 404 bedeutet, sie existiert nicht.
      if (resp && resp.status !== 404) return resp;
      return null;
    } catch (err) {
      // WICHTIG: Die Exception ist das Problem. Wir fangen sie, aber vermeiden den Aufruf später.
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
      return Response.redirect(`https://${target}${url.pathname}`, 302);
    }
    // Bots oder nicht-Navigation-Requests gehen an next() und Pages serviert Root-Inhalt
    return next();
  }

  // 4) Handler für Subdomains (Rewrite-Strategie für SPA)
  async function handleLangSubdomain(lang) {
    const prefix = `/${lang}`;

    // WICHTIG: Assets (JS/CSS/Bilder) übergeben wir IMMER an Pages.
    // Sie müssen ohne Prefix geladen werden (z.B. /app.js).
    if (!isNavigation) {
      return next();
    }

    // Für Navigationsanfragen (SPA-Routing):
    // Da wir die ASSETS-Exception haben, können wir die Datei nicht direkt laden.
    // Wir nutzen das Pages-interne Rewrite, um den korrekten Pfad zu erzwingen.

    // 1. Ziel-Pfad der SPA-Index-Datei definieren: /de/index.html
    const spaIndexFile = `${prefix}/index.html`;

    // 2. Erstelle eine URL, die nur auf die Index-Datei zeigt, unabhängig vom aktuellen Pfad.
    const rewriteUrl = new URL(request.url);

    // WICHTIG: Pages' SPA-Logik benötigt den Ordner-Pfad, um korrekt zu routen.
    // Wir müssen den Pfad zu /de/ (oder /en/) umschreiben, damit Pages das /de/index.html findet.
    // Jede Navigationsanfrage auf der Subdomain MUSS auf /lang/index.html umschreiben,
    // aber wir probieren zuerst den reinen Ordner-Rewrite.

    // Rewrite auf /de/ oder /en/ (der Ordner, der die index.html enthält)
    rewriteUrl.pathname = prefix + "/"; // Beispiel: /de/

    // Erstelle eine neue Anfrage mit dem umgeschriebenen Pfad.
    // Dies sollte Pages zwingen, den SPA-Fallback für den /de/ Ordner zu triggern.
    const modifiedRequest = new Request(rewriteUrl.toString(), request);

    // Übergib die modifizierte Anfrage an den nächsten Handler (Cloudflare Pages).
    // Pages sieht die Anfrage als "de.host/de/" und serviert /de/index.html (SPA Fallback).
    return next(modifiedRequest);
  }

  // Hier wird die Logik angewendet:
  if (host.startsWith("de.")) {
    return handleLangSubdomain("de");
  }
  if (host.startsWith("en.")) {
    return handleLangSubdomain("en");
  }

  // Fallback
  return next();
}