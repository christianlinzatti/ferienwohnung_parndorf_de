document.addEventListener('DOMContentLoaded', () => {
  // Hilfsfunktionen
  const stripExt = s => s ? s.replace(/\.(jpe?g|png|webp)$/i, '') : '';
  const ensureRoot = s => s && s.startsWith('/') ? s : ('/' + s);

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

const lang = window.location.hostname.startsWith("en.") ? "en" : "de";
const originalPageTitle = document.title

// Aktives Galerie-Mapping auswählen
const galleriesActive = lang === "en" ? galleriesEn : galleries;


  // =========================================================
  // 1. Slideshow (nur Vorschau)
  // =========================================================
  const mainSlideshowContainer = document.querySelector('.slideshow-container');
  if (mainSlideshowContainer) {
    const slides = mainSlideshowContainer.querySelectorAll('.slide');
    const btnPrev = mainSlideshowContainer.querySelector('.btn-prev');
    const btnNext = mainSlideshowContainer.querySelector('.btn-next');
    const dotsContainer = mainSlideshowContainer.querySelector('.dots-container');

    let currentIndex = 0;
    let slideInterval;

    const showSlide = (index) => {
      if (!slides[index] || !dotsContainer.children[index]) return;
      mainSlideshowContainer.querySelector('.slide.active')?.classList.remove('active');
      dotsContainer.querySelector('.dot.active')?.classList.remove('active');
      currentIndex = index;
      slides[currentIndex].classList.add('active');
      dotsContainer.children[currentIndex].classList.add('active');
    };

    const nextSlide = () => showSlide((currentIndex + 1) % slides.length);
    const prevSlide = () => showSlide((currentIndex - 1 + slides.length) % slides.length);

    const startInterval = () => slideInterval = setInterval(nextSlide, 5000);
    const resetInterval = () => { clearInterval(slideInterval); startInterval(); };

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

  // Seitentitel aktualisieren
  //const captionText = imageKey.replace(/_/g, " ");
  //document.title = `Ferienwohnung Parndorf – ${captionText}`;
};

  const popupCaption = photoPopup?.querySelector(".popup-caption");

const renderGallery = () => {
  if (!popupImagesContainer) return;
  popupImagesContainer.innerHTML = "";

  currentGalleryImages.forEach((src, idx) => {
    const img = document.createElement("img");
    img.src = src.startsWith("/") ? src : "/" + src;
    img.alt = stripExt(src);

    // caption aus vorhandenem <img>-Element im DOM holen
    // wir suchen nach einem Bild mit gleichem src in der Slideshow
    const originalImg = document.querySelector(`#fotogallerie img[src$="${src}"]`);

    if (originalImg?.dataset.caption) {
      img.dataset.caption = originalImg.dataset.caption;
    } else {
      img.dataset.caption = img.alt.replace(/_/g, " ");
    }

    if (idx === currentGalleryIndex) img.classList.add("active");
    popupImagesContainer.appendChild(img);
  });

  // Caption + Titel setzen
  const activeImg = popupImagesContainer.querySelector("img.active");
  if (activeImg) {
    const captionText = activeImg.dataset.caption || activeImg.alt;
    if (popupCaption) popupCaption.textContent = captionText;
    document.title = `Ferienwohnung Parndorf – ${captionText}`;
  }
};

  const openPhotoPopup = () => {
  if (currentGalleryImages.length === 0) return;
  renderGallery();
  updateUrlForCurrentImage(); // <--- hinzufügen
  photoPopup?.classList.add('open');
  document.body.classList.add('popup-is-open', 'no-scroll');
};

  const closePhotoPopup = (updateHistory = true) => {
    photoPopup?.classList.remove('open');
    document.body.classList.remove('popup-is-open', 'no-scroll');
    document.title = originalPageTitle;
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
  const rawPath = window.location.pathname || "";
  const cleaned = rawPath.replace(/^\/+|\/+$/g, "");
  const hash = (window.location.hash || "").replace(/^#/, "");

  // --- NEU: Hash-Scroll immer erlauben ---
  if (hash) {
    const targetEl = document.getElementById(hash);
    if (targetEl) {
      if (!isInitial) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
      return; // <--- wichtig, sonst läuft Galerie/Router weiter
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

      // Default: Kategorie-Galerie
      currentGalleryImages = galleriesActive[galleryKeyRaw].slice();
      currentGalleryIndex = 0;

      // Wenn imageKey vorhanden -> globale Galerie öffnen (Pfeiltasten über alle Bilder)
      if (imageKeyRaw) {
        currentGalleryImages = allImages.slice();
        const matchIndex = currentGalleryImages.findIndex(s => stripExt(s).toLowerCase() === imageKeyRaw.toLowerCase());
        if (matchIndex >= 0) currentGalleryIndex = matchIndex;
      }

      openPhotoPopup();
    } else {
      if (photoPopup?.classList.contains('open')) closePhotoPopup(false);

      if (target === "whatsapp") {
            // WhatsApp-Widget öffnen
            waWidget?.classList.add("open");
            return;
        }

      if (!isInitial) {
        const targetEl = document.getElementById(target);
        targetEl?.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Nav active toggle
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

  // 🔥 Hier Hash-Links abfangen
  if (hrefAttr.startsWith("#")) {
    e.preventDefault();
    const targetId = hrefAttr.replace("#", "");
    const targetEl = document.getElementById(targetId);
    targetEl?.scrollIntoView({ behavior: "smooth" });
    return; // wichtig: Abbruch, nicht weiter in den Router
  }

  e.preventDefault();

    // Hole das originale href-Attribut (nicht link.href, das ist absolute)
    // Normalisiere auf Pfad-Form: "/foo" oder "/foo/bar"
    let hrefPath = hrefAttr;
    try {
      // falls absolute URL in hrefAttr steht, extrahiere pathname
      if (/^https?:\/\//i.test(hrefAttr)) {
        const u = new URL(hrefAttr);
        hrefPath = u.pathname + (u.hash || '');
      } else {
        // ensure leading slash
        if (!hrefPath.startsWith('/')) hrefPath = '/' + hrefPath;
      }
    } catch (err) {
      if (!hrefPath.startsWith('/')) hrefPath = '/' + hrefPath;
    }

    // Prüfe, ob es sich um eine Kategorie handelt und erweitere bei Bedarf
    const galleryKeys = Object.keys(galleriesActive);
    const cleanHref = hrefPath.replace(/^\/+|\/+$/g, "").split('#')[0];
    if (galleryKeys.includes(cleanHref)) {
      const firstImage = galleriesActive[cleanHref][0];
      const firstKey = firstImage ? stripExt(firstImage) : null;
      if (firstKey) {
        hrefPath = `/${cleanHref}/${firstKey}`;
      }
    }

    history.pushState(null, null, hrefPath);
    handleRoute(false);
  });

  window.addEventListener("popstate", () => handleRoute(false));
  handleRoute(true); // initial ohne automatischem scroll

  document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closePhotoPopup(true);
    navToggle?.classList.remove("open");
    mainNav?.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }
});

  // =========================================================
// Burger-Menü Toggle
// =========================================================
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    mainNav.classList.toggle("open");
    document.body.classList.toggle("no-scroll");
  });

  // optional: Menü schließen, wenn ein Link geklickt wird
  mainNav.querySelectorAll("a[data-link]").forEach(link => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("open");
      mainNav.classList.remove("open");
      document.body.classList.remove("no-scroll");
    });
  });
}

 if (window.lucide) {
    lucide.createIcons();
  }

   const burgerToggle = document.getElementById("burger-toggle");
  const burgerClose = document.getElementById("burger-close");
  const burgerMenu = document.querySelector(".main-nav");

  burgerToggle?.addEventListener("click", () => {
    burgerMenu.classList.add("open");
  });

  burgerClose?.addEventListener("click", () => {
    burgerMenu.classList.remove("open");
  });


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
// 6. Airbnb Widget
// =========================================================
const airbnbWidgetContainer = document.getElementById('airbnb-superhost-widget-24131580');
(function initAirbnbWidgetWithFallback() {
  const airbnbWidgetContainer = document.getElementById('airbnb-superhost-widget-24131580');
  if (!airbnbWidgetContainer) return;

  const ROOM_ID = '24131580';

  function showStaticAirbnbBadge() {
    // Sauber ersetzen und click-handler setzen
    airbnbWidgetContainer.innerHTML = `
      <a href="https://www.airbnb.at/rooms/${ROOM_ID}" target="_blank" rel="noopener noreferrer"
         class="airbnb-fallback" aria-label="Airbnb Listing öffnen" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:inherit;cursor:pointer;">
        <img src="super.webp"
           alt="Airbnb Superhost"
           style="max-width:444px; cursor:pointer;" />
      </a>
    `;
    console.warn('Airbnb widget: Fallback-Badge angezeigt (CORS/Netzwerkfehler).');
  }

  // Script einbinden
  const s = document.createElement('script');
  s.src = 'https://airbnb-proxy.elgordoraba.workers.dev/widget.js';
  s.async = true;

  // Script-Ladefehler -> sofort Fallback
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
      const text = (airbnbWidgetContainer.innerText || '').trim().toLowerCase();
      const hasImg = !!airbnbWidgetContainer.querySelector('img');
      const hasMeaningfulChildren = airbnbWidgetContainer.children.length > 0 && !airbnbWidgetContainer.querySelector('.airbnb-fallback');

      if (text.includes('failed to load') || text.includes('failed') || text.includes('error') || text.includes('nicht geladen')) {
        console.warn('Airbnb widget: erkannter Fehlertext:', text);
        clearInterval(interval);
        showStaticAirbnbBadge();
        return;
      }

      if (hasMeaningfulChildren && !text.includes('failed') && !text.includes('error')) {
        clearInterval(interval);
        return;
      }

      if (attempts >= maxAttempts) {
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
    history.pushState(null, null, '/#kontakt'); // z. B. auf Kontaktseite springen
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
