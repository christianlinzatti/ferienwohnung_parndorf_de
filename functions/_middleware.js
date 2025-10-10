// functions/_middleware.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const ua = request.headers.get("user-agent") || "";
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const accept = request.headers.get("accept") || "";
  const isNavigation =
    accept.includes("text/html") ||
    request.headers.get("sec-fetch-mode") === "navigate";
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou|google)/i.test(
    ua
  );

  // 1️⃣ trailing slash erzwingen (z. B. /de → /de/)
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // 2️⃣ Hauptdomain → Sprachweiterleitung
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const isGerman = /\bde\b/.test(langHeader);
      const target = isGerman
        ? "de.ferienwohnung-parndorf.at"
        : "en.ferienwohnung-parndorf.at";
      return Response.redirect(`https://${target}${url.pathname}`, 302);
    }
    return context.next();
  }

  // 3️⃣ Sprach-Subdomains: korrekten Pfad berechnen
  const serveLang = async (langFolder) => {
    let path = url.pathname;

    // Falls Benutzer versehentlich /de/... auf de. Subdomain aufruft → bereinigen
    if (path.startsWith(`/${langFolder}/`)) {
      path = path.replace(`/${langFolder}`, "");
    }

    // Root → index.html
    if (path === "/" || path === "") {
      path = "/index.html";
    }

    // Datei aus dem Sprachverzeichnis holen
    const filePath = `/${langFolder}${path}`;
    const response = await env.ASSETS.fetch(filePath);

    // Wenn 404 → fallback auf /index.html
    return response.ok
      ? response
      : env.ASSETS.fetch(`/${langFolder}/index.html`);
  };

  if (host.startsWith("de.")) return serveLang("de");
  if (host.startsWith("en.")) return serveLang("en");

  // 4️⃣ Fallback
  return context.next();
}
