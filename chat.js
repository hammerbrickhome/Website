/* ============================================================
   HB ULTRA ESTIMATOR BOT v7.1 - PRO TIER BLUEPRINT
   - NYC Price Correction (Higher Base Rates)
   - Mandatory Disclaimer Gate (UX Fix)
   - Improved Size Input (Small/Medium/Large Guidance)
   - Full Service List, Conversational Memory, Dynamic Pricing Hooks
=============================================================== */

(function() {
  // ==========================================================
  // I. CONFIGURATION & DATA (V7.1 Price/UX Update)
  // ==========================================================

  // --- External Settings ---
  const COMPANY_NAME = "Hammer Brick & Home";
  const CONTACT_PHONE = "19295955300"; // 1-929-595-5300
  const CONTACT_EMAIL = "info@hammerbrickhome.com";
  
  // V7.0 PRO TIER INTEGRATION HOOKS - Update these values!
  const CRM_ENDPOINT = "https://api.yourcrm.com/leads/v1";      
  const CRM_API_KEY = "sk-y0urSecrEtAp1Key";                     
  const GA_TRACKING_ID = "G-XXXXXXXXXX";                         
  const VISION_AI_ENDPOINT = "https://vision-ai.api/analyze";   
  const PRICING_API_KEY = "live-cost-key";                       
  const WALKTHROUGH_URL = "";                                   

  // --- Pricing Modifiers ---
  const BOROUGH_MODS = {
    "Manhattan": { factor: 1.18, complexity: 1.2, label: "+18% High Congestion" },
    "Brooklyn": { factor: 1.08, complexity: 1.0, label: "+8% Standard" },
    "Queens": { factor: 1.05, complexity: 1.1, label: "+5% Complexity Factor" },
    "Bronx": { factor: 1.03, complexity: 0.9, label: "+3% Multi-Family Discount" },
    "Staten Island": { factor: 1.0, complexity: 0.95, label: "Base Rate" },
    "New Jersey": { factor: 0.96, complexity: 0.9, label: "-4% Lower Tax/Labor" }
  };

  const DISCOUNTS = {
    "VIP10": 0.10,       // 10% off
    "REFERRAL5": 0.05,    // 5% off
    "SPRINGCLEAN": 0.08   // 8% off
  };

  const ROI_DATA = {
    "kitchen": "Typical ROI on a mid-range Kitchen remodel in NYC is **65-78%**.",
    "bathroom": "Typical ROI on a Bathroom remodel in NYC is **57-73%**."
  };

  const LEAD_MAGNETS = [
    { label: "NYC Home Maintenance Checklist", key: "checklist" },
    { label: "Masonry Care Guide", key: "masonry_guide" }
  ];
  
  // --- Pricing Logic / Services (V7.1 NYC PRICE CORRECTION APPLIED) ---
  const SERVICES = {
    // 1. Masonry
    "masonry": {
      label: "Masonry & Concrete", emoji: "🧱", unit: "sq ft", baseLow: 28, baseHigh: 42, minSize: 100, // MINIMUM SET TO 100 FOR SQ INPUT
      sizeChips: [
        { label: "Small Steps/Patch (100 sq ft)", size: 100 },
        { label: "Medium Sidewalk/Patio (250 sq ft)", size: 250 },
        { label: "Large Driveway/Foundation (450 sq ft)", size: 450 }
      ],
      subQuestion: "What type of finish?",
      options: [
        { label: "Standard Concrete ($)", factor: 1.0 },
        { label: "Pavers ($$)", factor: 1.6 },
        { label: "Natural Stone ($$$)", factor: 2.2 }
      ]
    },
    // 2. Driveway
    "driveway": {
      label: "Driveway", emoji: "🚗", unit: "sq ft", baseLow: 18, baseHigh: 35, minSize: 100, 
      sizeChips: [
        { label: "Small One-Car (150 sq ft)", size: 150 },
        { label: "Standard Two-Car (300 sq ft)", size: 300 },
        { label: "Large/Custom (600 sq ft)", size: 600 }
      ],
      subQuestion: "Current surface condition?",
      options: [
        { label: "Dirt/Gravel (New)", factor: 1.0 },
        { label: "Existing Asphalt (Removal)", factor: 1.25 },
        { label: "Existing Concrete (Hard Demo)", factor: 1.4 }
      ]
    },
    // 3. Roofing
    "roofing": {
      label: "Roofing", emoji: "🏠", unit: "sq ft", baseLow: 8, baseHigh: 16, minSize: 500, 
      subQuestion: "Roof type?",
      options: [
        { label: "Shingle (Standard)", factor: 1.0 },
        { label: "Flat Roof (NYC Spec)", factor: 1.5 },
        { label: "Slate/Specialty", factor: 2.5 }
      ]
    },
    // 4. Painting (Interior)
    "painting": {
      label: "Interior Painting", emoji: "🎨", unit: "sq ft", baseLow: 3.5, baseHigh: 6.5, minSize: 500, 
      sizeChips: [
        { label: "Single Room (400 sq ft)", size: 400 },
        { label: "Small Apartment (900 sq ft)", size: 900 },
        { label: "House Floor / Large Apartment (1500 sq ft)", size: 1500 }
      ],
      subQuestion: "Paint quality?", leadSensitive: true,
      options: [
        { label: "Standard Paint", factor: 1.0 },
        { label: "Premium Paint", factor: 1.3 },
        { label: "Luxury Benjamin Moore", factor: 1.55 }
      ]
    },
    // 5. Exterior Paint
    "exterior_paint": {
      label: "Exterior Painting", emoji: "🖌", unit: "sq ft", baseLow: 5.5, baseHigh: 10.5, minSize: 800, 
      subQuestion: "Surface condition?",
      options: [
        { label: "Good Condition", factor: 1.0 },
        { label: "Peeling / Prep Needed", factor: 1.4 },
        { label: "Heavy Prep / Repairs", factor: 1.8 }
      ]
    },
    // 6. Basement Floor
    "basement_floor": {
      label: "Basement Floor Paint / Epoxy", emoji: "🧼", unit: "sq ft", baseLow: 4.5, baseHigh: 8.5, minSize: 300, 
      subQuestion: "Floor type?",
      options: [
        { label: "1-Part Epoxy Paint", factor: 1.0 },
        { label: "2-Part Epoxy (Thick Coat)", factor: 1.6 },
        { label: "Flake System", factor: 2.1 }
      ]
    },
    // 7. Fence
    "fence": {
      label: "Fence Install", emoji: "🚧", unit: "linear ft", baseLow: 45, baseHigh: 95, minSize: 50, 
      subQuestion: "Fence type?",
      options: [
        { label: "Wood", factor: 1.0 },
        { label: "PVC", factor: 1.6 },
        { label: "Chain-Link", factor: 0.9 },
        { label: "Aluminum", factor: 2.0 }
      ]
    },
    // 8. Deck
    "deck": {
      label: "Deck / Porch Build", emoji: "🪵", unit: "sq ft", baseLow: 55, baseHigh: 85, minSize: 100, 
      subQuestion: "Deck material?",
      options: [
        { label: "Pressure Treated", factor: 1.0 },
        { label: "Composite (Trex)", factor: 1.9 },
        { label: "PVC Luxury", factor: 2.4 }
      ]
    },
    // 9. Drywall
    "drywall": {
      label: "Drywall Install / Repair", emoji: "📐", unit: "sq ft", baseLow: 5.5, baseHigh: 10.5, minSize: 200, 
      subQuestion: "Scope?",
      options: [
        { label: "Minor Repairs", factor: 1.0 },
        { label: "Full Install", factor: 1.6 },
        { label: "Level 5 Finish", factor: 2.1 }
      ]
    },
    // 10. Flooring
    "flooring": {
      label: "Flooring Installation", emoji: "🪚", unit: "sq ft", baseLow: 5.5, baseHigh: 12.5, minSize: 200, 
      subQuestion: "Flooring type?",
      options: [
        { label: "Vinyl Plank", factor: 1.0 },
        { label: "Tile", factor: 1.8 },
        { label: "Hardwood", factor: 2.4 },
        { label: "Laminate", factor: 1.2 }
      ]
    },
    // 11. Powerwash
    "powerwash": {
      label: "Power Washing", emoji: "💦", unit: "sq ft", baseLow: 0.55, baseHigh: 1.2, minSize: 500
    },
    // 12. Gutter
    "gutter": {
      label: "Gutter Install", emoji: "🩸", unit: "linear ft", baseLow: 25, baseHigh: 55, minSize: 50, 
      subQuestion: "Type?",
      options: [
        { label: "Aluminum", factor: 1.0 },
        { label: "Seamless", factor: 1.4 },
        { label: "Copper", factor: 3.5 }
      ]
    },
    // 13. Windows (Fixed Price Service)
    "windows": {
      label: "Windows Install (Per Window)", emoji: "🪟", unit: "fixed",
      subQuestion: "Window type?",
      options: [
        { label: "Standard Vinyl", fixedLow: 750, fixedHigh: 1100 },
        { label: "Double Hung Premium", fixedLow: 1100, fixedHigh: 1800 },
        { label: "Bay/Bow Window", fixedLow: 4500, fixedHigh: 7500 }
      ]
    },
    // 14. Doors (Fixed Price Service)
    "doors": {
      label: "Door Installation (Per Door)", emoji: "🚪", unit: "fixed",
      subQuestion: "Door type?",
      options: [
        { label: "Interior", fixedLow: 350, fixedHigh: 750 },
        { label: "Exterior Steel / Fiberglass", fixedLow: 1200, fixedHigh: 2200 },
        { label: "Sliding Patio", fixedLow: 2800, fixedHigh: 4800 }
      ]
    },
    // 15. Demo
    "demo": {
      label: "Demolition", emoji: "💥", unit: "sq ft", baseLow: 5.5, baseHigh: 12.5, minSize: 200, 
      subQuestion: "Material?", leadSensitive: true,
      options: [
        { label: "Drywall", factor: 1.0 },
        { label: "Tile / Bathroom Demo", factor: 1.8 },
        { label: "Concrete Demo", factor: 2.4 }
      ]
    },
    // 16. Retaining Wall
    "retaining": {
      label: "Retaining Wall", emoji: "🧱", unit: "linear ft", baseLow: 90, baseHigh: 180, minSize: 40, 
      subQuestion: "Material?",
      options: [
        { label: "CMU Block", factor: 1.0 },
        { label: "Poured Concrete", factor: 1.7 },
        { label: "Stone Veneer", factor: 2.3 }
      ]
    },
    // 17. Handyman
    "handyman": {
      label: "Small Repairs / Handyman", emoji: "🛠", unit: "fixed",
      subQuestion: "Estimated duration?",
      options: [
        { label: "Half-Day (4 hrs)", fixedLow: 550, fixedHigh: 950 },
        { label: "Full-Day (8 hrs)", fixedLow: 950, fixedHigh: 1800 },
        { label: "Multi-Day Project (Custom Quote)", fixedLow: 1800, fixedHigh: 5000 }
      ]
    },
    // 18. Kitchen (Fixed Price Service)
    "kitchen": {
      label: "Kitchen Remodel", emoji: "🍳", unit: "fixed",
      subQuestion: "What is the scope?", leadSensitive: true,
      options: [
        { label: "Refresh (Cosmetic)", fixedLow: 35000, fixedHigh: 55000 }, // RAISED
        { label: "Mid-Range (Cabinets+)", fixedLow: 55000, fixedHigh: 85000 }, // RAISED
        { label: "Full Gut / Luxury", fixedLow: 85000, fixedHigh: 150000 } // RAISED
      ],
    },
    // 19. Bathroom (Fixed Price Service)
    "bathroom": {
      label: "Bathroom Remodel", emoji: "🚿", unit: "fixed",
      subQuestion: "What is the scope?", leadSensitive: true,
      options: [
        { label: "Update (Fixtures/Tile)", fixedLow: 18000, fixedHigh: 28000 }, // RAISED
        { label: "Full Gut / Redo", fixedLow: 28000, fixedHigh: 50000 } // RAISED
      ],
    },
    // 20. Other
    "other": { label: "Other / Custom", emoji: "📋", unit: "consult" }
  };
  
  // Custom sizes for fixed-unit jobs to guide the user (new v7.1 feature)
  const CUSTOM_SIZE_GUIDES = {
    // For fixed unit jobs that still need a size sense
    "windows": [
        { label: "2-3 Windows", size: 3 },
        { label: "4-6 Windows", size: 6 },
        { label: "Whole House (7+)", size: 10 }
    ],
    "doors": [
        { label: "1-2 Doors", size: 2 },
        { label: "3-4 Doors", size: 4 },
        { label: "5+ Doors", size: 6 }
    ],
    "kitchen": [
        { label: "Small (50-100 sq ft)", size: 75 },
        { label: "Medium (100-200 sq ft)", size: 150 },
        { label: "Large (200+ sq ft)", size: 250 }
    ],
    "bathroom": [
        { label: "Small (30-50 sq ft)", size: 40 },
        { label: "Medium (50-80 sq ft)", size: 65 },
        { label: "Large (80+ sq ft)", size: 100 }
    ]
  };


  // ==========================================================
  // II. STATE & MEMORY (v6.0 Core Feature)
  // ==========================================================

  const INITIAL_PROJECT_STATE = {
    step: 0,
    serviceKey: null,
    subOption: null,
    deepAnswer: null,
    size: 0,
    borough: null,
    isLeadHome: false,
    pricingMode: "full",
    isRush: false,
    promoCode: "",
    photosUploaded: 0, 
  };

  let state = {
    ...INITIAL_PROJECT_STATE,
    name: "",
    phone: "",
    projects: [],
    isChatOpen: false,
    currentStep: 0,
    hasAcceptedDisclaimer: false, // NEW V7.1 FLAG
  };

  let els = {}; 
  let currentFlowCallback = null; 

  function loadState() {
    const storedProjects = sessionStorage.getItem("hb_projects");
    const storedName = sessionStorage.getItem("hb_name");
    const storedPhone = sessionStorage.getItem("hb_phone");
    const storedOpen = sessionStorage.getItem("hb_chat_active") === "true";
    const storedDisclaimer = sessionStorage.getItem("hb_disclaimer_accepted") === "true";

    if (storedProjects) state.projects = JSON.parse(storedProjects);
    if (storedName) state.name = storedName;
    if (storedPhone) state.phone = storedPhone;
    state.isChatOpen = storedOpen;
    state.hasAcceptedDisclaimer = storedDisclaimer; // Load disclaimer state
  }

  function saveState() {
    sessionStorage.setItem("hb_projects", JSON.stringify(state.projects));
    sessionStorage.setItem("hb_name", state.name);
    sessionStorage.setItem("hb_phone", state.phone);
    sessionStorage.setItem("hb_disclaimer_accepted", state.hasAcceptedDisclaimer); // Save disclaimer state
  }

  function clearData(showConf) {
    sessionStorage.clear();
    localStorage.clear(); 
    Object.assign(state, { 
      ...INITIAL_PROJECT_STATE, 
      name: "", phone: "", projects: [], isChatOpen: false, currentStep: 0, 
      hasAcceptedDisclaimer: false // Clear disclaimer state
    });
    if (showConf) {
      addBotMessage("✅ Your data has been cleared from this device, as per your request.", false, 0);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }

  function resetProjectState() {
    Object.assign(state, { ...INITIAL_PROJECT_STATE, name: state.name, phone: state.phone, projects: state.projects });
  }

  // ... (III. UI UTILITIES & INITIALIZATION - no functional changes needed here except the initialization call) ...

  function createInterface() {
    loadState();
    
    // V7.0 PRO: Send initial analytics event
    sendAnalyticsEvent('bot_init', { status: 'loaded' });

    const fab = document.createElement("div");
    fab.className = "hb-chat-fab";
    fab.innerHTML = `<span class="hb-fab-icon">📷</span><span class="hb-fab-text">Get Estimate</span>`;
    fab.style.display = "flex";
    fab.onclick = () => toggleChat(true); 
    document.body.appendChild(fab);

    const wrapper = document.createElement("div");
    wrapper.className = "hb-chat-wrapper";
    wrapper.innerHTML = `
      <div class="hb-chat-header">
        <div class="hb-chat-title">
          <h3>${COMPANY_NAME}</h3>
          <span>AI Estimator (v7.1 Price Corrected)</span>
        </div>
        <button class="hb-chat-close">×</button>
      </div>
      <div class="hb-progress-container">
        <div class="hb-progress-bar" id="hb-prog"></div>
      </div>
      <div class="hb-chat-body" id="hb-body"></div>
      <div class="hb-chat-footer">
        <input type="text" class="hb-chat-input hb-honeypot" name="hb-hp-field" style="display: none !important; opacity: 0; position: absolute;" tabindex="-1" autocomplete="off">
        <input type="text" class="hb-chat-input" id="hb-input" placeholder="Select an option above..." disabled>
        <button class="hb-chat-send" id="hb-send">➤</button>
      </div>
      <div class="hb-chat-privacy">
          <a href="#" id="hb-clear-data">| Clear My Data (v6.0 Feature)</a>
      </div>
    `;
    document.body.appendChild(wrapper);

    const photoInput = document.createElement("input");
    photoInput.type = "file";
    photoInput.accept = "image/*";
    photoInput.multiple = true;
    photoInput.style.display = "none";
    photoInput.id = "hb-photo-input";
    document.body.appendChild(photoInput);

    els = {
      wrapper, fab,
      body: document.getElementById("hb-body"),
      input: document.getElementById("hb-input"),
      send: document.getElementById("hb-send"),
      prog: document.getElementById("hb-prog"),
      close: wrapper.querySelector(".hb-chat-close"),
      photoInput,
      honeypot: wrapper.querySelector(".hb-honeypot"),
      clearDataBtn: document.getElementById("hb-clear-data") 
    };

    // FIX FOR CLOSE BUTTON: ensure it uses the toggle function
    els.close.onclick = () => toggleChat(false); 
    els.send.onclick = handleManualInput;
    els.input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") handleManualInput();
    });
    els.clearDataBtn.onclick = (e) => { e.preventDefault(); clearData(true); };

    photoInput.addEventListener("change", function() {
      if (!photoInput.files || !photoInput.files.length) return;
      state.photosUploaded = photoInput.files.length;
      
      addBotMessage(`📷 **(V7.0 Hook)** You selected ${state.photosUploaded} photo(s).`, false, 200);
      
      simulatePhotoAnalysis(photoInput.files);
    });

    if (state.isChatOpen) {
      toggleChat(true); 
    }
    startConversation();
  }
  
  function toggleChat(forceOpen = false) {
    const isOpen = els.wrapper.classList.toggle("hb-open", forceOpen);
    if (isOpen) {
      els.fab.style.display = "none";
      sessionStorage.setItem("hb_chat_active", "true");
    } else {
      els.fab.style.display = "flex";
      sessionStorage.removeItem("hb_chat_active");
    }
  }

  function updateProgress(step) {
    sendAnalyticsEvent('progress_update', { step: step }); 
    const totalSteps = 10;
    const pct = Math.min(100, Math.round((step / totalSteps) * 100));
    state.currentStep = step;
    if (els.prog) els.prog.style.width = pct + "%";
  }

  // ... (addUserMessage, addChoices, enableInput, handleManualInput remain the same) ...
  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "hb-msg hb-msg-user";
    div.textContent = text;
    els.body.appendChild(div);
    els.body.scrollTop = els.body.scrollHeight;
  }
  
  function addBotMessage(text, isHtml = false, delay = 800) {
    const typingId = "typing-" + Date.now();
    const typingDiv = document.createElement("div");
    typingDiv.className = "hb-msg hb-msg-bot";
    typingDiv.id = typingId;
    typingDiv.innerHTML = `
      <div class="hb-typing-dots">
        <div class="hb-dot"></div><div class="hb-dot"></div><div class="hb-dot"></div>
      </div>`;
    els.body.appendChild(typingDiv);
    els.body.scrollTop = els.body.scrollHeight;

    setTimeout(function() {
      const msgBubble = document.getElementById(typingId);
      if (msgBubble) {
        if (isHtml) {
          msgBubble.innerHTML = text;
        } else {
          msgBubble.textContent = text;
        }
        els.body.scrollTop = els.body.scrollHeight;
      }
    }, Math.min(1500, text.length * 15 + delay));
  }

  function addChoices(options, callback) {
    setTimeout(function() {
      const chipContainer = document.createElement("div");
      chipContainer.className = "hb-chips";

      options.forEach(function(opt) {
        const btn = document.createElement("button");
        btn.className = "hb-chip";
        const label = (typeof opt === "object") ? opt.label : opt;
        btn.textContent = label;
        btn.onclick = function() {
          chipContainer.remove();
          addUserMessage(label);
          callback(opt);
        };
        chipContainer.appendChild(btn);
      });

      els.body.appendChild(chipContainer);
      els.body.scrollTop = els.body.scrollHeight;
    }, 1200);
  }

  function enableInput(callback, placeholder = "Type your answer...", disableSend = false) {
    els.input.disabled = false;
    els.input.placeholder = placeholder;
    els.input.focus();
    els.send.style.pointerEvents = disableSend ? 'none' : 'auto';
    els.send.style.opacity = disableSend ? 0.5 : 1;

    currentFlowCallback = function(val) {
      if (els.honeypot.value.length > 0) { 
        addBotMessage("⛔ Bot detection triggered. Please refresh and try again without filling the hidden field.");
        return;
      }
      
      addUserMessage(val);
      els.input.value = "";
      els.input.disabled = true;
      els.input.placeholder = "Please wait...";
      currentFlowCallback = null;
      callback(val);
    };
  }

  function handleManualInput() {
    if (!els.input.disabled && currentFlowCallback) {
      const val = els.input.value.trim();
      if (!val) return;
      currentFlowCallback(val);
    }
  }

  // ... (IV. V7.0 PRO TIER INTEGRATION PLACEHOLDERS - no changes) ...
  function sendLeadToCRM(leadData) {
    console.log(`[V7.0 PRO] Sending lead data to CRM_ENDPOINT: ${CRM_ENDPOINT}`);
    console.log("Lead Payload:", leadData);
    const success = Math.random() > 0.1; 
    if (success) {
      addBotMessage("✅ **(V7.0 PRO)** Estimate successfully logged in your CRM (ID: 12345). A sales rep will contact you instantly.", false, 500);
      return true;
    } else {
      addBotMessage("⚠️ **(V7.0 PRO)** CRM push failed. Falling back to email/text options. Please try manually.", false, 500);
      return false;
    }
  }

  function sendAnalyticsEvent(eventName, params = {}) {
    console.log(`[V7.0 PRO] Analytics: Sending event ${eventName} to GA ID ${GA_TRACKING_ID}`);
  }
  
  function fetchDynamicPricing(svcKey, borough) {
    console.log(`[V7.0 PRO] Dynamic Pricing: Fetching live costs for ${svcKey} in ${borough} using key: ${PRICING_API_KEY}...`);
    const materialFactor = 1.0 + Math.random() * 0.15; 
    const laborFactor = 1.0 + Math.random() * 0.10;
    return {
        materialFactor: materialFactor,
        laborFactor: laborFactor
    };
  }

  function simulatePhotoAnalysis(fileList) {
    if (fileList.length === 0) return;
    addBotMessage(`⏳ **(V7.0 PRO)** Sending photos for Visual AI analysis...`, false, 100);
    setTimeout(() => {
        const estimatedSize = 350 + Math.round(Math.random() * 200); 
        const confidence = 75 + Math.round(Math.random() * 20);
        addBotMessage(`🧠 **(Visual AI)** Analysis complete. AI suggests project size is approx. **${estimatedSize} sq ft** (Confidence: ${confidence}%).`, false, 1500);
    }, 2500);
  }


  // ==========================================================
  // V. FLOW LOGIC (v7.1 Flow: New Disclaimer Step)
  // ==========================================================

  function startConversation() {
    addBotMessage(`👋 Hi! Welcome to the ${COMPANY_NAME} AI Estimator (v7.1 Price Corrected). I can generate a ballpark estimate in under 60 seconds.`);

    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) {
      addBotMessage("🚨 We're past normal business hours. We only have **2 openings left** for tomorrow morning — want priority slotting? (v6.0 Urgency)", false, 800);
    }
    
    if (state.hasAcceptedDisclaimer) {
        addBotMessage("**(Memory)** You've accepted the terms. Proceeding to service selection.", false, 0);
        presentServiceOptions();
    } else {
        stepOne_DisclaimerGate(); // NEW: Start with the disclaimer
    }
  }

  // V7.1 NEW FUNCTION
  function stepOne_DisclaimerGate() {
      updateProgress(1);
      addBotMessage(`⚠️ **DISCLAIMER:** Please understand that this tool provides a rough, **ballpark estimate** for planning purposes only. Due to the high cost of skilled labor, materials, and complex NYC logistics, our final on-site quotes will be higher than general regional averages.`);
      
      addBotMessage(`By continuing, you acknowledge this is not a contract, and final pricing requires a site visit. Do you accept these terms to proceed?`);
      
      addChoices([
          { label: "✅ Yes, Proceed to Estimate", key: "yes" },
          { label: "❌ No, Close Chat", key: "no" }
      ], function(choice) {
          if (choice.key === "yes") {
              state.hasAcceptedDisclaimer = true;
              sessionStorage.setItem("hb_disclaimer_accepted", "true");
              addBotMessage("Terms accepted. Thank you. Now, what type of project are you planning?");
              presentServiceOptions();
          } else {
              addBotMessage("Understood. Closing the chat now. Thank you for visiting.");
              toggleChat(false);
          }
      });
  }


  function presentServiceOptions() {
    updateProgress(2); // Progress adjusted due to new Step 1
    const opts = Object.keys(SERVICES).map(k => ({
      label: SERVICES[k].emoji + " " + SERVICES[k].label, key: k
    }));

    opts.push({ label: "📞 Talk to a Human (v6.0 Human Mode)", key: "human" });

    addChoices(opts, function(selection) {
      if (selection.key === "human") {
        showHumanMode();
        return;
      }
      state.serviceKey = selection.key;
      stepTwo_SubQuestions();
    });
  }

  function showHumanMode() {
    addBotMessage("You got it. Switching to Human Mode. Please use these links to connect directly with our team:", false, 500);
    generateFinalLinks(true); 
  }

  function stepTwo_SubQuestions() {
    updateProgress(3);
    const svc = SERVICES[state.serviceKey];

    if (svc.subQuestion && svc.options) {
      addBotMessage(svc.subQuestion);
      addChoices(svc.options, function(choice) {
        state.subOption = choice;
        stepThree_DeepLogic();
      });
    } else {
      state.subOption = { factor: 1.0, label: "Standard" };
      stepFive_Size(); 
    }
  }
  
  function stepThree_DeepLogic() {
    updateProgress(4);
    const svc = SERVICES[state.serviceKey];
    const sub = state.subOption;

    if (sub && sub.deepQuestion) {
      addBotMessage(`**(v6.0 Deep Logic)** Based on selecting "${sub.label}", we need to ask: ${sub.deepQuestion}`);
      enableInput(function(ans) {
        state.deepAnswer = sanitizeAndConfirmInput(ans);
        addBotMessage(`**Confirmed:** I noted your answer: "${state.deepAnswer}"`);
        stepFour_LeadCheck();
      }, "Your details here...");
    } else {
      state.deepAnswer = 'N/A';
      stepFour_LeadCheck();
    }
  }


  function stepFour_LeadCheck() {
    updateProgress(5);
    const svc = SERVICES[state.serviceKey];
    if (svc && svc.leadSensitive) {
      addBotMessage("⚠️ **(v6.0 Safety Check)** Is your property built before 1978? (Required for lead safety laws).");
      addChoices(["Yes (Pre-1978)", "No / Not Sure"], function(ans) {
        state.isLeadHome = !!(ans && ans.indexOf("Yes") !== -1);
        stepFive_Size();
      });
    } else {
      stepFive_Size();
    }
  }

  // V7.1 MODIFIED FUNCTION
  function stepFive_Size() {
    updateProgress(6);
    const svc = SERVICES[state.serviceKey];

    // Skip if it's a fixed price or consultation service
    if (svc.unit === "consult") {
      stepSix_Location();
      return;
    }

    addBotMessage(`What is the size of your project in **${svc.unit}**?`);
    
    // Provide size guide chips for the user
    const sizeGuide = svc.sizeChips || CUSTOM_SIZE_GUIDES[state.serviceKey];
    if (sizeGuide) {
        const chips = sizeGuide.map(item => ({ 
            label: item.label, 
            key: item.size // key will be the size to use
        }));
        addChoices(chips, function(choice) {
            state.size = choice.key;
            addBotMessage(`**Confirmed:** Using the suggested size of ${state.size.toLocaleString()} ${svc.unit}.`, false, 0);
            stepSix_Location();
        });
    }
    
    // Always provide manual input option
    let minMsg = svc.minSize ? `(Enter your exact number. E.g., ${svc.minSize})` : "(Enter your exact number)";
    enableInput(function(val) {
        const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
        
        // Custom minimum validation
        if (!num || (svc.minSize && num < svc.minSize)) {
            const errorMsg = svc.minSize 
                ? `That seems too low for a typical job of this type. Please enter at least ${svc.minSize} ${svc.unit}.`
                : "Please enter a valid number (e.g. 250).";
            addBotMessage(errorMsg);
            stepFive_Size(); // Restart the step
        } else {
            state.size = num;
            addBotMessage(`**Confirmed:** Project size is ${num.toLocaleString()} ${svc.unit}.`);
            stepSix_Location();
        }
    }, `${minMsg}`);
  }


  function stepSix_Location() {
    updateProgress(7);
    if (state.projects.length > 0 && state.projects[0].borough) {
        state.borough = state.projects[0].borough;
        addBotMessage(`**(v6.0 Memory)** I see your last project was in **${state.borough}**. We'll use that for the price modifier.`, false, 0);
        stepSeven_PricingMode();
        return;
    }

    addBotMessage("Which borough/area is this in?");
    addChoices(Object.keys(BOROUGH_MODS), function(locKey) {
      state.borough = locKey;
      stepSeven_PricingMode();
    });
  }

  function stepSeven_PricingMode() {
    updateProgress(8);
    addBotMessage("How should we calculate the estimate?");

    const opts = [
      { label: "Full Project (Labor + Materials)", key: "full" },
      { label: "Labor Only", key: "labor" },
      { label: "Materials + Light Help", key: "materials" }
    ];

    addChoices(opts, function(choice) {
      state.pricingMode = choice.key || "full";
      stepEight_Promo();
    });
  }

  function stepEight_Promo() {
    updateProgress(9);
    addBotMessage("Do you have a promo code?");

    const opts = Object.keys(DISCOUNTS).map(code => ({
        label: `${code} (${Math.round(DISCOUNTS[code] * 100)}% off)`, code: code
    }));
    opts.unshift({ label: "No Code", code: "" });

    addChoices(opts, function(choice) {
      state.promoCode = choice.code || "";
      const est = computeEstimateForCurrent();
      showEstimateAndAskAnother(est);
    });
    
    enableInput(function(val) {
      state.promoCode = val.trim().toUpperCase();
      const est = computeEstimateForCurrent();
      showEstimateAndAskAnother(est);
    }, "Type custom code or 'NONE'...");
  }
  
  // ==========================================================
  // VI. CALCULATION & ESTIMATE (v6.0 Logic + V7.0 Hook)
  // ==========================================================

  function calculateConfidence() {
    let score = 0;
    // ... (logic remains the same) ...
    if (state.serviceKey === 'other' || SERVICES[state.serviceKey].unit === 'consult') return 0; 
    if (SERVICES[state.serviceKey].unit === 'fixed' || state.size > 0) score += 40;
    if (state.subOption) score += 25;
    if (state.borough) score += 20;
    if (state.deepAnswer && state.deepAnswer !== 'N/A') score += 15;
    if (state.photosUploaded > 0) score += 5; 
    return Math.min(100, score);
  }

  function computeEstimateForCurrent() {
    var svc = SERVICES[state.serviceKey];
    if (!svc) return null;

    var sub = state.subOption || {};
    var boroughMod = BOROUGH_MODS[state.borough] || { factor: 1.0, complexity: 1.0 };
    var low = 0;
    var high = 0;

    if (state.serviceKey === "other" || svc.unit === "consult") {
      return { isCustom: true, svc: svc, low: 0, high: 0, confidence: 0 };
    }
    
    // 🎯 V7.0 PRO: Call to Dynamic Pricing Engine
    const dynamicFactors = fetchDynamicPricing(state.serviceKey, state.borough);
    const materialModV7 = dynamicFactors.materialFactor;
    const laborModV7 = dynamicFactors.laborFactor;


    // Calculate Base Range
    if (svc.unit === "fixed") {
      // For fixed jobs, size represents number of units/scale
      low = (sub.fixedLow || 0) * (state.size || 1); 
      high = (sub.fixedHigh || 0) * (state.size || 1);
    } else {
      var rateLow = svc.baseLow * (sub.factor || 1.0);
      var rateHigh = svc.baseHigh * (sub.factor || 1.0);

      low = rateLow * state.size;
      high = rateHigh * state.size;
    }

    // --- APPLY MODIFIERS ---
    
    // 1. Borough Modifier
    low *= boroughMod.factor;
    high *= boroughMod.factor;
    
    // 2. V7.0 Dynamic Pricing (applied on top of fixed modifiers)
    low *= ((materialModV7 + laborModV7) / 2); 
    high *= ((materialModV7 + laborModV7) / 2);

    // 3. Minimum Check (Only apply if size unit is not fixed, fixed pricing already incorporates scale)
    if (svc.minSize && svc.unit !== 'fixed') { 
        // Use a high complexity factor to ensure the minimum is met for small jobs
        const hardMinLow = svc.minSize * (svc.baseLow * (sub.factor || 1.0) * boroughMod.factor);
        const hardMinHigh = svc.minSize * (svc.baseHigh * (sub.factor || 1.0) * boroughMod.factor);
        low = Math.max(low, hardMinLow);
        high = Math.max(high, hardMinHigh);
    }

    // 4. Lead safety bump
    if (state.isLeadHome) {
      low *= 1.10;
      high *= 1.10;
    }

    // 5. Pricing Mode (Labor Factor Calculation - simplified)
    var laborFactor = 1;
    if (state.pricingMode === "labor") laborFactor = 0.75;
    if (state.pricingMode === "materials") laborFactor = 0.50;
    low *= laborFactor;
    high *= laborFactor;

    // 6. Rush surcharge
    var rushFactor = 1.0;
    if (state.isRush) {
      rushFactor = 1.15; // 15% rush fee
      low *= rushFactor;
      high *= rushFactor;
    }

    // 7. Promo discount
    var dcRate = 0;
    var dcAmountLow = 0;
    var dcAmountHigh = 0;
    if (state.promoCode && DISCOUNTS[state.promoCode.toUpperCase()]) {
      dcRate = DISCOUNTS[state.promoCode.toUpperCase()];
      dcAmountLow = low * dcRate;
      dcAmountHigh = high * dcRate;
      low -= dcAmountLow;
      high -= dcAmountHigh;
    }
    
    const confidence = calculateConfidence();

    return {
      svc: svc, sub: sub, borough: state.borough, size: state.size,
      pricingMode: state.pricingMode, isRush: state.isRush, promoCode: state.promoCode,
      low: low, high: high, confidence: confidence,
      breakdown: {
          materialModV7, laborModV7, 
          baseLow: low / laborFactor / rushFactor + dcAmountLow, 
          baseHigh: high / laborFactor / rushFactor + dcAmountHigh,
          subFactor: (sub.factor || 1.0),
          boroughAdjustment: boroughMod.factor,
          rushAdjustment: rushFactor,
          discountAmountLow: dcAmountLow,
          discountAmountHigh: dcAmountHigh,
          finalLow: low,
          finalHigh: high
      }
    };
  }
  
  function buildEstimateHtml(est) {
    if (est.isCustom) {
        return `<div class="hb-receipt hb-receipt-custom">
            <h4>${est.svc.label} Summary</h4>
            <div class="hb-receipt-total"><span>ESTIMATE:</span><span>Requires Walkthrough</span></div>
            <p class="hb-disclaimer">This project requires an on-site visit due to its complexity or custom nature. We will contact you shortly to schedule.</p>
        </div>`;
    }

    const { breakdown, svc, borough, pricingMode, isRush, promoCode, confidence } = est;
    const fLow = Math.round(breakdown.finalLow).toLocaleString();
    const fHigh = Math.round(breakdown.finalHigh).toLocaleString();
    const isFixed = svc.unit === 'fixed';
    
    let html = `<div class="hb-receipt hb-breakdown">
        <h4>Detailed Estimate Breakdown</h4>
        <div class="hb-confidence-score">
            <span>Estimate Confidence: <strong>${confidence}%</strong></span>
            <span class="hb-confidence-tip">${confidence < 75 ? 'Missing details lower the accuracy.' : 'High accuracy based on your data.'}</span>
        </div>
        <div class="hb-breakdown-lines">`;
    
    // 1. Base Cost
    const sizeLabel = isFixed 
        ? `${est.size || '1'} Unit(s)`
        : `${est.size.toLocaleString()} ${svc.unit}`;
        
    html += `<div class="hb-receipt-row anim-1"><span>Base Cost (${sizeLabel} @ NYC Rates):</span>
        <span>$${Math.round(breakdown.baseLow).toLocaleString()} – $${Math.round(breakdown.baseHigh).toLocaleString()}</span></div>`;

    // 2. Sub-Option Factor
    if (breakdown.subFactor && breakdown.subFactor !== 1.0) {
        const adjustment = breakdown.subFactor > 1.0 ? `+${Math.round((breakdown.subFactor - 1) * 100)}%` : 'Standard';
        html += `<div class="hb-receipt-row anim-2"><span>Type/Material Factor:</span>
            <span>${adjustment}</span></div>`;
    }
    
    // 3. V7.0 Dynamic Pricing Line
    const dynPct = Math.round(((breakdown.materialModV7 + breakdown.laborModV7) / 2 - 1) * 100);
    html += `<div class="hb-receipt-row anim-3"><span>V7.0 Market Adjustment:</span>
        <span class="${dynPct >= 0 ? 'plus' : 'minus'}">${dynPct >= 0 ? '+' : ''}${dynPct}%</span></div>`;

    // 4. Borough Adjustment
    if (borough) {
        const modInfo = BOROUGH_MODS[borough] || {};
        const adjPct = Math.round((modInfo.factor - 1) * 100);
        html += `<div class="hb-receipt-row anim-4"><span>Borough Modifier (${borough}):</span>
            <span class="${adjPct > 0 ? 'plus' : 'minus'}">${modInfo.label}</span></div>`;
    }
    
    // 5. Pricing Mode
    let modeLabel = "Full Project (L+M)";
    if (pricingMode === "labor") modeLabel = "Labor Only (-25%)";
    if (pricingMode === "materials") modeLabel = "Materials Only (-50%)";
    html += `<div class="hb-receipt-row anim-5"><span>Pricing Mode:</span><span>${modeLabel}</span></div>`;

    // 6. Rush Fee
    if (isRush) {
        const rushPct = Math.round((breakdown.rushAdjustment - 1) * 100);
        html += `<div class="hb-receipt-row anim-6"><span>Rush Priority Fee:</span><span class="plus">+${rushPct}%</span></div>`;
    }

    // 7. Discount
    if (breakdown.discountAmountLow > 0) {
        const rate = DISCOUNTS[promoCode];
        const dcPct = Math.round(rate * 100);
        html += `<div class="hb-receipt-row anim-7"><span>Promo Discount (${promoCode}):</span><span class="minus">-${dcPct}% applied</span></div>`;
    } else if (promoCode) {
        html += `<div class="hb-receipt-row anim-7" style="color:#d55"><span>Promo Code:</span><span class="minus">Pending Verification</span></div>`;
    }
    
    html += `</div>`; 

    // Final Price
    html += `<div class="hb-receipt-total anim-8"><span>BALLPARK ESTIMATE:</span>
        <span>$${fLow} – $${fHigh}</span></div>`;

    html += `<div class="hb-receipt-footer hb-disclaimer">This range is for planning purposes only. A formal estimate will follow a site visit.</div>`;
    html += `</div>`; 
    
    return html;
  }

  // ... (showEstimateAndAskAnother, askAddAnother, showCombinedReceiptAndLeadCapture remain the same) ...
  function showEstimateAndAskAnother(est) {
    if (!est) return;
    updateProgress(9);

    var html = buildEstimateHtml(est);
    addBotMessage(html, true);

    const isExteriorJob = ['masonry', 'exterior_paint', 'deck', 'roofing', 'gutter'].includes(state.serviceKey);
    const month = new Date().getMonth();
    const isWinter = month === 11 || month === 0 || month === 1; 
    if (isExteriorJob && isWinter) {
        addBotMessage("🥶 **(v6.0 Weather Sync)** Exterior cure time may be extended due to winter temperatures. Should we plan a spring date?", false, 1200);
    }
    
    if (ROI_DATA[state.serviceKey]) {
        addBotMessage(`📈 **(v6.0 ROI Upsell)** Did you know? ${ROI_DATA[state.serviceKey]}`, false, 1200);
    }

    setTimeout(function() {
      askAddAnother(est);
    }, 1500);
  }

  function askAddAnother(est) {
    state.projects.push(est);
    saveState();
    updateProgress(9);

    addBotMessage("Would you like to add another project or grab a free guide?");
    addChoices(
      [
        { label: "➕ Add Another Project", key: "yes" },
        { label: "✅ Finish & Get Links", key: "no" },
        { label: `🎁 Free Guide: ${LEAD_MAGNETS[0].label}`, key: "magnet" }
      ],
      function(choice) {
        var key = choice.key || "no";
        if (key === "yes") {
          resetProjectState();
          addBotMessage("Great! What type of project is the next one?");
          presentServiceOptions();
        } else if (key === "magnet") {
            showLeadCapture(true); 
        } else {
          showCombinedReceiptAndLeadCapture();
        }
      }
    );
  }

  function showCombinedReceiptAndLeadCapture() {
    updateProgress(10);
    var projects = state.projects;

    var totalLow = 0;
    var totalHigh = 0;
    var requiresWalkthrough = false;

    var rowsHtml = projects.map((p, idx) => {
        if (p.isCustom || p.confidence < 50) requiresWalkthrough = true;
        
        var hasPrice = !!(p.low && p.high);
        if (hasPrice) {
          totalLow += p.low;
          totalHigh += p.high;
        }

        var fLow = hasPrice ? Math.round(p.low).toLocaleString() : "Custom";
        var fHigh = hasPrice ? Math.round(p.high).toLocaleString() : "Quote";
        var sizePart = p.size && p.svc.unit !== 'fixed' ? ` — ${p.size} ${p.svc.unit}` : '';
        if (p.svc.unit === 'fixed' && p.size > 0) sizePart = ` — ${p.size} Unit(s)`;
        var areaPart = p.borough ? ` (${p.borough})` : '';

        return `<div class="hb-receipt-row">
            <span>#${idx + 1} ${p.svc.label}${sizePart}${areaPart}</span>
            <span>${hasPrice ? `$${fLow} – $${fHigh}` : 'Walkthrough needed'}</span>
        </div>`;
    }).join("");

    var totalRow = "";
    if (totalLow && totalHigh) {
      totalRow = `<div class="hb-receipt-total">
          <span>Combined Range:</span>
          <span>$${Math.round(totalLow).toLocaleString()} – $${Math.round(totalHigh).toLocaleString()}</span>
        </div>`;
    }

    var html = `<div class="hb-receipt">
        <h4>Combined Estimate Summary</h4>
        ${rowsHtml}
        ${totalRow}
        <div class="hb-receipt-footer">
          ${requiresWalkthrough ? "⚠️ At least one project requires a walkthrough for accurate pricing." : "Your estimate is complete."}
        </div>
      </div>`;

    addBotMessage(html, true);

    setTimeout(function() {
      const intro = state.name 
        ? `Welcome back, ${state.name}! To save/send your estimate, please confirm your phone number.`
        : `To lock in this combined estimate, I can text or email you everything we just went over.`;
      
      showLeadCapture(false, intro);
    }, 1500);
  }

  function showLeadCapture(isLeadMagnet, introText) {
    if (isLeadMagnet) {
        addBotMessage("You've selected the free guide. What is your email address so we can send it?");
        enableInput(function(email) {
            addBotMessage(`Thanks! We've sent the ${LEAD_MAGNETS[0].label} to ${email}.`, false, 800);
            setTimeout(() => {
                generateFinalLinks(false, true); 
            }, 1000);
        }, "Your email address...");
        return;
    }

    addBotMessage(introText);
    
    if (!state.name) {
        addBotMessage("What is your name?");
        enableInput(function(name) {
            state.name = sanitizeAndConfirmInput(name, true);
            saveState();
            addBotMessage(`Thanks, ${state.name}! And your mobile number?`);
            askPhone();
        }, "Your full name...");
    } else {
        addBotMessage("Please confirm your mobile number, or enter a new one.");
        askPhone();
    }
  }

  function askPhone() {
    enableInput(function(phone) {
        state.phone = phone.replace(/[^0-9]/g, ""); 
        saveState();
        generateFinalLinks(false);
    }, state.phone || "Your mobile number...");
  }


  function generateFinalLinks(isHumanMode, isLeadMagnet = false) {
    if (!isLeadMagnet) updateProgress(100);

    // 🎯 V7.0 PRO: CRM Push attempt
    let crmSuccess = false;
    if (!isHumanMode && !isLeadMagnet) {
        const totalLow = state.projects.reduce((sum, p) => sum + (p.low || 0), 0);
        crmSuccess = sendLeadToCRM({
            name: state.name,
            phone: state.phone,
            totalEstimateLow: totalLow,
            projects: state.projects.map(p => ({ label: p.svc.label, low: p.low, high: p.high }))
        });
        sendAnalyticsEvent('lead_capture_success', { total_low: totalLow });
    }

    var lines = [];
    lines.push(isHumanMode ? "URGENT CONTACT REQUEST (Human Mode Switch)" : "Estimate Request");
    lines.push(`Name: ${state.name || 'N/A'}`);
    lines.push(`Phone: ${state.phone || 'N/A'}`);
    lines.push("---");
    
    if (state.projects.length) {
        lines.push("Projects Summary:");
        state.projects.forEach((p, idx) => {
            const range = (p.low && p.high) ? `~ $${Math.round(p.low).toLocaleString()}–$${Math.round(p.high).toLocaleString()}` : 'Walkthrough needed';
            lines.push(`${idx + 1}. ${p.svc.label} (${p.borough}) - ${range}`);
        });
        lines.push("---");
    } 

    var body = encodeURIComponent(lines.join("\n"));
    var smsLink = `sms:${CONTACT_PHONE}?&body=${body}`;
    var emailLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Estimate/Contact Request")}&body=${body}`;

    addBotMessage(
      isHumanMode 
        ? "We've placed you in our urgent queue. Call or text below to connect immediately."
        : crmSuccess 
            ? `Your request has been automatically sent to our sales team. Use the links below to save a copy.`
            : `Thanks! Here are your options to save/send the estimate and connect with ${COMPANY_NAME}:`,
      false
    );

    setTimeout(function() {
      const chipContainer = document.createElement("div");
      chipContainer.className = "hb-chips-final";

      const smsBtn = document.createElement("a");
      smsBtn.className = "hb-chip-cta hb-cta-sms";
      smsBtn.textContent = isHumanMode ? `📞 Call ${CONTACT_PHONE}` : `📲 Text Estimate & Details`;
      smsBtn.href = isHumanMode ? `tel:${CONTACT_PHONE}` : smsLink;
      chipContainer.appendChild(smsBtn);
      
      const emailBtn = document.createElement("a");
      emailBtn.className = "hb-chip-cta hb-cta-email";
      emailBtn.textContent = "✉️ Email My Details";
      emailLink.href = emailLink;
      chipContainer.appendChild(emailBtn);
      
      if (!isHumanMode && !isLeadMagnet) {
          const printBtn = document.createElement("button");
          printBtn.className = "hb-chip-cta hb-cta-print";
          printBtn.textContent = "🖨️ Printable Estimate (PDF)";
          printBtn.onclick = () => window.print(); 
          chipContainer.appendChild(printBtn);
      }
      
      els.body.appendChild(chipContainer);

      const photoBtn = document.createElement("button");
      photoBtn.className = "hb-chip";
      photoBtn.style.display = "block";
      photoBtn.style.marginTop = "12px";
      photoBtn.textContent = "📷 Add Photos to Phone/Desktop";
      photoBtn.onclick = () => { if (els.photoInput) els.photoInput.click(); };
      els.body.appendChild(photoBtn);

      els.body.scrollTop = els.body.scrollHeight;
      
      els.input.disabled = true;
      els.input.placeholder = "Conversation complete.";
      els.send.style.display = 'none';

    }, 500);
  }

  // ... (VIII. UTILS & SANITIZATION - no changes) ...
  function sanitizeAndConfirmInput(input, isName = false) {
    let sanitized = input.trim();
    if (isName) {
      sanitized = sanitized.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } else {
      sanitized = sanitized
        .replace(/\b(i|i'm|im|my|the|a|an)\b/gi, '')
        .replace(/steps r messed up/gi, 'steps are damaged')
        .replace(/idk/gi, 'I need to find out')
        .replace(/\s\s+/g, ' ')
        .trim();
    }
    return sanitized;
  }

  // ==========================================================
  // IX. RUNTIME
  // ==========================================================

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    createInterface();
  }

})();
