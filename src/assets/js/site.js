/* ============================================================
   USS AFRODITE - NCC 1863 | LCARS SCRIPTS
   Header, footer e navigazione sono già inclusi nell'HTML
   (generati da Eleventy): qui restano solo gli effetti dinamici.
   ============================================================ */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── STARDATE ──────────────────────────────────────────────
  function getStardate(now = new Date()) {
    const year = now.getFullYear();
    const frac = (now - new Date(year, 0, 1)) / (365.25 * 24 * 3600 * 1000);
    return ((year - 1987) * 1000 + frac * 1000).toFixed(1);
  }
  document.querySelectorAll(".js-stardate").forEach((el) => { el.textContent = getStardate(); });

  // ── OROLOGIO LCARS ────────────────────────────────────────
  const clock = document.getElementById("lcars-clock");
  if (clock) {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  // ── CIELO STELLATO ────────────────────────────────────────
  const canvas = document.getElementById("starfield");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w = 0;
    let h = 0;
    let raf = null;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.008 + 0.002,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.phase += s.speed;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha * (0.6 + 0.4 * Math.sin(s.phase))})`;
        ctx.fill();
      }
      raf = reduceMotion ? null : requestAnimationFrame(draw);
    };

    // in pausa quando la scheda non è visibile
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) { draw(); }
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); if (reduceMotion) draw(); }, 150);
    });

    resize();
    draw();
  }

  // ── COMPARSA PROGRESSIVA DELLE CARD ───────────────────────
  const cards = document.querySelectorAll(".mission-item, .crew-thumb, .padd-item, .diary-card, .section-card");
  if (cards.length && "IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const index = Array.prototype.indexOf.call(el.parentNode.children, el) % 8;
        el.addEventListener("transitionend", () => el.classList.remove("reveal", "is-visible"), { once: true });
        setTimeout(() => el.classList.add("is-visible"), 60 * index);
        observer.unobserve(el);
      });
    }, { threshold: 0.05 });
    cards.forEach((el) => { el.classList.add("reveal"); observer.observe(el); });
  }

  // ── IMMAGINI MANCANTI ─────────────────────────────────────
  // Rete di sicurezza: un'immagine non trovata viene nascosta senza
  // lasciare l'icona rotta (i segnaposto "FOTO" sono già nell'HTML).
  const markMissing = (img) => {
    // ignora immagini senza indirizzo (es. quella del lightbox prima del clic)
    if (img.dataset.missing || !img.getAttribute("src") || img.closest(".padd-lightbox")) return;
    img.dataset.missing = "1";
    // ritratti: al posto dell'immagine mostra il segnaposto "FOTO"
    if (img.matches(".crew-photo, .diary-header-pgbox img")) {
      const ph = document.createElement("div");
      ph.className = "photo-placeholder" + (img.matches(".crew-photo") ? " photo-placeholder--lg" : "");
      ph.innerHTML = '<i class="fa-solid fa-circle-user"></i><span>FOTO</span>';
      img.replaceWith(ph);
    } else {
      img.classList.add("img-missing");
    }
  };
  document.addEventListener("error", (e) => {
    if (e.target.tagName === "IMG") markMissing(e.target);
  }, true);
  // immagini già fallite prima che lo script partisse
  document.querySelectorAll("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && !/\.svg($|\?)/i.test(img.src)) markMissing(img);
  });

  // ── LIGHTBOX GALLERIE PADD ────────────────────────────────
  const galleryImages = document.querySelectorAll(".padd-gallery-item img");
  if (galleryImages.length) {
    const box = document.createElement("div");
    box.className = "padd-lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button class="padd-lightbox-close" aria-label="Chiudi popup"><i class="fa-solid fa-xmark"></i></button>' +
      '<div class="padd-lightbox-content"><img class="padd-lightbox-img" alt=""><div class="padd-lightbox-caption"></div></div>';
    document.body.appendChild(box);

    const boxImg = box.querySelector(".padd-lightbox-img");
    const boxCaption = box.querySelector(".padd-lightbox-caption");
    const close = () => { box.classList.remove("active"); document.body.style.overflow = ""; };

    galleryImages.forEach((img) => img.addEventListener("click", () => {
      boxImg.src = img.src;
      boxImg.alt = img.alt || "";
      const cap = img.closest(".padd-gallery-item")?.querySelector(".padd-gallery-caption");
      boxCaption.textContent = cap ? cap.textContent : (img.alt || "");
      box.classList.add("active");
      document.body.style.overflow = "hidden";
    }));
    box.querySelector(".padd-lightbox-close").addEventListener("click", (e) => { e.stopPropagation(); close(); });
    box.addEventListener("click", (e) => {
      if (e.target === box || e.target.classList.contains("padd-lightbox-content")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && box.classList.contains("active")) close();
    });
  }

  // ── CONSOLE ───────────────────────────────────────────────
  console.log("%c USS AFRODITE - NCC 1863", "color:#ff9900;font-family:monospace;font-size:18px;font-weight:bold;");
  console.log("%c CLASS: MIRANDA | STARFLEET REGISTRY", "color:#7799cc;font-family:monospace;font-size:11px;");
  console.log("%c Stardate: " + getStardate(), "color:#cc99cc;font-family:monospace;font-size:11px;");
})();
