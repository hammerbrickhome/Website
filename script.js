/* ============================================================
   HEADER + FOOTER INTERACTIONS
=============================================================== */
function initHeaderInteractions() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');
    });
  }

  const dropbtn = document.querySelector('.dropbtn');
  const dropdown = document.querySelector('.dropdown');
  if (dropbtn && dropdown) {
    dropbtn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });
    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) dropdown.classList.remove('show');
    });
  }

  const chatToggle = document.querySelector('.chat-toggle');
  const chatModal = document.querySelector('.chat-modal');
  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', () => {
      chatModal.style.display =
        chatModal.style.display === "flex" ? "none" : "flex";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initHeaderInteractions, 500);
});

/* ============================================================
   UTIL — Shuffle
=============================================================== */
function shuffle(arr) {
  return arr
    .map(x => ({ value: x, sort: Math.random() }))
    .sort((a,b) => a.sort - b.sort)
    .map(x => x.value);
}

/* ============================================================
   LIGHTBOX
=============================================================== */
function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  lb.querySelector("img").src = src;
  lb.classList.add("show");
}

document.addEventListener("click", e => {
  const lb = document.getElementById("lightbox");
  if (lb && e.target === lb) {
    lb.classList.remove("show");
  }
});

/* ============================================================
   GALLERY SEARCH
=============================================================== */
function initGallerySearch() {
  const input = document.getElementById("gallerySearch");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();

    document.querySelectorAll(".grid-photo").forEach(img => {
      img.style.display = img.alt.toLowerCase().includes(q) ? "" : "none";
    });

    document.querySelectorAll(".compare-caption").forEach(cap => {
      const card = cap.parentElement;
      const show = cap.textContent.toLowerCase().includes(q);
      card.style.display = show ? "" : "none";
    });
  });
}

/* ============================================================
   GALLERY PAGE - USE gallery.html BUTTONS (NO DUPLICATES)
=============================================================== */
async function loadGalleryPage() {
  const gridEl = document.getElementById("galleryContainer");
  const pairEl = document.getElementById("compareRow");
  if (!gridEl && !pairEl) return;

  const loadMoreGridBtn = document.getElementById("galleryLoadMore");
  const loadMorePairsBtn = document.getElementById("compareLoadMore");

  const res = await fetch("gallery.json", { cache: "no-store" });
  if (!res.ok) return console.error("Cannot load gallery.json");

  const data = await res.json();

  const grid = shuffle(data.galleryGrid || []);
  const pairs = shuffle(data.galleryPairs || []);

  let gridIndex = 0;
  let pairIndex = 0;
  const BATCH = 8;

  /* ---- GRID ---- */
  function loadMoreGrid() {
    const slice = grid.slice(gridIndex, gridIndex + BATCH);

    slice.forEach(name => {
      const ph = document.createElement("div");
      ph.className = "skeleton";
      ph.style.height = "160px";
      gridEl.appendChild(ph);

      const img = new Image();
      img.src = "images/" + name;
      img.alt = name;
      img.className = "grid-photo";
      img.loading = "lazy";
      img.onload = () => ph.replaceWith(img);
      img.onclick = () => openLightbox(img.src);
    });

    gridIndex += slice.length;
    if (gridIndex >= grid.length) loadMoreGridBtn.style.display = "none";
  }

  /* ---- BEFORE/AFTER ---- */
  function buildPairCard(p) {
    const outer = document.createElement("div");

    const wrap = document.createElement("div");
    wrap.className = "compare-item";

    const before = document.createElement("img");
    before.src = "images/" + p.before;
    before.className = "before-img";

    const afterWrap = document.createElement("div");
    afterWrap.className = "after-wrap";

    const after = document.createElement("img");
    after.src = "images/" + p.after;
    after.className = "after-img";

    afterWrap.appendChild(after);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 100;
    slider.value = 50;
    slider.className = "slider-control";
    slider.addEventListener("input", () => {
      afterWrap.style.width = slider.value + "%";
    });

    const lb1 = document.createElement("div");
    lb1.className = "compare-label";
    lb1.textContent = "Before";

    const lb2 = document.createElement("div");
    lb2.className = "compare-label right";
    lb2.textContent = "After";

    wrap.appendChild(before);
    wrap.appendChild(afterWrap);
    wrap.appendChild(lb1);
    wrap.appendChild(lb2);
    wrap.appendChild(slider);

    const caption = document.createElement("div");
    caption.className = "compare-caption";
    caption.textContent = p.label || "";

    outer.appendChild(wrap);
    outer.appendChild(caption);

    return outer;
  }

  function loadMorePairs() {
    const slice = pairs.slice(pairIndex, pairIndex + BATCH);

    slice.forEach(p => {
      const ph = document.createElement("div");
      ph.className = "skeleton";
      ph.style.height = "250px";
      pairEl.appendChild(ph);

      setTimeout(() => ph.replaceWith(buildPairCard(p)), 250);
    });

    pairIndex += slice.length;
    if (pairIndex >= pairs.length) loadMorePairsBtn.style.display = "none";
  }

  loadMoreGrid();
  loadMorePairs();

  loadMoreGridBtn.addEventListener("click", loadMoreGrid);
  loadMorePairsBtn.addEventListener("click", loadMorePairs);
}

/* ============================================================
   HOMEPAGE BEFORE/AFTER
=============================================================== */
async function initHomepageBA() {
  const grid = document.getElementById("ba-grid");
  const btn = document.getElementById("ba-loadmore");
  const tpl = document.getElementById("ba-card");
  if (!grid || !tpl) return;

  const res = await fetch("gallery.json", { cache: "no-store" });
  if (!res.ok) return;

  const data = await res.json();
  const pairs = data.homePairs || [];

  let index = 0;
  const BATCH = 6;

  function loadMore() {
    const slice = pairs.slice(index, index + BATCH);

    slice.forEach(p => {
      const card = tpl.content.cloneNode(true);
      const b = card.querySelector(".ba-before");
      const a = card.querySelector(".ba-after");
      const wrap = card.querySelector(".ba-after-wrap");
      const cap = card.querySelector(".ba-caption");
      const slider = card.querySelector(".ba-slider");

      b.src = "images/" + p.before;
      a.src = "images/" + p.after;
      cap.textContent = p.label || "";

      slider.addEventListener("input", () => {
        wrap.style.width = slider.value + "%";
      });

      grid.appendChild(card);
    });

    index += slice.length;
    if (index >= pairs.length) btn.style.display = "none";
  }

  loadMore();
  btn.addEventListener("click", loadMore);
}

/* ============================================================
   MASTER INIT
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadGalleryPage();
  initGallerySearch();
  initHomepageBA();
});









