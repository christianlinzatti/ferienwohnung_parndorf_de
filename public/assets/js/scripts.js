document.addEventListener('DOMContentLoaded', () => {




const scrollSpyNav = document.querySelector('.scroll-spy');
  const spyLinks = document.querySelectorAll('.scroll-spy-link');

  // Alle Sektionen, die beobachtet werden sollen
  const sections = document.querySelectorAll('section[id]');

  if (!scrollSpyNav || spyLinks.length === 0 || sections.length === 0) {
    return; // Funktion abbrechen, wenn Elemente fehlen
  }

  // Die Scroll-Spy Navigation erst nach dem Header einblenden
  const headerHeight = document.querySelector('header')?.offsetHeight || 150;
  window.addEventListener('scroll', () => {
    if (window.scrollY > headerHeight) {
      scrollSpyNav.classList.add('visible');
    } else {
      scrollSpyNav.classList.remove('visible');
    }
  });

  // Intersection Observer für die Sektionen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const activeLink = document.querySelector(`.scroll-spy-link[href="#${id}"]`);

        // Alle anderen Links deaktivieren
        spyLinks.forEach(link => link.classList.remove('active'));

        // Den korrekten Link aktivieren
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, {
    rootMargin: '-50% 0px -50% 0px', // Aktiviert, wenn die Sektion in der Mitte des Bildschirms ist
    threshold: 0
  });

  // Jede Sektion dem Observer hinzufügen
  sections.forEach(section => {
    observer.observe(section);
  });

  // Sanftes Scrollen bei Klick auf einen Punkt
  spyLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });



  // Hilfsfunktionen
  const stripExt = s => s ? s.replace(/\.(jpe?g|png|webp)$/i, '') : '';
  const ensureRoot = s => s && s.startsWith('/') ? s : ('/' + s);
  const IMAGE_BASE_PATH = "/assets/images/";
    const lang = window.location.hostname.startsWith("en.") ? "en" : "de";

    
const mainSlideshowContainer = document.querySelector('.slideshow-container');
  if (!mainSlideshowContainer) return;

  const slides = mainSlideshowContainer.querySelectorAll('.slide');
  const btnPrev = mainSlideshowContainer.querySelector('.btn-prev');
  const btnNext = mainSlideshowContainer.querySelector('.btn-next');
  const dotsContainer = mainSlideshowContainer.querySelector('.dots-container');

  let slideInterval;
  let currentIndex = 0;

  function showSlide(index) {
    if (!slides[index] || !dotsContainer.children[index]) return;
    mainSlideshowContainer.querySelector('.slide.active')?.classList.remove('active');
    dotsContainer.querySelector('.dot.active')?.classList.remove('active');
    currentIndex = index;
    slides[currentIndex].classList.add('active');
    dotsContainer.children[currentIndex].classList.add('active');
  }

  function nextSlide() { showSlide((currentIndex + 1) % slides.length); }
  function prevSlide() { showSlide((currentIndex - 1 + slides.length) % slides.length); }

  function startInterval() { if (slideInterval) return; // vermeidet Doppel-Intervalle
  slideInterval = setInterval(nextSlide, 5000); }
  function resetInterval() { clearInterval(slideInterval);
  slideInterval = null;
  startInterval(); }
  window.startInterval = startInterval;
window.resetInterval = resetInterval;

  // Navigation-Buttons
  btnNext?.addEventListener('click', () => { nextSlide(); resetInterval(); });
  btnPrev?.addEventListener('click', () => { prevSlide(); resetInterval(); });

  // Initial anzeigen und starten
  showSlide(0);
  startInterval();



const galleries = {
    kueche: ["kueche.webp", "essbereich.webp"],
    schlafzimmer: ["schlafzimmer.webp", "betten.webp", "bett_kasten.webp"],
    wohnzimmer: ["wohnzimmer.webp"],
    badezimmer: ["badezimmer.webp", "wc.webp"],
    terrasse: ["terrasse.webp", "garten.webp"],
    eingangsbereich: ["eingangsbereich.webp"],
  };

  const galleriesEn = {
    kitchen: ["kueche.webp", "essbereich.webp"],
    bedroom: ["schlafzimmer.webp", "betten.webp", "bett_kasten.webp"],
    livingroom: ["wohnzimmer.webp"],
    bathroom: ["badezimmer.webp", "wc.webp"],
    terrace: ["terrasse.webp", "garten.webp"],
    entrance: ["eingangsbereich.webp"],
  };
  const galleriesActive = lang === "en" ? galleriesEn : galleries;

  // Aktives Galerie-Mapping auswählen
  // =========================================================
  // SPRACHEINSTELLUNGEN UND TEXTE
  // =========================================================

  // Zentraler Ort für alle übersetzbaren Texte
  const translations = {
    de: {
      metaTitle: "Ferienwohnung Parndorf | {caption}",
      metaDescription: "Ein Blick auf: {caption}. Gemütliches Apartment in Parndorf, nur 2 km vom Designer Outlet entfernt. Ideal für Shopping, Erholung am Neusiedler See und Dienstreisen.",
      // NEU: Eigene Description-Vorlage für Sektionen
      metaDescriptionSection: "{caption} - Alle Infos zur Ferienwohnung Parndorf. Gemütliches Apartment in Top-Lage, nur 2 km vom Designer Outlet entfernt.",
      // NEU: Meta-Titel für Sektionen
      sectionMeta: {
        "anfahrt": "Anfahrt & Lage",
        "ausstattung": "Ausstattung",
        "faq": "Häufige Fragen (FAQ)",
        "highlight": "Highlights der Unterkunft",
        "verfuegbarkeit": "Verfügbarkeit prüfen",
        "kontakt": "Kontakt",
        "fotogallerie": "Fotogalerie",
        "region1": "Region & Umgebung" // ID der Region-Sektion
      },
      // NEU: Meta-Titel für Region
      regionMeta: {
        "default": "Region & Umgebung",
        "outlet": "Region: Designer Outlet",
        "neusiedlersee": "Region: Neusiedler See"
      }
    },
    en: {
      metaTitle: "Holiday Apartment Parndorf | {caption}",
      metaDescription: "A look at: {caption}. Cozy apartment in Parndorf, just 2 km from the Designer Outlet. Ideal for shopping, relaxing at Lake Neusiedl, and business trips.",
      // NEU
      metaDescriptionSection: "{caption} - All info about the Holiday Apartment Parndorf. Cozy apartment in a prime location, just 2 km from the Designer Outlet.",
      // NEU
      sectionMeta: {
        "anfahrt": "Directions & Location",
        "ausstattung": "Facilities",
        "faq": "Frequently Asked Questions (FAQ)",
        "highlight": "Accommodation Highlights",
        "verfuegbarkeit": "Check Availability",
        "kontakt": "Contact",
        "fotogallerie": "Photo Gallery",
        "region1": "Region & Surroundings" // ID der Region-Sektion
      },
      // NEU
      regionMeta: {
        "default": "Region & Surroundings",
        "outlet": "Region: Designer Outlet",
        "neusiedlersee": "Region: Lake Neusiedl"
      }
    }
  };

// =========================================================
// VERFÜGBARKEIT FORMULAR – Automatische Buttons (ohne Prüfen-Button)
// =========================================================

const form = document.getElementById("availability-form");
const startInput = document.getElementById("start-date");
const endInput = document.getElementById("end-date");
const guestsInput = document.getElementById("guests");
const nightsInput = document.getElementById("nights");
const resultBox = document.getElementById("availability-result");
const resultText = document.getElementById("result-text");
const resultIcon = resultBox?.querySelector(".result-icon");
const bookingBtn = document.querySelector(".booking-btn");
const airbnbBtn = document.querySelector(".airbnb-btn");

// Standardmäßig 2 Personen vorauswählen
if (guestsInput) guestsInput.value = 2;

// --- Übersetzungen ---
const availabilityTexts = {
  de: {
    title: "Verfügbarkeit prüfen",
    start: "Anreise",
    end: "Abreise",
    guests: "Personen",
    nights: "Nächte",
    ready: (n, g) =>
      `✅ ${n} Nacht${n > 1 ? "e" : ""}, ${g} Person${g > 1 ? "en" : ""} — bereit zur Buchung!`,
    invalid: "Bitte gültige Daten eingeben.",
  },
  en: {
    title: "Check availability",
    start: "Check-in",
    end: "Check-out",
    guests: "Guests",
    nights: "Nights",
    ready: (n, g) =>
      `✅ ${n} night${n > 1 ? "s" : ""}, ${g} guest${g > 1 ? "s" : ""} — ready to book!`,
    invalid: "Please enter valid dates.",
  },
};

// Sprache anhand Domain bestimmen
const t = availabilityTexts[lang];

// Texte im Formular setzen
document.getElementById("availability-title").textContent = t.title;
document.getElementById("label-start").textContent = t.start;
document.getElementById("label-end").textContent = t.end;
document.getElementById("label-guests").textContent = t.guests;
document.getElementById("label-nights").textContent = t.nights;

// Mindestdatum = morgen
const today = new Date();
today.setDate(today.getDate() + 1)
const todayStr = today.toISOString().split("T")[0];
startInput.min = todayStr;
endInput.min = todayStr;
endInput.disabled = true;

// Wenn Anreisedatum gewählt → Abreisedatum frühestens +1 Tag
startInput.addEventListener("change", () => {
  const startDate = new Date(startInput.value);
  if (isNaN(startDate)) {
    endInput.disabled = true;
    return;
  }
  const minCheckout = new Date(startDate);
  minCheckout.setDate(minCheckout.getDate() + 1);
  endInput.min = minCheckout.toISOString().split("T")[0];
  endInput.disabled = false;
});

// Nächte berechnen
const calculateNights = () => {
  const startDate = new Date(startInput.value);
  const endDate = new Date(endInput.value);
  if (isNaN(startDate) || isNaN(endDate) || endDate <= startDate) {
    nightsInput.value = "";
    return 0;
  }
  const diff = endDate - startDate;
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  nightsInput.value = nights;
  return nights;
};

// Hauptfunktion: Eingaben prüfen & Buttons generieren
const checkInputs = () => {
  const nights = calculateNights();
  const start = startInput.value;
  const end = endInput.value;
  const guests = guestsInput.value;
  const valid = start && end && guests > 0 && nights > 0;

  // Sprache bestimmen → passende Domains
  const isEnglish = window.location.hostname.startsWith("en.");
  const bookingDomain = isEnglish
    ? "https://www.booking.com/hotel/at/ferienwohnung-parndorf.en-gb.html"
    : "https://www.booking.com/hotel/at/ferienwohnung-parndorf.de.html";
  const airbnbDomain = isEnglish
    ? "https://www.airbnb.com"
    : "https://www.airbnb.at";

  [bookingBtn, airbnbBtn].forEach((btn) => {
    if (!btn) return;
    btn.style.display = valid ? "inline-flex" : "none";
    btn.classList.toggle("disabled", !valid);

    if (valid) {
      // ✅ Booking.com-Link (ohne Tracking)
      if (btn.classList.contains("booking-btn")) {
        const params = new URLSearchParams({
          checkin: start,
          checkout: end,
          group_adults: guests,
          group_children: 0,
          no_rooms: 1,
          req_adults: guests,
          req_children: 0,
        }).toString();
        btn.href = `${bookingDomain}?${params}`;
      }

      // ✅ Airbnb-Link (komplett mit Datum & Personen)
      if (btn.classList.contains("airbnb-btn")) {
        const params = new URLSearchParams({
          numberOfGuests: guests,
          checkin: start,
          checkout: end,
          numberOfAdults: guests,
          guestCurrency: "EUR",
          productId: "24131580",
          isWorkTrip: "false",
          numberOfChildren: 0,
          numberOfInfants: 0,
          numberOfPets: 0,
        }).toString();
        btn.href = `${airbnbDomain}/book/stays/24131580?${params}`;
      }
    }
  });

  // Ergebnisbox anzeigen/verstecken
  if (valid) {
    const icon = nights > 3 ? "✅" : "📅";
    resultIcon.textContent = icon;
    resultText.textContent = t.ready(nights, guests);
    resultBox.hidden = false;
    resultBox.classList.add("show");
  } else {
    resultBox.classList.remove("show");
    resultBox.hidden = true;
  }
};


if (form) {
  form.addEventListener("input", checkInputs);
}

  // =========================================================
  // METADATEN-HANDLING
  // =========================================================
  const originalPageTitle = document.title;
  // Speichern der ursprünglichen Meta-Werte beim Laden der Seite
  const originalMeta = {
    ogTitle: document.querySelector('meta[property="og:title"]')?.content,
    ogDescription: document.querySelector('meta[property="og:description"]')?.content,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    twitterTitle: document.querySelector('meta[property="twitter:title"]')?.content,
    twitterDescription: document.querySelector('meta[property="twitter:description"]')?.content,
    twitterImage: document.querySelector('meta[property="twitter:image"]')?.content,
    description: document.querySelector('meta[name="description"]')?.content
  };


  const updateMetaTagsForImage = (imageUrl, caption) => {
  console.log('[meta] updateMetaTagsForImage called', { imageUrl, caption });


  // Fallback: caption aus Dateinamen generieren, falls nicht vorhanden
  if (!caption && imageUrl) {
    try {
      const u = new URL(imageUrl, window.location.origin);
      caption = u.pathname.split('/').pop().replace(/\.(jpe?g|png|webp)$/i, '').replace(/[-_]/g, ' ');
    } catch {
      caption = caption || '';
    }
  }

  if (!imageUrl && !caption) {
    console.warn('[meta] Abbruch: weder imageUrl noch caption vorhanden');
    return;
  }

  // Absolute Bild-URL erzeugen
  const fullImageUrl = new URL(imageUrl, window.location.origin).href;


  // Titel und Beschreibung übersetzt erstellen
  const newTitle = translations[lang].metaTitle.replace('{caption}', caption || '');
  const newDescription = translations[lang].metaDescription.replace('{caption}', caption || '');
  updateJsonLdPrimaryImage(fullImageUrl,caption);

  // Seitentitel setzen
  document.title = newTitle;

  // Hauptmetadaten setzen
  setMeta('meta[name="description"]', newDescription);
  setMeta('meta[property="og:title"]', newTitle);
  setMeta('meta[property="og:description"]', newDescription);
  setMeta('meta[property="og:image"]', fullImageUrl);
  setMeta('meta[property="twitter:title"]', newTitle);
  setMeta('meta[property="twitter:description"]', newDescription);
  setMeta('meta[property="og:url"]', window.location.href);
  setMeta('meta[name="twitter:url"]', window.location.href);
  setMeta('meta[property="twitter:image"]', fullImageUrl);

  // ✅ Neu: primaryImageOfPage setzen
  setMeta('meta[itemprop="primaryImageOfPage"]', fullImageUrl);

  console.log('[meta] gesetzt ->', {
    title: newTitle,
    description: newDescription,
    image: fullImageUrl
  });
};

 const updateCanonicalTag = (newUrl) => {
  const head = document.head;
  let canonical = head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    head.appendChild(canonical);
  }

  // Bestimme die Ziel-URL (falls newUrl leer, nutze aktuelle Location)
  let target = '';
  if (!newUrl) {
    // Verwende pathname + search (kein Hash)
    const u = new URL(window.location.href);
    target = (u.pathname || '/') + (u.search || '');
  } else {
    try {
      // Wenn newUrl eine absolute oder relative URL ist, parsen
      const u = new URL(newUrl, window.location.origin);
      target = (u.pathname || '/') + (u.search || '');
    } catch (e) {
      // Fallback: als Pfad behandeln
      target = String(newUrl);
    }
  }

  // Normalisiere Pfad: führenden Slash sicherstellen, doppelte Slashes entfernen
  if (!target.startsWith('/')) target = '/' + target;
  target = target.replace(/\/{2,}/g, '/');

  // Falls kein Dateiname/Extension im Pfad vorhanden ist, sorge für einen abschließenden Slash
  // (vermeidet canonical ohne Slash auf Seiten wie "/highlights")
  const hasExtension = /\.[a-zA-Z0-9]{1,6}$/.test(target);
  if (!hasExtension && !target.endsWith('/')) {
    target = target + '/';
  }

  // Sprache / Host korrekt wählen
  const langPrefix = window.location.hostname.startsWith("en.")
    ? "https://en.ferienwohnung-parndorf.at"
    : "https://de.ferienwohnung-parndorf.at";

  const absUrl = langPrefix + target;
  canonical.setAttribute('href', absUrl);
  console.log('[meta] Canonical aktualisiert ->', absUrl);
};



function setMeta(selector, value) {
  if (!value) return; // Kein Wert → nichts setzen
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const match = selector.match(/\[(.*?)=(.*?)\]/);
    if (match) {
      const [_, attr, val] = match;
      el.setAttribute(attr, val.replace(/["']/g, ''));
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function getCurrentLang() {
  // Beispiel: URL = https://de.ferienwohnung-parndorf.at/region/neusiedlersee
  const host = window.location.hostname;
  if (host.startsWith('en.')) return 'en';
  return 'de'; // Standard
}

function updateMetaTagsForSection(arg) {
  const lang = getCurrentLang();

  // Wenn arg ein Pfad ist (beginnt mit '/'), nutze es als key
  let meta = null;
  if (typeof arg === 'string' && arg.startsWith('/')) {
    meta = metaDataMap[lang]?.[arg];
  }

  // Wenn kein Mapping gefunden, und arg ist ein Caption-Text, benutze die Caption-Fallback-Logik
  if (!meta && typeof arg === 'string') {
    const caption = arg; // z. B. "Anfahrt & Lage"
    const newTitle = translations[lang].metaTitle.replace('{caption}', caption);
    const newDescription = translations[lang].metaDescriptionSection.replace('{caption}', caption);

    document.title = newTitle;
    setMeta('meta[name="description"]', newDescription);
    setMeta('meta[property="og:title"]', newTitle);
    setMeta('meta[property="og:description"]', newDescription);

    // keep existing og:image if present
    const existingImage = document.querySelector('meta[property="og:image"]')?.content;
    if (existingImage) {
      setMeta('meta[property="og:image"]', existingImage);
      setMeta('meta[property="twitter:image"]', existingImage);
      setMeta('meta[itemprop="primaryImageOfPage"]', existingImage);
      updateJsonLdPrimaryImage(existingImage, caption);
    }

    setMeta('meta[property="og:url"]', window.location.href);
    updateAlternateLinks(window.location.pathname);
    return;
  }

  // Wenn ein meta-Mapping existiert, setze es (meta.image und meta.description optional)
  if (meta) {
    document.title = meta.title || document.title;
    if (meta.description) {
      setMeta('meta[name="description"]', meta.description);
      setMeta('meta[property="og:description"]', meta.description);
    }
    if (meta.image) {
      setMeta('meta[property="og:image"]', meta.image);
      setMeta('meta[property="twitter:image"]', meta.image);
      updateJsonLdPrimaryImage(meta.image, meta.title || '');
    }
    setMeta('meta[property="og:title"]', meta.title);
    setMeta('meta[property="og:url"]', window.location.href);
    updateAlternateLinks(window.location.pathname);
  }
}

// === hreflang-Alternate-Links ===
function updateAlternateLinks(path) {
  const baseDe = 'https://de.ferienwohnung-parndorf.at';
  const baseEn = 'https://en.ferienwohnung-parndorf.at';

  // Aktuelle Sprache ermitteln
  const isEn = window.location.hostname.startsWith("en.");

  // Pfade für BEIDE Sprachen berechnen
  let pathDe, pathEn;

  if (isEn) {
    // Wir sind auf Englisch -> Input 'path' ist Englisch
    pathEn = path;
    // Wir müssen für DE von En nach De übersetzen
    pathDe = translatePathClient(path, 'en->de');
  } else {
    // Wir sind auf Deutsch -> Input 'path' ist Deutsch
    pathDe = path;
    // Wir müssen für EN von De nach En übersetzen
    pathEn = translatePathClient(path, 'de->en');
  }

  // Helper für saubere Slashes
  const clean = (p) => {
    let s = p || '/';
    if (!s.startsWith('/')) s = '/' + s;
    if (!s.endsWith('/')) s = s + '/';
    return s === '/' ? '/' : s;
  };

  // remove old hreflang tags
  document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());

  const alternates = [
    { hreflang: 'de', href: baseDe + clean(pathDe) },
    { hreflang: 'en', href: baseEn + clean(pathEn) }
  ];

  alternates.forEach(({ hreflang, href }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    link.href = href;
    document.head.appendChild(link);
  });

  console.log('[meta] Alternates updated:', alternates);
}

// lightweight client-side translator (matching server dictionaries)
function translatePathClient(pathIn, direction) {
  // ensure leading slash and no trailing triple
  let p = pathIn || '/';
  // Pfad säubern
  p = p.replace(/\/+$/, ''); // Trailing slash weg für split
  if (!p.startsWith('/')) p = '/' + p;

  if (p === '/') return '/';

  const deToEn = {
    wohnzimmer: "livingroom",
    schlafzimmer: "bedroom",
    kueche: "kitchen",
    badezimmer: "bathroom",
    terrasse: "terrace",
    eingangsbereich: "entrance",
    ausstattung: "facilities",
    anfahrt: "directions",
    kontakt: "contact",
    region: "region",
    neusiedlersee: "neusiedlersee",
    outlet: "outlet",
    garten: "garden"
  };

  // Umkehr-Map erstellen
  const enToDe = Object.fromEntries(Object.entries(deToEn).map(([k, v]) => [v, k]));

  const parts = p.split('/').filter(Boolean); // Leere Teile entfernen

  const mapped = parts.map(seg => {
    const s = seg.toLowerCase();
    // Prüfen ob Übersetzung existiert, sonst Original behalten (z.B. bei Bildnamen "betten")
    if (direction === 'de->en') return deToEn[s] || s;
    if (direction === 'en->de') return enToDe[s] || s;
    return s;
  });

  return '/' + mapped.join('/');
}



  /**
   * Aktualisiert die Meta-Tags der Seite basierend auf dem aktiven Bild.
   * @param {string} imageUrl - Die URL des Bildes.
   * @param {string} caption - Die Bildunterschrift aus data-caption.
   */

function updateJsonLdPrimaryImage(imageUrl, caption = '') {
  // 1. Finde das JSON-LD Skript-Tag
  const script = document.getElementById('unified-schema');
  if (!script) {
    console.warn('[JSON-LD] Konnte <script id="unified-schema"> nicht finden.');
    return;
  }

  let schemas = [];
  try {
    // 2. Lese und parse das aktuelle JSON
    schemas = JSON.parse(script.textContent);
    if (!Array.isArray(schemas)) schemas = [schemas];
  } catch (e) {
    console.error('Fehler beim Parsen des JSON-LD-Schemas:', e);
    return; // Abbruch bei ungültigem JSON
  }

  // 3. Finde das 'WebPage'-Schema
  let webpageSchema = schemas.find(s => s['@type'] === 'WebPage');

  // 4. (NEU) Falls kein WebPage-Schema existiert, erstelle eines
  if (!webpageSchema) {
    console.warn('[JSON-LD] "WebPage"-Schema nicht gefunden. Erstelle ein Neues.');
    webpageSchema = {
      "@type": "WebPage",
      "url": window.location.href, // Nimm die aktuelle URL
      "name": document.title // Nimm den aktuellen Titel
    };
    schemas.push(webpageSchema); // Füge es dem Array hinzu
  }

  // 5. (NEU) Erstelle das ImageObject mit URL und Caption
  const imageObject = {
    "@type": "ImageObject",
    "url": imageUrl
  };

  // Füge die Caption nur hinzu, wenn sie vorhanden ist
  if (caption && caption.trim() !== '') {
    imageObject.caption = caption.trim();
  }

  // 6. Setze das ImageObject als primaryImageOfPage
  webpageSchema.primaryImageOfPage = imageObject;

  // 7. Schreibe das aktualisierte JSON zurück in das Skript-Tag
  script.textContent = JSON.stringify(schemas, null, 2);
  console.log('[JSON-LD] primaryImageOfPage (im WebPage-Objekt) aktualisiert ->', imageUrl, 'mit Caption:', caption || 'Keine');
}



const resetMetaTags = () => {
  console.log('[meta] resetMetaTags called');

  document.title = originalPageTitle;

  const setIfExists = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute('content', value);
  };

  // Ursprüngliche Meta-Tags wiederherstellen
  setIfExists('meta[name="description"]', originalMeta.description);
  setIfExists('meta[property="og:title"]', originalMeta.ogTitle);
  setIfExists('meta[property="og:description"]', originalMeta.ogDescription);
  setIfExists('meta[property="og:image"]', originalMeta.ogImage);
  setIfExists('meta[property="twitter:title"]', originalMeta.twitterTitle);
  setIfExists('meta[property="twitter:description"]', originalMeta.twitterDescription);
  setIfExists('meta[property="twitter:image"]', originalMeta.twitterImage);

  // ✅ primaryImageOfPage sauber zurücksetzen (Fallback: og:image)
  const primary = document.querySelector('meta[itemprop="primaryImageOfPage"]');
  if (primary) {
    primary.setAttribute('content', originalMeta.ogImage || '');
  } else if (originalMeta.ogImage) {
    const newMeta = document.createElement('meta');
    newMeta.setAttribute('itemprop', 'primaryImageOfPage');
    newMeta.setAttribute('content', originalMeta.ogImage);
    document.head.appendChild(newMeta);
  }

  // Canonical & Alternate Links aktualisieren
  updateCanonicalTag(window.location.pathname);
  updateAlternateLinks(window.location.pathname);

  console.log('[meta] zurückgesetzt ->', {
    description: originalMeta.description,
    image: originalMeta.ogImage
  });
  updateJsonLdPrimaryImage(originalMeta.ogImage || '');
};


  // =========================================================
  // GALLERIES (muss vor Slideshow deklariert sein)
  // =========================================================
  const allImages = [
    "wohnzimmer.webp",
    "schlafzimmer.webp",
    "betten.webp",
    "bett_kasten.webp",
    "kueche.webp",
    "essbereich.webp",
    "badezimmer.webp",
    "wc.webp",
    "terrasse.webp",
    "garten.webp",
    "eingangsbereich.webp"
  ];

  


  // =========================================================
  // 1. Slideshow (nur Vorschau)
  // =========================================================
  if (mainSlideshowContainer) {
    const slides = mainSlideshowContainer.querySelectorAll('.slide');
    const btnPrev = mainSlideshowContainer.querySelector('.btn-prev');
    const btnNext = mainSlideshowContainer.querySelector('.btn-next');
    const dotsContainer = mainSlideshowContainer.querySelector('.dots-container');





    // Klick auf Slides → Router öffnen
    slides.forEach((slide, i) => {
      const img = slide.querySelector('img');

      // Caption (Prio: data-caption > slide-caption > alt)
      const caption =
        img?.dataset.caption ||
        slide.querySelector('.slide-caption')?.textContent ||
        img?.alt ||
        '';

      // Bild-Basename als "slug"
      const src = (img.getAttribute('src') || '').toLowerCase();
      const srcBase = src.split('/').pop() || '';
      const imageKey = stripExt(srcBase);

      // galleryKey ermitteln (wie bisher)
      let galleryKey = (img.alt || '').toLowerCase();
      galleryKey = stripExt(galleryKey);
      if (!galleryKey) {
        for (const [gk, imgs] of Object.entries(galleries)) {
          if (imgs.some(s => stripExt(s.toLowerCase()) === imageKey.toLowerCase())) {
            galleryKey = gk;
            break;
          }
        }
      }

      const url = galleryKey ? `/${galleryKey}/${imageKey}` : `/${imageKey}`;

      // jetzt echten Link erzeugen
      const dot = document.createElement('a');
      dot.classList.add('dot');
      dot.href = url;
      dot.title = caption;
      dot.setAttribute('data-link', '');
      dot.setAttribute('aria-label', caption); // für Screenreader

      // Klick abfangen → interne Navigation statt echter Reload
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        showSlide(i);
        resetInterval();
        history.pushState({ popupScope: 'global' }, '', url);
        handleRoute(false);
      });

      slide.addEventListener('click', (e) => {
        e.preventDefault();
        showSlide(i); // Ensure the correct slide is active
        resetInterval();
        history.pushState({ popupScope: 'global' }, '', url);
        handleRoute(false);
      });

      dotsContainer.appendChild(dot);
    });

    btnNext?.addEventListener('click', () => { nextSlide(); resetInterval(); });
    btnPrev?.addEventListener('click', () => { prevSlide(); resetInterval(); });

    showSlide(0);
    startInterval();
  }

  // =========================================================
  // 2. Router + Galerie-Popup
  // =========================================================
  const photoPopup = document.getElementById("photo-popup");
  const popupImagesContainer = photoPopup?.querySelector(".popup-images");
  const photoPopupCloseBtn = photoPopup?.querySelector(".popup-close");
  const photoPopupPrevBtn = photoPopup?.querySelector(".prev");
  const photoPopupNextBtn = photoPopup?.querySelector(".next");

  let currentGalleryImages = [];
  let currentGalleryIndex = 0;

const updateUrlForCurrentImage = () => {
  const currentSrc = currentGalleryImages[currentGalleryIndex];
  if (!currentSrc) return;

  const imageKey = stripExt(currentSrc.split('/').pop().toLowerCase());

  let galleryKey = null;
  for (const [gk, imgs] of Object.entries(galleriesActive)) {
    if (imgs.some(s => stripExt(s.toLowerCase()) === imageKey)) {
      galleryKey = gk;
      break;
    }
  }

  const newUrl = galleryKey ? `/${galleryKey}/${imageKey}` : `/${imageKey}`;
  history.replaceState({ popupScope: 'global' }, null, newUrl);
};

  const popupCaption = photoPopup?.querySelector(".popup-caption");

  const renderGallery = () => {
  console.log('[gallery] renderGallery called', { currentGalleryImagesLength: currentGalleryImages.length, currentGalleryIndex });

  if (!popupImagesContainer) {
    console.warn('[gallery] popupImagesContainer ist null — Popup-Element nicht gefunden');
    return;
  }
  popupImagesContainer.innerHTML = "";

  // helper: finde Originalbild in #fotogallerie nach Basename (robuster als attribute selector)
  const findOriginalImgByBasename = (basename) => {
    const list = Array.from(document.querySelectorAll('#fotogallerie img'));
    const targetBase = basename.split('/').pop().toLowerCase();
    return list.find(imgEl => {
      const srcAttr = (imgEl.getAttribute('src') || '').split('/').pop().toLowerCase();
      return srcAttr === targetBase;
    }) || null;
  };

  currentGalleryImages.forEach((src, idx) => {
    const img = document.createElement("img");
    img.src = src.startsWith("/") ? src : IMAGE_BASE_PATH + src;
    img.alt = stripExt(src);

    const originalImg = findOriginalImgByBasename(src);
    if (originalImg?.dataset?.caption) {
      img.dataset.caption = originalImg.dataset.caption;
    } else {
      img.dataset.caption = img.alt.replace(/_/g, " ");
    }

    if (idx === currentGalleryIndex) img.classList.add("active");
    popupImagesContainer.appendChild(img);
  });

  const activeImg = popupImagesContainer.querySelector("img.active");
  if (activeImg) {
    const captionText = (activeImg.dataset.caption || activeImg.alt || '').trim();
    if (popupCaption) popupCaption.textContent = captionText;
    console.log('[gallery] activeImg:', { src: activeImg.src, captionText });
    updateMetaTagsForImage(activeImg.src, captionText);
    updateAlternateLinks(window.location.pathname);

    

  } else {
    console.warn('[gallery] kein activeImg gefunden — MetaUpdate übersprungen');
  }
};


function openGlobalImage(imageFilename) {
  // Den Galerie-Key finden, zu dem dieses Bild gehört
  let galleryKey = null;
  for (const [gk, imgs] of Object.entries(galleriesActive)) {
    if (imgs.some(s => stripExt(s) === stripExt(imageFilename))) {
      galleryKey = gk;
      break;
    }
  }

  // Wenn keine Galerie gefunden, abbrechen
  if (!galleryKey) {
    console.warn('[gallery] Kein galleryKey für', imageFilename);
    return;
  }

  // Galerie setzen und Index bestimmen
  currentGalleryImages = galleriesActive[galleryKey].map(img => IMAGE_BASE_PATH + img);
  currentGalleryIndex = currentGalleryImages.findIndex(
    s => stripExt(s.split('/').pop()) === stripExt(imageFilename)
  );

  // Popup bleibt offen – nur Inhalt neu rendern
  renderGallery();
  updateUrlForCurrentImage();
}

    const openPhotoPopup = (updateUrl = false) => {
    if (currentGalleryImages.length === 0) return;
    renderGallery();
    // Nur die URL aktualisieren, wenn explizit gefordert (z.B. bei Initialaufruf mit Bild)
    if (updateUrl) {
      updateUrlForCurrentImage();
    }
    photoPopup?.classList.add('open');
    document.body.classList.add('popup-is-open', 'no-scroll');
  };

  const closePhotoPopup = (updateHistory = true) => {
    photoPopup?.classList.remove('open');
    document.body.classList.remove('popup-is-open', 'no-scroll');
    resetMetaTags();
    updateCanonicalTag(window.location.pathname);
    updateAlternateLinks(window.location.pathname);


    if (updateHistory) history.pushState(null, null, '/#main');
  };

  photoPopupNextBtn?.addEventListener("click", () => {
  if (!allImages.length) return;

  // Aktuelles Bild bestimmen
  const currentSrc = currentGalleryImages[currentGalleryIndex];
  const currentBase = stripExt(currentSrc.split('/').pop().toLowerCase());

  // Index im globalen Array finden
  let globalIndex = allImages.findIndex(
    img => stripExt(img.toLowerCase()) === currentBase
  );

  // Nächstes globales Bild (mit Wrap-Around)
  globalIndex = (globalIndex + 1) % allImages.length;

  const nextImage = allImages[globalIndex];
  openGlobalImage(nextImage);
});

photoPopupPrevBtn?.addEventListener("click", () => {
  if (!allImages.length) return;

  const currentSrc = currentGalleryImages[currentGalleryIndex];
  const currentBase = stripExt(currentSrc.split('/').pop().toLowerCase());

  let globalIndex = allImages.findIndex(
    img => stripExt(img.toLowerCase()) === currentBase
  );

  globalIndex = (globalIndex - 1 + allImages.length) % allImages.length;

  const prevImage = allImages[globalIndex];
  openGlobalImage(prevImage);
});

  photoPopupCloseBtn?.addEventListener("click", () => closePhotoPopup(true));
  photoPopup?.addEventListener("click", e => e.target === photoPopup && closePhotoPopup(true));


  // === NEU: Pfeiltasten-Navigation für die Galerie ===
document.addEventListener('keydown', (e) => {
  // Prüfen, ob das Pop-up überhaupt offen ist
  if (!photoPopup?.classList.contains('open')) {
    return; // Wenn nicht, nichts tun
  }

  // Wenn "Pfeil nach links" gedrückt wird
  if (e.key === 'ArrowLeft') {
    photoPopupPrevBtn?.click(); // Simuliere einen Klick auf den "Zurück"-Button
  }

  // Wenn "Pfeil nach rechts" gedrückt wird
  if (e.key === 'ArrowRight') {
    photoPopupNextBtn?.click(); // Simuliere einen Klick auf den "Weiter"-Button
  }
});

function openGlobalImage(imageFilename) {
  // Den Galerie-Key finden, zu dem dieses Bild gehört
  let galleryKey = null;
  for (const [gk, imgs] of Object.entries(galleriesActive)) {
    if (imgs.some(s => stripExt(s) === stripExt(imageFilename))) {
      galleryKey = gk;
      break;
    }
  }

  // Wenn keine Galerie gefunden, abbrechen
  if (!galleryKey) {
    console.warn('[gallery] Kein galleryKey für', imageFilename);
    return;
  }

  // Galerie setzen und Index bestimmen
  currentGalleryImages = galleriesActive[galleryKey].map(img => IMAGE_BASE_PATH + img);
  currentGalleryIndex = currentGalleryImages.findIndex(
    s => stripExt(s.split('/').pop()) === stripExt(imageFilename)
  );

  // Popup bleibt offen – nur Inhalt neu rendern
  renderGallery();
  updateUrlForCurrentImage();
}


const metaDataMap = {
  de: {
    '/': {
      title: 'Ferienwohnung Parndorf – Ihr Zuhause am Neusiedler See',
      description: 'Entdecken Sie unsere komfortable Ferienwohnung in Parndorf – ideal gelegen zwischen Outlet und Neusiedler See.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/wohnzimmer.webp'
    },
    '/wohnzimmer': {
      title: 'Wohnzimmer – Ferienwohnung Parndorf',
      description: 'Gemütliches Wohnzimmer mit bequemer Couch – Ihr Rückzugsort in Parndorf.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/wohnzimmer.webp'
    },
    '/schlafzimmer': {
      title: 'Schlafzimmer – Ferienwohnung Parndorf',
      description: 'Erholsamer Schlaf in stilvollem Ambiente – entdecken Sie unser Schlafzimmer.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/schlafzimmer.webp'
    },
    '/kueche': {
      title: 'Küche & Essbereich – Ferienwohnung Parndorf',
      description: 'Voll ausgestattete Küche und Essbereich für gemütliche Mahlzeiten in Parndorf.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/kueche.webp'
    },
    '/badezimmer': {
      title: 'Badezimmer – Ferienwohnung Parndorf',
      description: 'Modernes Badezimmer mit Dusche und WC – Wohlfühlen leicht gemacht.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/badezimmer.webp'
    },
    '/terrasse': {
      title: 'Terrasse & Garten – Ferienwohnung Parndorf',
      description: 'Entspannen Sie im Garten oder genießen Sie Ihren Kaffee auf der sonnigen Terrasse.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/terrasse.webp'
    },
    '/eingangsbereich': {
      title: 'Eingangsbereich – Ferienwohnung Parndorf',
      description: 'Herzlich willkommen! Einladender Eingangsbereich für Ihren Aufenthalt.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/eingangsbereich.webp'
    },
    '/ausstattung': {
      title: 'Ausstattung – Ferienwohnung Parndorf',
      description: 'Alle Details zur Ausstattung: WLAN, Küche, Terrasse, Parkplatz, und mehr.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/wohnzimmer.webp'
    },
    '/anfahrt': {
      title: 'Anfahrt & Lage – Ferienwohnung Parndorf',
      description: 'So finden Sie uns – zentrale Lage zwischen Neusiedler See und Outlet-Center.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/map.webp'
    },
    '/kontakt': {
      title: 'Kontakt – Ferienwohnung Parndorf',
      description: 'Kontaktieren Sie uns für Buchungen oder Fragen zur Unterkunft.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/kontakt.webp'
    },
    '/region/neusiedlersee': {
      title: 'Region Neusiedler See – Ausflugsziele & Aktivitäten',
      description: 'Alles über den Neusiedler See: Sehenswürdigkeiten, Natur, Freizeit und Tipps für Ihren Aufenthalt in Parndorf.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/region-neusiedlersee.jpg'
    },
    '/region/outlet': {
      title: 'Designer Outlet Parndorf – Shopping & Lifestyle',
      description: 'Nur 2 km vom Apartment entfernt: Designer Outlet Parndorf mit über 160 Shops.',
      image: 'https://de.ferienwohnung-parndorf.at/assets/images/outlet.webp'
    }
  },
  en: {
    '/': {
      title: 'Holiday Apartment Parndorf – Your Home at Lake Neusiedl',
      description: 'Discover our cozy apartment in Parndorf – perfectly located between the outlet center and Lake Neusiedl.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/wohnzimmer.webp'
    },
    '/livingroom': {
      title: 'Living Room – Holiday Apartment Parndorf',
      description: 'Cozy living room with a comfortable couch – your retreat in Parndorf.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/wohnzimmer.webp'
    },
    '/bedroom': {
      title: 'Bedroom – Holiday Apartment Parndorf',
      description: 'Relax and unwind in our stylish bedroom.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/schlafzimmer.webp'
    },
    '/kitchen': {
      title: 'Kitchen & Dining Area – Holiday Apartment Parndorf',
      description: 'Fully equipped kitchen and dining area for your stay in Parndorf.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/kueche.webp'
    },
    '/bathroom': {
      title: 'Bathroom – Holiday Apartment Parndorf',
      description: 'Modern bathroom with shower and toilet.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/badezimmer.webp'
    },
    '/terrace': {
      title: 'Terrace & Garden – Holiday Apartment Parndorf',
      description: 'Enjoy breakfast on the sunny terrace or relax in the garden.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/terrasse.webp'
    },
    '/entrance': {
      title: 'Entrance – Holiday Apartment Parndorf',
      description: 'Welcome area of the apartment – feel at home.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/eingangsbereich.webp'
    },
    '/facilities': {
      title: 'Facilities – Holiday Apartment Parndorf',
      description: 'All apartment amenities: WiFi, kitchen, terrace, parking, and more.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/wohnzimmer.webp'
    },
    '/directions': {
      title: 'Directions & Location – Holiday Apartment Parndorf',
      description: 'Find us easily – between Lake Neusiedl and the Designer Outlet.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/map.webp'
    },
    '/contact': {
      title: 'Contact – Holiday Apartment Parndorf',
      description: 'Contact us for booking or inquiries.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/kontakt.webp'
    },
    '/region/neusiedlersee': {
      title: 'Lake Neusiedl Region – Sights & Activities',
      description: 'All about Lake Neusiedl: attractions, nature, leisure, and travel tips.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/region-neusiedlersee.jpg'
    },
    '/region/outlet': {
      title: 'Designer Outlet Parndorf – Shopping & Lifestyle',
      description: 'Just 2 km away – 160 designer shops for the perfect shopping experience.',
      image: 'https://en.ferienwohnung-parndorf.at/assets/images/outlet.webp'
    }
  }
};

  // =========================================================
  // Router-Logik (robust)
  // =========================================================
 const handleRoute = (isInitial = false) => {
    updateCanonicalTag(window.location.pathname);
    const rawPath = window.location.pathname || "";
    const cleaned = rawPath.replace(/^\/+|\/+$/g, ""); // "anfahrt", "wohnzimmer", "wohnzimmer/kueche", "region/outlet"
    const hash = (window.location.hash || "").replace(/^#/, "");
    const t = translations[lang]; // Übersetzungen holen

    // 1. Handle Hashes (e.g., /#anfahrt)
    // Dieser Fall tritt auf, wenn ein Link #anfahrt geklickt wird, der *kein* data-link ist (z.B. Scroll-Spy)
    if (hash && cleaned === "") {
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        if (!isInitial) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        // Metatags für Hash-Links aktualisieren
        const metaCaption = t.sectionMeta[hash] || t.sectionMeta['highlights']; // Fallback
        updateMetaTagsForSection(metaCaption);
        return;
      }
    }

    const parts = cleaned.split("/").filter(Boolean);
    const galleryKeyRaw = parts[0] ? stripExt(parts[0].toLowerCase()) : "";
    const imageKeyRaw = parts[1] ? stripExt(parts[1].toLowerCase()) : "";
    const galleryKeys = Object.keys(galleriesActive);

    // 2. Handle Gallery Routes (e.g., /wohnzimmer or /wohnzimmer/wohnzimmer)
    if (galleryKeyRaw && galleryKeys.includes(galleryKeyRaw)) {
      if (!isInitial) {
        const fotosSection = document.getElementById("fotogallerie");
        fotosSection?.scrollIntoView({ behavior: "smooth" });
      }

      currentGalleryImages = galleriesActive[galleryKeyRaw].slice();
      const shouldUpdateUrl = !!imageKeyRaw;

      if (!imageKeyRaw) {
        currentGalleryIndex = 0;
      } else {
        const matchIndex = currentGalleryImages.findIndex(
          s => stripExt(s).toLowerCase() === imageKeyRaw.toLowerCase()
        );
        currentGalleryIndex = matchIndex >= 0 ? matchIndex : 0;
      }

      openPhotoPopup(shouldUpdateUrl); // Diese Funktion ruft updateMetaTagsForImage()
      return;
    }

    // 3. Handle Non-Gallery Routes (Sections)
    // If popup is open from a previous gallery route, close it.
    if (photoPopup?.classList.contains('open')) {
      closePhotoPopup(false); // false = don't update history, we're already on the new URL
    }

    let targetSectionId = null;
    let metaCaption = null; // For updating meta tags

    if (galleryKeyRaw === "region") { // /region, /region/outlet, /region/neusiedlersee
      targetSectionId = "region1"; // Die ID der Sektion
      const regionKey = parts[1] || 'default'; // 'outlet', 'neusiedlersee', or 'default'
      metaCaption = t.regionMeta[regionKey] || t.regionMeta.default;

    } else if (galleryKeyRaw === "whatsapp") {
      waWidget?.classList.add("open");
      metaCaption = t.sectionMeta['kontakt']; // Meta-Tag für Kontakt setzen
      // Kein Scrollen, da Widget öffnet

    } else {
      // Default case: Check if the path matches an ID (e.g., /anfahrt, /ausstattung)
      const el = document.getElementById(galleryKeyRaw);
      if (el) {
        targetSectionId = galleryKeyRaw;
        metaCaption = t.sectionMeta[targetSectionId] || t.sectionMeta['highlights'];
      }
    }

    // 4. Perform Scroll (if a target was found)
    if (targetSectionId) {
      if (!isInitial) {
        const targetEl = document.getElementById(targetSectionId);
        targetEl?.scrollIntoView({ behavior: "smooth" });
      }

      // 5. Update Meta Tags for this section
      updateMetaTagsForSection(metaCaption);

    } else if (cleaned === "" || cleaned === "highlights" || !galleryKeyRaw) {
       // Scrolled to homepage (/)
       if (!isInitial) window.scrollTo({ top: 0, behavior: 'smooth' });
       resetMetaTags(); // Reset to default
    }

    // 6. Update Active Nav Links
    document.querySelectorAll('.main-nav a[data-link]').forEach(link => {
      const hrefAttr = (link.getAttribute("href") || "").replace(/^\/+|\/+$/g, "");
      const linkKey = hrefAttr.split("/")[0]; // Nur den ersten Teil vergleichen (z.B. 'wohnzimmer')
      link.classList.toggle("active", linkKey === galleryKeyRaw || hrefAttr === galleryKeyRaw);
    });
  };

  // =========================================================
  // globaler Klick-Handler für SPA-Links (robust normalisieren)
  // =========================================================
  document.addEventListener("click", e => {
    if (e.target.closest('.slideshow-container') || e.target.closest('#photo-popup')) return;

    const link = e.target.closest("a[data-link]");
    if (!link) return;

    let hrefAttr = link.getAttribute("href") || '/';

    if (hrefAttr.startsWith("#")) {
      e.preventDefault();
      const targetId = hrefAttr.replace("#", "");
      const targetEl = document.getElementById(targetId);
      targetEl?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    e.preventDefault();

    let hrefPath = hrefAttr;
    try {
      if (/^https?:\/\//i.test(hrefAttr)) {
        const u = new URL(hrefAttr);
        hrefPath = u.pathname + (u.hash || '');
      } else {
        if (!hrefPath.startsWith('/')) hrefPath = '/' + hrefPath;
      }
    } catch (err) {
      if (!hrefPath.startsWith('/')) hrefPath = '/' + hrefPath;
    }



    history.pushState(null, null, hrefPath);
    handleRoute(false);
  });

  window.addEventListener("popstate", () => handleRoute(false));
  handleRoute(true);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (photoPopup?.classList.contains('open')) {
        closePhotoPopup(true);
      }

      const burgerMenu = document.querySelector(".main-nav");
      // Ruft jetzt direkt die zentrale Funktion auf
      if (burgerMenu?.classList.contains("open")) {
        closeBurgerMenu();
      }
    }
  });

  // =========================================================
  // Burger-Menü Toggle
  // =========================================================
  const burgerToggle = document.getElementById("burger-toggle");
  const burgerClose = document.getElementById("burger-close");
  const burgerMenu = document.querySelector(".main-nav");

  let overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  let navOverlay = document.querySelector('.nav-overlay');
if (!navOverlay) {
  navOverlay = document.createElement('div');
  navOverlay.classList.add('nav-overlay');
  document.body.appendChild(navOverlay);
}

  function openMenu() {
  burgerMenu.classList.remove('closing');
  burgerMenu.classList.add('open');
  overlay.classList.add('visible');
  document.body.classList.add('no-scroll');
}

function closeMenu() {
  // Weicher Ausblende-Effekt
  burgerMenu.classList.remove('open');
  burgerMenu.classList.add('closing');
  overlay.classList.remove('visible');
  document.body.classList.remove('no-scroll');

  // Nach Ende der Animation: Zustand zurücksetzen
  burgerMenu.addEventListener('animationend', function handleClose() {
    burgerMenu.classList.remove('closing');
    burgerMenu.removeEventListener('animationend', handleClose);
  });
}

  burgerToggle?.addEventListener('click', openMenu);
  burgerClose?.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);


// NEU: Zentrale Funktion zum Schließen des Menüs
  function closeBurgerMenu() {
    if (burgerMenu?.classList.contains("open")) {
      burgerMenu.classList.remove("open");
      // Nur no-scroll entfernen, wenn das Foto-Popup nicht gleichzeitig offen ist
      if (!document.body.classList.contains('popup-is-open')) {
        document.body.classList.remove("no-scroll");
      }
    }
  }




 if (burgerToggle && burgerMenu) {
    burgerToggle.addEventListener("click", () => {
      burgerMenu.classList.add("open");
      document.body.classList.add("no-scroll");
    });
  }

  // Bestehende Events verwenden jetzt die neue Funktion
  if (burgerClose) {
    burgerClose.addEventListener("click", closeBurgerMenu);
  }

  if (burgerMenu) {
    burgerMenu.querySelectorAll("a[data-link]").forEach(link => {
      link.addEventListener("click", closeBurgerMenu);
    });
  }

  // NEU: Schließt das Menü, wenn außerhalb geklickt wird
  document.addEventListener('click', (e) => {
    // Prüfen, ob das Menü überhaupt offen ist
    if (!burgerMenu.classList.contains('open')) {
      return;
    }

    // Prüfen, ob der Klick weder das Menü selbst noch der Öffnen-Button war
    const isClickInsideMenu = burgerMenu.contains(e.target);
    const isClickOnToggle = burgerToggle.contains(e.target);

    if (!isClickInsideMenu && !isClickOnToggle) {
      closeBurgerMenu();
    }
  });

  if (window.lucide) {
    lucide.createIcons();
  }
  updateCanonicalTag(window.location.pathname);
  updateAlternateLinks(window.location.pathname);

  window.addEventListener('blur', () => clearInterval(slideInterval));
window.addEventListener('focus', () => startInterval());


(function generateMultilangUnifiedSchema() {
  const hostname = window.location.hostname;
  const lang = hostname.startsWith("en.") ? "en" : "de";
  const baseUrl = window.location.origin;

  // --- 1️⃣ Aktuelle Pfade und Titel aus Navigation ---
  const pathParts = window.location.pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

  const linkTitles = {};
  document.querySelectorAll("a[data-link]").forEach(a => {
    const href = a.getAttribute("href")?.replace(/^\/+|\/+$/g, "");
    const text = a.textContent.trim();
    if (href && text) linkTitles[href.toLowerCase()] = text;
  });

  // --- 2️⃣ Sprachübergreifende Bezeichnungen ---
  const titles = {
    wohnzimmer: { de: "Wohnzimmer", en: "Living Room" },
    schlafzimmer: { de: "Schlafzimmer", en: "Bedroom" },
    kueche: { de: "Küche", en: "Kitchen" },
    badezimmer: { de: "Badezimmer", en: "Bathroom" },
    terrasse: { de: "Terrasse", en: "Terrace" },
    eingangsbereich: { de: "Eingangsbereich", en: "Entrance" },
    ausstattung: { de: "Ausstattung", en: "Facilities" },
    anfahrt: { de: "Anfahrt", en: "Directions" },
    kontakt: { de: "Kontakt", en: "Contact" },
    highlights: { de: "Highlights", en: "Highlights" }
  };

  // --- 3️⃣ BreadcrumbList erzeugen ---
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": {
        "@value": lang === "en" ? "Home" : "Startseite",
        "@language": lang
      },
      "item": `${baseUrl}/`
    }
  ];

  let cumulativePath = "";
  pathParts.forEach((part, i) => {
    cumulativePath += "/" + part;
    const key = part.toLowerCase();

    const labelDe = linkTitles[key] || titles[key]?.de || part;
    const labelEn = titles[key]?.en || labelDe;

    const localizedName = {
      "@value": lang === "en" ? labelEn : labelDe,
      "@language": lang
    };

    breadcrumbItems.push({
      "@type": "ListItem",
      "position": i + 2,
      "name": localizedName,
      "item": `${baseUrl}${cumulativePath}/`
    });
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };

  // --- 4️⃣ Bestehendes Schema (LodgingBusiness) suchen ---
  const existingScripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
  );

  let combinedSchemas = [];

  for (const script of existingScripts) {
    try {
      const json = JSON.parse(script.textContent);
      if (Array.isArray(json)) combinedSchemas.push(...json);
      else combinedSchemas.push(json);
    } catch {
      console.warn("[schema] Fehler beim Lesen eines JSON-LD-Blocks – ignoriert.");
    }
  }

  // --- 5️⃣ Schemas zusammenführen ---
  const hasBreadcrumb = combinedSchemas.some(s => s["@type"] === "BreadcrumbList");
  if (!hasBreadcrumb) combinedSchemas.push(breadcrumbSchema);

  // --- 6️⃣ WebPage Schema sicherstellen und primaryImageOfPage setzen ---
  const activeOgImage = document.querySelector('meta[property="og:image"]')?.content;
  if (activeOgImage) {
    let webpageSchema = combinedSchemas.find(s => s["@type"] === "WebPage");
    if (!webpageSchema) {
      webpageSchema = {
          "@context": "https://schema.org", // <<< HIER HINZUGEFÜGT
          "@type": "WebPage",
          "url": window.location.href,
          "name": document.title
      };
      combinedSchemas.push(webpageSchema);
    }
    webpageSchema.primaryImageOfPage = {
      "@context": "https://schema.org", // <<< HIER HINZUGEFÜGT
      "@type": "ImageObject",
      "url": activeOgImage
    };
    console.log("[schema] Initial primaryImageOfPage gesetzt ->", activeOgImage);
  }

  // --- 7️⃣ Altes Skript entfernen und neues, kombiniertes Skript erstellen ---
  existingScripts.forEach(s => s.remove());
  const unifiedScript = document.createElement("script");
  unifiedScript.type = "application/ld+json";
  unifiedScript.id = "unified-schema";
  unifiedScript.textContent = JSON.stringify(combinedSchemas, null, 2);
  document.head.appendChild(unifiedScript);

  console.log(`[schema] Mehrsprachiges kombiniertes Schema (${lang}) erstellt:`, combinedSchemas);
})();



}); // DOMContentLoaded end

// =========================================================
// Header slideshow + sticky header (keine Änderungen nötig)
// =========================================================
const headerSlides = document.querySelectorAll('.header-slide');
if (headerSlides.length > 1) {
  let currentHeaderIndex = 0;
  const showHeaderSlide = (index) => {
    headerSlides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  };
  showHeaderSlide(0);
  setInterval(() => {
    currentHeaderIndex = (currentHeaderIndex + 1) % headerSlides.length;
    showHeaderSlide(currentHeaderIndex);
  }, 6000);
}



document.getElementById('load-streetview-btn')?.addEventListener('click', function () {
  const container = document.getElementById('map-placeholder-streetview');
   document.getElementById('map-placeholder-streetview').classList.add('loaded');


  // Entfernt nur das Overlay & Vorschaubild im Streetview-Container
  container.querySelectorAll('.map-overlay, img')?.forEach(el => el.remove());

  // Neues Iframe erzeugen
  const iframe = document.createElement('iframe');
  iframe.src = "https://www.google.com/maps/embed?pb=!4v1759240459840!6m8!1m7!1s2npPsX99OT31Kcon7JxnWQ!2m2!1d48.00060897249904!2d16.8641309679439!3f5.598648!4f0!5f0.7820865974627469";
  iframe.loading = "lazy";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.style.border = "0";
  iframe.width = "100%";
  iframe.height = "400";

  // In Container einfügen
  container.appendChild(iframe);
});



const loadMapBtn = document.getElementById('load-map-btn');
const mapPlaceholder = document.getElementById('map-placeholder');
const mapContainer = document.getElementById('map');

if (loadMapBtn && mapPlaceholder && mapContainer) {
  window.initMap = () => {
    const location = { lat: 48.0007115, lng: 16.8640465 };
    const map = new google.maps.Map(mapContainer, {
      zoom: 15,
      center: location,
      disableDefaultUI: true,
      mapId: "1f521e152f97485fa96f0a37"
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="max-width:280px; font-family:'Poppins',sans-serif;">
          <h3 style="margin:0 0 5px;color:#004d40;">
            <a href="https://maps.app.goo.gl/A3TWeZ5z6dYmZaf88"
               target="_blank" rel="noopener noreferrer">
               Ferienwohnung Parndorf
            </a>
          </h3>
          <p style="margin:0 0 10px;font-size:14px;">
            Obere Wunkau 38, 7111 Parndorf
          </p>
          <a href="https://www.google.com/maps/dir//Ferienwohnung+Parndorf,+Obere+Wunkau+38,+7111+Parndorf/@48.0006701,16.861591,17z"
             target="_blank" rel="noopener noreferrer"
             style="color:#0071c2;text-decoration:none;font-weight:bold;">
             Route planen
          </a>
        </div>`
    });

    const marker = new (google.maps.marker?.AdvancedMarkerElement || google.maps.Marker)({
      position: location,
      map,
      title: "Ferienwohnung Parndorf",
    });

    marker.addListener("click", () => infoWindow.open(map, marker));
    infoWindow.open(map, marker);

    // Nur Overlay + Vorschaubild entfernen (nicht den Container)
    mapPlaceholder.querySelectorAll('.map-overlay, img')?.forEach(el => el.remove());

    // Sichtbar machen, falls vorher versteckt
    mapContainer.style.display = 'block';
    mapPlaceholder.classList.add('loaded');
  };

  loadMapBtn.addEventListener('click', () => {
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
            script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAj3BUffMoTz7XsXEjJvnO-CBQq9oDQ4AA&callback=initMap&v=beta&libraries=marker";

      script.async = true;
      document.head.appendChild(script);
      loadMapBtn.disabled = true;
    } else {
      initMap();
    }
  });
}

// =========================================================
// 5. Sticky Header beim Scrollen
// =========================================================
const header = document.querySelector('header');
if (header) {
  const toggleSticky = () => {
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  };
  window.addEventListener('scroll', () => {
  window.requestAnimationFrame(toggleSticky);
});
  toggleSticky();
}




// =========================================================
// Lazy Loading für Header-Bilder (verbesserte Version)
// =========================================================
const lazyHeaderSlides = document.querySelectorAll('.header-slide[data-bg]');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const bgUrl = el.getAttribute('data-bg');
        if (bgUrl) {
          // Preload, um Sprünge zu vermeiden
          const img = new Image();
          img.src = bgUrl;
          img.onload = () => {
            el.style.backgroundImage = `url('${bgUrl}')`;
            el.classList.add('loaded'); // optional für Fade-In
          };
          el.removeAttribute('data-bg');
          obs.unobserve(el);
        }
      }
    });
  }, {
    rootMargin: '300px',
    threshold: 0.01
  });

  lazyHeaderSlides.forEach(slide => observer.observe(slide));
} else {
  // Fallback ohne IntersectionObserver
  lazyHeaderSlides.forEach(el => {
    const bgUrl = el.getAttribute('data-bg');
    if (bgUrl) el.style.backgroundImage = `url('${bgUrl}')`;
  });
}

// =========================================================
// 6. Airbnb Widget
// =========================================================
(function initAirbnbWidgetWithFallback() {
  const airbnbWidgetContainer = document.getElementById('airbnb-superhost-widget-24131580');
  if (!airbnbWidgetContainer) return;

  const ROOM_ID = '24131580';

  function showStaticAirbnbBadge() {
    airbnbWidgetContainer.innerHTML = `
      <a href="https://www.airbnb.at/rooms/${ROOM_ID}" target="_blank" rel="noopener noreferrer"
         class="airbnb-fallback" aria-label="Airbnb Listing öffnen" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:inherit;cursor:pointer;">
        <img src="/assets/images/super.webp"
           alt="Airbnb Superhost"
           style="max-width:444px; cursor:pointer;" />
      </a>
    `;
    console.warn('Airbnb widget: Fallback-Badge angezeigt (CORS/Netzwerkfehler).');
  }

  const s = document.createElement('script');
  s.src = 'https://airbnb-proxy.elgordoraba.workers.dev/widget.js';
  s.async = true;

  s.onerror = () => {
    console.error('Airbnb widget script konnte nicht geladen werden (onerror).');
    showStaticAirbnbBadge();
  };

  s.onload = () => {
  try {
    window.AirbnbSuperhostWidget?.create('airbnb-superhost-widget-24131580', ROOM_ID);
  } catch (err) {
    console.error('AirbnbWidget.create() hat geworfen:', err);
    showStaticAirbnbBadge();
    return;
  }

  let attempts = 0;
  const maxAttempts = 8;
  const checkInterval = 400;

  const interval = setInterval(() => {
    attempts++;

    const text = (airbnbWidgetContainer.innerText || '').toLowerCase();
    if (text.includes('failed') || text.includes('error')) {
        airbnbWidgetContainer.innerHTML = '';
        showStaticAirbnbBadge();
        clearInterval(interval);
        return;
  }
    const hasMeaningfulChildren = airbnbWidgetContainer.children.length > 0 && !airbnbWidgetContainer.querySelector('.airbnb-fallback');

    // Prüfen: Ist der Container immer noch leer → Fallback
    if (!hasMeaningfulChildren && attempts >= maxAttempts) {
      clearInterval(interval);
      console.warn('Airbnb widget: kein Rendering innerhalb Timeout — zeige Fallback.');
      showStaticAirbnbBadge();
    }
  }, checkInterval);
};

  document.head.appendChild(s);
})();

// =========================================================
// 7. WhatsApp Widget
// =========================================================
const waToggle = document.getElementById('wa-toggle');
const waWidget = document.getElementById('wa-widget');
const waClose = document.getElementById('wa-close');
const waForm = document.getElementById('wa-form');
const waInput = document.getElementById('wa-input');

if (waToggle && waWidget) {
  waToggle.addEventListener('click', () => waWidget.classList.toggle('open'));
  waClose?.addEventListener('click', () => {
    waWidget.classList.remove('open');
    history.pushState(null, null, '/#kontakt');
  });
  waForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = waInput.value.trim();
    if (message) {
      const phone = '436504124810';
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      waInput.value = '';
      waWidget.classList.remove('open');
    }
  });
}

const ctaFloating = document.querySelector('.cta-floating');
const topSentinel = document.getElementById('cta-top-sentinel');
const bottomSentinel = document.getElementById('cta-bottom-sentinel');

if (ctaFloating && topSentinel && bottomSentinel) {
  let topVisible = false;
  let bottomVisible = false;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === topSentinel) topVisible = entry.isIntersecting;
      if (entry.target === bottomSentinel) bottomVisible = entry.isIntersecting;

      if (!topVisible && !bottomVisible) {
        ctaFloating.classList.add('visible');
      } else {
        ctaFloating.classList.remove('visible');
      }
    });
  });

  observer.observe(topSentinel);
  observer.observe(bottomSentinel);
}
