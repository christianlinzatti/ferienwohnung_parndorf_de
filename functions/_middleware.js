// functions/_middleware.js

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const path = url.pathname;
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const ua = request.headers.get("user-agent") || "";
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou|google)/i.test(ua);
  const isNavigation = request.headers.get("accept")?.includes("text/html");

  // --- 0️⃣ Direkte Dateien (robots.txt etc.) durchlassen
  const directFiles = ["/robots.txt", "/site.webmanifest", "/sitemap.xml", "/favicon.ico", "/manifest.json"];
  if (directFiles.some(f => path === f)) {
    return env.ASSETS.fetch(request);
  }

  // --- 1️⃣ Root-Domain: Sprachbasierte Weiterleitung für echte Besucher
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const isGerman = /(de|de-at|de-de|de-ch)/i.test(langHeader);
      const target = isGerman ? "https://de.ferienwohnung-parndorf.at/" : "https://en.ferienwohnung-parndorf.at/";
      return Response.redirect(target, 302);
    }
    // Für Bots oder direkte Asset-Anfragen die Root-Index-Datei ausliefern
    return env.ASSETS.fetch(new URL("/index.html", request.url));
  }

  // --- 2️⃣ Deutsche Subdomain
  if (host.startsWith("de.")) {
    // Assets direkt durchlassen
    if (path.startsWith("/assets/")) {
      return env.ASSETS.fetch(request);
    }
    // Alle anderen Anfragen sind SPA-Routen und müssen die /de/index.html laden
    return env.ASSETS.fetch(new URL("/de/index.html", request.url));
  }

  // --- 3️⃣ Englische Subdomain
  if (host.startsWith("en.")) {
    // Assets direkt durchlassen
    if (path.startsWith("/assets/")) {
      return env.ASSETS.fetch(request);
    }
    // Alle anderen Anfragen sind SPA-Routen und müssen die /en/index.html laden
    return env.ASSETS.fetch(new URL("/en/index.html", request.url));
  }

  // --- 4️⃣ Standard-Fallback (sollte kaum erreicht werden)
  return env.ASSETS.fetch(request);
}
