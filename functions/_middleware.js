// functions/_middleware.js
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const { host, pathname } = url;

  // --- SICHERHEITSSCHALTER ---
  // Wenn die Anfrage bereits auf eine unserer SPA-Indexdateien zeigt,
  // beende die Middleware sofort und liefere die Datei aus.
  // Das verhindert, dass eine bereits umgeschriebene Anfrage eine neue Schleife auslöst.
  if (pathname === "/de/index.html" || pathname === "/en/index.html") {
    return next();
  }

  // --- 1. LOGIK FÜR DIE HAUPTDOMAIN (ferienwohnung-parndorf.at) ---
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    // Bots und direkte Asset-Anfragen (z.B. für SEO-Crawler) ignorieren
    const isBot = /(bot|crawl|spider)/i.test(request.headers.get("user-agent") || "");
    if (isBot || pathname.includes('.')) {
      return next(); // Nichts tun, einfach durchlassen
    }

    // Sprache aus dem Header des Browsers extrahieren
    const langHeader = request.headers.get("accept-language") || "";
    const primaryLang = langHeader.split(",")[0].split("-")[0].toLowerCase();

    // Ziel-Subdomain bestimmen (Standard ist "en")
    const targetSubdomain = primaryLang === "de" ? "de" : "en";
    const targetHost = `${targetSubdomain}.ferienwohnung-parndorf.at`;

    // Neue URL erstellen und den Benutzer dorthin umleiten
    const redirectURL = `https://${targetHost}${pathname}${url.search}`;
    return Response.redirect(redirectURL, 302); // 302 für eine temporäre Umleitung
  }

  // --- 2. LOGIK FÜR SUBDOMAINS (de. und en.) ---
  const handleSubdomain = (lang) => {
    // Wenn die URL einen Punkt enthält, ist es wahrscheinlich ein Asset (CSS, JS, Bild).
    // Diese Anfragen werden direkt durchgelassen.
    if (pathname.includes('.')) {
      return next();
    }

    // Dies ist eine Seitenanfrage für die SPA.
    // Wir schreiben die Anfrage intern auf die korrekte index.html um.
    // Der Browser des Benutzers behält die schöne URL bei.
    const spaEntrypoint = new URL(`/${lang}/index.html`, request.url);
    const rewrittenRequest = new Request(spaEntrypoint, request);

    return next(rewrittenRequest);
  };

  if (host.startsWith("de.")) {
    return handleSubdomain("de");
  }

  if (host.startsWith("en.")) {
    return handleSubdomain("en");
  }

  // Fallback: Für alle anderen Fälle (sollte nicht eintreten)
  return next();
}