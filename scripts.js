if (sessionStorage.redirect) {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  history.replaceState(null, null, redirect);
}

document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIK FÜR DIE HAUPT-SLIDESHOW IM CONTENT-BEREICH ---
    const mainSlideshowContainer = document.querySelector('.slideshow-container');
    if (mainSlideshowContainer) {
        const slides = mainSlideshowContainer.querySelectorAll('.slide');
        const btnPrev = mainSlideshowContainer.querySelector('.btn-prev');
        const btnNext = mainSlideshowContainer.querySelector('.btn-next');
        const dotsContainer = mainSlideshowContainer.querySelector('.dots-container');
        const popupContainer = document.querySelector('.popup-container'); // Dieser Popup ist für das einzelne Bild-Zoom
        const popupImg = document.querySelector('.popup-img');
        const popupClose = document.querySelector('.popup-close');

        // --- Navigation für das einzelne Bild-Popup ---
        const popupPrevBtn = document.querySelector('.popup-prev'); // NEU
        const popupNextBtn = document.querySelector('.popup-next'); // NEU

        let currentIndex = 0;
        let slideInterval;
        let touchStartX = 0;
        let touchEndX = 0;

        const initSlideshow = () => {
            if (slides.length === 0) return;

            slides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                dot.addEventListener('click', () => {
                    showSlide(i);
                    resetInterval();
                });
                dotsContainer.appendChild(dot);
            });

            slides.forEach((slide, index) => {
                slide.addEventListener('click', () => openPopup(index));
            });

            showSlide(currentIndex);
            startInterval();
        };

        const showSlide = (index) => {
            if (!slides[index] || !dotsContainer.children[index]) return;

            const currentActiveSlide = mainSlideshowContainer.querySelector('.slide.active');
            if (currentActiveSlide) currentActiveSlide.classList.remove('active');

            const currentActiveDot = dotsContainer.querySelector('.dot.active');
            if (currentActiveDot) currentActiveDot.classList.remove('active');

            currentIndex = index;
            slides[currentIndex].classList.add('active');
            dotsContainer.children[currentIndex].classList.add('active');
        };

        const nextSlide = () => showSlide((currentIndex + 1) % slides.length);
        const prevSlide = () => showSlide((currentIndex - 1 + slides.length) % slides.length);

        const startInterval = () => slideInterval = setInterval(nextSlide, 5000);
        const resetInterval = () => {
            clearInterval(slideInterval);
            startInterval();
        };

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });
        }

        mainSlideshowContainer.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX);
        mainSlideshowContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) { // Links wischen
                nextSlide();
                resetInterval();
            }
            if (touchEndX > touchStartX + 50) { // Rechts wischen
                prevSlide();
                resetInterval();
            }
        };

        const openPopup = (index) => {
            const imageUrls = Array.from(slides).map(slide => slide.querySelector('img').src);
            popupImg.src = imageUrls[index];
            popupContainer.classList.add('open');
            currentIndex = index; // Wichtig für die Popup-Navigation
            clearInterval(slideInterval);
        };

        const closePopup = () => {
            popupContainer.classList.remove('open');
            startInterval();
        };

        // --- Event-Listener für das einzelne Bild-Popup ---
        if (popupClose) popupClose.addEventListener('click', closePopup);
        if (popupContainer) {
            popupContainer.addEventListener('click', (e) => {
                if (e.target === popupContainer) closePopup();
            });
        }

        if (popupPrevBtn) {
           popupPrevBtn.addEventListener('click', () => {
                const newIndex = (currentIndex - 1 + slides.length) % slides.length;
                openPopup(newIndex);
           });
        }

        if (popupNextBtn) {
            popupNextBtn.addEventListener('click', () => {
                const newIndex = (currentIndex + 1) % slides.length;
                openPopup(newIndex);
            });
        }

        initSlideshow();
    }

    // --- LOGIK FÜR DIE HEADER-HINTERGRUND-SLIDESHOW ---
    const headerSlides = document.querySelectorAll('.header-slide');
    if (headerSlides.length > 1) {
        let currentHeaderIndex = 0;
        const showHeaderSlide = (index) => {
            headerSlides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        };
        showHeaderSlide(currentHeaderIndex); // Sofort erste Folie zeigen
        setInterval(() => {
            currentHeaderIndex = (currentHeaderIndex + 1) % headerSlides.length;
            showHeaderSlide(currentHeaderIndex);
        }, 6000);
    }

    // --- LOGIK FÜR DAS MOBILE NAVIGATIONS-MENÜ (BURGER) ---
    const navToggle = document.querySelector('.nav-toggle');



    navToggle.setAttribute('aria-controls', 'main-nav');
navToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') mainNav.classList.remove('open');
});

// Escape überall: close menu & popups
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMenu?.();
    closePopup?.(); // je nachdem welche Funktionen vorhanden sind
  }
});


    const mainNav = document.getElementById('main-nav');
    if (navToggle && mainNav) {
        const navLinks = mainNav.querySelectorAll('a:not([data-gallery])'); // Schließt Gallerie-Links aus

        const lockScroll = (locked) => {
            document.body.classList.toggle('no-scroll', locked);
        };

        const setAria = (open) => {
            navToggle.setAttribute('aria-expanded', String(open));
        };

        const closeMenu = () => {
            mainNav.classList.remove('open');
            navToggle.classList.remove('open');
            lockScroll(false);
            setAria(false);
        };

        const openMenu = () => {
             mainNav.classList.add('open');
             navToggle.classList.add('open');
             lockScroll(true);
             setAria(true);
        }

        navToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.contains('open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        setAria(false); // Initialer ARIA-Status
    }

    // --- DSGVO-KONFORME GOOGLE MAPS LOGIK ---
    const loadMapBtn = document.getElementById('load-map-btn');
    const mapPlaceholder = document.getElementById('map-placeholder');
    const mapContainer = document.getElementById('map');

    if (loadMapBtn && mapPlaceholder && mapContainer) {
        // Die `initMap` Funktion muss global verfügbar sein für den Google Maps Callback
        window.initMap = () => {
            const location = { lat: 48.0007115, lng: 16.8640465 };
            const map = new google.maps.Map(mapContainer, {
                zoom: 15,
                center: location,
                disableDefaultUI: true,
                mapId: "1f521e152f97485fa96f0a37" // Beispiel Map ID
            });
            const contentString = `
              <div style="max-width:280px; font-family: 'Poppins', sans-serif;">
                <h3 style="margin: 0 0 5px; color: #004d40;">Ferienwohnung Parndorf</h3>
                <p style="margin: 0 0 10px; font-size: 14px;">Obere Wunkau 38, 7111 Parndorf</p>
                <p style="margin-top:10px; font-size: 14px;">
                  <a href="https://www.google.com/maps/dir/?api=1&destination=Ferienwohnung+Parndorf"
                     target="_blank" rel="noopener noreferrer"
                     style="color: #0071c2; text-decoration: none; font-weight: bold;">
                    Route planen
                  </a>
                </p>
              </div>`;
            const infowindow = new google.maps.InfoWindow({ content: contentString });
            const marker = new google.maps.marker.AdvancedMarkerElement({
                position: location,
                map: map,
                title: "Ferienwohnung Parndorf",
            });
            marker.addListener("click", () => infowindow.open(map, marker));
            infowindow.open(map, marker);
            mapPlaceholder.style.display = 'none';
            mapContainer.style.display = 'block';
        };

        loadMapBtn.addEventListener('click', () => {
            if (!window.google || !window.google.maps) {
                const script = document.createElement('script');
                // Ersetzen Sie "DEIN_API_KEY" durch Ihren echten Google Maps API Key
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAj3BUffMoTz7XsXEjJvnO-CBQq9oDQ4AA&callback=initMap&v=beta&libraries=marker`;
                script.async = true;
                document.head.appendChild(script);
                loadMapBtn.disabled = true;
            }
        });
    }

    // --- LOGIK FÜR DAS FOTO-POPUP (GALERIE) ---
    const photoPopup = document.getElementById("photo-popup");
    if (photoPopup) {
        const popupImagesContainer = photoPopup.querySelector(".popup-images");
        const photoPopupCloseBtn = photoPopup.querySelector(".popup-close");
        const photoPopupPrevBtn = photoPopup.querySelector(".prev");
        const photoPopupNextBtn = photoPopup.querySelector(".next");

        let currentGalleryImages = [];
        let currentGalleryIndex = 0;

        const galleries = {
            kueche: ["kueche.webp", "essbereich.webp"],
            schlafzimmer: ["schlafzimmer.webp", "betten.webp", "bett_kasten.webp"],
            wohnzimmer: ["wohnzimmer.webp"],
            badezimmer: ["badezimmer.webp", "wc.webp"],
            terrasse: ["terrasse.webp", "garten.webp"],
            eingang: ["eingangsbereich.webp"],
        };

        const renderGallery = () => {
            popupImagesContainer.innerHTML = "";
            currentGalleryImages.forEach((src, idx) => {
                const img = document.createElement("img");
                img.src = src;
                if (idx === currentGalleryIndex) img.classList.add("active");
                popupImagesContainer.appendChild(img);
            });
        };

        const showNextPhoto = () => {
            currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
            renderGallery();
        };

        const showPrevPhoto = () => {
            currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            renderGallery();
        };

        const openPhotoPopup = (galleryKey) => {
             currentGalleryImages = galleries[galleryKey] || [];
             if(currentGalleryImages.length > 0) {
                currentGalleryIndex = 0;
                renderGallery();
                photoPopup.style.display = "flex";
                document.body.classList.add('no-scroll');
             }
        };

        const closePhotoPopup = () => {
            photoPopup.style.display = "none";
            document.body.classList.remove('no-scroll');
        };

        document.querySelectorAll(".photo-link a[data-gallery]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                openPhotoPopup(link.dataset.gallery);
            });
        });

        if (photoPopupNextBtn) photoPopupNextBtn.addEventListener("click", showNextPhoto);
        if (photoPopupPrevBtn) photoPopupPrevBtn.addEventListener("click", showPrevPhoto);
        if (photoPopupCloseBtn) photoPopupCloseBtn.addEventListener("click", closePhotoPopup);
        photoPopup.addEventListener("click", e => {
            if (e.target === photoPopup) closePhotoPopup();
        });
    }

    // --- AIRBNB WIDGET LOGIK ---
    const airbnbWidgetContainer = document.getElementById('airbnb-superhost-widget-24131580');
    if (airbnbWidgetContainer) {
        (function() {
            function loadScript(src, onload) {
                const s = document.createElement('script');
                s.src = src;
                s.async = true;
                s.onload = onload;
                s.onerror = () => console.error('Could not load script:', src);
                document.head.appendChild(s);
            }

            function initSuperhost() {
                if (window.AirbnbSuperhostWidget) {
                    AirbnbSuperhostWidget.create('airbnb-superhost-widget-24131580', '24131580');
                } else {
                    setTimeout(initSuperhost, 150);
                }
            }

            loadScript('https://airbnb-proxy.elgordoraba.workers.dev/widget.js', initSuperhost);
        })();

        airbnbWidgetContainer.addEventListener('click', () => {
            window.open('https://www.airbnb.at/rooms/24131580', '_blank');
        });
    }

    // --- LOGIK FÜR SCROLL-ANIMATIONEN ---
const faders = document.querySelectorAll('.fade-in');
const appearOptions = {
  threshold: 0.3, // Element muss zu 30% sichtbar sein
  rootMargin: "0px 0px -50px 0px" // Trigger etwas früher auslösen
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    } else {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, appearOptions);

faders.forEach(fader => {
  appearOnScroll.observe(fader);
});

const ctaFloating = document.querySelector('.cta-floating');
const footer = document.querySelector('footer');

if (ctaFloating && footer) {
  let isVisible = false;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    const windowHeight = window.innerHeight;

    const shouldShow = scrollY > 500 && scrollY + windowHeight < footerTop;

    if (shouldShow && !isVisible) {
      ctaFloating.classList.remove('hiding');
      ctaFloating.classList.add('visible');
      isVisible = true;
    } else if (!shouldShow && isVisible) {
      ctaFloating.classList.remove('visible');
      ctaFloating.classList.add('hiding');
      isVisible = false;

      // Nach Ablauf der Transition sicherstellen, dass .hiding entfernt wird
      setTimeout(() => {
        if (!isVisible) ctaFloating.classList.remove('hiding');
      }, 600); // muss zur CSS-Transition-Dauer passen
    }
  });
}

const waToggle = document.getElementById('wa-toggle');
    const waWidget = document.getElementById('wa-widget');
    const waClose = document.getElementById('wa-close');
    const waForm = document.getElementById('wa-form');
    const waInput = document.getElementById('wa-input');

    // Ihre Telefonnummer im internationalen Format (ohne '+', '00' oder Leerzeichen)
    const phoneNumber = '436509210630';

    if (waToggle) {
        waToggle.addEventListener('click', function() {
            if (waWidget) {
                waWidget.classList.toggle('open');
            }
        });
    }

    if (waClose) {
        waClose.addEventListener('click', function() {
            if (waWidget) {
                waWidget.classList.remove('open');
            }
        });
    }

    if (waForm) {
        waForm.addEventListener('submit', function(event) {
            // Verhindert das Standard-Verhalten des Formulars
            event.preventDefault();

            const message = waInput.value.trim();
            if (message === '') {
                // Leere Nachrichten nicht senden
                return;
            }

            // Erstellt den WhatsApp-Link
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // Öffnet den Link in einem neuen Tab
            window.open(whatsappUrl, '_blank');

            // Optional: Eingabefeld leeren und Widget nach dem Senden schließen
            waInput.value = '';
            if (waWidget) {
                waWidget.classList.remove('open');
            }
        });
    }

  document.getElementById('map-placeholder-streetview').addEventListener('click', function() {
    // Erstelle das iframe-Element
    var iframe = document.createElement('iframe');

    // Setze die Attribute für das iframe
    iframe.src = "https://www.google.com/maps/embed?pb=!4v1759240459840!6m8!1m7!1s2npPsX99OT31Kcon7JxnWQ!2m2!1d48.00060897249904!2d16.8641309679439!3f5.598648!4f0!5f0.7820865974627469"; // <-- ÄNDERE DEINE KARTEN-URL HIER
    iframe.style.border = "0";
    iframe.allowfullscreen = "";
    iframe.loading = "lazy";
    iframe.referrerpolicy = "no-referrer-when-downgrade";

    // Ersetze den Inhalt des Containers durch das iframe
    this.innerHTML = '';
    this.appendChild(iframe);
});

}); // Ende von DOMContentLoaded

function waSend(e){
  e.preventDefault();
  const input = document.getElementById("wa-input");
  const msg = input.value.trim();
  if(!msg) return false;

  // Eigene Nachricht im Chat anzeigen
  const messages = document.getElementById("wa-messages");
  const bubble = document.createElement("div");
  bubble.className = "wa-bubble wa-sent";
  bubble.textContent = msg;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;

  // WhatsApp öffnen
  const phone = "436504124810";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  input.value = "";
  return false;
}

function navigateTo(path) {
  history.pushState(null, null, path);
  handleRoute();
}

function handleRoute() {
  // Pfad aus URL holen, ohne führenden Slash
  const path = window.location.pathname.replace("/", "");
  const targetId = path || "highlights"; // Fallback auf "highlights" oder "home"
  const targetEl = document.getElementById(targetId);

  // Zum passenden Abschnitt scrollen
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: "smooth" });
  }

  // Aktiven Menüpunkt hervorheben
  document.querySelectorAll('nav a[data-link]').forEach(link => {
    const linkPath = link.getAttribute("href").replace("/", "");
    if (linkPath === targetId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// --- Klicks auf Links abfangen ---
document.addEventListener("click", e => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    const href = link.getAttribute("href");
    navigateTo(href);
  }
});

// --- Auf Browsernavigation (Zurück / Vor) reagieren ---
window.addEventListener("popstate", handleRoute);

// --- Router beim ersten Laden starten ---
document.addEventListener("DOMContentLoaded", handleRoute);