// functions/_middleware.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const ua = request.headers.get("user-agent") || "";
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou|google)/i.test(ua);
  const isNavigation = request.headers.get("accept")?.includes("text/html");

  // --- 1️⃣ Rootdomain → Sprachbasierte Weiterleitung
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const isGerman = /\bde\b/.test(langHeader);
      const target = isGerman
        ? "de.ferienwohnung-parndorf.at"
        : "en.ferienwohnung-parndorf.at";

      // Immer zur Subdomain-Root weiterleiten
      return Response.redirect(`https://${target}/`, 301);
    }
    // Bots dürfen Root-Domain sehen (SEO)
    return env.ASSETS.fetch(request);
  }

  // --- 2️⃣ Deutsche Subdomain: Root-Dateien laden
  if (host.startsWith("de.")) {
    const resp = await env.ASSETS.fetch(new URL(url.pathname, url.origin));
    if (resp.status === 404) {
      return env.ASSETS.fetch(new URL("/index.html", url.origin));
    }
    return resp;
  }

  // --- 3️⃣ Englische Subdomain: /en/...-Ordner laden
  if (host.startsWith("en.")) {
    let path = url.pathname;
    if (path === "/" || path === "") path = "/index.html";
    const resp = await env.ASSETS.fetch(new URL(`/en${path}`, url.origin));
    if (resp.status === 404) {
      return env.ASSETS.fetch(new URL("/en/index.html", url.origin));
    }
    return resp;
  }

  // --- 4️⃣ Standard: normale Auslieferung
  return env.ASSETS.fetch(request);
}
