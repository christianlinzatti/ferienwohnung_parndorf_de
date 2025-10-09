// functions/_middleware.js
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const pathname = url.pathname;

  // 1. Root-Domain-Logik: Leitet Benutzer basierend auf der Browsersprache um
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    const langHeader = (request.headers.get("accept-language") || "").toLowerCase();
    const primaryLang = langHeader.split(",")[0].split(";")[0].trim().split("-")[0];
    const isBot = /(bot|crawl|spider)/i.test(request.headers.get("user-agent") || "");

    // Bots und direkte API-/Asset-Anfragen werden nicht umgeleitet
    if (!isBot && !pathname.includes('.')) {
      const targetSubdomain = primaryLang === "de" ? "de" : "en";
      const targetUrl = `https://${targetSubdomain}.${host}${pathname}${url.search}`;

      return Response.redirect(targetUrl, 302); // Temporäre Umleitung
    }

    // Für Bots und Assets die Anfrage einfach durchlassen
    return next();
  }

  // 2. Subdomain-Logik: Schreibt Anfragen intern für die SPA um
  async function handleSpaSubdomain(lang) {
    // Wenn der Pfad einen Punkt enthält, gehen wir davon aus, dass es ein Asset ist (z.B. app.js, style.css).
    // Diese Anfragen leiten wir direkt an den Cloudflare Pages Asset-Server weiter.
    if (pathname.includes('.')) {
      return next();
    }

    // Für alle anderen Pfade (z.B. /, /buchen, /kontakt), die zur SPA gehören:
    // Wir schreiben die Anfrage intern auf die richtige index.html um.
    // Der Browser des Benutzers sieht weiterhin die schöne URL (z.B. de.ferienwohnung-parndorf.at/buchen),
    // aber im Hintergrund wird /de/index.html geladen.
    const spaIndexUrl = new URL(`/${lang}/index.html`, request.url);
    const spaRequest = new Request(spaIndexUrl.toString(), request);

    return next(spaRequest);
  }

  if (host.startsWith("de.")) {
    return handleSpaSubdomain("de");
  }

  if (host.startsWith("en.")) {
    return handleSpaSubdomain("en");
  }

  // Fallback für alle anderen Fälle
  return next();
}