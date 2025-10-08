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
      return Response.redirect(`https://${target}${url.pathname}`, 302);
    }
    return next();
  }

  // 4) Handler für Subdomains (vermeidet doppeltes Prefix)
  async function handleLangSubdomain(lang) {
    if (!isNavigation) return next(); // Asset (css/js/image) requests weiterreichen
    const prefix = `/${lang}`;
    const candidate = url.pathname.startsWith(prefix) ? url.pathname : `${prefix}${url.pathname}`;
    // Versuche candidate, dann index fallback
    const resp = await safeFetchAsset(candidate) || await safeFetchAsset(`${prefix}/`);
    if (resp) return resp;
    // Wenn nichts gefunden oder ASSETS fehlt → next() (Pages serviert normal)
    return next();
  }

  if (host.startsWith("de.")) return handleLangSubdomain("de");
  if (host.startsWith("en.")) return handleLangSubdomain("en");

  // Fallback
  return next();
}
