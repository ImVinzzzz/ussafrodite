// ── COMPONENTI ESTERNI (header e footer) ──────────────────
async function loadComponent(selector, filePath) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const response = await fetch(filePath);
    const html = await response.text();
    el.innerHTML = html;
    // Dopo il caricamento, esegui le funzioni che dipendono dall'header
    highlightActiveNav();
    updateClock();
    // Popola gli stardate nel componente appena caricato
    el.querySelectorAll('.js-stardate').forEach(span => {
      span.textContent = getStardate();
    });
  } catch (err) {
    console.warn('Componente non caricato:', filePath, err);
  }
}

function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    if (path !== 'index.html' && path !== '' && href && path.startsWith(href.split('.')[0])) {
      link.classList.add('active');
    }
  });
}

// Avvia il caricamento dei componenti
document.addEventListener('DOMContentLoaded', () => {
  loadComponent('#site-header', 'header.html');
  loadComponent('#site-footer', 'footer.html');
});

/* ============================================================
   USS AFRODITE - NCC 1863 | LCARS SCRIPTS
   ============================================================ */

// ── STARFIELD ──────────────────────────────────────────────
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(count = 220) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     Math.random() * 1.4 + 0.3,
        speed: Math.random() * 0.12 + 0.02,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.008 + 0.002,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const alpha = s.alpha * (0.6 + 0.4 * Math.sin(s.twinklePhase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', () => { resize(); createStars(); });
  resize();
  createStars();
  requestAnimationFrame(drawStars);
})();

// ── ACTIVE NAV LINK ────────────────────────────────────────
(function highlightNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.startsWith(href.split('.')[0])) {
      link.classList.add('active');
    }
    if (path === 'index.html' || path === '') {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    }
  });
})();

// ── STARDATE CALCULATOR ────────────────────────────────────
function getStardate() {
  const now   = new Date();
  const year  = now.getFullYear();
  const start = new Date(year, 0, 1);
  const frac  = (now - start) / (365.25 * 24 * 3600 * 1000);
  return ((year - 1987) * 1000 + frac * 1000).toFixed(1);
}

document.querySelectorAll('.js-stardate').forEach(el => {
  el.textContent = getStardate();
});

// ── LCARS CLOCK ────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('lcars-clock');
  if (!el) return;
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  const ss  = String(now.getSeconds()).padStart(2, '0');
  el.textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── FADE-IN OBSERVER ───────────────────────────────────────
(function initAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.mission-item, .crew-thumb, .padd-item, .diary-card, .section-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    observer.observe(el);
  });

  // When element enters viewport, animate it
  document.querySelectorAll('.mission-item, .crew-thumb, .padd-item, .diary-card, .section-card').forEach(el => {
    el.addEventListener('transitionend', () => {
      el.style.opacity = '';
      el.style.transform = '';
    }, { once: true });
  });

  // Simpler approach: just observe and set visible
  const simpleObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 60 * (Array.from(entry.target.parentNode?.children || []).indexOf(entry.target) % 8));
        simpleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.mission-item, .crew-thumb, .padd-item, .diary-card, .section-card').forEach(el => {
    simpleObserver.observe(el);
  });
})();

// ── PADD GALLERY LIGHTBOX ──────────────────────────────────
(function initPaddLightbox() {
  document.addEventListener("DOMContentLoaded", () => {
    const galleryImages = document.querySelectorAll(".padd-gallery-item img");
    if (galleryImages.length === 0) return;

    const lightbox = document.createElement("div");
    lightbox.className = "padd-lightbox";
    lightbox.id = "paddLightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.innerHTML =
      '<button class="padd-lightbox-close" aria-label="Chiudi popup">' +
      '<i class="fa-solid fa-xmark"></i>' +
      "</button>" +
      '<div class="padd-lightbox-content">' +
      '<img class="padd-lightbox-img" src="" alt="" />' +
      '<div class="padd-lightbox-caption"></div>' +
      "</div>";

    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector(".padd-lightbox-img");
    const lightboxCaption = lightbox.querySelector(".padd-lightbox-caption");
    const closeBtn = lightbox.querySelector(".padd-lightbox-close");

    function openLightbox(imgElement) {
      lightboxImg.src = imgElement.src;
      lightboxImg.alt = imgElement.alt || "";
      const captionElement = imgElement.closest(".padd-gallery-item")?.querySelector(".padd-gallery-caption");
      lightboxCaption.textContent = captionElement ? captionElement.textContent : (imgElement.alt || "");
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    }

    galleryImages.forEach(img => {
      img.addEventListener("click", () => openLightbox(img));
    });

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLightbox();
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.classList.contains("padd-lightbox-content")) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
      }
    });
  });
})();

// ── CONSOLE EASTER EGG ─────────────────────────────────────
console.log('%c USS AFRODITE - NCC 1863', 'color:#ff9900;font-family:monospace;font-size:18px;font-weight:bold;');
console.log('%c CLASS: MIRANDA | STARFLEET REGISTRY', 'color:#7799cc;font-family:monospace;font-size:11px;');
console.log('%c Stardate: ' + getStardate(), 'color:#cc99cc;font-family:monospace;font-size:11px;');

