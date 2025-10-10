// functions/_middleware.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const ua = request.headers.get("user-agent") || "";
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou|google)/i.test(ua);
  const isNavigation = request.headers.get("accept")?.includes("text/html");

  // --- 1️⃣ Rootdomain → Sprachweiterleitung (außer Bots)
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const isGerman = /\bde\b/.test(langHeader);
      const target = isGerman
        ? "de.ferienwohnung-parndorf.at"
        : "en.ferienwohnung-parndorf.at";
      return Response.redirect(`https://${target}${url.pathname}`, 302);
    }
    // Bots sehen die normale Startseite (für SEO / Backlinks)
    return env.ASSETS.fetch(request);
  }

  // --- 2️⃣ Deutsche Subdomain: direkt /index.html im Root ausliefern
  if (host.startsWith("de.")) {
    // Alles direkt aus dem Hauptverzeichnis laden
    const fileUrl = new URL(url.pathname, url.origin);
    const resp = await env.ASSETS.fetch(fileUrl);

    // Fallback auf index.html
    if (resp.status === 404) {
      const fallbackUrl = new URL("/index.html", url.origin);
      return env.ASSETS.fetch(fallbackUrl);
    }
    return resp;
  }

  // --- 3️⃣ Englische Subdomain: /en/...-Ordner ausliefern
  if (host.startsWith("en.")) {
    let path = url.pathname;
    if (path === "/" || path === "") path = "/index.html";

    const fileUrl = new URL(`/en${path}`, url.origin);
    const resp = await env.ASSETS.fetch(fileUrl);

    if (resp.status === 404) {
      const fallbackUrl = new URL("/en/index.html", url.origin);
      return env.ASSETS.fetch(fallbackUrl);
    }
    return resp;
  }

  // --- 4️⃣ Default: normale Auslieferung
  return env.ASSETS.fetch(request);
}
