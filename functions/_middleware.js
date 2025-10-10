// functions/_middleware.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const ua = request.headers.get("user-agent") || "";
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou|google)/i.test(ua);
  const isNavigation = request.headers.get("accept")?.includes("text/html");

  // --- 1️⃣ Rootdomain → Weiterleitung je nach Sprache
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const isGerman = /(de|de-at|de-de|de-ch)/i.test(langHeader);
      const target = isGerman
        ? "https://de.ferienwohnung-parndorf.at/"
        : "https://en.ferienwohnung-parndorf.at/";
      return Response.redirect(target, 302);
    }
    // Bots sehen normale Rootseite (für SEO)
    return env.ASSETS.fetch(request);
  }

  // --- 2️⃣ Deutsche Subdomain → statische Auslieferung
  if (host.startsWith("de.")) {
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const resp = await env.ASSETS.fetch(new URL(path, url.origin));
    if (resp.status === 404) {
      return env.ASSETS.fetch(new URL("/index.html", url.origin));
    }
    return resp;
  }

  // --- 3️⃣ Englische Subdomain → statische Auslieferung
  if (host.startsWith("en.")) {
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const resp = await env.ASSETS.fetch(new URL(`/en${path}`, url.origin));
    if (resp.status === 404) {
      return env.ASSETS.fetch(new URL("/en/index.html", url.origin));
    }
    return resp;
  }

  // --- 4️⃣ Standard → Weitergabe an statische Dateien
  return env.ASSETS.fetch(request);
}
