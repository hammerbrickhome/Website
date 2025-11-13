/* ---------------------------
   SHUFFLE HELPER
---------------------------- */
function shuffle(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/* ============================================================
   GALLERY PAGE LOADER
=============================================================== */
async function loadGalleryPage() {
  const gridBox = document.getElementById("galleryContainer");
  const pairBox = document.getElementById("compareRow");
  if (!gridBox && !pairBox) return;

  let gridIndex = 0;
  let pairIndex = 0;
  const PAGE = 8;

  const res = await fetch("gallery.json", { cache: "no-store" });
  const data = await res.json();

  const grid = shuffle(data.galleryGrid || []);
  const pairs = shuffle(data.galleryPairs || []);

  /* -------------------- BEFORE & AFTER -------------------- */
  function buildPairCard(p) {
    const wrap = document.createElement("div");
    wrap.className = "compare-item";

    wrap.innerHTML = `
      <img class="before-img" src="images/${p.before}">
      <div class="after-wrap"><img class="after-img" src="images/${p.after}"></div>
      <div class="compare-label">Before</div>
      <div class="compare-label right">After</div>
      <input type="range" min="0" max="100" value="50" class="slider-control">
      <div class="compare-caption">${p.label || ""}</div>
    `;

    const slider = wrap.querySelector(".slider-control");
    const afterWrap = wrap.querySelector(".after-wrap");
    slider.oninput = () => (afterWrap.style.width = slider.value + "%");

    return wrap;
  }

  function loadMorePairs() {
    const slice = pairs.slice(pairIndex, pairIndex + PAGE);
    slice.forEach(p => pairBox.appendChild(buildPairCard(p)));
    pairIndex += slice.length;

    if (pairIndex >= pairs.length)
      document.getElementById("loadMoreBA").style.display = "none";
  }

  /* -------------------- PHOTO GRID -------------------- */
  function loadMoreGrid() {
    const slice = grid.slice(gridIndex, gridIndex + PAGE);
    slice.forEach(src => {
      const img = document.createElement("img");
      img.src = "images/" + src;
      img.alt = "Project Photo";
      img.className = "grid-photo";
      img.onclick = () => openLightbox(img.src);
      gridBox.appendChild(img);
    });

    gridIndex += slice.length;

    if (gridIndex >= grid.length)
      document.getElementById("loadMoreGrid").style.display = "none";
  }

  loadMorePairs();
  loadMoreGrid();

  document.getElementById("loadMoreBA").onclick = loadMorePairs;
  document.getElementById("loadMoreGrid").onclick = loadMoreGrid;

  initGallerySearch();
}

/* ============================================================
   SEARCH
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
      const card = cap.closest(".compare-item").parentNode;
      const text = cap.textContent.toLowerCase();
      card.style.display = text.includes(q) ? "" : "none";
    });
  });
}

/* ============================================================
   LIGHTBOX
=============================================================== */
function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  lb.querySelector("img").src = src;
  lb.classList.add("show");
}

document.addEventListener("click", e => {
  const lb = document.getElementById("lightbox");
  if (e.target === lb) lb.classList.remove("show");
});

