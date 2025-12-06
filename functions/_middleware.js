// _middleware.js - Debug Version & Explicit Maps

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const accept = request.headers.get("accept") || "";
  const ua = request.headers.get("user-agent") || "";
  const isHtmlNav = accept.includes("text/html");

  const baseDe = "https://de.ferienwohnung-parndorf.at";
  const baseEn = "https://en.ferienwohnung-parndorf.at";
  const assets = env.ASSETS;

  // Bot detection
  const isBot = /(googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|preview|embed)/i
    .test(ua);

  // -------------------------------------------------------
  // 1. MANUELLE WORTERBÜCHER (Fehlerquelle ausschließen)
  // -------------------------------------------------------

  // Deutsch -> Englisch
  const deToEn = {
    "wohnzimmer": "livingroom",
    "schlafzimmer": "bedroom",
    "kueche": "kitchen",
    "badezimmer": "bathroom",
    "terrasse": "terrace",
    "eingangsbereich": "entrance",
    "ausstattung": "facilities",
    "anfahrt": "directions",
    "kontakt": "contact",
    "region": "region",
    "neusiedlersee": "neusiedlersee",
    "outlet": "outlet",
    "garten": "garden"
  };

  // Englisch -> Deutsch (Manuell definiert für Sicherheit)
  const enToDe = {
    "livingroom": "wohnzimmer",
    "bedroom": "schlafzimmer",
    "kitchen": "kueche",
    "bathroom": "badezimmer",
    "terrace": "terrasse",
    "entrance": "eingangsbereich",
    "facilities": "ausstattung",
    "directions": "anfahrt",
    "contact": "kontakt",
    "region": "region",
    "neusiedlersee": "neusiedlersee",
    "outlet": "outlet",
    "garden": "garten"
  };

  // Pfad normalisieren
  function normalizePath(p) {
    if (!p || p === "/") return "/";
    let s = p.toLowerCase();
    try { s = decodeURIComponent(s); } catch (e) {}
    // Sicherstellen, dass Slashes sauber sind
    if (!s.startsWith("/")) s = "/" + s;
    if (!s.endsWith("/")) s = s + "/";
    return s;
  }

  const path = normalizePath(url.pathname);

  // Sprache erkennen
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const targetBase = lang === "de" ? baseDe : baseEn;

  // -------------------------------------------------------
  // 2. CHECK: DOMAIN REDIRECTS
  // -------------------------------------------------------
  if (hostname.startsWith("www.")) {
    const bare = hostname.replace(/^www\./, "");
    return Response.redirect(`https://${bare}${path}`, 301);
  }
  if (hostname === "ferienwohnung-parndorf.at") {
    if (isHtmlNav) return Response.redirect(`${baseDe}${path}`, 301);
  }

  // -------------------------------------------------------
  // 3. HAUPTLOGIK: URL ÜBERSETZUNG PRÜFEN
  // -------------------------------------------------------

  // Ist es ein Asset? (Bilder, JS, CSS)
  const isAsset = path.startsWith("/assets/") || path.match(/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|txt|json|xml|pdf|webmanifest|woff2?)$/i);

  let redirectUrl = null;

  if (!isAsset && path !== "/") {
    const segments = path.split('/').filter(Boolean); // Entfernt leere Einträge
    let needsRedirect = false;

    // Wir bauen den Pfad neu auf
    const newSegments = segments.map(seg => {
      const lower = seg.toLowerCase();

      if (lang === "de") {
        // Wir sind auf DE -> Prüfe, ob Segment englisch ist
        if (enToDe[lower]) {
          // Es ist ein englisches Wort! -> Übersetzen
          // WICHTIG: Nur redirecten, wenn das Wort sich ändert (z.B. outlet -> outlet braucht keinen redirect)
          if (enToDe[lower] !== lower) {
            needsRedirect = true;
            return enToDe[lower];
          }
        }
      } else {
        // Wir sind auf EN -> Prüfe, ob Segment deutsch ist
        if (deToEn[lower]) {
          if (deToEn[lower] !== lower) {
            needsRedirect = true;
            return deToEn[lower];
          }
        }
      }
      return lower; // Unverändert lassen
    });

    if (needsRedirect) {
      redirectUrl = `${targetBase}/${newSegments.join("/")}/`;
    }
  }

  // Wenn Redirect gefunden wurde, SOFORT ausführen
  if (redirectUrl) {
    return Response.redirect(redirectUrl, 301);
  }

  // -------------------------------------------------------
  // 4. AUSGABE (FALLBACK) MIT DEBUG-INFOS
  // -------------------------------------------------------

  if (isAsset) {
    return assets.fetch(request);
  }

  // META-Daten Logik (gekürzt für Übersichtlichkeit, bleibt funktionell gleich)
  // ... Hier wird normalerweise HTML generiert ...

  // SPA Fallback: index.html laden
  try {
    let fetchUrl = "/index.html";
    if (hostname.startsWith("de.")) fetchUrl = "/de/index.html";
    if (hostname.startsWith("en.")) fetchUrl = "/en/index.html";

    // Versuchen, die spezifische index Datei zu laden, sonst root
    let response = await assets.fetch(new URL(fetchUrl, request.url));
    if (response.status === 404) {
       response = await assets.fetch(new URL("/index.html", request.url));
    }

    // DEBUG: Wir klonen die Antwort, um Header hinzuzufügen
    const newResponse = new Response(response.body, response);

    // Diese Header siehst du im Browser Netzwerk-Tab unter "Response Headers"
    newResponse.headers.set("X-Debug-Lang", lang);
    newResponse.headers.set("X-Debug-Path-In", path);
    newResponse.headers.set("X-Debug-Redirect-Triggered", "false");

    return newResponse;

  } catch (err) {
    return new Response("Error loading page: " + err.message, { status: 500 });
  }
}