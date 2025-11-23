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
   GALLERY FILTERING & RENDERING LOGIC
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

let allGridPhotos = [];
let currentFilteredGrid = [];
let gridIndex = 0;

let allComparePairs = [];
let currentFilteredPairs = [];
let pairIndex = 0;

const PAGE_SIZE = 8;

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

function renderGallery(photos, append = false) {
  const container = document.getElementById("galleryContainer");
  const loadMoreBtn = document.getElementById("loadMoreGrid");
  if (!container || !loadMoreBtn) return;

  if (!append) container.innerHTML = "";

  const start = append ? gridIndex : 0;
  const end = Math.min(start + PAGE_SIZE, photos.length);
  const slice = photos.slice(start, end);

  slice.forEach(photo => {
    const imgName = typeof photo === 'string' ? photo : photo.name;
    const img = document.createElement("img");
    img.src = "/images/" + imgName;
    img.className = "grid-photo fade-in";
    img.addEventListener("click", () => openLightbox(img.src));
    container.appendChild(img);
  });

  gridIndex = end;
  loadMoreBtn.style.display = (gridIndex < photos.length) ? 'inline-block' : 'none';
  loadMoreBtn.textContent = `Load ${Math.min(PAGE_SIZE, photos.length - gridIndex)} More`;
}

function renderComparePairs(pairs, append = false) {
  const container = document.getElementById("compareRow");
  const loadMoreBtn = document.getElementById("loadMoreBA");
  if (!container || !loadMoreBtn) return;

  if (!append) container.innerHTML = "";

  const start = append ? pairIndex : 0;
  const end = Math.min(start + PAGE_SIZE, pairs.length);
  const slice = pairs.slice(start, end);

  slice.forEach(pair => {
    container.appendChild(buildCompare(pair));
  });

  pairIndex = end;
  loadMoreBtn.style.display = (pairIndex < pairs.length) ? 'inline-block' : 'none';
  loadMoreBtn.textContent = `Load ${Math.min(PAGE_SIZE, pairs.length - pairIndex)} More`;
}

function filterGallery() {
  const searchTerm = (document.getElementById('gallerySearch')?.value || '').trim().toLowerCase();

  if (searchTerm === "") {
    currentFilteredGrid = allGridPhotos;
    currentFilteredPairs = allComparePairs;
  } else {
    currentFilteredGrid = allGridPhotos.filter(photo => {
      const name = typeof photo === 'string' ? photo : photo.name;
      const tags = (typeof photo === 'object' && photo.tags) ? photo.tags.join(' ') : '';
      const searchData = (name + " " + tags).toLowerCase();
      return searchData.includes(searchTerm);
    });

    currentFilteredPairs = allComparePairs.filter(pair => {
      const tags = pair.tags ? pair.tags.join(' ') : '';
      const searchData = (pair.label + " " + tags).toLowerCase();
      return searchData.includes(searchTerm);
    });
  }

  gridIndex = 0;
  pairIndex = 0;

  renderGallery(currentFilteredGrid);
  renderComparePairs(currentFilteredPairs);
}

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

    allGridPhotos = shuffle(data.galleryGrid || []);
    currentFilteredGrid = allGridPhotos;

    allComparePairs = shuffle(data.galleryPairs || []);
    currentFilteredPairs = allComparePairs;

    if (compareRow && allComparePairs.length) {
      renderComparePairs(currentFilteredPairs);
    }
    if (galleryContainer && allGridPhotos.length) {
      renderGallery(currentFilteredGrid);
    }
  } catch (err) {
    console.error("Gallery Error:", err);
  }
}

/* ============================================================
   EVENT LISTENERS
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadGalleryPage();
  initHeaderInteractions();

  const searchInput = document.getElementById("gallerySearch");
  const loadMoreGridBtn = document.getElementById("loadMoreGrid");
  const loadMoreBABtn = document.getElementById("loadMoreBA");

  if (searchInput) searchInput.addEventListener("input", filterGallery);
  if (loadMoreGridBtn) loadMoreGridBtn.addEventListener("click", () => renderGallery(currentFilteredGrid, true));
  if (loadMoreBABtn) loadMoreBABtn.addEventListener("click", () => renderComparePairs(currentFilteredPairs, true));
});

/* ============================================================
   ⭐ FIXED — ALWAYS LOAD HEADER + FOOTER (NO DUPLICATION)
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const headerEl = document.getElementById("header-include");
  const footerEl = document.getElementById("footer-include");

  Promise.all([
    headerEl ? fetch("/header.html").then(r => r.text()) : "",
    footerEl ? fetch("/footer.html").then(r => r.text()) : ""
  ])
    .then(([header, footer]) => {
      if (headerEl && header) headerEl.innerHTML = header;
      if (footerEl && footer) footerEl.innerHTML = footer;

      if (typeof initHeaderInteractions === "function") {
        initHeaderInteractions();
      }
    })
    .catch(err => console.error("Include load error:", err));
});

/* ============================================================
   ⭐ GLOBAL STICKY CONTACT BUTTON (NOW ALWAYS WORKS)
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector(".sticky-quick-btn")) {

    const sticky = document.createElement("button");
    sticky.className = "sticky-quick-btn";
    sticky.innerHTML = "💬 Contact";
    sticky.style.zIndex = "99999";
    document.body.appendChild(sticky);

    const panel = document.createElement("div");
    panel.id = "quick-contact-panel";
    panel.className = "quick-contact-panel";
    panel.style.display = "none";
    panel.style.zIndex = "99998";

    panel.innerHTML = `
      <div class="quick-contact-inner">
        <button class="quick-close">×</button>
        <h2>Quick Contact</h2>
        <ul>
          <li><a href="tel:+19295955300">📞 Call Now</a></li>
          <li><a href="sms:+19295955300">💬 Text Us</a></li>
          <li><a href="mailto:hammerbrickhome@gmail.com">✉️ Email Us</a></li>
          <li><a href="/project-estimator.html">🧮 Free Estimate</a></li>
          <li><a href="/contact.html">📝 Contact Form</a></li>
          <li><a href="sms:+19295955300">📷 Send Photos</a></li>
        </ul>
      </div>
    `;

    document.body.appendChild(panel);

    sticky.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.style.display = "flex";
    });

    panel.addEventListener("click", (e) => {
      if (e.target === panel) panel.style.display = "none";
    });

    panel.querySelector(".quick-close").addEventListener("click", () => {
      panel.style.display = "none";
    });
  }
});

