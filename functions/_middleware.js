// functions/_middleware.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const ua = request.headers.get("user-agent") || "";
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou|google)/i.test(ua);
  const isNavigation = request.headers.get("accept")?.includes("text/html");

  // --- 1️⃣ Rootdomain → Weiterleitung anhand Sprache
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const isGerman = /(de|de-at|de-de|de-ch)/i.test(langHeader);
      const target = isGerman
        ? "https://de.ferienwohnung-parndorf.at/"
        : "https://en.ferienwohnung-parndorf.at/";
      return Response.redirect(target, 302);
    }
    return env.ASSETS.fetch(request);
  }

  // --- 2️⃣ Deutsche Subdomain → Dateien aus /de/ Ordner laden
  if (host.startsWith("de.")) {
    let path = url.pathname;
    if (path === "/" || path === "") path = "/index.html";

    // Dateien aus /de/ laden
    const resp = await env.ASSETS.fetch(new URL(`/de${path}`, url.origin));
    if (resp.status === 404) {
      // Fallback auf /de/index.html
      return env.ASSETS.fetch(new URL("/de/index.html", url.origin));
    }
    return resp;
  }

  // --- 3️⃣ Englische Subdomain → Dateien aus /en/ Ordner laden
  if (host.startsWith("en.")) {
    let path = url.pathname;
    if (path === "/" || path === "") path = "/index.html";

    const resp = await env.ASSETS.fetch(new URL(`/en${path}`, url.origin));
    if (resp.status === 404) {
      return env.ASSETS.fetch(new URL("/en/index.html", url.origin));
    }
    return resp;
  }

  // --- 4️⃣ Standard → normale Auslieferung
  return env.ASSETS.fetch(request);
}
