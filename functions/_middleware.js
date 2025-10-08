export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const host = url.hostname;
  const ua = request.headers.get("user-agent") || "";
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const accept = request.headers.get("accept") || "";
  const isNavigation = accept.includes("text/html") || request.headers.get("sec-fetch-mode") === "navigate";

  // 1) Normalisiere Pfad
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // 2) Bot-Erkennung
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou)/i.test(ua);

  // 3) Hauptdomain → Sprachweiterleitung
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const isGerman = /\bde\b/.test(langHeader);
      const targetHost = isGerman ? "de.ferienwohnung-parndorf.at" : "en.ferienwohnung-parndorf.at";
      return Response.redirect(`https://${targetHost}${url.pathname}`, 302);
    }
    return context.next();
  }

  // 4) de.Subdomain → /de/
  if (host.startsWith("de.")) {
    if (!isNavigation) return context.next();
    try {
      let resp = await context.asset(`/de${url.pathname}`);
      if (!resp) resp = await context.asset("/de/index.html");
      return resp;
    } catch {
      return await context.asset("/de/index.html");
    }
  }

  // 5) en.Subdomain → /en/
  if (host.startsWith("en.")) {
    if (!isNavigation) return context.next();
    try {
      let resp = await context.asset(`/en${url.pathname}`);
      if (!resp) resp = await context.asset("/en/index.html");
      return resp;
    } catch {
      return await context.asset("/en/index.html");
    }
  }

  // 6) Standard
  return context.next();
}
