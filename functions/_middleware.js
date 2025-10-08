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

 // NEUER Debug 2 (Nur zum Testen)
if (url.searchParams.get("debug") === "2") {
    const internalUrl = new URL(request.url);
    internalUrl.hostname = host.replace("de.", "").replace("en.", ""); // Stelle sicher, dass du die Root-URL verwendest

    let r1Status = "error";
    internalUrl.pathname = "/de/index.html";
    try {
        const r1 = await fetch(internalUrl.toString());
        r1Status = r1.status;
    } catch (e) {
        r1Status = "exception_fetch";
    }
    return new Response(JSON.stringify({ deIndexFetch: r1Status }, null, 2),
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
    const prefix = `/${lang}`;

    // WICHTIG: Assets (JS/CSS/Bilder) übergeben wir IMMER an Cloudflare Pages.
    // Sie sollen ohne Prefix geladen werden (z.B. /app.js).
    if (!isNavigation) {
      return next();
    }

    // 1. Ziel-Pfad der SPA-Index-Datei definieren.
    const spaIndexFile = `${prefix}/index.html`;

    // 2. Interne URL für den Fetch erstellen: Nutze den eigenen Host und den korrigierten Pfad.
    // Beispiel: https://de.ferienwohnung-parndorf.at/de/index.html
    // WICHTIG: Hier verwenden wir NICHT env.ASSETS, sondern den globalen fetch.
    const internalUrl = new URL(request.url);
    internalUrl.pathname = spaIndexFile;

    try {
      // 3. Datei intern fetchen. Dies sollte die Asset-Exception umgehen.
      const resp = await fetch(internalUrl.toString(), {
        // Option, um interne Anfragen an den Pages Origin zu senden.
        // Das kann notwendig sein, um Caching oder interne Regeln zu umgehen.
        cf: { host: url.hostname }
      });

      if (resp.ok || resp.status === 404) {
        // Wenn erfolgreich oder 404, senden wir die Antwort zurück.
        // Bei 404 kann Pages ggf. den Standard-Fallback (Root /index.html) verwenden.
        // Wenn die Datei existiert (200), wird sie direkt geliefert.
        return resp;
      }

    } catch (e) {
      console.error(`Direkt-Fetch für ${spaIndexFile} auf ${internalUrl.toString()} fehlgeschlagen:`, e);
      // Im Falle eines Fehlers muss der Worker an Pages übergeben.
      return next();
    }

    // Fallback auf Pages, wenn Fetch fehlschlägt
    return next();
  }

  // Hier wird die Logik angewendet:
  if (host.startsWith("de.")) {
    return handleLangSubdomain("de");
  }
  if (host.startsWith("en.")) {
    return handleLangSubdomain("en");
  }

// Die schließende Klammer } gehört zu "export async function onRequest(context) {"