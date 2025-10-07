export async function onRequest(context) {
  const lang = context.request.headers.get("accept-language")?.toLowerCase() || "";
  const url = new URL(context.request.url);

  // ✅ Wenn bereits auf der deutschen Subdomain → nichts tun
  if (url.hostname.startsWith("de.")) {
    return context.next();
  }

  // ✅ Wenn die aktuelle Seite bereits manuell /de/... im Pfad hat → auch nichts tun
  if (url.pathname.startsWith("/de")) {
    return context.next();
  }

  // ✅ Wenn Browser-Sprache deutsch → Weiterleitung auf deutsche Subdomain
  if (lang.startsWith("de")) {
    // Schleifen-Schutz: nur redirecten, wenn NICHT schon auf de.-Domain
    const target = `https://de.ferienwohnung-parndorf.at${url.pathname}`;
    if (url.href !== target) {
      return Response.redirect(target, 302);
    }
  }

  // Standard: englische Seite
  return context.next();
}
