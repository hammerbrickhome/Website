/* ============================================================
   HAMMER BRICK & HOME — ULTRA ADVANCED ESTIMATOR BOT v6.1
   (CRITICAL FIX APPLIED: Initialized addonParts to prevent ReferenceError crash on load)
   (Note: Must be deployed with the matching chat.css file)
=============================================================== */

(function() {
  // --- CONFIGURATION & DATA -----------------------------------

  // Borough modifiers
  const BOROUGH_MODS = {
    "Manhattan": 1.18,
    "Brooklyn": 1.08,
    "Queens": 1.05,
    "Bronx": 1.03,
    "Staten Island": 1.0,
    "New Jersey": 0.96
  };

  // Recognized promo codes (optional)
  const DISCOUNTS = {
    "VIP10": 0.10,       // 10% off
    "REFERRAL5": 0.05    // 5% off
  };

  // Fixed Add-On Prices
  const ADD_ON_PRICES = {
    "debrisRemoval": { low: 800, high: 1500 } // Cost of a dumpster and haul-away
  };

  // Optional external URLs (leave empty if not used)
  const CRM_FORM_URL = "";      // e.g. "https://forms.gle/your-form-id"
  const WALKTHROUGH_URL = "";   // e.g. "https://calendly.com/your-link"

  // Global visibility state (Set to TRUE to auto-show chat on every page)
  const AUTO_OPEN_CHAT = false; 

  // Pricing Logic / Services
  const SERVICES = {
    "masonry": {
      label: "Masonry & Concrete",
      emoji: "🧱",
      unit: "sq ft",
      baseLow: 16, baseHigh: 28, min: 2500,
      subQuestion: "What type of finish?",
      context: "Masonry is typically priced by the square foot, often running **$16–$28 per sq ft** depending on the complexity and finish you choose.",
      options: [
        { label: "Standard Concrete ($)", factor: 1.0 },
        { label: "Pavers ($$)", factor: 1.6 },
        { label: "Natural Stone ($$$)", factor: 2.2 }
      ],
      addons: {
        luxury: [
          { label: "Premium border band with contrasting pavers", low: 900, high: 2200, note: "Adds a designer frame to walkways, patios, or driveways." },
          { label: "Decorative inlays or medallion pattern", low: 850, high: 2600, note: "Custom shapes, logos, or patterns for higher curb appeal." },
        ],
        protection: [
          { label: "Full base compaction upgrade", low: 850, high: 2200, note: "Extra gravel, geo-textile, and specialized compactor for maximum longevity." }
        ]
      },
      tips: [
        "Projects often require a minimum size due to labor mobilization costs.",
        "Consider paver sealing for longevity and color protection."
      ]
    },

    "driveway": {
      label: "Driveway",
      emoji: "🚗",
      unit: "sq ft",
      baseLow: 10, baseHigh: 20, min: 3500,
      subQuestion: "Current surface condition?",
      context: "Driveways are priced by the square foot. Factors like existing asphalt removal can add to the cost, which ranges from **$10–$20 per sq ft**.",
      options: [
        { label: "Dirt/Gravel (New)", factor: 1.0 },
        { label: "Existing Asphalt (Removal)", factor: 1.25 },
        { label: "Existing Concrete (Hard Demo)", factor: 1.4 }
      ],
      addons: {
        protection: [
          { label: "Full-depth frost barrier installation", low: 1800, high: 4500, note: "Prevents heaving and cracking in cold weather." },
        ],
        design: [
          { label: "Stamped concrete pattern or coloring", low: 1500, high: 4000, note: "Provides a decorative stone or brick appearance." },
        ],
        speed: [
          { label: "Temporary off-site parking pad", low: 1800, high: 3200, note: "Pads are added to the yard or temporary area while main driveway is closed." }
        ]
      },
      maintenance: [
        { label: "Sealcoat package (asphalt)", low: 450, high: 900, note: "Protective coating every 2-3 years." }
      ],
      tips: [
        "Proper drainage is critical to prevent future damage. Ensure a plan is in place.",
        "Asphalt is cheaper upfront; concrete lasts longer and handles heavier loads."
      ]
    },

    "roofing": {
      label: "Roofing",
      emoji: "🏠",
      unit: "sq ft",
      baseLow: 4.5, baseHigh: 9.5, min: 6500,
      subQuestion: "Roof type?",
      context: "Roofing costs vary widely by material and accessibility. Typical pricing is **$4.50–$9.50 per sq ft**, with a minimum project size of around $6,500.",
      options: [
        { label: "Shingle (Standard)", factor: 1.0 },
        { label: "Flat Roof (NYC Spec)", factor: 1.5 },
        { label: "Slate/Specialty", factor: 2.5 }
      ],
      addons: {
        protection: [
          { label: "Full gutter and downspout replacement", low: 1200, high: 4500, note: "Installation of seamless aluminum gutters." },
          { label: "Ice and water shield upgrade", low: 900, high: 2800, note: "Protective membrane under shingles for harsh weather." }
        ],
        design: [
          { label: "Designer architectural shingles", low: 1200, high: 3500, note: "Higher profile shingles for better curb appeal." }
        ]
      },
      tips: [
        "A proper inspection of decking and ventilation is crucial before installing the new roof.",
        "Flat roofs in NYC often require specialized, reflective materials to meet building codes."
      ]
    },

    "painting": {
      label: "Interior Painting",
      emoji: "🎨",
      unit: "sq ft",
      baseLow: 1.8, baseHigh: 3.8, min: 1800,
      subQuestion: "Paint quality?",
      context: "A standard interior paint job (walls/ceiling) runs about **$1.80–$3.80 per sq ft** of floor space, depending on the quality of paint selected.",
      leadSensitive: true,
      options: [
        { label: "Standard Paint", factor: 1.0 },
        { label: "Premium Paint", factor: 1.3 },
        { label: "Luxury Benjamin Moore", factor: 1.55 }
      ],
      addons: {
        luxury: [
          { label: "Full trim and crown molding paint package", low: 800, high: 2400, note: "Painting of all baseboards, door frames, and window casings." },
        ],
        protection: [
          { label: "Dedicated safety crew and air monitoring (required for older homes)", low: 1200, high: 3500, note: "Dedicated safety crew and air monitoring (required for older homes)." },
        ],
        maintenance: [
          { label: "Minor spackle/crack repair allowance", low: 650, high: 1900, note: "Allowance for light plaster and drywall repair before painting." }
        ]
      },
      tips: [
        "Using a high-quality primer is essential for achieving the best finish and durability.",
        "Always confirm if the paint estimate covers ceilings, doors, and trim."
      ]
    },

    "exterior_paint": {
      label: "Exterior Painting",
      emoji: "🖌",
      unit: "sq ft",
      baseLow: 2.5, baseHigh: 5.5, min: 3500,
      subQuestion: "Surface condition?",
      context: "Exterior painting, including surface prep, typically ranges from **$2.50–$5.50 per sq ft** of surface area. Extensive prep work will increase the price.",
      options: [
        { label: "Good Condition", factor: 1.0 },
        { label: "Peeling / Prep Needed", factor: 1.4 },
        { label: "Heavy Prep / Repairs", factor: 1.8 }
      ],
      addons: {
        protection: [
          { label: "Full power washing and mildew treatment", low: 550, high: 1800, note: "Deep cleaning to ensure paint adheres properly." },
        ],
        design: [
          { label: "Two-tone color scheme allowance", low: 800, high: 2400, note: "Includes a separate color for trim or accent areas." }
        ]
      },
      tips: [
        "A full building scaffold is often required in NYC, which can add significant cost.",
        "Wait for a dry weather window, as exterior painting is highly dependent on climate."
      ]
    },

    "basement_floor": {
      label: "Basement Floor Paint / Epoxy",
      emoji: "🧼",
      unit: "sq ft",
      baseLow: 2.8, baseHigh: 5.5, min: 1200,
      subQuestion: "Floor type?",
      context: "Epoxy and specialized coatings for basements are common, ranging from **$2.80–$5.50 per sq ft** depending on the prep required and the coating system chosen.",
      options: [
        { label: "Standard Floor Paint", factor: 1.0 },
        { label: "Utility-Grade Epoxy", factor: 1.5 },
        { label: "High-Grade Flake Epoxy", factor: 1.9 }
      ],
      addons: {
        protection: [
          { label: "Moisture barrier primer for high-humidity areas", low: 650, high: 1800, note: "Specialized primer for high-humidity or below-grade areas." },
          { label: "Urethane topcoat (high-wear areas)", low: 650, high: 1900, note: "Extra durable clear coat for garages or workshops." }
        ]
      },
      tips: [
        "Moisture control is essential. Test your basement for water intrusion before applying any coating.",
        "Epoxy systems require specific temperature and humidity levels to cure properly."
      ]
    },

    "deck": {
      label: "Deck & Patio",
      emoji: "🌳",
      unit: "sq ft",
      baseLow: 30, baseHigh: 65, min: 8000,
      subQuestion: "Material selected?",
      context: "Decking and patio construction can range from **$30–$65 per sq ft** and up, based on material. Includes framing and foundation work.",
      options: [
        { label: "Pressure-Treated Wood", factor: 1.0 },
        { label: "Composite Decking", factor: 1.45 },
        { label: "Hardwood / Ipe", factor: 1.9 }
      ],
      addons: {
        design: [
          { label: "Picture frame border design", low: 1200, high: 3500, note: "Uses contrasting boards to frame the perimeter." },
        ],
        protection: [
          { label: "Below-deck drainage system", low: 1800, high: 4500, note: "Creates a dry space beneath the deck." },
        ],
        luxury: [
          { label: "Built-in LED deck lighting package", low: 1500, high: 3800, note: "Ambient lighting integrated into risers and posts." }
        ]
      },
      tips: [
        "Always confirm local zoning and permit requirements for size and height restrictions.",
        "Ipe and hardwood require maintenance; composite is nearly maintenance-free."
      ]
    },

    "kitchen": {
      label: "Kitchen Remodel",
      emoji: "🍽️",
      unit: "room", // Use room for simplicity in this context
      options: [
        { label: "Cabinet Reface / Light Remodel", fixedLow: 8000, fixedHigh: 20000 },
        { label: "Full Kitchen Remodel (Mid-Grade)", fixedLow: 25000, fixedHigh: 55000 },
        { label: "Luxury Custom Kitchen", fixedLow: 65000, fixedHigh: 120000 }
      ],
      subQuestion: "Project scope?",
      context: "Kitchen remodeling varies hugely. Our prices are based on scope: light refresh, full remodel, or luxury custom work. We need a walkthrough for a firm quote.",
      addons: {
        luxury: [
          { label: "Pot filler faucet at stove", low: 950, high: 2600, note: "Dedicated cold water tap over the stove area." },
          { label: "Custom range hood and ventilation system", low: 2800, high: 6500, note: "Designer hood with exterior venting." }
        ],
        design: [
          { label: "Custom tile backsplash allowance", low: 1500, high: 4000, note: "Allowance for custom tile work above countertops." }
        ]
      },
      tips: [
        "Ensure all appliances are on site before rough-in begins to avoid delays.",
        "Changing the layout of water and gas lines is the biggest cost driver."
      ]
    },

    "bathroom": {
      label: "Bathroom Remodel",
      emoji: "🛁",
      unit: "room", // Use room for simplicity in this context
      options: [
        { label: "Refresh / Tub Replacement", fixedLow: 6000, fixedHigh: 15000 },
        { label: "Full Bathroom Remodel (Mid-Grade)", fixedLow: 15000, fixedHigh: 30000 },
        { label: "Luxury Custom Shower/Spa Bath", fixedLow: 30000, fixedHigh: 60000 }
      ],
      subQuestion: "Project scope?",
      context: "Bathroom remodeling is complex due to plumbing and waterproofing. Prices depend on the size and fixtures chosen (new tub, custom shower, steam unit, etc.).",
      addons: {
        luxury: [
          { label: "Integrated radiant floor heating", low: 1800, high: 4500, note: "Electric heating system under the tile floor." },
          { label: "Custom glass shower enclosure", low: 1500, high: 3800, note: "Frameless or semi-frameless glass." }
        ],
        speed: [
          { label: "Rapid remodel allowance", low: 1500, high: 4000, note: "Minimizes the time the bathroom is out of service." }
        ],
        maintenance: [
          { label: "Grout cleaning & sealing package (first year)", low: 350, high: 900, note: "Professional clean and seal of all tile grout lines." }
        ]
      },
      tips: [
        "Waterproofing and proper venting are non-negotiable for longevity and mold prevention.",
        "Choosing standard fixture sizes (tub/vanity) saves time and money."
      ]
    }
  };

  // --- STATE --------------------------------------------------

  const state = {
    // Current project object being configured
    currentProject: {
      serviceKey: null,
      area: null,
      areaNote: null,
      optionFactor: 1.0,
      optionLabel: null,
      low: null,
      high: null,
      isRush: false,
      hasDebrisRemoval: false,
      isLeadSafeRequired: false,
      promoCode: null,
      addons: [] // Array of selected Smart Add-On objects
    },
    // Array of completed projects
    projects: [],
    // Global selections
    borough: null,
    buildingType: null,
    promoCode: null,
    // Elements mapped after createInterface()
    els: {} 
  };
  
  // --- ELEMENTS -------------------------------------------------
  
  // Storage for all dynamic elements
  const els = {}; 

  // --- MATH & FORMATTING --------------------------------------

  function formatMoney(amount) {
    if (amount === null) return "N/A";
    return "$" + Math.round(amount).toLocaleString();
  }

  function computeProjectEstimates() {
    let totalLow = 0;
    let totalHigh = 0;
    let totalLowFinal = 0;
    let totalHighFinal = 0;

    state.projects.forEach(est => {
      let low = 0;
      let high = 0;
      const svc = SERVICES[est.serviceKey];
      const boroughMod = BOROUGH_MODS[state.borough] || 1.0;

      // 1. Calculate Base Estimate
      if (svc.unit === "room") {
        // Fixed-price services (Kitchen/Bath)
        low = est.fixedLow;
        high = est.fixedHigh;
      } else {
        // Area-based services
        low = est.area * svc.baseLow * est.optionFactor;
        high = est.area * svc.baseHigh * est.optionFactor;
        // Apply minimum price if estimate is below it
        if (svc.min && low < svc.min) {
          low = svc.min;
          high = svc.min * (high / low); // Scale high price to maintain ratio, or just set high=min
          if (high < low) high = low * 1.5; // Ensure high remains above low
        }
      }

      // 2. Apply Borough Modifier
      low *= boroughMod;
      high *= boroughMod;

      // 3. Apply Fixed Add-Ons (Debris)
      let addonLow = 0;
      let addonHigh = 0;
      if (est.hasDebrisRemoval) {
        addonLow += ADD_ON_PRICES.debrisRemoval.low;
        addonHigh += ADD_ON_PRICES.debrisRemoval.high;
      }

      // 3.1 Apply Smart Add-Ons
      if (est.addons && est.addons.length > 0) {
        est.addons.forEach(addon => {
          addonLow += addon.low;
          addonHigh += addon.high;
        });
      }

      low += addonLow;
      high += addonHigh;

      // 4. Apply Rush/Promo Modifiers
      if (est.isRush) {
        low *= 1.15;
        high *= 1.15;
      }
      if (state.promoCode && DISCOUNTS[state.promoCode]) {
        low *= (1 - DISCOUNTS[state.promoCode]);
        high *= (1 - DISCOUNTS[state.promoCode]);
      }
      
      // 5. Apply Lead Safe Modifier if required
      if (est.isLeadSafeRequired) {
        low *= 1.10;
        high *= 1.10;
      }
      
      // Update the project object with final estimate
      est.low = low;
      est.high = high;
      totalLowFinal += low;
      totalHighFinal += high;
    });

    return { totalLow: totalLowFinal, totalHigh: totalHighFinal };
  }

  function computeGrandTotal() {
    let totalLow = 0;
    let totalHigh = 0;
    state.projects.forEach(est => {
      totalLow += est.low;
      totalHigh += est.high;
    });
    return { totalLow, totalHigh };
  }

  function generateReceiptText() {
    // Ensure all project estimates are computed before generating receipt
    computeProjectEstimates();

    const lines = [];
    lines.push("--- PROJECT ESTIMATE SUMMARY ---");
    lines.push("Location: " + state.borough + " | Building: " + state.buildingType);
    if (state.promoCode) {
      lines.push("Promo Code Applied: " + state.promoCode + " (" + DISCOUNTS[state.promoCode] * 100 + "% off)");
    }
    lines.push("---------------------");

    if (state.projects && state.projects.length > 0) {
      state.projects.forEach((p, idx) => {
        const svc = SERVICES[p.serviceKey];
        const sizePart = p.area ? ` (${p.area} ${svc.unit})` : "";
        const areaPart = p.areaNote ? ` [${p.areaNote}]` : "";

        // **CRITICAL FIX:** Initialize addonParts to prevent ReferenceError crash
        let addonParts = []; 

        // Add Smart Add-ons to the text
        if (p.addons && p.addons.length > 0) {
            addonParts = p.addons.map(a => `\n- SMART ADD-ON: ${a.label} (${formatMoney(a.low)}-${formatMoney(a.high)})`);
        }

        var line = (idx + 1) + ". " + svc.label + sizePart + areaPart;
        if (p.low && p.high) {
          line += " — Range: " + formatMoney(p.low) + "-" + formatMoney(p.high);
        } else {
          line += " — CUSTOM QUOTE REQUIRED";
        }

        if (p.hasDebrisRemoval) {
            line += "\n- FIXED ADD-ON: Debris Removal Included";
        }
        line += addonParts.join('');

        lines.push(line);
      });
    }

    const { totalLow, totalHigh } = computeGrandTotal();
    lines.push("");
    lines.push("GRAND TOTAL ESTIMATE: " + formatMoney(totalLow) + " - " + formatMoney(totalHigh));
    lines.push("---------------------");
    lines.push("Disclaimer: Final quote requires walkthrough. Estimate includes all selected options (Rush, Add-Ons, etc.).");

    return lines.join('\n');
  }

  // --- UI CONSTRUCTION ----------------------------------------

  function injectInitialHTML() {
    // Main Wrapper
    els.wrapper = document.createElement("div");
    els.wrapper.className = "hb-chat-wrapper";
    els.wrapper.style.display = "none";
    document.body.appendChild(els.wrapper);

    // Header
    els.header = document.createElement("div");
    els.header.className = "hb-chat-header";
    els.header.innerHTML = `
      <div class="hb-header-info">
        <div class="hb-logo">🔨 Hammer Brick & Home AI</div>
        <div class="hb-status">Online</div>
      </div>
      <button class="hb-close">X</button>
    `;
    els.wrapper.appendChild(els.header);
    els.close = els.header.querySelector(".hb-close");

    // Body (Messages)
    els.body = document.createElement("div");
    els.body.className = "hb-chat-body";
    els.wrapper.appendChild(els.body);

    // Footer (Input)
    els.footer = document.createElement("div");
    els.footer.className = "hb-chat-footer";
    els.footer.innerHTML = `
      <input type="text" class="hb-chat-input" placeholder="Type your answer..." disabled>
      <button class="hb-chat-send">^</button>
    `;
    els.wrapper.appendChild(els.footer);
    els.input = els.footer.querySelector(".hb-chat-input");
    els.send = els.footer.querySelector(".hb-chat-send");
    
    // Hidden Photo Input (for file uploads)
    els.photoInput = document.createElement("input");
    els.photoInput.type = "file";
    els.photoInput.accept = "image/*, .pdf";
    els.photoInput.style.display = "none";
    els.body.appendChild(els.photoInput);

    // FAB Button
    els.fab = document.createElement("button");
    els.fab.className = "hb-chat-fab";
    els.fab.innerHTML = "Get Estimate";
    document.body.appendChild(els.fab);
  }

  function createInterface() {
    injectInitialHTML();
    
    // Add event listeners
    els.fab.onclick = toggleChat;
    els.close.onclick = toggleChat;

    // Handle Enter keypress in input field
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter" && !els.input.disabled) {
        els.send.click();
      }
    });

    // Handle photo file selection
    els.photoInput.onchange = function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const sizeInMB = (file.size / (1024*1024)).toFixed(2);
            addUserMessage(`[FILE SENT: ${file.name} (${sizeInMB} MB)]`);
            
            // Upload Simulation/Confirmation
            addBotMessage(`Thank you for the photo (${file.name}). We will save this to your file. Please continue with your project details.`);
            
            // Clear the file input for next time
            e.target.value = null;
        }
    };
    
    // Check for auto-open (first load only)
    if (AUTO_OPEN_CHAT && sessionStorage.getItem("hb_chat_active") !== "true") {
      setTimeout(toggleChat, 500);
    }
  }
  
  function toggleChat() {
    if (els.wrapper.classList.contains("hb-open")) {
      // Closing chat
      els.wrapper.classList.remove("hb-open");
      els.fab.style.display = "flex"; 
      els.wrapper.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "false");
    } else {
      // Opening chat
      els.wrapper.style.display = "flex";
      // This timeout allows the display change to register before the animation starts
      setTimeout(() => {
        els.wrapper.classList.add("hb-open");
        els.fab.style.display = "none";
        sessionStorage.setItem("hb_chat_active", "true");
        // Start the conversation only on first open
        if (state.projects.length === 0 && state.borough === null) {
          startConversation();
        } else {
          // If returning, ensure body is scrolled to bottom
          els.body.scrollTop = els.body.scrollHeight;
        }
      }, 50); 
    }
  }

  // --- CONVERSATION FLOW --------------------------------------

  function startConversation() {
    addBotMessage("Hi there! I'm the Hammer Brick & Home AI Estimator.");
    addBotMessage("I can give you a rough cost range for your home project in about 60 seconds.");
    stepOne_Borough();
  }
  
  function addBotMessage(text, isCard = false) {
    const msg = document.createElement("div");
    msg.className = isCard ? "hb-msg hb-bot hb-card" : "hb-msg hb-bot";
    msg.innerHTML = `<span>${text}</span>`;
    els.body.appendChild(msg);
    els.body.scrollTop = els.body.scrollHeight;
  }
  
  function addUserMessage(text) {
    const msg = document.createElement("div");
    msg.className = "hb-msg hb-user";
    msg.innerHTML = `<span>${text}</span>`;
    els.body.appendChild(msg);
    els.body.scrollTop = els.body.scrollHeight;
  }
  
  function updateProgress(percent) {
    // Placeholder for a visual progress bar update
    console.log(`Progress: ${percent}%`);
  }

  // --- STEP 1: Borough Selection ---
  function stepOne_Borough() {
    updateProgress(10);
    const options = Object.keys(BOROUGH_MODS);
    addBotMessage("First, what is your project's location?");
    showChips("borough", options, (selection) => {
      state.borough = selection;
      addUserMessage(selection);
      stepTwo_BuildingType();
    });
  }

  // --- STEP 2: Building Type ---
  function stepTwo_BuildingType() {
    updateProgress(20);
    const options = ["Brownstone/Row-House", "Single Family Home", "Co-op/Condo Unit", "Commercial/Other"];
    addBotMessage("Got it. What type of building is this?");
    showChips("building", options, (selection) => {
      state.buildingType = selection;
      addUserMessage(selection);
      stepThree_SelectService();
    });
  }

  // --- STEP 3: Service Selection (Loop Start) ---
  function stepThree_SelectService() {
    updateProgress(30);
    const options = Object.keys(SERVICES).map(key => SERVICES[key].label);
    addBotMessage(`Perfect. We have ${state.projects.length} project(s) configured. What project would you like to estimate next?`);
    showChips("service", options, (selection) => {
      // Find the service key from the label
      const serviceKey = Object.keys(SERVICES).find(key => SERVICES[key].label === selection);
      
      // Reset current project state and set key
      state.currentProject = {
        serviceKey: serviceKey,
        area: null,
        areaNote: null,
        optionFactor: 1.0,
        optionLabel: null,
        low: null,
        high: null,
        isRush: false,
        hasDebrisRemoval: false,
        isLeadSafeRequired: false,
        promoCode: null,
        addons: []
      };
      
      addUserMessage(selection);
      stepThree_1_ProjectScope();
    });
  }

  // --- STEP 3.1: Project Scope/Options (Fixed Price vs Area) ---
  function stepThree_1_ProjectScope() {
    updateProgress(40);
    const svc = SERVICES[state.currentProject.serviceKey];
    addBotMessage(svc.context);

    const options = svc.options.map(opt => opt.label);
    addBotMessage(svc.subQuestion);
    
    showChips("scope", options, (selection) => {
      const selectedOption = svc.options.find(opt => opt.label === selection);
      
      state.currentProject.optionFactor = selectedOption.factor || 1.0;
      state.currentProject.optionLabel = selectedOption.label;
      state.currentProject.fixedLow = selectedOption.fixedLow;
      state.currentProject.fixedHigh = selectedOption.fixedHigh;
      
      addUserMessage(selection);
      
      if (svc.unit === "room") {
        // Skip area input for fixed-price projects (Kitchen/Bath)
        stepThree_3_AddOns();
      } else {
        stepThree_2_AreaInput();
      }
    });
  }

  // --- STEP 3.2: Area Input (for Area-based projects) ---
  function stepThree_2_AreaInput() {
    updateProgress(45);
    const svc = SERVICES[state.currentProject.serviceKey];
    const prompt = `What is the approximate size of the area in **${svc.unit}**? (Just the number, e.g., '1200')`;
    const validationRegex = /^\d+$/;

    handleManualInput(prompt, validationRegex, (area) => {
      state.currentProject.area = parseInt(area, 10);
      addUserMessage(area);
      stepThree_2_1_AreaNote();
    });
  }
  
  // --- STEP 3.2.1: Area Note / Context ---
  function stepThree_2_1_AreaNote() {
    const prompt = `Optional: Add a short note about the area for context (e.g., 'front and back sidewalk' or 'two stories'). Type 'NO' or hit enter to skip.`;
    const validationRegex = /.+/i;

    handleManualInput(prompt, validationRegex, (note) => {
      if (note.toUpperCase() !== 'NO' && note.trim() !== '') {
        state.currentProject.areaNote = note.trim();
        addUserMessage(note);
      } else {
        addUserMessage("Skipped context note.");
      }
      stepThree_3_AddOns();
    });
  }

  // --- STEP 3.3: Smart Add-Ons (New in v6.1) ---
  function stepThree_3_AddOns() {
    updateProgress(50);
    const svc = SERVICES[state.currentProject.serviceKey];
    if (!svc.addons) {
        addBotMessage("No specific smart add-ons available for this project type.");
        return stepThree_4_Debris();
    }
    
    addBotMessage(`We have some recommended **Smart Add-Ons** for ${svc.label}. Please select any that apply:`);
    
    let html = '';
    const addonGroups = svc.addons;
    let idx = 0;
    
    for (const groupKey in addonGroups) {
        if (addonGroups.hasOwnProperty(groupKey)) {
            const group = addonGroups[groupKey];
            if (group.length === 0) continue;

            // Simple title casing for group key
            const title = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
            html += `<p style="font-weight:bold; margin-top:10px;">${title} Options:</p>`;
            
            group.forEach(addon => {
                const low = addon.low;
                const high = addon.high;
                
                // Embed data in chip for later retrieval
                html += `
                    <div class="hb-chip-checkbox">
                        <input type="checkbox" id="addon-${idx}" data-label="${addon.label}" data-low="${low}" data-high="${high}">
                        <label for="addon-${idx}">
                            ${addon.label} 
                            <span style="font-size:0.8em; opacity:0.8; margin-left:5px;">(${formatMoney(low)}-${formatMoney(high)})</span>
                        </label>
                        <span class="hb-addon-note">${addon.note}</span>
                    </div>`;
                idx++;
            });
        }
    }
    
    showCheckboxChips(html, (selectedAddons) => {
        state.currentProject.addons = selectedAddons;
        
        if (selectedAddons.length > 0) {
            addUserMessage(`Selected ${selectedAddons.length} add-on(s).`);
        } else {
            addUserMessage("No add-ons selected.");
        }
        
        stepThree_4_Debris();
    });
  }

  // --- STEP 3.4: Debris Removal ---
  function stepThree_4_Debris() {
    updateProgress(55);
    addBotMessage("Does this project include debris removal (e.g., hauling away old materials/dumpster rental)? This is a fixed add-on.");
    showChips("debris", ["YES", "NO"], (selection) => {
      state.currentProject.hasDebrisRemoval = selection === 'YES';
      addUserMessage(selection);
      stepThree_5_Rush();
    });
  }

  // --- STEP 3.5: Rush Order ---
  function stepThree_5_Rush() {
    updateProgress(60);
    addBotMessage("Is this a rush order? (We can prioritize your job for a 15% surcharge.)");
    showChips("rush", ["YES", "NO"], (selection) => {
      state.currentProject.isRush = selection === 'YES';
      addUserMessage(selection);
      stepThree_6_CompleteProject();
    });
  }
  
  // --- STEP 3.6: Complete Project & Continue/Finish ---
  function stepThree_6_CompleteProject() {
    // Check for Lead-Safe requirement for Interior Paint
    const svc = SERVICES[state.currentProject.serviceKey];
    if (svc.leadSensitive && state.currentProject.serviceKey === "painting") {
      return stepFive_LeadSafe();
    }
    
    // Finalize the project
    state.projects.push(state.currentProject);
    
    // Compute the estimate for display
    computeProjectEstimates();

    addBotMessage(`Project: **${svc.label}** added to your estimate!`);
    
    // Reset current project state for next use
    state.currentProject = {
      serviceKey: null,
      area: null,
      areaNote: null,
      optionFactor: 1.0,
      optionLabel: null,
      low: null,
      high: null,
      isRush: false,
      hasDebrisRemoval: false,
      isLeadSafeRequired: false,
      promoCode: null,
      addons: []
    };

    stepFour_ContinueFinish();
  }
  
  // --- STEP 4: Continue or Finish ---
  function stepFour_ContinueFinish() {
    updateProgress(70);
    addBotMessage("Would you like to add another project to the estimate, or are you finished?");
    showChips("continue", ["Add Another Project", "Finished - Show Estimate"], (selection) => {
      addUserMessage(selection);
      if (selection === "Add Another Project") {
        stepThree_SelectService();
      } else {
        stepSix_PromoCode();
      }
    });
  }

  // --- STEP 5: Lead Safe Check (only for applicable projects) ---
  function stepFive_LeadSafe() {
    updateProgress(50);
    addBotMessage("Your project is for interior paint. Is this home built **before 1978** (requiring EPA Lead-Safe practices)?");
    showChips("lead", ["YES (Before 1978)", "NO (1978 or Later)"], (selection) => {
      state.currentProject.isLeadSafeRequired = selection === 'YES (Before 1978)';
      addUserMessage(selection);
      stepThree_6_CompleteProject(); // Go back to finalize project and continue/finish
    });
  }

  // --- STEP 6: Promo Code ---
  function stepSix_PromoCode() {
    updateProgress(80);
    const prompt = "Do you have a promo code? Type it in, or type 'NO' to skip.";
    const validationRegex = /.+/i;

    handleManualInput(prompt, validationRegex, (code) => {
      code = code.toUpperCase();
      if (DISCOUNTS[code]) {
        state.promoCode = code;
        addBotMessage(`Successfully applied promo code **${code}**! (${DISCOUNTS[code] * 100}% off)`);
      } else if (code === 'NO' || code.trim() === '') {
        addBotMessage("Skipped promo code.");
      } else {
        addBotMessage("That promo code is not recognized.");
      }
      addUserMessage(code);
      stepSeven_FinalEstimate();
    });
  }

  // --- STEP 7: Final Estimate ---
  function stepSeven_FinalEstimate() {
    updateProgress(100);
    
    // Ensure final estimates are computed with promo code
    computeProjectEstimates(); 

    const { totalLow, totalHigh } = computeGrandTotal();
    const rangeText = formatMoney(totalLow) + " - " + formatMoney(totalHigh);

    addBotMessage(`Thank you!`);
    addBotMessage("Your **Total Estimate** is in the range of **" + rangeText + "** for all " + state.projects.length + " project(s).", false);

    setTimeout(function() {
      const summaryCard = document.createElement("div");
      summaryCard.className = "hb-result-card hb-final-summary";
      
      // Calculate total discount for display
      let totalDiscount = 0;
      if (state.promoCode && DISCOUNTS[state.promoCode]) {
        // Since discount is applied to low/high in computeProjectEstimates, we calculate the difference
        const originalLow = totalLow / (1 - DISCOUNTS[state.promoCode]);
        const originalHigh = totalHigh / (1 - DISCOUNTS[state.promoCode]);
        totalDiscount = (originalLow + originalHigh) / 2 * DISCOUNTS[state.promoCode];
      }
      
      summaryCard.innerHTML = `
        <h3>Your Estimate Summary</h3>
        <p>Your Project(s): **${state.projects.map(p => SERVICES[p.serviceKey].label).join(', ')}**</p>
        <div class="hb-estimate-range">
          ${rangeText}
        </div>
        ${state.promoCode ? `<div class="hb-discount">You saved approx. ${formatMoney(totalDiscount)} with code ${state.promoCode}!</div>` : ''}
        
        <p class="hb-disclaimer-note">
          This is a detailed range based on your inputs. A fixed quote requires an on-site walkthrough.
        </p>
        
        <a href="${CRM_FORM_URL || 'mailto:info@hammerbrickhome.com'}" target="_blank" class="hb-cta-btn">
          ✉️ Get a Written Quote
        </a>
      `;
      addBotMessage(summaryCard.outerHTML, true);
      
      // Post-estimate action chips
      setTimeout(stepEight_FinalActions, 500);

    }, 500);
  }
  
  // --- STEP 8: Final Actions ---
  function stepEight_FinalActions() {
    addBotMessage("What would you like to do next?");
    showChips("final", ["Print Full Receipt", "Start Over"], (selection) => {
      addUserMessage(selection);
      if (selection === "Print Full Receipt") {
        printReceipt();
        stepEight_FinalActions(); // Loop back for other actions
      } else if (selection === "Start Over") {
        window.location.reload();
      }
    });
  }

  // --- UTILS - CHIPS & INPUT ----------------------------------

  function showChips(name, options, callback) {
    // Disable input while chips are active
    els.input.disabled = true;
    els.input.placeholder = "Select an option above...";
    
    const chipContainer = document.createElement("div");
    chipContainer.className = "hb-chip-container";
    chipContainer.dataset.name = name;
    
    options.forEach(option => {
      const chip = document.createElement("button");
      chip.className = "hb-chip";
      chip.textContent = option;
      chip.onclick = function() {
        // Remove all chips from the body
        els.body.querySelectorAll('.hb-chip-container').forEach(c => c.remove());
        callback(option);
      };
      chipContainer.appendChild(chip);
    });
    
    // Add the chip container to the body
    els.body.appendChild(chipContainer);
    els.body.scrollTop = els.body.scrollHeight;
  }
  
  function showCheckboxChips(html, callback) {
    // Disable input while chips are active
    els.input.disabled = true;
    els.input.placeholder = "Select your add-ons...";
    
    const chipContainer = document.createElement("div");
    chipContainer.className = "hb-chip-container hb-checkbox-group";
    chipContainer.innerHTML = html;
    
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "hb-chip hb-confirm-btn";
    confirmBtn.textContent = "Confirm Add-Ons";
    confirmBtn.style.marginTop = "15px";
    
    confirmBtn.onclick = function() {
      const selectedCheckboxes = chipContainer.querySelectorAll('input[type="checkbox"]:checked');
      const selectedAddons = Array.from(selectedCheckboxes).map(cb => ({
          label: cb.dataset.label, 
          low: parseFloat(cb.dataset.low), 
          high: parseFloat(cb.dataset.high), 
          isAddon: true 
      }));
      
      // Remove all chips from the body
      els.body.querySelectorAll('.hb-chip-container').forEach(c => c.remove());
      callback(selectedAddons);
    };
    
    chipContainer.appendChild(confirmBtn);
    els.body.appendChild(chipContainer);
    els.body.scrollTop = els.body.scrollHeight;
  }

  function enableInput(callback) {
    els.input.disabled = false;
    els.input.placeholder = "Type your answer...";
    els.input.focus();

    // Reset send button listener
    var newSend = els.send.cloneNode(true);
    els.send.parentNode.replaceChild(newSend, els.send);
    els.send = newSend;

    els.send.onclick = function() {
      var val = els.input.value.trim();
      if (!val) return;
      addUserMessage(val);
      els.input.value = "";
      els.input.disabled = true;
      els.input.placeholder = "Please wait...";
      callback(val);
    };
  }

  function handleManualInput(prompt, validationRegex, nextStep) {
    addBotMessage(prompt);
    
    // Remove all chips from the body (in case it was a mixed step)
    els.body.querySelectorAll('.hb-chip-container').forEach(c => c.remove());
    
    enableInput(function(response) {
      if (validationRegex.test(response) || response.toUpperCase() === 'NO') {
        nextStep(response);
      } else {
        addBotMessage("That doesn't look like a valid format. Please re-enter.");
        handleManualInput(prompt, validationRegex, nextStep); // Recursive call
      }
    });
  }

  function printReceipt() {
    const receiptText = generateReceiptText();
    
    // Create an invisible iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    iframe.contentDocument.write(`
      <html>
        <head>
          <title>Hammer Brick & Home Estimate</title>
          <style>
            body { font-family: monospace; white-space: pre; margin: 20px; }
            .header { margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
            .header h1 { font-size: 18px; }
            .content { font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔨 HAMMER BRICK & HOME LLC</h1>
            <p>ADVANCED ESTIMATOR RECEIPT</p>
          </div>
          <div class="content">${receiptText}</div>
        </body>
      </html>
    `);
    iframe.contentDocument.close();
    
    iframe.onload = function() {
      iframe.contentWindow.print();
      // Clean up the iframe after printing is done (or fails)
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
    
    addBotMessage("Your full receipt has been sent to your printer (or saved as a PDF).");

    // Add buttons for Walkthrough and Photo Upload
    setTimeout(function() {
      if (WALKTHROUGH_URL) {
        var walkBtn = document.createElement("a");
        walkBtn.className = "hb-chip";
        walkBtn.style.display = "block";
        walkBtn.style.marginTop = "8px";
        walkBtn.textContent = "📅 Book a Walkthrough";
        walkBtn.href = WALKTHROUGH_URL;
        walkBtn.target = "_blank";
        els.body.appendChild(walkBtn);
      }

      // Photo button (triggers hidden input)
      var photoBtn = document.createElement("button");
      photoBtn.className = "hb-chip";
      photoBtn.style.display = "block";
      photoBtn.style.marginTop = "8px";
      photoBtn.textContent = "📷 Add Photos";
      photoBtn.onclick = function() {
        if (els.photoInput) els.photoInput.click();
      };
      els.body.appendChild(photoBtn);

      els.body.scrollTop = els.body.scrollHeight;
    }, 500);
  }

  // --- UTILS -------------------------------------------------

  function enableInput(callback) {
    els.input.disabled = false;
    els.input.placeholder = "Type your answer...";
    els.input.focus();

    // Reset send button listener
    var newSend = els.send.cloneNode(true);
    els.send.parentNode.replaceChild(newSend, els.send);
    els.send = newSend;

    els.send.onclick = function() {
      var val = els.input.value.trim();
      if (!val) return;
      addUserMessage(val);
      els.input.value = "";
      els.input.disabled = true;
      els.input.placeholder = "Please wait...";
      callback(val);
    };
  }

  function handleManualInput() {
    if (!els.input) return; // Safety check
    // Overloaded function - implementation is above, just need to make sure it's exported/used correctly
  }


  // --- INIT ---------------------------------------------------

  function init() {
    console.log("HB Chat: Initializing v6.1 (Syntax Fixed)...");
    createInterface();
    if (sessionStorage.getItem("hb_chat_active") === "true") {
      toggleChat();
    }
  }

  // Call init() when script loads
  init();

})();
