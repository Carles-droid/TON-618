/* ============================================================
   main.js
   TON 618 — Navbar, Mobile Panel, Hero, Scroll Reveal,
             Lightbox
   ============================================================ */

"use strict";

/* ============================================================
   1. UTILIDADES
============================================================ */

/**
 * Selecciona un elemento del DOM
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
const qs = (selector, context = document) => context.querySelector(selector);

/**
 * Selecciona múltiples elementos del DOM
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {NodeList}
 */
const qsa = (selector, context = document) =>
  context.querySelectorAll(selector);

/**
 * Agrega uno o varios event listeners a un elemento
 * @param {Element} el
 * @param {string} events — separados por espacio
 * @param {Function} handler
 * @param {object} [options]
 */
const on = (el, events, handler, options = {}) => {
  if (!el) return;
  events
    .split(" ")
    .forEach((event) => el.addEventListener(event, handler, options));
};

/* ============================================================
   2. NAVBAR — SCROLL
   Agrega .scrolled al #navbar cuando el usuario hace scroll
============================================================ */

const initNavbarScroll = () => {
  const navbar = qs("#navbar");
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  const handleScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
  };

  on(window, "scroll", handleScroll, { passive: true });

  /* Estado inicial por si la página carga con scroll */
  handleScroll();
};

/* ============================================================
   3. MOBILE PANEL — OFF-CANVAS
   Controla apertura/cierre del panel y el overlay
============================================================ */

const initMobilePanel = () => {
  const hamburger = qs("#hamburgerBtn");
  const panel = qs("#mobilePanel");
  const overlay = qs("#mobileOverlay");
  const mobileLinks = qsa(".mobile-nav-links a, .mobile-social-links a");

  if (!hamburger || !panel || !overlay) return;

  const openPanel = () => {
    panel.classList.add("open");
    overlay.classList.add("visible");
    hamburger.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("scrollLock");
    document.getElementById("backToTop").classList.add("force-hidden");
  };

  const closePanel = () => {
    panel.classList.remove("open");
    overlay.classList.remove("visible");
    hamburger.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("scrollLock");
    document.getElementById("backToTop").classList.remove("force-hidden");
  };

  const togglePanel = () => {
    const isOpen = panel.classList.contains("open");
    isOpen ? closePanel() : openPanel();
  };

  on(hamburger, "click", togglePanel);
  on(overlay, "click", closePanel);

  /* Cierre con ESC */
  on(document, "keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      closePanel();
      hamburger.focus();
    }
  });

  /* Cierre al hacer click en cualquier link del panel */
  mobileLinks.forEach((link) => on(link, "click", closePanel));
};

/* ============================================================
   4. HERO — ENTRADA INICIAL
   Agrega .loaded al hero y a .section-hero para disparar
   las animaciones CSS del título, tagline y CTAs
============================================================ */

const initHero = () => {
  const hero = qs(".section-hero");
  if (!hero) return;

  /* Pequeño delay para que la transición CSS sea perceptible */
  requestAnimationFrame(() => {
    setTimeout(() => {
      hero.classList.add("loaded");
    }, 80);
  });
};

/* ============================================================
   5. SCROLL REVEAL
   IntersectionObserver que agrega .revealed a los elementos
   con clase .revealFade, .revealUp o .revealBlur
============================================================ */

const initScrollReveal = () => {
  const targets = qsa(".revealFade, .revealUp, .revealBlur");
  if (!targets.length) return;

  /* Respeta la preferencia del usuario de reducir movimiento */
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReduced) {
    targets.forEach((el) => el.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  targets.forEach((el) => observer.observe(el));
};

/* ============================================================
   6. LIGHTBOX
   Abre/cierra el modal al hacer click en .flyer-item
============================================================ */

const initLightbox = () => {
  const lightbox = qs("#lightbox");
  const lightboxImg = qs("#lightboxImg");
  const lightboxClose = qs("#lightboxClose");
  const lightboxOverlay = qs("#lightboxOverlay");
  const flyerItems = qsa(".flyer-item");

  if (!lightbox || !lightboxImg) return;

  const openLightbox = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("scrollLock");
    document.getElementById("backToTop").classList.add("force-hidden");

    /* Foco al botón de cierre para accesibilidad */
    requestAnimationFrame(() => {
      lightboxClose?.focus();
    });
  };

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("scrollLock");
    lightboxImg.src = "";
    lightboxImg.alt = "";
    document.getElementById("backToTop").classList.remove("force-hidden");
  };

  /* Apertura al click en cada flyer */
  flyerItems.forEach((item) => {
    on(item, "click", () => {
      const img = qs("img", item);
      if (!img) return;
      openLightbox(img.src, img.alt);
    });
  });

  /* Cierre con botón X */
  on(lightboxClose, "click", closeLightbox);

  /* Cierre al click en el overlay */
  on(lightboxOverlay, "click", closeLightbox);

  /* Cierre con ESC */
  on(document, "keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("open")) {
      closeLightbox();
    }
  });
};

/* ============================================================
   7. ACTIVE NAV LINK
   Marca con .active el link de navegación que corresponde
   a la sección visible actual usando IntersectionObserver
============================================================ */

const initActiveNavLink = () => {
  const sections = qsa("main > section[id]");
  const navLinks = qsa(".nav-links a");

  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive =
        href === `#${id}` ||
        href === `${id}.html` ||
        (id === "home" && (href === "#home" || href === "index.html"));

      link.classList.toggle("active", isActive);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: `-${72}px 0px 0px 0px`,
    },
  );

  sections.forEach((section) => observer.observe(section));
};

/* ============================================================
   8. INIT — PUNTO DE ENTRADA
============================================================ */

const init = () => {
  initNavbarScroll();
  initMobilePanel();
  initHero();
  initScrollReveal();
  initLightbox();
  initActiveNavLink();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ——— BACK TO TOP ———
(function () {
  const btn = document.getElementById("backToTop");
  const threshold = 400; // px de scroll para aparecer

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > threshold) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    },
    { passive: true },
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ============================================================
   DEMO MODAL
   Intercepta todos los triggers que apuntan a demo.html
   o a funciones aún no disponibles.
============================================================ */

(function () {
  const modal = document.getElementById("demoModal");
  const overlay = document.getElementById("demoModalOverlay");
  const closeBtn = document.getElementById("demoModalClose");
  const confirmBtn = document.getElementById("demoModalConfirm");

  if (!modal) return;

  // — Abrir
  function openDemoModal() {
    modal.removeAttribute("aria-hidden");
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  // — Cerrar
  function closeDemoModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  // — Triggers: enlaces que apuntan a demo.html
  document.querySelectorAll('a[href="demo.html"]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openDemoModal();
    });
  });

  // — Triggers: botones Tickets (href="#")
  document.querySelectorAll(".btn-tickets").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openDemoModal();
    });
  });

  // — Triggers: lang toggle (desktop — botones ES/EN dentro del nav)
  document.querySelectorAll(".lang-toggle .lang-option").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openDemoModal();
    });
  });

  // — Triggers: lang toggle mobile
  document
    .querySelectorAll(".mobile-lang .mobile-lang-option")
    .forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openDemoModal();
      });
    });

  // — Triggers: CTA "Listen on Bandcamp" (sección CTA, href externo real pero aún no disponible)
  // Nota: si Bandcamp ya está activo, eliminar este bloque.
  document
    .querySelectorAll('a[href="https://ton618.bandcamp.com"]')
    .forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openDemoModal();
      });
    });

  // — Cierre: botones de cierre y confirm
  closeBtn.addEventListener("click", closeDemoModal);
  confirmBtn.addEventListener("click", closeDemoModal);

  // — Cierre: click en overlay
  overlay.addEventListener("click", closeDemoModal);

  // — Cierre: tecla ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeDemoModal();
    }
  });
})();
