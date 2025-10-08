export async function onRequest(context) {
  const lang = context.request.headers.get("accept-language")?.toLowerCase() || "";
  const url = new URL(context.request.url);
  const host = url.hostname;

  // ✅ Slash am Ende erzwingen (aber nur, wenn keine Datei gemeint ist)
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // ✅ Wenn bereits auf Sprach-Subdomain → keine Umleitung
  if (host.startsWith("de.") || host.startsWith("en.")) {
    return context.next();
  }

  // ✅ Nur Hauptdomain umleiten (ferienwohnung-parndorf.at)
  if (host === "ferienwohnung-parndorf.at" || host === "www.ferienwohnung-parndorf.at") {
    if (lang.startsWith("de")) {
      return Response.redirect(`https://de.ferienwohnung-parndorf.at${url.pathname}`, 302);
    } else {
      return Response.redirect(`https://en.ferienwohnung-parndorf.at${url.pathname}`, 302);
    }
  }

  // Standardverhalten (sollte nie nötig sein)
  return context.next();
}
