// functions/_middleware.js  (Pages Functions / Middleware)
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname;
  const ua = request.headers.get("user-agent") || "";
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const accept = request.headers.get("accept") || "";
  const isNavigation = accept.includes("text/html") || request.headers.get("sec-fetch-mode") === "navigate";

  // 1) Normalisiere: wenn kein Dateiname und kein Slash -> Slash anfügen
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // 2) Bot-Erkennung (Google, Bing, etc.) — Bots sollen die Hauptdomain sehen (SEO & Backlinks)
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou)/i.test(ua);

  // 3) Wenn Hauptdomain (ferienwohnung-parndorf.at)
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    // echte Besucher → Sprachredirect
    if (!isBot && isNavigation) {
      const isGerman = /\bde\b/.test(langHeader);
      const targetHost = isGerman ? "de.ferienwohnung-parndorf.at" : "en.ferienwohnung-parndorf.at";
      return Response.redirect(`https://${targetHost}${url.pathname}`, 302);
    }
    // Bots und Nicht-HTML-Anfragen: normal weiter (Pages liefert Root index.html)
    return context.next();
  }

  // 4) Subdomain: de.* → liefere /de/* Assets (HTML navigation -> /de/ as SPA fallback)
  if (host.startsWith("de.")) {
    // Static assets (css/js/images) normal durchlassen
    if (!isNavigation) return context.next();

    // Versuche zuerst exakte Pfad unter /de (z.B. /de/kontakt/), fallback auf /de/
    const candidate = `/de${url.pathname}`;
    let resp = await env.ASSETS.fetch(candidate);
    if (resp.status === 404) {
      resp = await env.ASSETS.fetch("/de/");
    }
    return resp;
  }

  // 5) Subdomain: en.* → liefere /en/* Assets analog
  if (host.startsWith("en.")) {
    if (!isNavigation) return context.next();

    const candidate = `/en${url.pathname}`;
    let resp = await env.ASSETS.fetch(candidate);
    if (resp.status === 404) {
      resp = await env.ASSETS.fetch("/en/");
    }
    return resp;
  }

  // 6) Fallback: normal weiterreichen
  return context.next();
}