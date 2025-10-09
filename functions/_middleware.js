// functions/_middleware.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const ua = request.headers.get("user-agent") || "";
  const langHeader = request.headers.get("accept-language")?.toLowerCase() || "";
  const accept = request.headers.get("accept") || "";
  const isNavigation = accept.includes("text/html") || request.headers.get("sec-fetch-mode") === "navigate";
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou|google)/i.test(ua);

  // 1️⃣ trailing slash erzwingen
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // 2️⃣ Hauptdomain: Sprache erkennen & weiterleiten
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (!isBot && isNavigation) {
      const isGerman = /\bde\b/.test(langHeader);
      const target = isGerman ? "de.ferienwohnung-parndorf.at" : "en.ferienwohnung-parndorf.at";
      return Response.redirect(`https://${target}${url.pathname}`, 302);
    }
    // Bots oder API → neutrale Seite
    return context.next();
  }

  // 3️⃣ Sprach-Subdomains bedienen (Assets aus /de bzw. /en)
  const serveLang = async (prefix) => {
    if (!isNavigation) return context.next();
    const candidate = `${prefix}${url.pathname}`;
    const resp = await env.ASSETS.fetch(candidate);
    if (resp.status === 404) {
      return env.ASSETS.fetch(`${prefix}/index.html`);
    }
    return resp;
  };

  if (host.startsWith("de.")) return serveLang("/de");
  if (host.startsWith("en.")) return serveLang("/en");

  // 4️⃣ Fallback
  return context.next();
}