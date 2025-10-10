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
  const isBot = /(bot|crawl|spider|slurp|bing|yandex|duckduckgo|baiduspider|sogou|google)/i.test(ua);

  // 1️⃣ trailing slash erzwingen
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // 2️⃣ Rootdomain → Sprachweiterleitung (außer Bots)
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

  // 3️⃣ Sprach-Subdomains: Dateien korrekt laden
  const serveLang = async (langFolder) => {
    let path = url.pathname;

    // doppelte Präfixe vermeiden
    if (path.startsWith(`/${langFolder}/`)) {
      path = path.replace(`/${langFolder}`, "");
    }

    // Root oder leer → index.html
    if (path === "/" || path === "") {
      path = "/index.html";
    }

    const fileUrl = new URL(`/${langFolder}${path}`, url.origin);
    const resp = await env.ASSETS.fetch(fileUrl);

    if (resp.status === 404) {
      const fallbackUrl = new URL(`/${langFolder}/index.html`, url.origin);
      return env.ASSETS.fetch(fallbackUrl);
    }

    return resp;
  };

  if (host.startsWith("de.")) return serveLang("de");
  if (host.startsWith("en.")) return serveLang("en");

  return context.next();
}
