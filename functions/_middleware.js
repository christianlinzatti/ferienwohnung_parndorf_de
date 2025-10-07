export async function onRequest(context) {
  const lang = context.request.headers.get("accept-language")?.toLowerCase() || "";
  const url = new URL(context.request.url);

  // Slash am Ende erzwingen (optional, nur für SEO)
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  const host = url.hostname;

  // Wenn bereits auf de. oder en. → nichts tun
  if (host.startsWith("de.") || host.startsWith("en.")) {
    return context.next();
  }

  // Sprachweiterleitung nur für Hauptdomain
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (lang.startsWith("de")) {
      return Response.redirect(`https://de.ferienwohnung-parndorf.at${url.pathname}`, 302);
    } else {
      return Response.redirect(`https://en.ferienwohnung-parndorf.at${url.pathname}`, 302);
    }
  }

  // Standard: normal weiter
  return context.next();
}
