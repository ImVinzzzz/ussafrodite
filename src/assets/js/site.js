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

  // ── BOX "LOG" IN HOMEPAGE: compilazione riga per riga ─────
  // Quando il box entra nello schermo le voci compaiono una alla volta,
  // dalla più vecchia alla più recente, come l'output di un compilatore.
  // Rotellina, tocco o tastiera sull'elenco: compare tutto subito e si
  // scorre a mano. Senza JS o con "riduci movimento": elenco completo.
  const homeLog = document.querySelector(".js-home-log");
  if (homeLog) {
    const rows = [...homeLog.querySelectorAll(".home-log-row")];
    const toBottom = () => { homeLog.scrollTop = homeLog.scrollHeight; };

    if (reduceMotion || !("IntersectionObserver" in window) || !rows.length) {
      toBottom();
    } else {
      const delay = Math.max(25, Math.min(110, 9000 / rows.length)); // ~9 s in tutto
      let i = 0;
      let timer = null;
      rows.forEach((r) => r.classList.add("is-pending"));

      const step = () => {
        if (i >= rows.length) return;
        const row = rows[i++];
        row.classList.remove("is-pending");
        row.classList.add("is-new");
        toBottom();
        timer = setTimeout(step, delay);
      };
      const finish = () => {
        if (i >= rows.length) return;
        clearTimeout(timer);
        rows.forEach((r) => r.classList.remove("is-pending"));
        i = rows.length;
        toBottom();
      };
      ["wheel", "touchstart", "pointerdown", "keydown"].forEach((ev) =>
        homeLog.addEventListener(ev, finish, { passive: true }));

      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        step();
      }, { threshold: 0.25 });
      io.observe(homeLog);
    }
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

  // ── GALLERIE PADD: STESSA ALTEZZA, LARGHEZZA PROPORZIONALE ──
  // Ogni elemento cresce in proporzione al rapporto larghezza/altezza della
  // sua immagine, così tutte le immagini della riga risultano alte uguali
  // senza tagli né deformazioni. La griglia non supera la larghezza che
  // corrisponde all'altezza massima (--padd-gallery-h, vedi 09-padd.css).
  document.querySelectorAll(".padd-gallery-grid").forEach((grid) => {
    const items = [...grid.querySelectorAll(".padd-gallery-item")];
    const imgs = items.map((it) => it.querySelector("img"));
    const layout = () => {
      if (!imgs.every((img) => img && img.naturalWidth > 0)) return;
      let sum = 0;
      items.forEach((it, i) => {
        const ratio = imgs[i].naturalWidth / imgs[i].naturalHeight;
        it.style.flex = `${ratio} 1 0%`;
        sum += ratio;
      });
      grid.style.maxWidth =
        `calc(${sum.toFixed(4)} * var(--padd-gallery-h) + ${items.length - 1} * var(--padd-gallery-gap))`;
    };
    imgs.forEach((img) => img && !img.complete && img.addEventListener("load", layout));
    layout();
  });

  // ── LIGHTBOX GALLERIE (PADD e gallerie fotografiche) ──────
  // Clic su una miniatura: immagine intera a schermo pieno con didascalia.
  // Vale anche per qualsiasi immagine con l'attributo data-lightbox,
  // il cui valore diventa la didascalia:
  //   <img src="…" alt="…" data-lightbox="USS Afrodite - NCC 1863">
  const GALLERY_ITEM = ".padd-gallery-item, .gallery-item";
  const galleryImages = document.querySelectorAll(".padd-gallery-item img, .gallery-item img, img[data-lightbox]");
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
      const cap = img.closest(GALLERY_ITEM)?.querySelector(".padd-gallery-caption, .gallery-item-caption");
      boxCaption.textContent = img.dataset.lightbox || (cap ? cap.textContent : (img.alt || ""));
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

  // ── TORNA IN CIMA ─────────────────────────────────────────
  // Il pulsante (layouts/base.njk) compare dopo aver scorso la pagina
  // di circa mezzo schermo e riporta in cima con uno scorrimento morbido
  // (immediato con "riduci movimento").
  const toTop = document.querySelector(".js-back-to-top");
  if (toTop) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const limit = Math.min(400, window.innerHeight * 0.5);
      toTop.classList.toggle("is-visible", window.scrollY > limit);
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      toTop.blur();
    });
  }

  // ── ALTEZZA HEADER ────────────────────────────────────────
  // Espone l'altezza reale dell'header fisso come --header-h, usata da
  // scroll-margin-top per non far finire i titoli sotto l'header.
  const siteHeader = document.getElementById("site-header");
  if (siteHeader) {
    const setHeaderH = () => document.documentElement.style.setProperty("--header-h", siteHeader.offsetHeight + "px");
    setHeaderH();
    window.addEventListener("resize", setHeaderH, { passive: true });
  }

  // ── BARRA SEZIONI CREW ────────────────────────────────────
  // Evidenzia nella barra .crew-jump la sezione attualmente in vista.
  const jumpLinks = [...document.querySelectorAll(".crew-jump-link")];
  if (jumpLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(jumpLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const visible = new Set();
    const mark = () => {
      const first = [...byId.keys()].find((id) => visible.has(id));
      jumpLinks.forEach((a) => {
        const on = byId.get(first) === a;
        a.classList.toggle("is-current", on);
        if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    };
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
      mark();
    }, { rootMargin: "-30% 0px -60% 0px" });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // ── CONSOLE ───────────────────────────────────────────────
  console.log("%c USS AFRODITE - NCC 1863", "color:#ff9900;font-family:monospace;font-size:18px;font-weight:bold;");
  console.log("%c CLASS: MIRANDA | STARFLEET REGISTRY", "color:#7799cc;font-family:monospace;font-size:11px;");
  console.log("%c Stardate: " + getStardate(), "color:#cc99cc;font-family:monospace;font-size:11px;");
})();
