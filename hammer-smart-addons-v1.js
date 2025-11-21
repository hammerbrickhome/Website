/* ============================================================
   SMART ADD-ONS — Hammer Brick & Home LLC
   Option C — Full Breakdown by Service + Category
   DOES NOT REMOVE OR REPLACE YOUR EXISTING FUNCTIONS
=============================================================== */

/* -----------------------------------
   FIX 1: EXPORTED TOTALS FOR MAIN ESTIMATOR
   (This allows estimator-advanced.js to add the cost)
----------------------------------- */
window.hammerAddonTotals = { // <--- CRITICAL FIX: Add this new global variable
  low: 0,
  high: 0
};

/* -----------------------------------
   CONFIG — Add-ons for each service
   Groups:
   - luxury      → Luxury Upgrades
   - protection  → Protection & Safety
   - design      → Design Enhancements
   - speed       → Speed / Convenience
   - maintenance → Maintenance Items
----------------------------------- */
const SMART_ADDONS_CONFIG = {
  masonry: {
    title: "Masonry · Pavers · Concrete",
    groups: {
      luxury: [
        { label: "Premium border band with contrasting pavers", low: 900, high: 2200, note: "Adds a designer frame to walkways, patios, or driveways." },
        { label: "Decorative inlays or medallion pattern", low: 850, high: 2600, note: "Custom shapes, logos, or patterns for higher curb appeal." },
        { label: "Raised seating wall or planter", low: 1800, high: 4800, note: "Creates a built-in sitting or planting area along the patio or yard." },
        { label: "Outdoor kitchen prep pad (gas/electric ready)", low: 2200, high: 6800, note: "Reinforced pad and rough-in for a future outdoor kitchen or bar." }
      ],
      protection: [
        { label: "Full base compaction upgrade", low: 850, high: 2200, note: "Extra gravel, compaction, and geotextile for longer-lasting work." },
        { label: "Perimeter drain or channel drain", low: 950, high: 2600, note: "Helps move water away from the house, steps, or driveway." },
        { label: "Concrete edge restraint / curb", low: 650, high: 1600, note: "Keeps pavers locked in and reduces shifting or spreading." }
      ],
      design: [
        { label: "Color upgrade / multi-blend pavers", low: 650, high: 1900, note: "Premium color ranges and blends beyond standard stock options." },
        { label: "Large-format or European-style pavers", low: 1500, high: 5200, note: "Modern oversized pavers with tighter joints and clean lines." },
        { label: "Step face stone veneer upgrade", low: 1100, high: 3600, note: "Applies stone veneer to exposed step faces and risers." }
      ],
      speed: [
        { label: "Weekend or off-hours install (where allowed)", low: 850, high: 2600, note: "Adds extra crew or overtime to speed up completion." },
        { label: "Phased work scheduling", low: 450, high: 1200, note: "Plan project in phases so driveways and entries stay usable." }
      ],
      maintenance: [
        { label: "Polymeric sand refill & joint tightening", low: 250, high: 650, note: "Refreshes joints, reduces weeds, and tightens pavers." },
        { label: "Clean & seal package (pavers or concrete)", low: 450, high: 1800, note: "Helps protect color and surface from stains and salt." },
        { label: "Annual inspection & touch-up visit", low: 350, high: 900, note: "Check joints, sunken areas, and step safety once per year." }
      ]
    }
  },

  driveway: {
    title: "Driveway / Parking Area",
    groups: {
      luxury: [
        { label: "Decorative apron or entry pattern", low: 900, high: 2800, note: "Stamped or paver apron where driveway meets street or sidewalk." },
        { label: "Heated driveway rough-in (conduit only)", low: 2800, high: 7800, note: "Prep for a future heated driveway system where allowed." },
        { label: "Integrated lighting at edges", low: 950, high: 2600, note: "Low-voltage lighting along driveway edges or retaining walls." }
      ],
      protection: [
        { label: "Thicker base / driveway reinforcement", low: 1200, high: 3500, note: "Upgraded gravel and reinforcement for heavy vehicles." },
        { label: "Drain basin or trench drain at garage", low: 950, high: 2600, note: "Helps prevent water from entering garage or basement." }
      ],
      design: [
        { label: "Two-tone driveway with borders", low: 1500, high: 4200, note: "Main field color plus contrasting border or tire track bands." },
        { label: "Stamped concrete pattern upgrade", low: 1800, high: 5200, note: "Simulates stone, slate, or brick with colored stamp patterns." }
      ],
      speed: [
        { label: "Temporary parking pad during work", low: 650, high: 1600, note: "Gravel pad or temporary area while main driveway is closed." }
      ],
      maintenance: [
        { label: "Sealcoat package (asphalt)", low: 450, high: 900, note: "Protects asphalt finish and slows down wear." },
        { label: "First-year checkup & joint touch-up", low: 350, high: 900, note: "Inspect for settlement, cracking, and proper drainage after winter." }
      ]
    }
  },

  roofing: {
    title: "Roofing – Shingle / Flat",
    groups: {
      luxury: [
        { label: "Architectural or designer shingle upgrade", low: 1800, high: 5200, note: "Heavier, dimensional shingles with longer warranties." },
        { label: "Decorative metal accent roofing", low: 2200, high: 7800, note: "Metal panels at dormers, porches, or entry roofs." }
      ],
      protection: [
        { label: "Full ice & water shield upgrade", low: 1500, high: 4200, note: "Enhances leak protection in valleys and eave areas." },
        { label: "High-performance synthetic underlayment", low: 650, high: 1900, note: "Replaces standard felt for better water resistance." },
        { label: "Premium flashing & chimney reflashing", low: 900, high: 2600, note: "Extra attention around chimneys, skylights, and walls." }
      ],
      design: [
        { label: "Color-matched drip edge & accessories", low: 450, high: 1200, note: "Coordinates trims and vents with shingle color." },
        { label: "Decorative ridge cap upgrade", low: 650, high: 1600, note: "Thicker ridge caps with enhanced visual profile." }
      ],
      speed: [
        { label: "One-day tear-off & install (where feasible)", low: 1500, high: 4500, note: "Extra crew to try completing standard roof in one day." }
      ],
      maintenance: [
        { label: "Annual roof inspection & tune-up", low: 350, high: 900, note: "Check flashing, sealants, small nail pops, and ventilation." },
        { label: "Gutter cleaning added to roof project", low: 250, high: 650, note: "Clean gutters and downspouts while roof is being replaced." }
      ]
    }
  },

  siding: {
    title: "Siding – Exterior",
    groups: {
      luxury: [
        { label: "Stone or brick accent wall", low: 3500, high: 9800, note: "Upgrades one key wall or entry area with masonry veneer." },
        { label: "Board-and-batten or mixed cladding look", low: 2200, high: 6800, note: "Mixes textures for a custom exterior design." }
      ],
      protection: [
        { label: "Full house wrap / moisture barrier upgrade", low: 950, high: 2800, note: "Improves moisture protection behind siding." },
        { label: "Flashing and sill pan upgrade at windows", low: 900, high: 2600, note: "Reduces risk of water intrusion at openings." }
      ],
      design: [
        { label: "Premium color or insulated siding line", low: 2600, high: 7800, note: "Higher-end siding with richer colors or built-in insulation." },
        { label: "Decorative trim and crown details", low: 1500, high: 4200, note: "Custom trims around windows, doors, and corners." }
      ],
      speed: [
        { label: "Staged / phased install by elevation", low: 450, high: 1200, note: "Work in phases so parts of home stay less impacted." }
      ],
      maintenance: [
        { label: "Annual siding wash & inspection", low: 350, high: 900, note: "Light wash plus caulk and joint inspection once per year." }
      ]
    }
  },

  windows: {
    title: "Windows & Exterior Doors",
    groups: {
      luxury: [
        { label: "Black or color-exterior window upgrade", low: 900, high: 2600, note: "Upgraded finishes for better curb appeal." },
        { label: "Integrated blinds or shades", low: 650, high: 1900, note: "Blinds sealed between the glass panes." }
      ],
      protection: [
        { label: "Laminated / noise-reducing glass upgrade", low: 1800, high: 4200, note: "Reduces exterior noise and improves security." },
        { label: "Full sill-pan & flashing upgrade", low: 900, high: 2600, note: "Better waterproofing details around the opening." }
      ],
      design: [
        { label: "Interior casing and trim upgrade", low: 1500, high: 4200, note: "New or upgraded trim package around the inside frame." },
        { label: "Integrated security sensors (contact pre-wire)", low: 950, high: 2800, note: "Ready for smart security system integration." }
      ],
      speed: [
        { label: "Phased installation by floor", low: 450, high: 1200, note: "Minimize disruption by replacing all windows on one floor first." }
      ],
      maintenance: [
        { label: "First-year function check & adjustment", low: 350, high: 900, note: "Tune up and adjust sash operation after the first winter." }
      ]
    }
  },

  bathroom: {
    title: "Bathroom – Remodeling",
    groups: {
      luxury: [
        { label: "Frameless glass shower door upgrade", low: 1800, high: 3200, note: "Clean look with minimal metal frame." },
        { label: "Custom vanity with stone countertop", low: 2500, high: 5800, note: "Cabinetry and counter beyond standard stock options." }
      ],
      protection: [
        { label: "Electric floor heating system", low: 2200, high: 4200, note: "Adds comfort, especially in basement or first-floor baths." },
        { label: "Steam shower rough-in prep", low: 3500, high: 8500, note: "Specialized vapor barrier and plumbing prep for a future steam unit." }
      ],
      design: [
        { label: "Built-in tile niche(s) (1–2 units)", low: 450, high: 1200, note: "Recessed storage for shampoo and soap." },
        { label: "Custom stone/glass mosaic accent wall", low: 1500, high: 3800, note: "Feature wall with premium tile." }
      ],
      speed: [
        { label: "Extended crew / accelerated timeline", low: 1500, high: 4500, note: "More crew or overtime to speed up construction." }
      ],
      maintenance: [
        { label: "Quiet exhaust fan with timer upgrade", low: 650, high: 1400, note: "Reduces noise and improves moisture removal." }
      ]
    }
  },

  kitchen: {
    title: "Kitchen – Remodeling",
    groups: {
      luxury: [
        { label: "Custom pull-out organizers / inserts", low: 900, high: 2600, note: "Advanced cabinet accessories for maximum storage." },
        { label: "Appliance garage or custom panel fridge/dishwasher", low: 2200, high: 6800, note: "Concealed small appliance area or integrated appliance panels." }
      ],
      protection: [
        { label: "Dedicated circuit for heavy-duty appliances", low: 950, high: 2800, note: "New circuits for induction cooktops or double ovens." },
        { label: "Plumbing shut-off valve upgrade", low: 650, high: 1600, note: "New, easy-to-access main shutoffs for sink/dishwasher." }
      ],
      design: [
        { label: "Full-height backsplash (counter to cabinet)", low: 1500, high: 4200, note: "Extends tile or stone from counter to upper cabinets." },
        { label: "Under-cabinet lighting package", low: 950, high: 2200, note: "Task lighting for prep areas." }
      ],
      speed: [
        { label: "Temporary kitchenette setup", low: 900, high: 2600, note: "Provides a temporary sink, microwave, and fridge during demo." }
      ],
      maintenance: [
        { label: "Water filter system install (under sink)", low: 450, high: 1200, note: "Dedicated filtered water faucet at the main sink." }
      ]
    }
  },

  basement: {
    title: "Basement / Finishing",
    groups: {
      luxury: [
        { label: "Wet bar or kitchenette rough-in", low: 3500, high: 9500, note: "Plumbing and electrical prep for a future bar area." },
        { label: "Custom built-in shelving or media center", low: 2800, high: 7800, note: "Creates high-end, integrated storage." }
      ],
      protection: [
        { label: "Dedicated dehumidifier with pump drain", low: 950, high: 2200, note: "Automated moisture control." },
        { label: "Sound-damped ceiling over main area", low: 2200, high: 5200, note: "Reduces sound transmission from upper floors." }
      ],
      design: [
        { label: "Egress window rough budget (where allowed)", low: 4500, high: 9500, note: "Adds natural light and code-required emergency exit." },
        { label: "Recessed lighting grid upgrade", low: 1800, high: 4200, note: "More fixtures for brighter, more even light." }
      ],
      speed: [
        { label: "Temporary storage pod rental & load-in", low: 650, high: 1800, note: "On-site storage for basement contents during work." }
      ],
      maintenance: [
        { label: "Sump pump and battery backup system", low: 1500, high: 3800, note: "Reliable water removal, even during power outages." }
      ]
    }
  },
  
  // New service configurations should be added here...
};

/* -----------------------------------
   HELPER FUNCTIONS
----------------------------------- */
function formatMoney(amount) {
  if (typeof amount !== 'number') return '$0';
  return '$' + Math.round(amount).toLocaleString('en-US');
}

/* -----------------------------------
   UI RENDERING LOGIC
----------------------------------- */
const panel = document.getElementById("smart-addons-panel");

/**
 * Renders the add-on panel for the selected service.
 * @param {string} serviceKey - The key for the service (e.g., 'masonry').
 */
function renderSmartAddons(serviceKey) {
  if (!panel) return;
  const config = SMART_ADDONS_CONFIG[serviceKey];

  if (!config) {
    panel.innerHTML = '<p class="addons-subnote" style="text-align:center;">No smart add-ons available for this project type.</p>';
    panel.dataset.active = 'false';
    return;
  }

  panel.dataset.active = 'true';

  let html = `<h4 class="addons-title">${config.title}</h4>
              <p class="addons-subnote">Optional upgrades many homeowners add to this type of project.</p>`;
  
  let groupsHtml = '';
  for (const groupKey in config.groups) {
    const groupItems = config.groups[groupKey];
    
    // Capitalize the group title (e.g., 'luxury' -> 'Luxury Options')
    const groupTitle = groupKey.charAt(0).toUpperCase() + groupKey.slice(1) + ' Options';
    
    let itemsHtml = '<div class="addons-list">';
    groupItems.forEach(item => {
      // Use the groupKey + item label as a unique ID for the checkbox
      const itemId = `addon-${serviceKey}-${groupKey}-${item.label.replace(/\s/g, '-')}`;
      
      itemsHtml += `
        <label for="${itemId}" class="addon-item"
          data-low="${item.low}" data-high="${item.high}"
          data-note="${item.note.replace(/"/g, '&quot;')}"
        >
          <input type="checkbox" id="${itemId}" name="addon" value="${item.label}">
          <span class="addon-label">${item.label}</span>
          <span class="addon-price">(${formatMoney(item.low)} – ${formatMoney(item.high)})</span>
        </label>
      `;
    });
    itemsHtml += '</div>';

    groupsHtml += `
      <div class="addon-group">
        <h5 class="addon-group-title">${groupTitle}</h5>
        ${itemsHtml}
      </div>
    `;
  }
  
  panel.innerHTML = html + groupsHtml;
}

/**
 * Appends the breakdown of selected add-ons to the result box.
 * This runs after the main estimate is calculated.
 */
function applySmartAddonBreakdown() {
  // We target the breakdown element. The original code used 'base.el'.
  // We'll explicitly define it to ensure we target the container captured by PDF/Email.
  const baseEl = document.getElementById("est-result-breakdown");
  const resultBox = document.getElementById("est-result");
  const panel = document.getElementById("smart-addons-panel");

  if (!baseEl || !resultBox || !panel || panel.dataset.active !== 'true') {
    // Clear totals if no add-ons are active
    window.hammerAddonTotals.low = 0;
    window.hammerAddonTotals.high = 0;
    return;
  }
  
  // Remove any previous add-on breakdown
  const oldBreakdown = document.getElementById('addon-breakdown');
  if (oldBreakdown) oldBreakdown.remove();

  const selectedItems = panel.querySelectorAll('.addon-item input:checked');
  if (selectedItems.length === 0) {
    // Clear totals if nothing is selected
    window.hammerAddonTotals.low = 0;
    window.hammerAddonTotals.high = 0;
    return;
  }

  let totalLow = 0;
  let totalHigh = 0;
  let itemsHtml = '';
  
  selectedItems.forEach(input => {
    const labelEl = input.closest('.addon-item');
    const low = parseInt(labelEl.dataset.low);
    const high = parseInt(labelEl.dataset.high);
    const note = labelEl.dataset.note;

    totalLow += low;
    totalHigh += high;

    itemsHtml += `
      <div class="breakdown-item addon-line" title="${note}">
        <div class="item-label">${input.value} <span class="addon-note">(${note})</span></div>
        <div class="item-price">${formatMoney(low)} – ${formatMoney(high)}</div>
      </div>
    `;
  });

  const breakdownHtml = `
    <div id="addon-breakdown" class="result-breakdown-card" style="margin-top:15px; border-top: 1px solid rgba(255,255,255,0.1);">
      <h5 style="margin:5px 0; color:#f0dca0; font-size:14px;">🛠️ Smart Add-Ons Selected</h5>
      
      ${itemsHtml}

      <div class="breakdown-item addon-total" style="font-weight:bold; padding-top:4px; border-top:1px solid rgba(255,255,255,0.2);">
        <div class="item-label">Add-Ons Subtotal</div>
        <div class="item-price">${formatMoney(totalLow)} – ${formatMoney(totalHigh)}</div>
      </div>

      <div style="margin-top:6px;font-size:11px;color:#aaa;">
        Note: Add-ons are approximate and will be itemized in your written estimate after a walkthrough.
      </div>
    </div>
  `;

  // <--- CRITICAL FIX 2: Export the calculated totals for the main script
  window.hammerAddonTotals.low = totalLow;
  window.hammerAddonTotals.high = totalHigh;

  // <--- CRITICAL FIX 3: Change insertion point from 'afterend' to 'beforeend'
  // This places the content *inside* the main breakdown element (est-result-breakdown),
  // which is necessary for it to be captured by PDF/Email/Save functions.
  baseEl.insertAdjacentHTML("beforeend", breakdownHtml); // Change was made here
}

/* -----------------------------------
   INIT — Hook into your existing estimator
----------------------------------- */
window.addEventListener("load", () => {
  const serviceSelect = document.getElementById("est-service");
  const form = document.getElementById("est-form");
  const panel = document.getElementById("smart-addons-panel");

  if (!serviceSelect || !form || !panel) return;

  // When service changes, render matching add-ons
  serviceSelect.addEventListener("change", () => {
    renderSmartAddons(serviceSelect.value);
  });

  // Render for initial selected service
  renderSmartAddons(serviceSelect.value);

  // When the estimator form is submitted:
  // - Your original listener runs first (calculateEstimate)
  // - Then our listener runs and extends the result box
  form.addEventListener("submit", (evt) => {
    // Original handler already called evt.preventDefault()
    // We just wait for DOM updates, then add the breakdown.
    setTimeout(applySmartAddonBreakdown, 0);
  });
});
