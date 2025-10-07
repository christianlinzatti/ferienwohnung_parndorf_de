export async function onRequest(context) {
  const lang = context.request.headers.get("accept-language")?.toLowerCase() || "";
  const url = new URL(context.request.url);

  // Slash erzwingen (SEO-freundlich)
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // Wenn bereits auf einer Sprach-Subdomain, nichts tun
  if (url.hostname.startsWith("de.") || url.hostname.startsWith("en.")) {
    return context.next();
  }

  // Sprachweiterleitung (nur für Hauptdomain)
  if (url.hostname === "ferienwohnung-parndorf.at" || url.hostname === "www.ferienwohnung-parndorf.at") {
    if (lang.startsWith("de")) {
      return Response.redirect(`https://de.ferienwohnung-parndorf.at${url.pathname}`, 302);
    } else {
      return Response.redirect(`https://en.ferienwohnung-parndorf.at${url.pathname}`, 302);
    }
  }

  // Falls nichts anderes greift → Seite normal laden
  return context.next();
}