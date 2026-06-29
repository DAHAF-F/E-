/* =========================================================
   STIN AVLI TIS MIAS MILIAS — script.js
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Sticky header — darken + shrink on scroll
  --------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  function handleHeaderScroll() {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  handleHeaderScroll();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

  /* ---------------------------------------------------------
     2. Mobile hamburger menu
  --------------------------------------------------------- */
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  function closeMobileNav() {
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
    mobileNav.classList.remove("open");
    mobileNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function openMobileNav() {
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Close menu");
    mobileNav.classList.add("open");
    mobileNav.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.getAttribute("aria-expanded") === "true";
    isOpen ? closeMobileNav() : openMobileNav();
  });
  document.querySelectorAll("[data-nav-mobile]").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) closeMobileNav();
  });

  /* ---------------------------------------------------------
     3. Active nav-link highlighting on scroll
  --------------------------------------------------------- */
  const sections = document.querySelectorAll("main > section[id]");
  const navLinks = document.querySelectorAll(".nav-link[data-nav]");

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      const match = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", match);
    });
  }

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------------------------------------------------------
     4. Scroll-to-About indicator
  --------------------------------------------------------- */
  const scrollIndicator = document.getElementById("scrollIndicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      document.getElementById("about")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------
     5. Generic scroll-reveal via IntersectionObserver
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const siblings = Array.from(el.parentElement?.querySelectorAll(".reveal") || []);
            const idx = siblings.indexOf(el);
            const delay = Math.min(idx * 70, 350);
            setTimeout(() => el.classList.add("in-view"), delay);
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------------------------------------------------------
     6. Animated stat counters (Established / Seating / Awards / Years)
  --------------------------------------------------------- */
  const statNums = document.querySelectorAll(".stat-num");
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1400;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach((el) => statObserver.observe(el));
  }

  /* ---------------------------------------------------------
     7. Menu tabs (Starters / Mains / Desserts / Drinks)
  --------------------------------------------------------- */
  const tabs = Array.from(document.querySelectorAll(".menu-tab"));
  const panels = document.querySelectorAll(".menu-panel");
  const underline = document.querySelector(".menu-tab-underline");

  function moveUnderline(tabEl) {
    if (!underline || !tabEl) return;
    const tabsRect = tabEl.parentElement.getBoundingClientRect();
    const rect = tabEl.getBoundingClientRect();
    underline.style.left = `${rect.left - tabsRect.left}px`;
    underline.style.width = `${rect.width}px`;
  }

  function activateTab(tabEl, { focus = false } = {}) {
    tabs.forEach((t) => {
      const isActive = t === tabEl;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
      t.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach((p) => {
      const match = p.id === `panel-${tabEl.dataset.tab}`;
      p.classList.toggle("active", match);
      p.hidden = !match;
    });
    moveUnderline(tabEl);
    if (focus) tabEl.focus();

    // Re-trigger reveal for newly shown panel items
    const activePanel = document.getElementById(`panel-${tabEl.dataset.tab}`);
    activePanel?.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        activateTab(tabs[(i + 1) % tabs.length], { focus: true });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        activateTab(tabs[(i - 1 + tabs.length) % tabs.length], { focus: true });
      }
    });
  });

  window.addEventListener("load", () => {
    const activeTab = document.querySelector(".menu-tab.active");
    moveUnderline(activeTab);
  });
  window.addEventListener("resize", () => {
    const activeTab = document.querySelector(".menu-tab.active");
    moveUnderline(activeTab);
  });

  /* ---------------------------------------------------------
     8. Download Full Menu (PDF placeholder)
  --------------------------------------------------------- */
  const downloadMenuBtn = document.getElementById("downloadMenu");
  if (downloadMenuBtn) {
    downloadMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("The full menu PDF will be available soon. Please check back shortly.");
    });
  }

  /* ---------------------------------------------------------
     9. Reservation form — validation + success toast
  --------------------------------------------------------- */
  const form = document.getElementById("reservationForm");
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  let toastTimer = null;

  function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 5000);
  }

  function validateField(field) {
    const wrapper = field.closest(".field");
    let valid = field.checkValidity();

    if (field.id === "resPhone" && field.value.trim()) {
      const digits = field.value.replace(/[^\d]/g, "");
      valid = digits.length >= 7;
    }
    if (field.id === "resEmail" && field.value.trim()) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    }

    wrapper.classList.toggle("invalid", !valid);
    return valid;
  }

  if (form) {
    const requiredFields = form.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".field").classList.contains("invalid")) validateField(field);
      });
    });

    // Set min date to today
    const dateInput = document.getElementById("resDate");
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let allValid = true;
      requiredFields.forEach((field) => {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        const firstInvalid = form.querySelector(".field.invalid input, .field.invalid select");
        firstInvalid?.focus();
        return;
      }

      const name = document.getElementById("resName").value.trim();
      showToast(`Thank you, ${name.split(" ")[0]}. Your reservation request has been sent — we'll confirm shortly.`);
      form.reset();
      form.querySelectorAll(".field.invalid").forEach((f) => f.classList.remove("invalid"));
      if (dateInput) dateInput.min = dateInput.min; // retain min after reset
    });
  }

  /* ---------------------------------------------------------
     10. Testimonials carousel
  --------------------------------------------------------- */
  const slides = Array.from(document.querySelectorAll(".testimonial-slide"));
  const dotsWrap = document.getElementById("tDots");
  const prevBtn = document.getElementById("tPrev");
  const nextBtn = document.getElementById("tNext");
  let currentSlide = 0;
  let autoplayTimer = null;

  if (slides.length && dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function goToSlide(index) {
      slides[currentSlide].classList.remove("active");
      dotsWrap.children[currentSlide].classList.remove("active");
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add("active");
      dotsWrap.children[currentSlide].classList.add("active");
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    nextBtn?.addEventListener("click", () => { nextSlide(); restartAutoplay(); });
    prevBtn?.addEventListener("click", () => { prevSlide(); restartAutoplay(); });

    function startAutoplay() {
      if (reduceMotion) return;
      autoplayTimer = setInterval(nextSlide, 6500);
    }
    function restartAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }
    startAutoplay();

    const sliderEl = document.getElementById("testimonialSlider");
    sliderEl?.addEventListener("mouseenter", () => clearInterval(autoplayTimer));
    sliderEl?.addEventListener("mouseleave", startAutoplay);
  }

  /* ---------------------------------------------------------
     11. Newsletter signup
  --------------------------------------------------------- */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterSuccess = document.getElementById("newsletterSuccess");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletterEmail");
      if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.focus();
        return;
      }
      newsletterSuccess.classList.add("show");
      newsletterForm.reset();
      setTimeout(() => newsletterSuccess.classList.remove("show"), 4500);
    });
  }

  /* ---------------------------------------------------------
     12. Dark / light theme toggle
  --------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  function applyTheme(theme) {
    body.classList.toggle("theme-light", theme === "light");
    body.classList.toggle("theme-dark", theme !== "light");
    themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  }

  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("avli-theme") || "dark";
  } catch (err) { /* storage unavailable — default to dark */ }
  applyTheme(savedTheme);

  themeToggle?.addEventListener("click", () => {
    const next = body.classList.contains("theme-light") ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem("avli-theme", next); } catch (err) { /* ignore */ }
  });

  /* ---------------------------------------------------------
     13. Gallery item click — simple lightbox-free focus state
  --------------------------------------------------------- */
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    const title = item.querySelector(".gi-title")?.textContent || "image";
    item.setAttribute("aria-label", `View ${title}`);
  });

})();
