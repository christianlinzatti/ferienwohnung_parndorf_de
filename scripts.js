document.addEventListener('DOMContentLoaded', () => {
  // =========================================================
  // 1. Slideshow (nur Vorschau, kein eigenes Popup mehr)
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
      const dot = document.createElement('div');
      dot.classList.add('dot');
      const img = slide.querySelector('img');
      const caption = slide.querySelector('.slide-caption')?.textContent || (img?.alt || '');
      dot.title = caption;
      dot.addEventListener('click', () => { showSlide(i); resetInterval(); });
      dotsContainer.appendChild(dot);

      if (img) {
        img.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          let galleryKey = img.alt?.toLowerCase() || "";
            galleryKey = galleryKey.replace(/\.(jpe?g|png|webp)$/i, ""); // falls alt ein Dateiname ist
          let imageKey = null;

          // versuche aus dem Dateinamen einen Unterkey abzuleiten
          const src = img.getAttribute('src').toLowerCase();
          if (src.includes("essbereich")) imageKey = "essbereich";
          else if (src.includes("betten")) imageKey = "betten";
          else if (src.includes("bett_kasten")) imageKey = "bett_kasten";
          else if (src.includes("wc")) imageKey = "wc";
          else if (src.includes("garten")) imageKey = "garten";
          else if (src.includes("terrasse")) imageKey = "terrasse";

          // baue Route: /galleryKey[/imageKey]
          const url = imageKey ? `/${galleryKey}/${imageKey}` : `/${galleryKey}`;
          history.pushState(null, null, url);
          handleRoute();
        });
      }
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

  const galleries = {
    kueche: ["kueche.webp", "essbereich.webp"],
    schlafzimmer: ["schlafzimmer.webp", "betten.webp", "bett_kasten.webp"],
    wohnzimmer: ["wohnzimmer.webp"],
    badezimmer: ["badezimmer.webp", "wc.webp"],
    terrasse: ["terrasse.webp", "garten.webp"],
    eingangsbereich: ["eingangsbereich.webp"],
  };

  let currentGalleryImages = [];
  let currentGalleryIndex = 0;

  const renderGallery = () => {
    popupImagesContainer.innerHTML = "";
    currentGalleryImages.forEach((src, idx) => {
      const img = document.createElement("img");
      img.src = src;
      if (idx === currentGalleryIndex) img.classList.add("active");
      popupImagesContainer.appendChild(img);
    });
  };

  const openPhotoPopup = () => {
    if (currentGalleryImages.length === 0) return;
    renderGallery();
    photoPopup.classList.add('open');
    document.body.classList.add('popup-is-open', 'no-scroll');
  };

  const closePhotoPopup = (updateHistory = true) => {
    photoPopup.classList.remove('open');
    document.body.classList.remove('popup-is-open', 'no-scroll');
    if (updateHistory) {
      history.pushState(null, null, '/#fotos');
    }
  };

  photoPopupNextBtn?.addEventListener("click", () => {
    currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
    renderGallery();
  });
  photoPopupPrevBtn?.addEventListener("click", () => {
    currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    renderGallery();
  });
  photoPopupCloseBtn?.addEventListener("click", () => closePhotoPopup(true));
  photoPopup?.addEventListener("click", e => e.target === photoPopup && closePhotoPopup(true));

 const handleRoute = (isInitial = false) => {
  const path = window.location.pathname.replace("/", "");
  const hash = window.location.hash.replace("#", "");
  const targetId = path || hash || "highlights";

  const parts = targetId.split("/").filter(Boolean);
  const galleryKey = parts[0];
  const imageKey = parts[1];

  const galleryKeys = Object.keys(galleries);

  if (galleryKeys.includes(galleryKey)) {
    // nur beim User-Klick scrollen
    if (!isInitial) {
      const fotosSection = document.getElementById("fotos");
      fotosSection?.scrollIntoView({ behavior: "smooth" });
    }

    currentGalleryImages = galleries[galleryKey] || [];
    currentGalleryIndex = 0;

    if (imageKey) {
      currentGalleryImages = Object.values(galleries).flat();
      const matchIndex = currentGalleryImages.findIndex(src =>
        src.toLowerCase().includes(imageKey.toLowerCase())
      );
      if (matchIndex >= 0) {
        currentGalleryIndex = matchIndex;
      }
    }

    openPhotoPopup();
  } else {
    if (photoPopup.classList.contains('open')) {
      closePhotoPopup(false);
    }
    if (!isInitial) {
      const targetEl = document.getElementById(targetId);
      targetEl?.scrollIntoView({ behavior: "smooth" });
    }
  }

  document.querySelectorAll('nav a[data-link]').forEach(link => {
    const linkPath = link.getAttribute("href").replace(/[/|#]/g, "");
    link.classList.toggle("active", linkPath === targetId);
  });
};

  // globaler Klick-Handler für SPA-Links
  document.addEventListener("click", e => {
    if (e.target.closest('.slideshow-container') || e.target.closest('#photo-popup')) {
      return;
    }
    const link = e.target.closest("a[data-link]");
    if (link) {
      e.preventDefault();
      history.pushState(null, null, link.href);
      handleRoute();
    }
  });

  window.addEventListener("popstate", handleRoute);
  handleRoute(true); // initial

  // =========================================================
  // 3. Escape Taste = Popup schließen
  // =========================================================
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closePhotoPopup(true);
    }
  });
});

// =========================================================
// 4. Header-Slideshow
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
           style="max-width:150px; cursor:pointer;" />
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
  waClose?.addEventListener('click', () => waWidget.classList.remove('open'));
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
