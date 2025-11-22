/* ============================================================
   HEADER + FOOTER INTERACTIONS
=============================================================== */

function initHeaderInteractions() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav && !navToggle.hasAttribute('data-init')) {
    navToggle.setAttribute('data-init', 'true');

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('show');
      }
    });
  }

  /* Dropdowns */
  document.querySelectorAll('.dropbtn').forEach(btn => {
    const dropdown = btn.closest('.dropdown');

    if (dropdown && !btn.hasAttribute('data-init')) {
      btn.setAttribute('data-init', 'true');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => dropdown.classList.remove('show'));
    }
  });
}

/* ============================================================
   SERVICE FILTER
=============================================================== */
window.filterServices = function () {
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  document.querySelectorAll('.service-grid .card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? "" : "none";
  });
};

/* ============================================================
   LIGHTBOX
=============================================================== */
function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  const img = lightbox.querySelector("img");
  img.src = src;
  lightbox.classList.add("show");
}
document.addEventListener("click", e => {
  const lightbox = document.getElementById("lightbox");
  if (lightbox && e.target === lightbox) lightbox.classList.remove("show");
});

/* ============================================================
   GALLERY
=============================================================== */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let galleryInitialized = false;

async function loadGalleryPage() {
  if (galleryInitialized) return;
  galleryInitialized = true;

  const galleryContainer = document.getElementById("galleryContainer");
  const compareRow = document.getElementById("compareRow");

  if (!galleryContainer && !compareRow) return;

  try {
    const res = await fetch("/gallery.json", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();

    const grid = shuffle(data.galleryGrid || []);
    const pairs = shuffle(data.galleryPairs || []);

    let gridIndex = 0;
    let pairIndex = 0;
    const PAGE = 8;

    function makeSkeleton(h) {
      const sk = document.createElement("div");
      sk.className = "skeleton";
      sk.style.height = h + "px";
      return sk;
    }

    function buildCompare(pair) {
      const card = document.createElement("div");
      card.className = "ba-card fade-in";

      const frame = document.createElement("div");
      frame.className = "ba-frame";

      const before = document.createElement("img");
      before.src = "/images/" + pair.before;
      before.className = "ba-before";

      const afterWrap = document.createElement("div");
      afterWrap.className = "ba-after-wrap";

      const after = document.createElement("img");
      after.src = "/images/" + pair.after;
      after.className = "ba-after";
      afterWrap.appendChild(after);

      const slider = document.createElement("input");
      slider.className = "ba-slider";
      slider.type = "range";
      slider.min = 0;
      slider.max = 100;
      slider.value = 50;

      slider.addEventListener("input", () => {
        afterWrap.style.width = slider.value + "%";
      });

      const caption = document.createElement("div");
      caption.className = "ba-caption";
      caption.textContent = pair.label || "";

      frame.appendChild(before);
      frame.appendChild(afterWrap);
      frame.appendChild(slider);
      card.appendChild(frame);
      card.appendChild(caption);

      return card;
    }

    /* Compare pairs */
    if (compareRow && pairs.length) {
      const slice = pairs.slice(0, PAGE);
      slice.forEach(pair => {
        compareRow.appendChild(buildCompare(pair));
      });
    }

    /* Grid gallery */
    if (galleryContainer && grid.length) {
      const slice = grid.slice(0, PAGE);
      slice.forEach(imgName => {
        const img = document.createElement("img");
        img.src = "/images/" + imgName;
        img.className = "grid-photo";
        img.addEventListener("click", () => openLightbox(img.src));
        galleryContainer.appendChild(img);
      });
    }
  } catch (err) {
    console.error("Gallery Error:", err);
  }
}

/* ============================================================
   MASTER INIT
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadGalleryPage();
  initHeaderInteractions();
});

/* ============================================================
   AUTO-INCLUDE HEADER & FOOTER
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const headerEl = document.getElementById("header-include");
  const footerEl = document.getElementById("footer-include");

  if (headerEl) {
    Promise.all([
      fetch("/header.html").then(r => r.text()),
      fetch("/footer.html").then(r => r.text())
    ]).then(([header, footer]) => {
      headerEl.innerHTML = header;
      footerEl.innerHTML = footer;
      initHeaderInteractions();
    });
  }
});


