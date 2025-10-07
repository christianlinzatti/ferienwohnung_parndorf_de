export async function onRequest(context) {
  const lang = context.request.headers.get("accept-language") || "";
  const url = new URL(context.request.url);

  // Wenn bereits auf der deutschen Subdomain, nichts tun
  if (url.hostname.startsWith("de.")) return context.next();

  if (lang.startsWith("de")) {
    return Response.redirect(`https://de.ferienwohnung-parndorf.at${url.pathname}`, 302);
  } else {
    return context.next(); // keine Weiterleitung, normale Seite
  }
}