/* ============================================================
   HEADER + NAV + CHAT INTERACTIONS
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
    dropbtn.addEventListener('click', e => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('show');
    });
  }

  const chatToggle = document.querySelector('.chat-toggle');
  const chatModal = document.querySelector('.chat-modal');

  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', () => {
      chatModal.style.display = (chatModal.style.display === "flex") ? "none" : "flex";
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initHeaderInteractions, 500);
});

/* ============================================================
   UTILITIES
=============================================================== */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   LIGHTBOX
=============================================================== */
function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.querySelector('img').src = src;
  lightbox.classList.add('show');
}

document.addEventListener('click', e => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && e.target === lightbox) {
    lightbox.classList.remove('show');
  }
});

/* ============================================================
   BUILD BEFORE/AFTER CARD
=============================================================== */
function buildCompareCard(pair) {
  const outer = document.createElement('div');

  const wrap = document.createElement('div');
  wrap.className = 'compare-item fade-in';

  // Before
  const before = document.createElement('img');
  before.className = 'before-img';
  before.src = 'images/' + pair.before;
  before.loading = 'lazy';

  // After
  const afterWrap = document.createElement('div');
  afterWrap.className = 'after-wrap';

  const after = document.createElement('img');
  after.className = 'after-img';
  after.src = 'images/' + pair.after;
  after.loading = 'lazy';

  afterWrap.appendChild(after);

  // Labels
  const lbBefore = document.createElement('div');
  lbBefore.className = 'compare-label';
  lbBefore.textContent = 'Before';

  const lbAfter = document.createElement('div');
  lbAfter.className = 'compare-label right';
  lbAfter.textContent = 'After';

  // Slider
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '50';
  slider.className = 'slider-control';
  slider.addEventListener('input', () => {
    afterWrap.style.width = slider.value + '%';
  });

  wrap.appendChild(before);
  wrap.appendChild(afterWrap);
  wrap.appendChild(lbBefore);
  wrap.appendChild(lbAfter);
  wrap.appendChild(slider);

  const caption = document.createElement('div');
  caption.className = 'compare-caption';
  caption.textContent = pair.label || "";

  outer.appendChild(wrap);
  outer.appendChild(caption);

  return outer;
}

/* ============================================================
   GALLERY PAGE — Load 10 at a time
=============================================================== */
async function loadGalleryPage() {
  const compareRow = document.getElementById('compareRow');
  const gridContainer = document.getElementById('galleryContainer');

  if (!compareRow && !gridContainer) return;

  try {
    const res = await fetch("gallery.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load gallery.json");
    const data = await res.json();

    const galleryPairs = shuffle(data.galleryPairs || []);
    const galleryGrid = shuffle(data.galleryGrid || []);

    /* ----- BEFORE/AFTER (10 at a time) ----- */
    let pairIndex = 0;
    const PAIR_BATCH = 10;

    function loadMorePairs() {
      const slice = galleryPairs.slice(pairIndex, pairIndex + PAIR_BATCH);

      slice.forEach(pair => {
        const skeleton = document.createElement("div");
        skeleton.className = "skeleton";
        skeleton.style.height = "260px";
        compareRow.appendChild(skeleton);

        const card = buildCompareCard(pair);
        setTimeout(() => skeleton.replaceWith(card), 200);
      });

      pairIndex += slice.length;

      if (pairIndex >= galleryPairs.length) {
        document.getElementById("loadMorePairs").style.display = "none";
      }
    }

    /* ----- PHOTO GRID (10 at a time) ----- */
    let gridIndex = 0;
    const GRID_BATCH = 10;

    function loadMoreGrid() {
      const slice = galleryGrid.slice(gridIndex, gridIndex + GRID_BATCH);

      slice.forEach(imgName => {
        const holder = document.createElement("div");
        holder.className = "skeleton";
        holder.style.height = "180px";
        gridContainer.appendChild(holder);

        const img = new Image();
        img.src = "images/" + imgName;
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = imgName;

        img.onload = () => holder.replaceWith(img);
        img.onclick = () => openLightbox(img.src);
      });

      gridIndex += slice.length;

      if (gridIndex >= galleryGrid.length) {
        document.getElementById("loadMoreGrid").style.display = "none";
      }
    }

    // Initial load
    if (compareRow) loadMorePairs();
    if (gridContainer) loadMoreGrid();

    // Button events
    document.getElementById("loadMorePairs")?.addEventListener("click", loadMorePairs);
    document.getElementById("loadMoreGrid")?.addEventListener("click", loadMoreGrid);

  } catch (err) {
    console.error("Gallery Load Error:", err);
  }
}

/* ============================================================
   GALLERY SEARCH
=============================================================== */
function initGallerySearch() {
  const input = document.getElementById("gallerySearch");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();

    // Search grid images
    document.querySelectorAll("#galleryContainer img").forEach(img => {
      const match = img.alt.toLowerCase().includes(q);
      img.style.display = match ? "" : "none";
    });

    // Search before/after captions
    document.querySelectorAll("#compareRow .compare-caption").forEach(cap => {
      const card = cap.parentElement;
      const match = cap.textContent.toLowerCase().includes(q);
      card.style.display = match ? "" : "none";
    });
  });
}

/* ============================================================
   HOMEPAGE — homePairs
=============================================================== */
async function initHomepageBA() {
  const grid = document.getElementById("ba-grid");
  const template = document.getElementById("ba-card");
  const btn = document.getElementById("ba-loadmore");

  if (!grid || !template) return;

  try {
    const res = await fetch("gallery.json", { cache: "no-store" });
    const data = await res.json();
    const pairs = data.homePairs || [];

    let index = 0;
    const BATCH = 6;

    function loadMore() {
      const slice = pairs.slice(index, index + BATCH);

      slice.forEach(pair => {
        const card = template.content.cloneNode(true);

        card.querySelector(".ba-before").src = "images/" + pair.before;
        card.querySelector(".ba-after").src = "images/" + pair.after;
        card.querySelector(".ba-caption").textContent = pair.label;

        const wrap = card.querySelector(".ba-after-wrap");
        const slider = card.querySelector(".ba-slider");

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

  } catch (err) {
    console.error("Homepage BA Error:", err);
  }
}

/* ============================================================
   MASTER INIT
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initHomepageBA();
  initGallerySearch();
});

