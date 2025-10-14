document.addEventListener('DOMContentLoaded', () => {
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
      metaDescription: "Ein Blick auf: {caption}. Gemütliches Apartment in Parndorf, nur 2 km vom Designer Outlet entfernt. Ideal für Shopping, Erholung am Neusiedler See und Dienstreisen."
    },
    en: {
      metaTitle: "Holiday Apartment Parndorf | {caption}",
      metaDescription: "A look at: {caption}. Cozy apartment in Parndorf, just 2 km from the Designer Outlet. Ideal for shopping, relaxing at Lake Neusiedl, and business trips."
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

// Eingaben überwachen
[startInput, endInput, guestsInput].forEach((el) =>
  el.addEventListener("input", checkInputs)
);

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

 const updateCanonicalTag = (newUrl) => {
  const head = document.head;
  let canonical = head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    head.appendChild(canonical);
  }

  // Hostname + Sprache automatisch bestimmen
  const langPrefix = window.location.hostname.startsWith("en.")
    ? "https://en.ferienwohnung-parndorf.at"
    : "https://de.ferienwohnung-parndorf.at";

  const absUrl = langPrefix + newUrl.replace(/\/+$/, "") + "/";
  canonical.setAttribute('href', absUrl);
  console.log('[meta] Canonical aktualisiert ->', absUrl);
};

  const updateAlternateLinks = (currentPath = window.location.pathname) => {
  const head = document.head;
  head.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove());

  const isEnglish = window.location.hostname.startsWith("en.");
  const currentKey = currentPath.replace(/^\/+|\/+$/g, "").split("/")[0];

  // passendes Gegenstück finden
  let deKey = null;
  let enKey = null;

  if (isEnglish) {
    // englische Seite: passendes deutsches Mapping suchen
    for (const [de, imgs] of Object.entries(galleries)) {
      const en = Object.keys(galleriesEn).find(k => galleriesEn[k][0] === imgs[0]);
      if (en === currentKey) {
        deKey = de;
        enKey = en;
        break;
      }
    }
  } else {
    // deutsche Seite: passendes englisches Mapping suchen
    for (const [en, imgs] of Object.entries(galleriesEn)) {
      const de = Object.keys(galleries).find(k => galleries[k][0] === imgs[0]);
      if (de === currentKey) {
        deKey = de;
        enKey = en;
        break;
      }
    }
  }

  const deUrl = `https://de.ferienwohnung-parndorf.at/${deKey || "highlights"}/`;
  const enUrl = `https://en.ferienwohnung-parndorf.at/${enKey || "highlights"}/`;

  const linkDe = document.createElement("link");
  linkDe.rel = "alternate";
  linkDe.hreflang = "de";
  linkDe.href = deUrl;

  const linkEn = document.createElement("link");
  linkEn.rel = "alternate";
  linkEn.hreflang = "en";
  linkEn.href = enUrl;

  head.append(linkDe, linkEn);
  console.log("[meta] alternate links gesetzt:", { deUrl, enUrl });
};

  /**
   * Aktualisiert die Meta-Tags der Seite basierend auf dem aktiven Bild.
   * @param {string} imageUrl - Die URL des Bildes.
   * @param {string} caption - Die Bildunterschrift aus data-caption.
   */
  const updateMetaTagsForImage = (imageUrl, caption) => {
  console.log('[meta] updateMetaTagsForImage called', { imageUrl, caption });

  // fallback: wenn caption fehlt, versuche aus imageUrl einen lesbaren Namen zu bauen
  if (!caption) {
    try {
      const u = new URL(imageUrl, window.location.origin);
      caption = u.pathname.split('/').pop().replace(/[-_]/g, ' ');
    } catch (e) {
      caption = caption || '';
    }
  }

  if (!imageUrl && !caption) {
    console.warn('[meta] Abbruch: weder imageUrl noch caption vorhanden');
    return;
  }

  const fullImageUrl = imageUrl ? new URL(imageUrl, window.location.origin).href : '';
  const newTitle = translations[lang].metaTitle.replace('{caption}', caption || '');
  const newDescription = translations[lang].metaDescription.replace('{caption}', caption || '');

  document.title = newTitle;

  const setMeta = (selector, value) => {
    const el = document.head.querySelector(selector) || document.querySelector(selector);
    if (el) {
      el.setAttribute('content', value);
    } else {
      console.warn('[meta] Selector nicht gefunden:', selector);
    }
  };

  setMeta('meta[name="description"]', newDescription);
  setMeta('meta[property="og:title"]', newTitle);
  setMeta('meta[property="og:description"]', newDescription);
  if (fullImageUrl) setMeta('meta[property="og:image"]', fullImageUrl);
  setMeta('meta[property="twitter:title"]', newTitle);
  setMeta('meta[property="twitter:description"]', newDescription);
    setMeta('meta[property="og:url"]', window.location.href);
setMeta('meta[name="twitter:url"]', window.location.href);
  if (fullImageUrl) setMeta('meta[property="twitter:image"]', fullImageUrl);

  console.log('[meta] gesetzt ->', document.querySelector('meta[name="description"]')?.content);
};

const resetMetaTags = () => {
  console.log('[meta] resetMetaTags called');
  document.title = originalPageTitle;

  if (originalMeta.description) document.querySelector('meta[name="description"]')?.setAttribute('content', originalMeta.description);
  if (originalMeta.ogTitle) document.querySelector('meta[property="og:title"]')?.setAttribute('content', originalMeta.ogTitle);
  if (originalMeta.ogDescription) document.querySelector('meta[property="og:description"]')?.setAttribute('content', originalMeta.ogDescription);
  if (originalMeta.ogImage) document.querySelector('meta[property="og:image"]')?.setAttribute('content', originalMeta.ogImage);
  if (originalMeta.twitterTitle) document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', originalMeta.twitterTitle);
  if (originalMeta.twitterDescription) document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', originalMeta.twitterDescription);
  if (originalMeta.twitterImage) document.querySelector('meta[property="twitter:image"]')?.setAttribute('content', originalMeta.twitterImage);
  updateCanonicalTag(window.location.pathname);
  updateAlternateLinks(window.location.pathname);



  console.log('[meta] zurückgesetzt ->', document.querySelector('meta[name="description"]')?.content);
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

    // versuche galleryKey zu finden
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
    if (!currentGalleryImages.length) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
    renderGallery();
    updateUrlForCurrentImage();
  });

  photoPopupPrevBtn?.addEventListener("click", () => {
    if (!currentGalleryImages.length) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    renderGallery();
    updateUrlForCurrentImage();
  });

  photoPopupCloseBtn?.addEventListener("click", () => closePhotoPopup(true));
  photoPopup?.addEventListener("click", e => e.target === photoPopup && closePhotoPopup(true));

  // =========================================================
  // Router-Logik (robust)
  // =========================================================
  const handleRoute = (isInitial = false) => {
    updateCanonicalTag(window.location.pathname);
    const rawPath = window.location.pathname || "";
    const cleaned = rawPath.replace(/^\/+|\/+$/g, "");
    const hash = (window.location.hash || "").replace(/^#/, "");

    if (hash) {
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        if (!isInitial) {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
    }

    const target = cleaned || "highlights";
    const parts = target.split("/").filter(Boolean);
    const galleryKeyRaw = parts[0] ? stripExt(parts[0].toLowerCase()) : "";
    const imageKeyRaw = parts[1] ? stripExt(parts[1].toLowerCase()) : "";

    const galleryKeys = Object.keys(galleriesActive);

    if (galleryKeyRaw && galleryKeys.includes(galleryKeyRaw)) {
      if (!isInitial) {
        const fotosSection = document.getElementById("fotos");
        fotosSection?.scrollIntoView({ behavior: "smooth" });
      }

      currentGalleryImages = galleriesActive[galleryKeyRaw].slice();
       const shouldUpdateUrl = !!imageKeyRaw;


      if (!imageKeyRaw) {
      currentGalleryIndex = 0;
    } else {
      // 🧩 Wenn ein Bild angegeben ist (/wohnzimmer/wohnzimmer)
      const matchIndex = currentGalleryImages.findIndex(
        s => stripExt(s).toLowerCase() === imageKeyRaw.toLowerCase()
      );
      currentGalleryIndex = matchIndex >= 0 ? matchIndex : 0;
    }

      openPhotoPopup(shouldUpdateUrl);
      return;
    } else {
      if (photoPopup?.classList.contains('open')) closePhotoPopup(false);

      if (target === "whatsapp") {
        waWidget?.classList.add("open");
        return;
      }

      if (!isInitial) {
        const targetEl = document.getElementById(target);
        targetEl?.scrollIntoView({ behavior: "smooth" });
      }
    }

    document.querySelectorAll('nav a[data-link]').forEach(link => {
      const hrefAttr = (link.getAttribute("href") || "").replace(/^\/+|\/+$/g, "");
      link.classList.toggle("active", hrefAttr === cleaned || hrefAttr === hash);
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
      if(burgerMenu?.classList.contains("open")) {
        burgerMenu.classList.remove("open");
        document.body.classList.remove("no-scroll");
      }
    }
  });

  // =========================================================
  // Burger-Menü Toggle
  // =========================================================
  const burgerToggle = document.getElementById("burger-toggle");
  const burgerClose = document.getElementById("burger-close");
  const burgerMenu = document.querySelector(".main-nav");

  if (burgerToggle && burgerMenu) {
    burgerToggle.addEventListener("click", () => {
        burgerMenu.classList.add("open");
        document.body.classList.add("no-scroll");
    });
  }

  if (burgerClose && burgerMenu) {
    burgerClose.addEventListener("click", () => {
        burgerMenu.classList.remove("open");
        document.body.classList.remove("no-scroll");
    });
  }

  if(burgerMenu) {
      burgerMenu.querySelectorAll("a[data-link]").forEach(link => {
        link.addEventListener("click", () => {
          burgerMenu.classList.remove("open");
          document.body.classList.remove("no-scroll");
        });
      });
  }

  if (window.lucide) {
    lucide.createIcons();
  }
  updateCanonicalTag(window.location.pathname);
  updateAlternateLinks(window.location.pathname);

  window.addEventListener('blur', () => clearInterval(slideInterval));
window.addEventListener('focus', () => startInterval());



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



// Streetview laden
document.getElementById('load-streetview-btn')?.addEventListener('click', function () {
  const container = document.getElementById('map-placeholder-streetview');
  const iframe = document.createElement('iframe');
  iframe.src = "https://www.google.com/maps/embed?pb=!4v1759240459840!6m8!1m7!1s2npPsX99OT31Kcon7JxnWQ!2m2!1d48.00060897249904!2d16.8641309679439!3f5.598648!4f0!5f0.7820865974627469";
  iframe.style.border = "0";
  iframe.width = "100%";
  iframe.height = "400";
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";

  container.innerHTML = ''; // nur dieses Placeholder leeren
  container.appendChild(iframe);
});

// Karte laden
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
          <h3 style="margin:0 0 5px;color:#004d40;">Ferienwohnung Parndorf</h3>
          <p style="margin:0 0 10px;font-size:14px;">Obere Wunkau 38, 7111 Parndorf</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=Ferienwohnung+Parndorf"
             target="_blank" rel="noopener noreferrer"
             style="color:#0071c2;text-decoration:none;font-weight:bold;">Route planen</a>
        </div>`
    });

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: location,
      map,
      title: "Ferienwohnung Parndorf",
    });

    marker.addListener("click", () => infoWindow.open(map, marker));
    infoWindow.open(map, marker);

    // nur die Karten-Vorschau ausblenden – Streetview bleibt
    mapPlaceholder.querySelector('.map-overlay')?.remove();
  };

  loadMapBtn.addEventListener('click', () => {
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAj3BUffMoTz7XsXEjJvnO-CBQq9oDQ4AA&callback=initMap&v=beta&libraries=marker";
      script.async = true;
      document.head.appendChild(script);
      loadMapBtn.disabled = true;
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
  window.addEventListener('scroll', toggleSticky);
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

