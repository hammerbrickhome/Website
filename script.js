/* ============================================================
   ✅ HEADER + FOOTER INTERACTIONS
=============================================================== */
function initHeaderInteractions() {
  /* --- Mobile nav toggle --- */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');
    });
  }

  /* --- Dropdown (Service Areas) toggle --- */
  const dropbtn = document.querySelector('.dropbtn');
  const dropdown = document.querySelector('.dropdown');
  if (dropbtn && dropdown) {
    dropbtn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  /* --- Chat bubble toggle --- */
  const chatToggle = document.querySelector('.chat-toggle');
  const chatModal = document.querySelector('.chat-modal');
  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', () => {
      chatModal.style.display =
        chatModal.style.display === 'flex' ? 'none' : 'flex';
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initHeaderInteractions, 500);
});


/* ============================================================
   🔧 UTILITIES
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
   🔍 GALLERY SEARCH
=============================================================== */
function initGallerySearch() {
  const input = document.getElementById("gallerySearch");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();

    // Filter grid photos
    document.querySelectorAll(".grid-photo").forEach(img => {
      img.style.display = img.alt.toLowerCase().includes(q) ? "" : "none";
    });

    // Filter Before/After captions
    document.querySelectorAll(".compare-caption").forEach(cap => {
      const card = cap.parentElement;
      const match = cap.textContent.toLowerCase().includes(q);
      card.style.display = match ? "" : "none";
    });
  });
}


/* ============================================================
   🖼️ LIGHTBOX
=============================================================== */
function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  lb.querySelector("img").src = src;
  lb.classList.add("show");
}

document.addEventListener("click", (e) => {
  const lb = document.getElementById("lightbox");
  if (e.target === lb) lb.classList.remove("show");
});


/* ============================================================
   🖼️ GALLERY PAGE LOADER
=============================================================== */
async function loadGalleryPage() {
  const galleryContainer = document.getElementById("galleryContainer");
  const compareRow = document.getElementById("compareRow");

  if (!galleryContainer && !compareRow) return;

  const btnGrid = document.getElementById("loadMoreGrid");  // HTML button
  const btnPairs = document.getElementById("loadMoreBA");    // HTML button

  const res = await fetch("gallery.json", { cache: "no-store" });
  if (!res.ok) return console.error("❌ gallery.json failed to load");
  const data = await res.json();

  const gridArr = shuffle(data.galleryGrid || []);
  const pairArr = shuffle(data.galleryPairs || []);

  let gridIndex = 0;
  let pairIndex = 0;
  const BATCH = 8;

  /* ------------------------------------------
     GRID PHOTOS
  ------------------------------------------ */
  function renderGrid() {
    const slice = gridArr.slice(gridIndex, gridIndex + BATCH);
    slice.forEach(name => {
      const img = document.createElement("img");
      img.src = "images/" + name;
      img.alt = name;
      img.className = "grid-photo";
      img.loading = "lazy";
      img.onclick = () => openLightbox(img.src);
      galleryContainer.appendChild(img);
    });

    gridIndex += slice.length;
    if (gridIndex >= gridArr.length) btnGrid.style.display = "none";
  }

  /* ------------------------------------------
     BEFORE / AFTER CARDS
  ------------------------------------------ */
  function renderPairs() {
    const slice = pairArr.slice(pairIndex, pairIndex + BATCH);
    slice.forEach(item => {
      if (!item.before || !item.after) return;

      const wrapper = document.createElement("div");

      const card = document.createElement("div");
      card.className = "compare-item";

      // Before
      const before = document.createElement("img");
      before.src = "images/" + item.before;
      before.className = "before-img";

      // After
      const afterWrap = document.createElement("div");
      afterWrap.className = "after-wrap";
      const after = document.createElement("img");
      after.src = "images/" + item.after;
      after.className = "after-img";
      afterWrap.appendChild(after);

      // Labels
      const labelB = document.createElement("div");
      labelB.className = "compare-label";
      labelB.textContent = "Before";

      const labelA = document.createElement("div");
      labelA.className = "compare-label right";
      labelA.textContent = "After";

      // Slider
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = 0;
      slider.max = 100;
      slider.value = 50;
      slider.className = "slider-control";
      slider.addEventListener("input", () => {
        afterWrap.style.width = slider.value + "%";
      });

      card.appendChild(before);
      card.appendChild(afterWrap);
      card.appendChild(labelB);
      card.appendChild(labelA);
      card.appendChild(slider);

      // Caption
      if (item.label) {
        const caption = document.createElement("div");
        caption.className = "compare-caption";
        caption.textContent = item.label;

        wrapper.appendChild(card);
        wrapper.appendChild(caption);
        compareRow.appendChild(wrapper);
      } else {
        compareRow.appendChild(card);
      }
    });

    pairIndex += slice.length;
    if (pairIndex >= pairArr.length) btnPairs.style.display = "none";
  }

  /* Initial load */
  renderGrid();
  renderPairs();

  /* Button events */
  btnGrid.addEventListener("click", renderGrid);
  btnPairs.addEventListener("click", renderPairs);
}


/* ============================================================
   🚀 MASTER INIT
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initGallerySearch();
  loadGalleryPage();
});
