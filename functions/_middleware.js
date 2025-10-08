export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const host = url.hostname;
  const ua = request.headers.get("user-agent")?.toLowerCase() || "";
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";

  // 🔹 Konsistente URLs (SEO + Cache)
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // 🔹 Bots (Google, Bing, etc.) sehen Originalseite → SEO/Backlinks funktionieren
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou)/i.test(ua);
  if (isBot) return context.next();

  // 🔹 Sprach-Domains: keine Umleitung
  if (host.startsWith("de.") || host.startsWith("en.")) {
    return context.next();
  }

  // 🔹 Automatische Weiterleitung nur für echte Besucher auf Hauptdomain
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    const isGerman = /\bde\b/.test(langHeader);
    const target = isGerman
      ? `https://de.ferienwohnung-parndorf.at${url.pathname}`
      : `https://en.ferienwohnung-parndorf.at${url.pathname}`;
    // 302 → temporär, damit Suchmaschinen Hauptdomain indexieren dürfen
    return Response.redirect(target, 302);
  }

  // 🔹 Edge-Caching aktivieren (Cloudflare Pages)
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=3600");
  return new Response(response.body, { ...response, headers });
}
