// _middleware.js - Ultimative Version gegen HTML-Überschreibung

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const hostname = url.hostname.toLowerCase();
  const assets = env.ASSETS;

  // --- 1. FORCE EXIT FÜR SYSTEMDATEIEN ---
  // Wir prüfen explizit auf robots.txt und sitemap.xml
  if (path === "/robots.txt" || path === "/sitemap.xml") {
    const response = await assets.fetch(request);
    // Wenn die Datei gefunden wurde, erzwingen wir den richtigen Content-Type
    if (response.ok) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Content-Type", path.endsWith(".txt") ? "text/plain" : "application/xml");
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    }
  }

  // --- 2. GENERELLE DATEI-PRÜFUNG (Bilder, Assets) ---
  if (path.includes('.') || path.startsWith("/assets/")) {
    return assets.fetch(request);
  }

  // --- 3. REDIRECTS (WWW & SLASH) ---
  if (hostname.startsWith("www.")) {
    return Response.redirect(`https://${hostname.replace(/^www\./, "")}${path}`, 301);
  }
  if (path !== "/" && !path.endsWith("/")) {
    return Response.redirect(`https://${hostname}${path}/`, 301);
  }

  // --- 4. SEO & SPRACH-LOGIK ---
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const baseDe = "https://de.ferienwohnung-parndorf.at";
  const baseEn = "https://en.ferienwohnung-parndorf.at";
  
  const deToEn = { 
    "wohnzimmer": "livingroom", "schlafzimmer": "bedroom", "kueche": "kitchen", 
    "badezimmer": "bathroom", "terrasse": "terrace", "eingangsbereich": "entrance", 
    "ausstattung": "facilities", "anfahrt": "directions", "kontakt": "contact", 
    "region": "region", "neusiedlersee": "neusiedlersee", "outlet": "outlet" 
  };
  const enToDe = Object.fromEntries(Object.entries(deToEn).map(([k, v]) => [v, k]));

  // Meta-Daten (Vollständig)
  const metaDataMap = {
    de: {
      "/": { title: "Ferienwohnung Parndorf – Ihr Zuhause am Neusiedler See", description: "Entdecken Sie unsere komfortable Ferienwohnung in Parndorf.", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/wohnzimmer/": { title: "Wohnzimmer – Ferienwohnung Parndorf", description: "Gemütliches Wohnzimmer mit bequemer Couch.", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/schlafzimmer/": { title: "Schlafzimmer – Ferienwohnung Parndorf", description: "Erholsamer Schlaf in stilvollem Ambiente.", image: `${baseDe}/assets/images/schlafzimmer.webp` },
      "/kueche/": { title: "Küche & Essbereich – Ferienwohnung Parndorf", description: "Voll ausgestattete Küche für gemütliche Mahlzeiten.", image: `${baseDe}/assets/images/kueche.webp` },
      "/badezimmer/": { title: "Badezimmer – Ferienwohnung Parndorf", description: "Modernes Badezimmer mit Dusche und WC.", image: `${baseDe}/assets/images/badezimmer.webp` },
      "/terrasse/": { title: "Terrasse & Garten – Ferienwohnung Parndorf", description: "Entspannen Sie im Garten oder auf der sonnigen Terrasse.", image: `${baseDe}/assets/images/terrasse.webp` },
      "/eingangsbereich/": { title: "Eingangsbereich – Ferienwohnung Parndorf", description: "Herzlich willkommen in Parndorf.", image: `${baseDe}/assets/images/eingangsbereich.webp` },
      "/ausstattung/": { title: "Ausstattung – Ferienwohnung Parndorf", description: "Details: WLAN, Küche, Terrasse, Parkplatz.", image: `${baseDe}/assets/images/wohnzimmer.webp` },
      "/anfahrt/": { title: "Anfahrt & Lage – Ferienwohnung Parndorf", description: "Zentrale Lage zwischen See und Outlet.", image: `${baseDe}/assets/images/map.webp` },
      "/kontakt/": { title: "Kontakt – Ferienwohnung Parndorf", description: "Kontaktieren Sie uns für Buchungen.", image: `${baseDe}/assets/images/kontakt.webp` },
      "/region/": { title: "Region Parndorf – Entdecken Sie das Burgenland", description: "Region rund um den Neusiedler See.", image: `${baseDe}/assets/images/region.webp` },
      "/region/neusiedlersee/": { title: "Region Neusiedler See – Ausflugsziele", description: "Tipps für den Neusiedler See.", image: `${baseDe}/assets/images/region-neusiedlersee.jpg` },
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping", description: "Nur 2 km vom Apartment entfernt.", image: `${baseDe}/assets/images/outlet.webp` }
    },
    en: {
      "/": { title: "Holiday Apartment Parndorf – Lake Neusiedl", description: "Discover our cozy apartment in Parndorf.", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/livingroom/": { title: "Living Room – Holiday Apartment Parndorf", description: "Cozy living room with a comfortable couch.", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/bedroom/": { title: "Bedroom – Holiday Apartment Parndorf", description: "Relax and unwind in our stylish bedroom.", image: `${baseEn}/assets/images/schlafzimmer.webp` },
      "/kitchen/": { title: "Kitchen & Dining – Holiday Apartment Parndorf", description: "Fully equipped kitchen for your stay.", image: `${baseEn}/assets/images/kueche.webp` },
      "/bathroom/": { title: "Bathroom – Holiday Apartment Parndorf", description: "Modern bathroom with shower.", image: `${baseEn}/assets/images/badezimmer.webp` },
      "/terrace/": { title: "Terrace & Garden – Holiday Apartment Parndorf", description: "Enjoy the sunny terrace or the garden.", image: `${baseEn}/assets/images/terrasse.webp` },
      "/entrance/": { title: "Entrance – Holiday Apartment Parndorf", description: "Welcome to your home away from home.", image: `${baseEn}/assets/images/eingangsbereich.webp` },
      "/facilities/": { title: "Facilities – Holiday Apartment Parndorf", description: "Amenities: WiFi, kitchen, terrace, parking.", image: `${baseEn}/assets/images/wohnzimmer.webp` },
      "/directions/": { title: "Directions – Holiday Apartment Parndorf", description: "Easy to find between Lake Neusiedl and Outlet.", image: `${baseEn}/assets/images/map.webp` },
      "/contact/": { title: "Contact – Holiday Apartment Parndorf", description: "Get in touch for bookings.", image: `${baseEn}/assets/images/kontakt.webp` },
      "/region/": { title: "Parndorf Region – Discover Burgenland", description: "Explore the Lake Neusiedl region.", image: `${baseEn}/assets/images/region.webp` },
      "/region/neusiedlersee/": { title: "Lake Neusiedl – Sights & Activities", description: "Best travel tips for Lake Neusiedl.", image: `${baseEn}/assets/images/region-neusiedlersee.jpg` },
      "/region/outlet/": { title: "Designer Outlet Parndorf – Shopping", description: "Just 2 km from the apartment.", image: `${baseEn}/assets/images/outlet.webp` }
    }
  };

  // --- 5. BOT-LOGIK (Meta-Tags) ---
  const ua = request.headers.get("user-agent") || "";
  if (/googlebot|bingbot|facebook|twitter|pinterest/i.test(ua) && request.headers.get("accept")?.includes("text/html")) {
    const meta = metaDataMap[lang][path] || metaDataMap[lang]["/"];
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return new Response(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(meta.title)}</title><meta name="description" content="${esc(meta.description)}"><meta property="og:image" content="${meta.image}"></head><body><h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p></body></html>`, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // --- 6. REGULÄRE AUSLIEFERUNG ---
  try {
    const fetchPath = lang === "en" ? "/en/index.html" : "/de/index.html";
    const response = await assets.fetch(new URL(fetchPath, request.url));
    return response.status === 404 ? assets.fetch(new URL("/index.html", request.url)) : response;
  } catch (e) {
    return new Response("Service Unavailable", { status: 503 });
  }
}
