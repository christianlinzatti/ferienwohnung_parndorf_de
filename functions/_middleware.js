export async function onRequest(context) {
  const lang = context.request.headers.get("accept-language")?.toLowerCase() || "";
  const url = new URL(context.request.url);

  // ✅ Wenn bereits auf der deutschen Subdomain, nichts weiter tun
  if (url.hostname.startsWith("de.")) {
    return context.next();
  }

  // ✅ Wenn bereits /de im Pfad, auch nichts tun
  if (url.pathname.startsWith("/de")) {
    return context.next();
  }

  // ✅ Wenn Sprache deutsch und NICHT auf de.-Subdomain, einmal umleiten
  if (lang.startsWith("de")) {
    const target = `https://de.ferienwohnung-parndorf.at${url.pathname}`;
    if (url.href !== target) {
      return Response.redirect(target, 302);
    }
  }

  // ✅ Standard (englische Seite)
  return context.next();
}
