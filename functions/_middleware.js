export async function onRequest(context) {
  const lang = context.request.headers.get("accept-language")?.toLowerCase() || "";
  const url = new URL(context.request.url);

  // Wenn bereits auf der deutschen Subdomain, liefere /de-Version
  if (url.hostname.startsWith("de.")) {
    // Wenn jemand /de/... aufruft, korrigieren wir auf die Root der Subdomain
    if (url.pathname.startsWith("/de")) {
      const fixed = `https://de.ferienwohnung-parndorf.at${url.pathname.replace(/^\/de/, "")}`;
      return Response.redirect(fixed, 301);
    }
    return context.next(); // alles andere -> /de/index.html laut _redirects
  }

  // Wenn Browser deutsch spricht und wir NICHT auf der de.-Subdomain sind:
  if (lang.startsWith("de")) {
    const target = `https://de.ferienwohnung-parndorf.at${url.pathname}`;
    if (url.href !== target) {
      return Response.redirect(target, 302);
    }
  }

  // Standard: Hauptseite (Englisch)
  return context.next();
}
