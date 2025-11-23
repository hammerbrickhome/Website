/* ============================================================
   HAMMER BRICK & HOME LLC
   ESTIMATOR BOT v7.0 — ULTRA EDITION
   - AI project detection
   - Size Wizard
   - Tiered pricing
   - Lead scoring + confidence score
   - Smart bundles / upsells
   - Time-aware + seasonal messaging
   - Photo handling (Base64, 100KB limit, 5 photos)
   - Storage separation (PII in sessionStorage)
   - CRM webhook + email/SMS payload helpers
   - Language-ready (EN primary, stubs for more)
   - Progress, lead magnet, privacy mode, human mode
   - Commented, modular-ish, "zero breaks" mindset
============================================================ */

(function () {
  "use strict";

  // ----------------------------
  // 0. BASIC CONFIG
  // ----------------------------

  const WEBHOOK_URL = "https://your-silent-lead-capture-endpoint.com/receive"; // <- replace
  const MAX_PHOTOS = 5;
  const MAX_PHOTO_SIZE_BYTES = 100 * 1024; // 100KB

  const BOROUGH_MODS = {
    "Manhattan": 1.18,
    "Brooklyn": 1.08,
    "Queens": 1.04,
    "Bronx": 1.02,
    "Staten Island": 0.98
  };

  const DISCOUNTS = {
    "WELCOME10": 0.10,
    "SPRING15": 0.15
  };

  // Different job types and rough base pricing + ROI notes
  const SERVICES = {
    masonry: {
      label: "Masonry / Concrete / Pavers",
      base: 850,
      perSqFt: 12,
      roi: "Exterior masonry and hardscape upgrades can improve curb appeal and resale value.",
      related: ["Power-wash & seal", "Step repair", "Belgian block curb"],
      deepQuestions: [
        "Is this a walkway, driveway, patio, or front steps?",
        "Is there existing concrete or pavers to remove?",
        "Any drainage or water issues in this area?"
      ]
    },
    painting: {
      label: "Interior / Exterior Painting",
      base: 600,
      perSqFt: 2.5,
      roi: "Fresh paint is one of the highest-ROI cosmetic upgrades.",
      related: ["Drywall patching", "Trim & doors", "Ceiling repaint"],
      deepQuestions: [
        "Are walls in good shape or peeling / cracked?",
        "Do you need ceilings and trim included?",
        "Any color changes from dark to light?"
      ]
    },
    remodeling: {
      label: "Kitchen / Bathroom Remodeling",
      base: 6500,
      perSqFt: 150,
      roi: "NYC kitchens and baths often return 57–73% of their cost at resale.",
      related: ["Floor upgrade", "Lighting package", "Tile upgrade"],
      deepQuestions: [
        "Is this a full gut or cosmetic remodel?",
        "Any layout changes (moving plumbing or walls)?",
        "Do you want tile all the way to the ceiling?"
      ]
    },
    flooring: {
      label: "Flooring (Vinyl, Laminate, Hardwood)",
      base: 1200,
      perSqFt: 6,
      roi: "Modern flooring improves comfort and perceived home value.",
      related: ["Baseboard replacement", "Soundproof underlayment"],
      deepQuestions: [
        "Is furniture moving required?",
        "Do you have existing flooring to remove?",
        "Any steps or transitions to other floors?"
      ]
    },
    landscaping: {
      label: "Landscaping / Yard Clean-Up",
      base: 450,
      perSqFt: 3,
      roi: "Clean, maintained landscaping can significantly boost curb appeal.",
      related: ["Mulch & bed edging", "Hedge trimming", "Seasonal cleanup"],
      deepQuestions: [
        "Is this a one-time clean-up or recurring maintenance?",
        "Any large tree or stump work?",
        "Do you want mulch or rock installed?"
      ]
    }
  };

  // Map of keywords -> service (AI-ish detection)
  const AI_SERVICE_KEYWORDS = {
    masonry: ["brick", "blocks", "steps", "stoop", "pavers", "concrete", "sidewalk", "cement", "walkway", "curb"],
    painting: ["paint", "painting", "peeling", "color", "primer", "wall color", "stain on wall"],
    remodeling: ["kitchen", "bathroom", "remodel", "renovation", "gut", "shower", "tile walls", "vanity"],
    flooring: ["flooring", "laminate", "vinyl", "hardwood", "engineered", "lvp"],
    landscaping: ["grass", "lawn", "mulch", "hedge", "yard", "bush", "cleanup", "landscape"]
  };

  // Simple spam / bot detection keywords
  const SPAM_KEYWORDS = ["viagra", "crypto", "casino", "betting", "adult link"];

  // ----------------------------
  // 1. GLOBAL STATE
  // ----------------------------

  const state = {
    step: "greeting",
    lang: "en",
    privacyMode: false,
    humanMode: false,
    sizeWizard: {
      active: false,
      length: null,
      width: null
    },
    project: {
      serviceKey: null,
      borough: null,
      zip: null,
      sizeSqFt: null,
      rush: null,
      budgetLevel: null,
      notesRaw: "",
      notesClean: "",
      tieredEstimate: null,
      priceConfidence: 0,
      roiNote: "",
      breakdown: null
    },
    contact: {
      name: "",
      phone: "",
      email: ""
    },
    meta: {
      timestamp: null,
      timeOfDayLabel: "",
      seasonLabel: "",
      urgencyCopy: "",
      progress: 0,
      leadScore: 0,
      spamScore: 0
    },
    photos: [], // {name, size, previewUrl, base64}
    leadMagnetOptIn: false
  };

  // cached DOM
  const els = {
    messages: null,
    form: null,
    input: null,
    photos: null,
    progress: null,
    resetBtn: null
  };

  // ----------------------------
  // 2. STORAGE HELPERS
  // ----------------------------

  function saveNonPII() {
    try {
      const payload = {
        project: state.project,
        meta: state.meta,
        photosMeta: state.photos.map(p => ({ name: p.name, size: p.size }))
      };
      localStorage.setItem("hb_hammer_estimator_project", JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save non-PII state:", e);
    }
  }

  function loadNonPII() {
    try {
      const raw = localStorage.getItem("hb_hammer_estimator_project");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.project) Object.assign(state.project, parsed.project);
      if (parsed.meta) Object.assign(state.meta, parsed.meta);
    } catch (e) {
      console.warn("Failed to load non-PII state:", e);
    }
  }

  function saveContact() {
    if (state.privacyMode) return;
    try {
      sessionStorage.setItem("hb_hammer_estimator_contact", JSON.stringify(state.contact));
    } catch (e) {
      console.warn("Failed to save contact:", e);
    }
  }

  function loadContact() {
    try {
      const raw = sessionStorage.getItem("hb_hammer_estimator_contact");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      Object.assign(state.contact, parsed);
    } catch (e) {
      console.warn("Failed to load contact:", e);
    }
  }

  function clearAllStorage() {
    try {
      localStorage.removeItem("hb_hammer_estimator_project");
      sessionStorage.removeItem("hb_hammer_estimator_contact");
    } catch (e) {
      console.warn("Failed to clear storage:", e);
    }
  }

  // ----------------------------
  // 3. DOM / UI HELPERS
  // ----------------------------

  function cacheDOM() {
    els.messages = document.querySelector("#chat-messages");
    els.form = document.querySelector("#chat-form");
    els.input = document.querySelector("#chat-input");
    els.photos = document.querySelector("#chat-photos");
    els.progress = document.querySelector("#chat-progress");
    els.resetBtn = document.querySelector("#chat-reset-btn"); // optional
  }

  function ensureStylesInjected() {
    if (document.getElementById("hb-estimator-inline-style")) return;
    const style = document.createElement("style");
    style.id = "hb-estimator-inline-style";
    style.textContent = `
      .hb-msg { margin: 8px 0; font-size: 14px; line-height: 1.4; }
      .hb-msg.bot { text-align: left; }
      .hb-msg.user { text-align: right; }
      .hb-bubble {
        display: inline-block;
        padding: 10px 12px;
        border-radius: 14px;
        max-width: 90%;
      }
      .hb-msg.bot .hb-bubble {
        background: rgba(10,18,32,0.9);
        color: #f7f7f7;
        border: 1px solid rgba(231,191,99,0.25);
      }
      .hb-msg.user .hb-bubble {
        background: #e7bf63;
        color: #05090f;
        border: 1px solid rgba(0,0,0,0.5);
      }
      .hb-ballpark-card {
        background: radial-gradient(circle at top left, #111a2d, #050812);
        color: #ffffff;
        border-radius: 18px;
        padding: 14px 16px;
        border: 1px solid rgba(231,191,99,0.4);
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        margin-top: 6px;
      }
      .hb-ballpark-card h4 { margin: 0 0 4px 0; font-size: 15px; }
      .hb-ballpark-card .tiers { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
      .hb-ballpark-card .tier {
        border-radius: 12px;
        padding: 4px 8px;
        border: 1px solid rgba(231,191,99,0.4);
        font-size: 12px;
      }
      .hb-disclaimer {
        color: #ff5555;
        font-size: 12px;
        margin-top: 4px;
      }
      .hb-progress-bar {
        height: 4px;
        border-radius: 999px;
        background: rgba(255,255,255,0.07);
        overflow: hidden;
      }
      .hb-progress-value {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #e7bf63, #f5d89b);
        transition: width 0.25s ease;
      }
      .hb-photo-thumb {
        max-width: 90px;
        max-height: 90px;
        border-radius: 10px;
        object-fit: cover;
        margin-right: 4px;
        border: 1px solid rgba(231,191,99,0.6);
      }
      .hb-tag {
        display: inline-block;
        padding: 3px 7px;
        border-radius: 999px;
        border: 1px solid rgba(231,191,99,0.5);
        font-size: 11px;
        margin-right: 4px;
        margin-top: 2px;
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
  }

  function createProgressBarIfNeeded() {
    if (els.progress && els.progress.querySelector(".hb-progress-bar")) return;
    if (!els.progress) return;
    const bar = document.createElement("div");
    bar.className = "hb-progress-bar";
    const inner = document.createElement("div");
    inner.className = "hb-progress-value";
    bar.appendChild(inner);
    els.progress.appendChild(bar);
  }

  function setProgress(pct) {
    state.meta.progress = pct;
    const inner = els.progress && els.progress.querySelector(".hb-progress-value");
    if (inner) inner.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  // Typing delay: 10ms per char, max 1000ms
  function getTypingDelayFor(text) {
    const base = Math.min(1000, text.length * 10);
    return base;
  }

  function scrollToBottom() {
    if (!els.messages) return;
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function addMessage(opts) {
    // opts: { text, html, from: 'bot' | 'user', extraClass }
    if (!els.messages) return;
    const wrapper = document.createElement("div");
    wrapper.className = "hb-msg " + (opts.from || "bot") + (opts.extraClass ? " " + opts.extraClass : "");
    const bubble = document.createElement("div");
    bubble.className = "hb-bubble";
    if (opts.html) bubble.innerHTML = opts.html;
    else bubble.textContent = opts.text || "";
    wrapper.appendChild(bubble);
    els.messages.appendChild(wrapper);
    scrollToBottom();
  }

  function addBotMessage(textOrHtml, { html = false, extraClass = "" } = {}) {
    const delay = getTypingDelayFor(
      typeof textOrHtml === "string" ? textOrHtml : (textOrHtml || "")
    );
    setTimeout(() => {
      addMessage({
        from: "bot",
        text: html ? "" : textOrHtml,
        html: html ? textOrHtml : null,
        extraClass
      });
    }, delay);
  }

  function addUserMessage(text) {
    addMessage({ from: "user", text });
  }

  function attachResetButton() {
    if (!els.resetBtn) {
      // Try to find one or create minimal one
      const header = document.querySelector("#chat-header");
      if (header) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "chat-reset-btn";
        btn.textContent = "🔄";
        btn.style.marginLeft = "auto";
        btn.style.background = "transparent";
        btn.style.border = "none";
        btn.style.cursor = "pointer";
        btn.title = "Reset estimator";
        header.appendChild(btn);
        els.resetBtn = btn;
      }
    }
    if (els.resetBtn) {
      els.resetBtn.addEventListener("click", () => {
        clearAllStorage();
        window.location.reload();
      });
    }
  }

  // ----------------------------
  // 4. AI PROJECT DETECTION & CLEANING
  // ----------------------------

  function detectServiceFromText(text) {
    const txt = (text || "").toLowerCase();
    let bestKey = null;
    let bestHits = 0;
    for (const key in AI_SERVICE_KEYWORDS) {
      const list = AI_SERVICE_KEYWORDS[key];
      let hits = 0;
      list.forEach((word) => {
        if (txt.includes(word)) hits++;
      });
      if (hits > bestHits) {
        bestHits = hits;
        bestKey = key;
      }
    }
    return bestKey;
  }

  function sanitizeNotes(raw) {
    if (!raw) return "";
    let txt = raw.replace(/\s+/g, " ").trim();
    SPAM_KEYWORDS.forEach((bad) => {
      const re = new RegExp(bad, "gi");
      txt = txt.replace(re, "***");
    });
    return txt;
  }

  // AI-ish rewrite to clean description for email / scope
  function rewriteDescriptionForScope(raw) {
    if (!raw) return "";
    let s = sanitizeNotes(raw);
    // simple "AI style" cleanup
    s = s.replace(/\bi\b/g, "I");
    if (!/[.!?]$/.test(s)) s += ".";
    return s;
  }

  // ----------------------------
  // 5. SIZE WIZARD & MEASUREMENTS
  // ----------------------------

  function startSizeWizard() {
    state.sizeWizard.active = true;
    state.sizeWizard.length = null;
    state.sizeWizard.width = null;
    state.step = "sizeWizard_length";
    addBotMessage("No problem. Let’s estimate size together. Roughly how many feet is the **length** of the area?", { html: true });
  }

  function handleSizeWizardInput(userText) {
    const value = parseFloat(userText);
    if (isNaN(value) || value <= 0) {
      addBotMessage("Please enter a number in feet (e.g. 20).");
      return;
    }
    if (state.step === "sizeWizard_length") {
      state.sizeWizard.length = value;
      state.step = "sizeWizard_width";
      addBotMessage("Got it. And the **width** in feet?", { html: true });
    } else if (state.step === "sizeWizard_width") {
      state.sizeWizard.width = value;
      const sqf = Math.round(state.sizeWizard.length * state.sizeWizard.width);
      state.project.sizeSqFt = sqf;
      state.sizeWizard.active = false;
      state.step = "borough";
      addBotMessage(`That’s about **${sqf} sq ft**.`, { html: true });
      askBorough();
      saveNonPII();
    }
  }

  // ----------------------------
  // 6. PRICING, TIERED ESTIMATE, CONFIDENCE, UPSPELLS
  // ----------------------------

  function basePriceForService(serviceKey) {
    const cfg = SERVICES[serviceKey];
    if (!cfg) return 0;
    const base = cfg.base || 0;
    const per = cfg.perSqFt || 0;
    const sqf = state.project.sizeSqFt || 0;
    return base + per * sqf;
  }

  function boroughMultiplier() {
    const b = state.project.borough;
    return BOROUGH_MODS[b] || 1;
  }

  function difficultyMultiplier() {
    // Very simple: remodeling > masonry > others
    const key = state.project.serviceKey;
    if (key === "remodeling") return 1.4;
    if (key === "masonry") return 1.2;
    return 1.0;
  }

  function rushMultiplier() {
    const rush = state.project.rush;
    if (rush === "same-day") return 1.35;
    if (rush === "24hr") return 1.2;
    return 1.0;
  }

  function discountMultiplier() {
    const promo = (state.project.promoCode || "").toUpperCase();
    if (DISCOUNTS[promo]) {
      return 1 - DISCOUNTS[promo];
    }
    return 1;
  }

  function calculateEstimate() {
    const base = basePriceForService(state.project.serviceKey);
    let price = base;
    price *= boroughMultiplier();
    price *= difficultyMultiplier();
    price *= rushMultiplier();
    price *= discountMultiplier();
    const rounded = Math.round(price);

    const tiers = buildTieredPricing(rounded);
    const breakdown = {
      base,
      boroughMult: boroughMultiplier(),
      difficultyMult: difficultyMultiplier(),
      rushMult: rushMultiplier(),
      discountMult: discountMultiplier(),
      final: rounded,
      tiers
    };

    state.project.tieredEstimate = tiers;
    state.project.breakdown = breakdown;
    state.project.priceConfidence = estimateConfidenceScore();
    const svc = SERVICES[state.project.serviceKey];
    state.project.roiNote = svc ? svc.roi : "";
    return breakdown;
  }

  function buildTieredPricing(base) {
    return {
      basic: Math.round(base * 0.85),
      standard: Math.round(base),
      premium: Math.round(base * 1.25)
    };
  }

  function estimateConfidenceScore() {
    let score = 60;
    if (state.project.sizeSqFt) score += 10;
    if (state.photos.length > 0) score += 10;
    if (state.project.borough) score += 5;
    if (state.project.notesClean.length > 30) score += 5;
    return Math.min(100, score);
  }

  function suggestUpsells() {
    const key = state.project.serviceKey;
    const svc = SERVICES[key];
    if (!svc) return [];
    return svc.related || [];
  }

  // ROI message for remodeling etc.
  function getROIMessage() {
    const svc = SERVICES[state.project.serviceKey];
    if (!svc || !svc.roi) return "";
    if (state.project.serviceKey === "remodeling") {
      return "Typical ROI on a NYC kitchen or bathroom remodel is often in the 57–73% range at resale.";
    }
    return svc.roi;
  }

  // ----------------------------
  // 7. LEAD SCORING & URGENCY
  // ----------------------------

  function computeLeadScore() {
    let score = 50;
    const proj = state.project;

    // Borough
    if (proj.borough === "Manhattan") score += 10;
    if (proj.borough === "Brooklyn") score += 5;

    // Rush
    if (proj.rush === "same-day") score += 20;
    if (proj.rush === "24hr") score += 10;

    // Job type
    if (proj.serviceKey === "remodeling") score += 15;
    if (proj.serviceKey === "masonry") score += 10;

    // Photos
    if (state.photos.length >= 3) score += 10;

    // Budget (user-chosen)
    if (proj.budgetLevel === "high") score += 20;
    if (proj.budgetLevel === "medium") score += 10;

    // Spam penalty
    score -= state.meta.spamScore || 0;

    state.meta.leadScore = Math.max(0, Math.min(100, score));
    return state.meta.leadScore;
  }

  function computeUrgencyCopy() {
    const hour = new Date().getHours();
    let msg = "";

    if (hour >= 20 || hour < 7) {
      msg = "Our office is closed right now, but I’ll flag this for **priority review** tomorrow morning.";
    } else {
      msg = "We still have a few openings — we’ll review this and contact you as soon as possible.";
    }

    // “ethical urgency”
    if (state.project.serviceKey === "masonry" || state.project.serviceKey === "concrete") {
      msg += " Concrete and exterior work can book out quickly as weather allows, so locking a slot early helps.";
    }

    state.meta.urgencyCopy = msg;
    return msg;
  }

  // ----------------------------
  // 8. TIME / SEASONAL LOGIC
  // ----------------------------

  function computeTimeAndSeasonMeta() {
    const now = new Date();
    state.meta.timestamp = now.toISOString();
    const hour = now.getHours();
    if (hour < 12) state.meta.timeOfDayLabel = "morning";
    else if (hour < 18) state.meta.timeOfDayLabel = "afternoon";
    else state.meta.timeOfDayLabel = "evening";

    const month = now.getMonth() + 1;
    if ([12,1,2].includes(month)) state.meta.seasonLabel = "winter";
    else if ([3,4,5].includes(month)) state.meta.seasonLabel = "spring";
    else if ([6,7,8].includes(month)) state.meta.seasonLabel = "summer";
    else state.meta.seasonLabel = "fall";
  }

  function seasonalNote() {
    const s = state.meta.seasonLabel;
    const key = state.project.serviceKey;
    if (!s) return "";
    if (["winter"].includes(s) && (key === "masonry" || key === "concrete")) {
      return "Note: exterior concrete and masonry are **weather-dependent** in colder months. We can still plan and reserve a Spring or weather-window slot.";
    }
    if (["spring", "summer"].includes(s) && key === "landscaping") {
      return "Spring and summer bookings fill quickly for exterior and landscaping work — pre-booking helps lock your preferred dates.";
    }
    return "";
  }

  // ----------------------------
  // 9. PHOTO HANDLING (PREVIEW + BASE64 FOR CRM)
  // ----------------------------

  function handlePhotoInputChange(files) {
    if (!files || !files.length) return;
    const arr = Array.from(files);
    const remainingSlots = MAX_PHOTOS - state.photos.length;
    if (remainingSlots <= 0) {
      addBotMessage(`You already attached ${MAX_PHOTOS} photos. That’s enough for now.`);
      return;
    }

    const toUse = arr.slice(0, remainingSlots);
    toUse.forEach((file) => {
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        addBotMessage(`One photo (${file.name}) is over 100KB. I’ll skip that to keep things stable.`);
        return;
      }
      const photo = {
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        base64: null
      };
      state.photos.push(photo);
      renderPhotoPreview(photo);
      // read base64 for webhook later
      const reader = new FileReader();
      reader.onload = function (e) {
        photo.base64 = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    saveNonPII();
  }

  function renderPhotoPreview(photo) {
    if (!els.messages) return;
    const wrapper = document.createElement("div");
    wrapper.className = "hb-msg user";
    const bubble = document.createElement("div");
    bubble.className = "hb-bubble";
    const img = document.createElement("img");
    img.src = photo.previewUrl;
    img.alt = photo.name;
    img.className = "hb-photo-thumb";
    bubble.textContent = "Uploaded photo: ";
    bubble.appendChild(img);
    wrapper.appendChild(bubble);
    els.messages.appendChild(wrapper);
    scrollToBottom();
  }

  // ----------------------------
  // 10. EMAIL / SMS PAYLOAD + DISCLAIMER
  // ----------------------------

  function buildEmailSubject() {
    const score = state.meta.leadScore || 0;
    const svcLabel = SERVICES[state.project.serviceKey]?.label || "Project";
    const urgencyFlag = score >= 70 ? "🔥 URGENT HIGH-VALUE LEAD" :
                        score >= 50 ? "⭐ New Qualified Lead" :
                        "New Estimate Request";

    return `${urgencyFlag}: ${svcLabel} in ${state.project.borough || "NYC"} — ${state.contact.name || "Unknown"}`;
  }

  function buildEmailBody() {
    const b = state.project.breakdown || {};
    const tiers = state.project.tieredEstimate || {};
    const ROI = getROIMessage();
    const seasonal = seasonalNote();
    const urgency = state.meta.urgencyCopy || computeUrgencyCopy();
    const descClean = rewriteDescriptionForScope(state.project.notesRaw);

    const disclaimerText =
      "DISCLAIMER: This is a rough, non-binding ballpark estimate based on limited information. Final pricing requires an on-site visit, detailed scope, and written proposal.";

    let body = "";
    body += `Lead time: ${state.meta.timestamp}\n`;
    body += `Name: ${state.contact.name || ""}\n`;
    body += `Phone: ${state.contact.phone || ""}\n`;
    body += `Email: ${state.contact.email || ""}\n\n`;

    body += `Service: ${SERVICES[state.project.serviceKey]?.label || ""}\n`;
    body += `Borough / ZIP: ${state.project.borough || ""} ${state.project.zip || ""}\n`;
    body += `Approx. Size: ${state.project.sizeSqFt || "N/A"} sq ft\n`;
    body += `Rush Level: ${state.project.rush || "Standard"}\n`;
    body += `Budget Level: ${state.project.budgetLevel || "Not specified"}\n\n`;

    body += `User Description (cleaned):\n${descClean}\n\n`;

    body += `Ballpark Estimate (tiers):\n`;
    if (tiers.basic) body += `- BASIC: $${tiers.basic}\n`;
    if (tiers.standard) body += `- STANDARD: $${tiers.standard}\n`;
    if (tiers.premium) body += `- PREMIUM: $${tiers.premium}\n`;
    body += `\nConfidence Score: ${state.project.priceConfidence || 0}%\n`;
    body += `Lead Score: ${state.meta.leadScore || 0}/100\n\n`;

    if (ROI) body += `ROI Note: ${ROI}\n`;
    if (seasonal) body += `Seasonal Note: ${seasonal}\n`;
    if (urgency) body += `Urgency Note: ${urgency}\n`;
    body += `\n${disclaimerText}\n`;

    if (state.leadMagnetOptIn) {
      body += `\nLead Magnet: User requested Hammer Brick & Home NYC Home Maintenance Checklist.\n`;
    }

    // photo summary
    if (state.photos.length) {
      body += `\nPhotos (${state.photos.length}):\n`;
      state.photos.forEach((p, idx) => {
        body += `  ${idx + 1}. ${p.name} (${Math.round(p.size / 1024)} KB)\n`;
      });
    }

    return body;
  }

  function buildSmsBody() {
    const svcLabel = SERVICES[state.project.serviceKey]?.label || "Project";
    const b = state.project.breakdown || {};
    const tiers = state.project.tieredEstimate || {};
    const disclaimer =
      "DISCLAIMER: Rough ballpark only. Final price after site visit & written quote.";

    // SMS is plain text (no red color possible)
    let msg = "";
    msg += `Hammer Brick & Home — ${svcLabel} in ${state.project.borough || "NYC"}\n`;
    if (tiers.standard) msg += `Std: ~$${tiers.standard}`;
    if (tiers.basic) msg += ` | Basic: ~$${tiers.basic}`;
    if (tiers.premium) msg += ` | Prem: ~$${tiers.premium}`;
    msg += `\nConf: ${state.project.priceConfidence || 0}% | Lead: ${state.meta.leadScore || 0}`;
    msg += `\n${disclaimer}`;
    return msg;
  }

  // ----------------------------
  // 11. BALLPARK MESSAGE RENDER
  // ----------------------------

  function renderBallparkCard() {
    const breakdown = state.project.breakdown || calculateEstimate();
    const tiers = breakdown.tiers || state.project.tieredEstimate || {};
    const confidence = state.project.priceConfidence || 0;
    const score = state.meta.leadScore || computeLeadScore();
    const ROI = getROIMessage();
    const seasonal = seasonalNote();

    const upsells = suggestUpsells();
    const urgency = state.meta.urgencyCopy || computeUrgencyCopy();

    const disclaimerHtml =
      '<div class="hb-disclaimer">DISCLAIMER: This is a rough, non-binding ballpark based on limited info. Final pricing requires an on-site visit + written proposal.</div>';

    let html = `<div class="hb-ballpark-card">`;
    html += `<h4>Ballpark Estimate (Not a Final Quote)</h4>`;
    html += `<div>For: <strong>${SERVICES[state.project.serviceKey]?.label || "Project"}</strong> in <strong>${state.project.borough || "NYC"}</strong></div>`;
    if (state.project.sizeSqFt) {
      html += `<div>Approx. size: <strong>${state.project.sizeSqFt} sq ft</strong></div>`;
    }
    html += `<div class="tiers">`;
    if (tiers.basic) html += `<div class="tier">BASIC ~ $${tiers.basic}</div>`;
    if (tiers.standard) html += `<div class="tier">STANDARD ~ $${tiers.standard}</div>`;
    if (tiers.premium) html += `<div class="tier">PREMIUM ~ $${tiers.premium}</div>`;
    html += `</div>`;
    html += `<div style="margin-top:6px;font-size:12px;">Confidence: <strong>${confidence}%</strong> · Lead Score: <strong>${score}/100</strong></div>`;

    if (ROI) {
      html += `<div style="margin-top:6px;font-size:12px;">ROI insight: ${ROI}</div>`;
    }
    if (seasonal) {
      html += `<div style="margin-top:4px;font-size:12px;">${seasonal}</div>`;
    }
    if (upsells.length) {
      html += `<div style="margin-top:6px;font-size:12px;">You may also want: `;
      upsells.forEach((u) => {
        html += `<span class="hb-tag">${u}</span>`;
      });
      html += `</div>`;
    }
    if (urgency) {
      html += `<div style="margin-top:6px;font-size:12px;">${urgency}</div>`;
    }

    html += disclaimerHtml;
    html += `</div>`;

    addBotMessage(html, { html: true });
  }

  // ----------------------------
  // 12. LEAD MAGNET / PRIVACY / HUMAN MODE
  // ----------------------------

  function askLeadMagnet() {
    addBotMessage(
      "Would you like a free **NYC Home Maintenance Checklist** from Hammer Brick & Home emailed to you along with your estimate? Type **yes** or **no**.",
      { html: true }
    );
    state.step = "lead_magnet";
  }

  function enablePrivacyMode() {
    state.privacyMode = true;
    addBotMessage(
      "Privacy mode is now **ON**. I won’t store your contact details in this browser after we’re done.",
      { html: true }
    );
  }

  function triggerHumanMode() {
    state.humanMode = true;
    const phoneText = "929-595-5300";
    addBotMessage(
      `You can reach a human now at <strong>${phoneText}</strong> (call or text). I’ll still capture your details here so we can follow up.`,
      { html: true }
    );
  }

  // ----------------------------
  // 13. CRM / WEBHOOK
  // ----------------------------

  async function sendToCRM() {
    const payload = {
      project: state.project,
      contact: state.contact,
      photos: state.photos
        .filter((p) => !!p.base64)
        .map((p) => ({ name: p.name, size: p.size, base64: p.base64 })),
      meta: state.meta,
      emailSubject: buildEmailSubject(),
      emailBody: buildEmailBody(),
      smsPreview: buildSmsBody()
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log("CRM webhook sent.");
    } catch (e) {
      console.warn("Failed to send webhook:", e);
    }
  }

  // ----------------------------
  // 14. CHAT FLOW ENGINE (SIMPLIFIED)
  // ----------------------------

  function startConversation() {
    computeTimeAndSeasonMeta();
    ensureStylesInjected();
    createProgressBarIfNeeded();
    setProgress(5);
    let greet = "Hi, I’m the Hammer Brick & Home estimate assistant.";
    if (state.meta.timeOfDayLabel === "evening") {
      greet = "Good evening — I’m the Hammer Brick & Home estimate assistant.";
    }
    addBotMessage(greet);
    addBotMessage("Tell me what you’re working on. You can say things like “front steps are cracked”, “basement floor painting”, or “full bathroom remodel”.");
    state.step = "service";
  }

  function askBorough() {
    addBotMessage("Which borough is the property in? (Manhattan, Brooklyn, Queens, Bronx, Staten Island)");
  }

  function askSizeOrWizard() {
    addBotMessage(
      'Do you know the approximate size in square feet? You can type a number (like **400**) or type **help** and I’ll guide you.',
      { html: true }
    );
    state.step = "size_choice";
  }

  function askRush() {
    addBotMessage(
      "How fast do you need this done? Type: **standard**, **24hr**, or **same-day** (where available).",
      { html: true }
    );
    state.step = "rush";
  }

  function askContactInfo() {
    addBotMessage("What’s your **name**?", { html: true });
    state.step = "contact_name";
  }

  function handleUserInput(raw) {
    const text = raw.trim();
    if (!text) return;

    // privacy + human triggers (any time)
    if (/privacy/i.test(text)) {
      enablePrivacyMode();
      return;
    }
    if (/human|agent|person/i.test(text)) {
      triggerHumanMode();
    }

    if (state.step === "service") {
      // detect service
      const key = detectServiceFromText(text);
      if (!key) {
        addBotMessage("Got it. That sounds like a project I can help with. I’ll treat it as general remodeling for now.");
        state.project.serviceKey = "remodeling";
      } else {
        state.project.serviceKey = key;
        addBotMessage(`Sounds like **${SERVICES[key].label}**.`, { html: true });
      }
      state.project.notesRaw = text;
      state.project.notesClean = sanitizeNotes(text);

      const svc = SERVICES[state.project.serviceKey];
      if (svc && svc.deepQuestions && svc.deepQuestions.length) {
        addBotMessage("A couple of quick questions help make the estimate smarter:");
        svc.deepQuestions.forEach((q) => addBotMessage("• " + q));
      }

      saveNonPII();
      setProgress(15);
      askSizeOrWizard();
      return;
    }

    if (state.step === "size_choice") {
      if (/help/i.test(text)) {
        startSizeWizard();
        return;
      }
      const sqf = parseFloat(text);
      if (isNaN(sqf) || sqf <= 0) {
        addBotMessage("Please enter a rough number in square feet (for example: 400) or type **help**.", { html: true });
        return;
      }
      state.project.sizeSqFt = Math.round(sqf);
      addBotMessage(`Great — I’ll use about **${state.project.sizeSqFt} sq ft**.`, { html: true });
      saveNonPII();
      setProgress(25);
      askBorough();
      state.step = "borough";
      return;
    }

    if (state.step === "sizeWizard_length" || state.step === "sizeWizard_width") {
      handleSizeWizardInput(text);
      setProgress(30);
      return;
    }

    if (state.step === "borough") {
      const b = text.trim();
      const normalized = Object.keys(BOROUGH_MODS).find((k) =>
        k.toLowerCase().startsWith(b.toLowerCase())
      );
      if (!normalized) {
        addBotMessage("Please type one of: Manhattan, Brooklyn, Queens, Bronx, or Staten Island.");
        return;
      }
      state.project.borough = normalized;
      addBotMessage(`Perfect, we’ll treat this as **${normalized}** pricing.`, { html: true });
      setProgress(40);
      askRush();
      return;
    }

    if (state.step === "rush") {
      const t = text.toLowerCase();
      if (/same/.test(t)) state.project.rush = "same-day";
      else if (/24/.test(t)) state.project.rush = "24hr";
      else state.project.rush = "standard";
      addBotMessage(`Got it — **${state.project.rush.toUpperCase()}** timing.`, { html: true });
      setProgress(50);
      askContactInfo();
      return;
    }

    if (state.step === "contact_name") {
      state.contact.name = text;
      saveContact();
      addBotMessage("Thanks! What’s the best **phone number** to reach you?", { html: true });
      state.step = "contact_phone";
      setProgress(60);
      return;
    }

    if (state.step === "contact_phone") {
      state.contact.phone = text;
      saveContact();
      addBotMessage("And your **email address** (for sending your written estimate)?", { html: true });
      state.step = "contact_email";
      setProgress(70);
      return;
    }

    if (state.step === "contact_email") {
      state.contact.email = text;
      saveContact();
      setProgress(80);
      // compute everything now
      computeTimeAndSeasonMeta();
      computeLeadScore();
      calculateEstimate();
      renderBallparkCard();
      setProgress(90);
      // Ask about lead magnet
      askLeadMagnet();
      return;
    }

    if (state.step === "lead_magnet") {
      if (/yes|yeah|yep/i.test(text)) {
        state.leadMagnetOptIn = true;
        addBotMessage("Nice — I’ll include the checklist with your follow-up email.");
      } else {
        state.leadMagnetOptIn = false;
        addBotMessage("No problem. I’ll just send the estimate details.");
      }
      setProgress(100);
      // Send to CRM
      sendToCRM();
      addBotMessage(
        "I’ve captured everything. A human from Hammer Brick & Home will review this and follow up with a proper written estimate. If you need to talk right away, call or text <strong>929-595-5300</strong>.",
        { html: true }
      );
      state.step = "done";
      return;
    }

    if (state.step === "done") {
      addBotMessage("You’re all set. If you’d like to start a **new estimate**, hit the reset button (🔄) at the top.");
      return;
    }
  }

  // ----------------------------
  // 15. INIT
  // ----------------------------

  function init() {
    cacheDOM();
    ensureStylesInjected();
    loadNonPII();
    loadContact();
    attachResetButton();
    createProgressBarIfNeeded();

    if (els.form && els.input) {
      els.form.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = els.input.value;
        if (!text.trim()) return;
        addUserMessage(text);
        els.input.value = "";
        handleUserInput(text);
      });
    }

    if (els.photos) {
      els.photos.addEventListener("change", function () {
        handlePhotoInputChange(this.files);
        // Clear input so same file can be re-chosen if needed
        this.value = "";
      });
    }

    // Start fresh conversation
    startConversation();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

