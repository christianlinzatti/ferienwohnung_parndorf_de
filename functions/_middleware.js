// functions/_middleware.js  -- NUR ZUM DEBUGGING
export async function onRequest({ request }) {
  const url = new URL(request.url);

  // Sammle alle wichtigen Informationen über die Anfrage
  const debugInfo = {
    nachricht: "DEBUG-MODUS AKTIV: Dies sind die Daten, die die Middleware empfängt.",
    zeitstempel: new Date().toISOString(),
    vollstaendige_url: url.href,
    host: url.host,
    pfad: url.pathname,
    protocol: url.protocol,
    cloudflare_infos: {
      land: request.cf?.country,
      colo: request.cf?.colo,
      http_protocol: request.cf?.httpProtocol,
    },
    // Alle Header der Anfrage anzeigen
    headers: Object.fromEntries(request.headers),
  };

  // Gib diese Informationen als Text (JSON) zurück.
  // Dies stoppt alle Weiterleitungen und Umschreibungen.
  return new Response(JSON.stringify(debugInfo, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}