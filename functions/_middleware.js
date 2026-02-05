// _middleware.js - Maximale Stabilität für Systemdateien & SEO

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const hostname = url.hostname.toLowerCase();
  const assets = env.ASSETS;

  // --- 1. PRIORITÄT: SYSTEMDATEIEN (KEIN REDIRECT, KEIN VERARBEITEN) ---
  // Diese Dateien müssen im Root deines Cloudflare Pages Projekts liegen
  const systemFiles = [
    "/robots.txt",
    "/sitemap.xml",
    "/site.webmanifest",
    "/favicon.ico",
    "/browserconfig.xml"
  ];

  if (systemFiles.includes(path) || path.startsWith("/assets/")) {
    return assets.fetch(request);
  }

  // --- 2. WEITERE DATEI-PRÜFUNG (Bilder, JS, CSS) ---
  // Wenn ein Punkt im Pfad ist, ist es eine Datei -> direkt ausliefern
  if (path.includes('.')) {
    return assets.fetch(request);
  }

  // --- 3. WWW-UMLEITUNG (NUR FÜR SEITENAUFRUFE) ---
  if (hostname.startsWith("www.")) {
    const newHost = hostname.replace(/^www\./, "");
    return Response.redirect(`https://${newHost}${path}`, 301);
  }

  // --- 4. PFAD-NORMALISIERUNG (SLASH AM ENDE) ---
  // Wir erzwingen den Slash nur, wenn es keine Datei ist
  if (path !== "/" && !path.endsWith("/")) {
    return Response.redirect(`https://${hostname}${path}/`, 301);
  }

  // --- 5. SEO & SPRACH-LOGIK ---
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const baseDe = "https://de.ferienwohnung-parndorf.at";
  const baseEn = "https://en.ferienwohnung-parndorf.at";

  const deToEn = { "wohnzimmer": "livingroom", "schlafzimmer": "bedroom", "kueche": "kitchen", "badezimmer": "bathroom", "terrasse": "terrace", "eingangsbereich": "entrance", "ausstattung": "facilities", "anfahrt": "directions", "kontakt": "contact", "region": "region", "neusiedlersee": "neusiedlersee", "outlet": "outlet" };
  const enToDe = Object.fromEntries(Object.entries(deToEn).map(([k, v]) => [v, k]));

   const metaDataMap = {

    de: {

      "/": { title: "Ferienwohnung Parndorf – Ihr Zuhause am Neusiedler See", description: "Entdecken Sie unsere komfortable Ferienwohnung in Parndorf – ideal gelegen zwischen Outlet und Neusiedler See.", image: `${baseDe}/assets/images/wohnzimmer.webp` },

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



  // --- 6. BOT-VORSCHAU (GOOGLE & CO) ---
  const ua = request.headers.get("user-agent") || "";
  const isBot = /googlebot|bingbot|facebookexternalhit|twitterbot/i.test(ua);
  
  if (isBot && request.headers.get("accept")?.includes("text/html")) {
    const meta = metaDataMap[lang][path] || metaDataMap[lang]["/"];
    
    return new Response(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${meta.title}</title><meta name="description" content="${meta.description}"><meta name="robots" content="max-image-preview:large"><meta property="og:image" content="${meta.image}"></head><body><h1>${meta.title}</h1><p>${meta.description}</p></body></html>`, 
    { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // --- 7. FINALE AUSLIEFERUNG ---
  try {
    const targetFile = lang === "en" ? "/en/index.html" : "/de/index.html";
    const response = await assets.fetch(new URL(targetFile, request.url));
    return response.status === 404 ? assets.fetch(new URL("/index.html", request.url)) : response;
  } catch (e) {
    return new Response("Service Unavailable", { status: 503 });
  }
}
