export async function onRequest(context) {
  const lang = context.request.headers.get("accept-language")?.toLowerCase() || "";
  const url = new URL(context.request.url);

  // ✅ Slash am Ende erzwingen (aber nur, wenn keine Datei gemeint ist)
  if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
    url.pathname += "/";
    return Response.redirect(url.href, 301);
  }

  // ✅ Wenn bereits auf deutscher Subdomain, nichts tun
  if (url.hostname.startsWith("de.")) return context.next();

  // ✅ Wenn bereits /de im Pfad, nichts tun
  if (url.pathname.startsWith("/de")) return context.next();

  // ✅ Browser-Sprache deutsch → redirect auf de.-Subdomain
  if (lang.startsWith("de")) {
    const target = `https://de.ferienwohnung-parndorf.at${url.pathname}`;
    if (url.href !== target) return Response.redirect(target, 302);
  }

  return context.next();
}