// Hammer Brick & Home LLC — Estimator Super v4 (CLEAN FIXED VERSION)
// - Keeps all your big CONFIG blocks
// - Fixes syntax issues and safely wires logic + UI
// - Split into 3 parts (paste Part 1, then Part 2, then Part 3 in one file)

document.addEventListener("DOMContentLoaded", () => {
  const form        = document.getElementById("est-form");
  if (!form) return;

  // Inject extra styles for advanced UI bits (averages, breakdown, chips, bands, etc.)
  injectEstimatorExtraStyles();

  const serviceEl   = document.getElementById("est-service");
  const boroughEl   = document.getElementById("est-borough");
  const buildingEl  = document.getElementById("est-building");
  const sizeRow     = document.getElementById("est-size-row");
  const sizeLabel   = document.getElementById("est-size-label");
  const sizeInput   = document.getElementById("est-size");
  const scopeRow    = document.getElementById("est-scope-row");
  const scopeSelect = document.getElementById("est-scope");
  const finishEl    = document.getElementById("est-finish");
  const urgencyEl   = document.getElementById("est-urgency");
  const leadRow     = document.getElementById("lead-row");
  const leadEl      = document.getElementById("est-lead");
  const dumpsterEl  = document.getElementById("est-dumpster");
  const demoEl      = document.getElementById("est-demo");
  const permitEl    = document.getElementById("est-permit");
  const resultBox   = document.getElementById("est-result");
  const permitBox   = document.getElementById("permit-helper");
  const regionNoteEl= document.getElementById("region-note");

  // ⭐ SMART ADD-ON CONFIG (OPTION C: dedicated panel that changes by service) ⭐
  const ADDON_CONFIG = {
    "masonry": {
      title: "Popular Masonry / Paver Add-Ons",
      subnote: "Optional upgrades many NYC homeowners add to masonry and paver projects.",
      items: [
        { id:"polymeric-sand", label:"Polymeric sand + joint lock upgrade", low:350, high:850 },
        { id:"paver-seal", label:"Paver sealing (up to ~800 sq ft)", low:450, high:1200 },
        { id:"drainage", label:"Channel drain / extra drainage work", low:900, high:2200 },
        { id:"step-safety", label:"Front steps safety / repair upgrade", low:1800, high:4200 }
      ]
    },
    "driveway": {
      title: "Driveway Add-Ons",
      subnote: "Extras that improve drainage, edging, and long-term performance.",
      items: [
        { id:"edging", label:"Decorative border / soldier course", low:750, high:2500 },
        { id:"extra-drainage", label:"Extra drainage or trench drain at garage", low:1200, high:3200 },
        { id:"heated", label:"Snow-melt / heat prep (where feasible)", low:2500, high:6500 }
      ]
    },
    "roofing": {
      title: "Roofing Protection Add-Ons",
      subnote: "Common upgrades for better protection and ventilation.",
      items: [
        { id:"ice-water", label:"Full ice & water shield upgrade", low:900, high:2600 },
        { id:"ridge-vent", label:"Ridge vent / attic ventilation upgrade", low:750, high:2200 },
        { id:"gutter-upgrade", label:"New gutters / downspouts with roof", low:1500, high:3800 }
      ]
    },
    "bathroom": {
      title: "Bathroom Comfort Add-Ons",
      subnote: "Small upgrades that make the bathroom feel more custom.",
      items: [
        { id:"niches", label:"1–2 built-in shampoo niches", low:450, high:1200 },
        { id:"glass-door", label:"Frameless glass door upgrade", low:1800, high:3200 },
        { id:"heated-floor", label:"Heated floor mat (where feasible)", low:2200, high:4200 },
        { id:"fan-upgrade", label:"Quiet exhaust fan with timer", low:650, high:1400 }
      ]
    },
    "kitchen": {
      title: "Kitchen Add-Ons",
      subnote: "Popular kitchen extras many NYC clients add.",
      items: [
        { id:"under-cabinet", label:"Under-cabinet lighting package", low:950, high:2200 },
        { id:"backsplash", label:"Full-height backsplash upgrade", low:1500, high:4200 },
        { id:"island-electric", label:"Extra island outlets / pendants", low:900, high:2600 }
      ]
    },
    "basement": {
      title: "Basement Finishing Add-Ons",
      subnote: "Extras that improve comfort and moisture control.",
      items: [
        { id:"dehumid", label:"Dedicated dehumidifier with drain", low:950, high:2200 },
        { id:"soundproof-ceiling", label:"Sound-damped ceiling over main area", low:2200, high:5200 },
        { id:"egress", label:"Egress window rough budget (where allowed)", low:4500, high:9500 }
      ]
    },
    "interior-paint": {
      title: "Interior Painting Add-Ons",
      subnote: "Detail work and premium finish options.",
      items: [
        { id:"trim-upgrade", label:"Trim / doors enamel upgrade", low:850, high:2200 },
        { id:"accent-walls", label:"Multiple accent walls / feature color", low:450, high:1200 },
        { id:"ceiling-paint", label:"Ceiling repaint package", low:650, high:1800 }
      ]
    },
    "flooring": {
      title: "Flooring Add-Ons",
      subnote: "Prep and finishing options that affect look and lifespan.",
      items: [
        { id:"demo-disposal", label:"Old flooring demo & disposal", low:1200, high:3200 },
        { id:"stair-upgrade", label:"Stair treads & railing detail work", low:1800, high:4500 }
      ]
    },
    "windows": {
      title: "Window / Door Add-Ons",
      subnote: "Comfort and finish upgrades.",
      items: [
        { id:"interior-trim", label:"New interior casing / trim package", low:1200, high:3200 },
        { id:"laminated-glass", label:"Noise-reducing / laminated glass upgrade", low:1800, high:4200 }
      ]
    },
    "fence": {
      title: "Fence Add-Ons",
      subnote: "Privacy and access upgrades.",
      items: [
        { id:"gates", label:"Extra gate(s) or wider gate upgrade", low:750, high:2200 },
        { id:"privacy-screens", label:"Privacy screens / lattice sections", low:900, high:2600 }
      ]
    },
    "deck": {
      title: "Deck / Patio Add-Ons",
      subnote: "Comfort and safety upgrades.",
      items: [
        { id:"lighting", label:"Stair & railing lighting package", low:900, high:2600 },
        { id:"privacy-wall", label:"Privacy wall / divider", low:2200, high:5200 }
      ]
    },
    "power-wash": {
      title: "Power Washing Add-Ons",
      subnote: "Deep cleaning and protection upgrades.",
      items: [
        { id:"softwash", label:"Soft-wash solution upgrade (roof/siding)", low:450, high:1200 },
        { id:"sealant", label:"Sealer on cleaned concrete/pavers", low:650, high:1800 }
      ]
    },
    "gutters": {
      title: "Gutter Add-Ons",
      subnote: "Common gutter extras.",
      items: [
        { id:"guards", label:"Gutter guards on main runs", low:1200, high:2800 },
        { id:"heat-cables", label:"Heat cables at trouble spots", low:900, high:2600 }
      ]
    },
    "landscaping": {
      title: "Landscaping Add-Ons",
      subnote: "Curb-appeal boosters.",
      items: [
        { id:"mulch-refresh", label:"Mulch / stone bed refresh", low:450, high:1200 },
        { id:"planting", label:"Seasonal planting package", low:650, high:2200 }
      ]
    },
    "smart-home": {
      title: "Smart Home & Lighting Add-Ons",
      subnote: "Extra zones and devices.",
      items: [
        { id:"extra-cameras", label:"Extra camera locations", low:750, high:2200 },
        { id:"smart-dimmers", label:"Smart dimmers in key rooms", low:850, high:2600 }
      ]
    },
    "handyman": {
      title: "Handyman Visit Add-Ons",
      subnote: "Common small extras during a visit.",
      items: [
        { id:"small-paint", label:"Small paint touchups (1–2 rooms)", low:250, high:550 },
        { id:"caulking", label:"Caulk & weatherstrip package", low:220, high:480 }
      ]
    }
  };

  // Add-on panel DOM
  const addonsPanel = document.getElementById("est-addons-panel");
  let extraAddonsValue = 0; // running total from selected smart add-ons (average of low/high)

  // Brand elements
  const brandRow    = document.getElementById("brand-row");
  const brandSelect = document.getElementById("est-brand");
  const brandLabel  = document.getElementById("est-brand-label");

  // Advanced groups
  const advMasonry  = document.getElementById("adv-masonry");
  const advRoof     = document.getElementById("adv-roof");
  const advSiding   = document.getElementById("adv-siding");
  const advWindows  = document.getElementById("adv-windows");
  const advStyle    = document.getElementById("adv-style");

  const masonryFocusEl  = document.getElementById("masonry-focus");
  const driveExistingEl = document.getElementById("drive-existing");
  const driveRemoveEl   = document.getElementById("drive-remove");
  const driveAccessEl   = document.getElementById("drive-access");

  const roofTearoffEl = document.getElementById("roof-tearoff");
  const roofPitchEl   = document.getElementById("roof-pitch");
  const roofHeightEl  = document.getElementById("roof-height");

  const sidingRemoveEl  = document.getElementById("siding-remove");
  const sidingStoriesEl = document.getElementById("siding-stories");

  const windowCountEl  = document.getElementById("window-count");
  const doorCountEl    = document.getElementById("door-count");

  const designStyleEl  = document.getElementById("design-style");

  // ==========================
  // CORE CONFIG (SERVICES)
  // ==========================
  const SERVICE_CONFIG = {
    "masonry": {
      mode: "area",
      label: "Approx. masonry / paver area (sq. ft.)",
      minArea: 80,
      maxArea: 4000,
      perSqLow: 16,
      perSqHigh: 28,
      minLow: 2500,
      minHigh: 6500,
      leadSensitive: false,
      permit: "maybe"
    },
    "driveway": {
      mode: "area",
      label: "Driveway / parking area (sq. ft.)",
      minArea: 250,
      maxArea: 5000,
      perSqLow: 8,
      perSqHigh: 20,
      minLow: 3500,
      minHigh: 15000,
      leadSensitive: false,
      permit: "maybe"
    },
    "roofing": {
      mode: "area",
      label: "Roof area (sq. ft. of deck)",
      minArea: 700,
      maxArea: 5000,
      perSqLow: 3.75,
      perSqHigh: 9.5,
      minLow: 6500,
      minHigh: 22000,
      leadSensitive: false,
      permit: "likely"
    },
    "siding": {
      mode: "area",
      label: "Wall area to side (sq. ft.)",
      minArea: 600,
      maxArea: 4500,
      perSqLow: 5,
      perSqHigh: 12,
      minLow: 6500,
      minHigh: 28000,
      leadSensitive: true,
      permit: "likely"
    },
    "windows": {
      mode: "area",
      label: "Total openings (windows + doors count)",
      minArea: 3,
      maxArea: 40,
      perSqLow: 750,
      perSqHigh: 1600,
      minLow: 5000,
      minHigh: 45000,
      leadSensitive: true,
      permit: "maybe"
    },
    "exterior-paint": {
      mode: "area",
      label: "Approx. exterior wall area (sq. ft.)",
      minArea: 400,
      maxArea: 5000,
      perSqLow: 2.5,
      perSqHigh: 6.5,
      minLow: 2800,
      minHigh: 10000,
      leadSensitive: true,
      permit: "maybe"
    },
    "deck": {
      mode: "area",
      label: "Approx. deck / patio area (sq. ft.)",
      minArea: 120,
      maxArea: 1500,
      perSqLow: 28,
      perSqHigh: 60,
      minLow: 6000,
      minHigh: 26000,
      leadSensitive: false,
      permit: "likely"
    },
    "fence": {
      mode: "scope",
      leadSensitive: false,
      permit: "maybe",
      scopes: {
        "yard": {
          label: "Standard run (approx. 50–120 ft)",
          low: 3000,
          high: 6500
        },
        "corner": {
          label: "Corner / larger yard (120–220 ft)",
          low: 6500,
          high: 12000
        },
        "premium": {
          label: "Premium/custom fence or multiple gates",
          low: 12000,
          high: 20000
        }
      }
    },
    "waterproofing": {
      mode: "area",
      label: "Approx. basement / wall area (sq. ft.)",
      minArea: 200,
      maxArea: 2000,
      perSqLow: 18,
      perSqHigh: 40,
      minLow: 3800,
      minHigh: 22000,
      leadSensitive: true,
      permit: "likely"
    },
    "power-wash": {
      mode: "area",
      label: "Approx. area to wash (sq. ft.)",
      minArea: 400,
      maxArea: 6000,
      perSqLow: 0.5,
      perSqHigh: 1.6,
      minLow: 300,
      minHigh: 2500,
      leadSensitive: false,
      permit: "none"
    },
    "landscaping": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "basic": {
          label: "Basic monthly care (lawn, trim, light cleanup)",
          low: 180,
          high: 450
        },
        "seasonal": {
          label: "Spring / Fall cleanup bundle",
          low: 650,
          high: 1800
        },
        "upgrade": {
          label: "Landscape upgrade (beds, plants, small hardscape)",
          low: 2500,
          high: 9000
        }
      }
    },
    "exterior-lighting": {
      mode: "scope",
      leadSensitive: false,
      permit: "maybe",
      scopes: {
        "basic": {
          label: "Basic package (3–6 fixtures, simple controls)",
          low: 1500,
          high: 3500
        },
        "standard": {
          label: "Full front package (6–12 fixtures, timer/smart)",
          low: 3500,
          high: 7500
        },
        "premium": {
          label: "Whole-property or high-end system",
          low: 7500,
          high: 16000
        }
      }
    },
    "sidewalk": {
      mode: "area",
      label: "Sidewalk / DOT concrete area (sq. ft.)",
      minArea: 80,
      maxArea: 800,
      perSqLow: 18,
      perSqHigh: 35,
      minLow: 4500,
      minHigh: 18000,
      leadSensitive: false,
      permit: "likely"
    },
    "gutters": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "clean": {
          label: "Cleanout / minor repair",
          low: 250,
          high: 700
        },
        "replace": {
          label: "Standard replacement (typical home)",
          low: 1500,
          high: 3500
        },
        "guards": {
          label: "Install gutter guards (with minor repairs)",
          low: 1500,
          high: 3800
        }
      }
    },
    "interior-paint": {
      mode: "area",
      label: "Approx. interior floor area (sq. ft.)",
      minArea: 250,
      maxArea: 4000,
      perSqLow: 1.5,
      perSqHigh: 3.5,
      minLow: 1800,
      minHigh: 9000,
      leadSensitive: true,
      permit: "none"
    },
    "flooring": {
      mode: "area",
      label: "Floor area (sq. ft.)",
      minArea: 200,
      maxArea: 3000,
      perSqLow: 4,
      perSqHigh: 14,
      minLow: 2500,
      minHigh: 26000,
      leadSensitive: false,
      permit: "none"
    },
    "drywall": {
      mode: "area",
      label: "Wall / ceiling surface area (sq. ft.)",
      minArea: 200,
      maxArea: 4000,
      perSqLow: 2.75,
      perSqHigh: 7.5,
      minLow: 2000,
      minHigh: 18000,
      leadSensitive: true,
      permit: "maybe"
    },
    "interior-doors": {
      mode: "area",
      label: "Number of doors to replace",
      minArea: 2,
      maxArea: 20,
      perSqLow: 300,
      perSqHigh: 900,
      minLow: 600,
      minHigh: 12000,
      leadSensitive: false,
      permit: "none"
    },
    "closets": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "simple": {
          label: "Simple reach-in or small closet",
          low: 1500,
          high: 3500
        },
        "walkin": {
          label: "Standard walk-in layout",
          low: 3500,
          high: 7800
        },
        "premium": {
          label: "Custom built-ins / dressing room",
          low: 7800,
          high: 15000
        }
      }
    },
    "interior-lighting": {
      mode: "scope",
      leadSensitive: false,
      permit: "maybe",
      scopes: {
        "room": {
          label: "Single room upgrade (recessed / fixture)",
          low: 1500,
          high: 3000
        },
        "multi": {
          label: "Multiple rooms / small apartment",
          low: 3000,
          high: 6500
        },
        "whole": {
          label: "Whole-home smart lighting package",
          low: 6500,
          high: 18000
        }
      }
    },
    "bathroom": {
      mode: "scope",
      leadSensitive: true,
      permit: "likely",
      scopes: {
        "refresh": {
          label: "Light refresh (keep layout & most fixtures)",
          low: 9000,
          high: 16000
        },
        "mid": {
          label: "Mid-level remodel (tile + fixtures upgrade)",
          low: 16000,
          high: 28000
        },
        "gut": {
          label: "Full gut with higher-end finishes",
          low: 28000,
          high: 45000
        }
      }
    },
    "kitchen": {
      mode: "scope",
      leadSensitive: true,
      permit: "likely",
      scopes: {
        "refresh": {
          label: "Cosmetic refresh (paint, backsplash, hardware)",
          low: 16000,
          high: 28000
        },
        "mid": {
          label: "Mid-level remodel (cabinets + surfaces)",
          low: 28000,
          high: 55000
        },
        "gut": {
          label: "Full gut / higher-end kitchen",
          low: 55000,
          high: 90000
        }
      }
    },
    "basement": {
      mode: "area",
      label: "Approx. finished basement area (sq. ft.)",
      minArea: 400,
      maxArea: 2000,
      perSqLow: 35,
      perSqHigh: 85,
      minLow: 22000,
      minHigh: 65000,
      leadSensitive: true,
      permit: "likely"
    },
    "garage-conversion": {
      mode: "scope",
      leadSensitive: true,
      permit: "likely",
      scopes: {
        "basic": {
          label: "Basic insulated studio / office conversion",
          low: 18000,
          high: 35000
        },
        "enhanced": {
          label: "Enhanced conversion (bath / kitchenette)",
          low: 35000,
          high: 65000
        }
      }
    },
    "epoxy-garage": {
      mode: "area",
      label: "Garage floor area (sq. ft.)",
      minArea: 250,
      maxArea: 1500,
      perSqLow: 4.25,
      perSqHigh: 9.5,
      minLow: 1800,
      minHigh: 9000,
      leadSensitive: false,
      permit: "none"
    },
    "smart-home": {
      mode: "scope",
      leadSensitive: false,
      permit: "maybe",
      scopes: {
        "basic": {
          label: "Doorbell / a few cameras / smart lock",
          low: 1500,
          high: 3000
        },
        "standard": {
          label: "Full-floor or small home package",
          low: 3000,
          high: 6500
        },
        "premium": {
          label: "Whole-home integrated smart system",
          low: 6500,
          high: 15000
        }
      }
    },
    "handyman": {
      mode: "scope",
      leadSensitive: false,
      permit: "none",
      scopes: {
        "small": {
          label: "Small visit (up to 2 hours)",
          low: 250,
          high: 450
        },
        "halfday": {
          label: "Half day (up to 4 hours)",
          low: 450,
          high: 700
        },
        "fullday": {
          label: "Full day (up to 8 hours)",
          low: 700,
          high: 1000
        }
      }
    },
    "soundproofing": {
      mode: "area",
      label: "Approx. wall/ceiling area to soundproof (sq. ft.)",
      minArea: 150,
      maxArea: 2000,
      perSqLow: 12,
      perSqHigh: 28,
      minLow: 3000,
      minHigh: 15000,
      leadSensitive: true,
      permit: "maybe"
    },
    "moisture-control": {
      mode: "area",
      label: "Approx. treated area (sq. ft.)",
      minArea: 150,
      maxArea: 2000,
      perSqLow: 8,
      perSqHigh: 22,
      minLow: 2500,
      minHigh: 15000,
      leadSensitive: true,
      permit: "maybe"
    }
  };

  const BOROUGH_FACTOR = {
    "staten-island": 1.00,
    "brooklyn": 1.08,
    "queens": 1.05,
    "bronx": 1.03,
    "manhattan": 1.18,
    "nj": 0.96,
    "outside": 1.00
  };

  const BUILDING_FACTOR = {
    "house": 1.00,
    "small-multi": 1.08,
    "coop-condo": 1.15,
    "mixed": 1.20
  };

  const FINISH_FACTOR = {
    "standard": 1.00,
    "premium": 1.15,
    "luxury": 1.32
  };

  const FINISH_LABEL = {
    "standard": "Standard",
    "premium": "Premium",
    "luxury": "Luxury"
  };

  const URGENCY_FACTOR = {
    "flex": 1.00,
    "soon": 1.07,
    "rush": 1.15
  };

  const URGENCY_LABEL = {
    "flex": "Flexible (2–3+ months)",
    "soon": "Soon (4–8 weeks)",
    "rush": "Rush (< 4 weeks)"
  };

  const SERVICE_LABEL = {
    "masonry": "Masonry · Pavers · Concrete",
    "driveway": "Driveway / Parking Area",
    "roofing": "Roofing – Shingle / Flat",
    "siding": "Siding – Exterior",
    "windows": "Windows & Exterior Doors",
    "exterior-paint": "Exterior Facade / Painting",
    "deck": "Deck / Patio Build or Rebuild",
    "fence": "Fence Install / Replacement",
    "waterproofing": "Waterproofing & Foundation Sealing",
    "power-wash": "Power Washing / Soft Washing",
    "landscaping": "Landscaping & Seasonal Care",
    "exterior-lighting": "Exterior Lighting & Smart Security",
    "sidewalk": "Sidewalk / DOT Concrete Repair",
    "gutters": "Gutter Install / Repair",
    "interior-paint": "Interior Painting",
    "flooring": "Flooring (LVP / Tile / Hardwood)",
    "drywall": "Drywall / Plaster / Skim Coat",
    "interior-doors": "Interior Doors & Trim",
    "closets": "Closet / Storage Buildouts",
    "interior-lighting": "Interior Electrical / Smart Lighting",
    "bathroom": "Bathroom Remodel",
    "kitchen": "Kitchen Remodel",
    "basement": "Basement Finishing",
    "garage-conversion": "Garage Conversion / Remodel",
    "epoxy-garage": "Epoxy Garage Floor",
    "smart-home": "Smart Home Upgrades (Ring / Nest / Cameras)",
    "handyman": "Small Repairs / Handyman Visit",
    "soundproofing": "Soundproofing",
    "moisture-control": "Mold / Moisture Prevention (non-remediation)"
  };

  // Brand config (extended)
  const BRAND_CONFIG = {
    "windows": {
      label: "Preferred Window / Door Brand",
      budget: [
        "Alside",
        "Revere",
        "Ideal",
        "American Craftsman (Home Depot)",
        "JELD-WEN (Home Depot)",
        "ReliaBilt (Lowe's)",
        "MI Windows",
        "Silver Line"
      ],
      standard: [
        "Pella 250",
        "Andersen 100",
        "JELD-WEN Premium",
        "Pella Lifestyle (Lowe's)",
        "Harvey Classic",
        "Okna 400"
      ],
      luxury: [
        "Andersen 400 / A-Series",
        "Marvin Elevate / Ultimate",
        "Pella Architect",
        "Marvin Signature",
        "Kolbe Ultra Series"
      ]
    },
    "roofing": {
      label: "Preferred Roofing Line",
      budget: [
        "IKO Cambridge",
        "GAF Royal Sovereign (Home Depot)",
        "Owens Corning Supreme (Lowe's)",
        "TAMKO Heritage",
        "BP Mystique"
      ],
      standard: [
        "CertainTeed Landmark",
        "Owens Corning Oakridge (Lowe's)",
        "GAF Timberline NS (Home Depot)",
        "Tamko Elite",
        "GAF Timberline HDZ"
      ],
      luxury: [
        "CertainTeed Landmark Pro",
        "Owens Corning Duration",
        "GAF Timberline UHDZ",
        "CertainTeed Grand Manor",
        "DaVinci Synthetic Slate"
      ]
    },
    "siding": {
      label: "Preferred Siding Brand",
      budget: [
        "Alside Vinyl",
        "Royal Vinyl",
        "Georgia-Pacific Vinyl (Home Depot)",
        "Everlast (Lowe's)",
        "Mastic Ovation"
      ],
      standard: [
        "CertainTeed Monogram",
        "Mastic Quest",
        "Ply Gem",
        "Norandex",
        "Royal Haven"
      ],
      luxury: [
        "James Hardie Fiber Cement",
        "CertainTeed Cedar Impressions",
        "LP SmartSide",
        "AZEK Cladding"
      ]
    },
    "flooring": {
      label: "Preferred Flooring Brand",
      budget: [
        "MSI",
        "Pergo (Home Depot)",
        "TrafficMaster (Home Depot)",
        "Style Selections (Lowe's)",
        "LifeProof Basic (Home Depot)"
      ],
      standard: [
        "Armstrong",
        "LifeProof Premium (Home Depot)",
        "Home Decorators Collection (Home Depot)",
        "Shaw (Lowe's)",
        "Mohawk RevWood"
      ],
      luxury: [
        "Mohawk Hardwood",
        "Shaw Epic Plus",
        "Cali Bamboo",
        "Bruce Solid Hardwood",
        "Mirage Hardwood"
      ]
    },
    "interior-paint": {
      label: "Preferred Paint Line",
      budget: [
        "Behr Premium Plus (Home Depot)",
        "Glidden Essentials (Home Depot)",
        "Valspar 2000 (Lowe's)",
        "PPG Speedhide"
      ],
      standard: [
        "Sherwin-Williams SuperPaint",
        "Behr Ultra (Home Depot)",
        "HGTV Home by Sherwin-Williams (Lowe's)",
        "Benjamin Moore Regal Select"
      ],
      luxury: [
        "Benjamin Moore Aura",
        "Sherwin-Williams Emerald",
        "Fine Paints of Europe"
      ]
    },
    "kitchen": {
      label: "Preferred Cabinet / Kitchen Line",
      budget: [
        "IKEA SEKTION",
        "Stock / Builder Grade",
        "Hampton Bay (Home Depot)",
        "Project Source (Lowe's)",
        "RTA Cabinets (Online)"
      ],
      standard: [
        "Fabuwood",
        "Wolf Classic",
        "Thomasville (Home Depot)",
        "Diamond NOW (Lowe's)",
        "Forevermark Cabinetry"
      ],
      luxury: [
        "KraftMaid",
        "Custom Millwork",
        "Omega",
        "Starmark",
        "Plain & Fancy"
      ]
    },
    "bathroom": {
      label: "Preferred Bath Fixture / Line",
      budget: [
        "Standard / Builder Grade",
        "Glacier Bay (Home Depot)",
        "Project Source (Lowe's)",
        "Delta Classic"
      ],
      standard: [
        "Delta",
        "Kohler",
        "Moen",
        "American Standard"
      ],
      luxury: [
        "Hansgrohe",
        "DXV / Luxury Collections",
        "Brizo",
        "Graff"
      ]
    },
    "deck": {
      label: "Deck / Railing Brand Preference",
      budget: [
        "Standard Pressure-Treated Lumber",
        "Severe Weather (Lowe's)",
        "YellaWood",
        "Grip-Rite PT"
      ],
      standard: [
        "Trex Enhance",
        "Fiberon Good Life (Home Depot)",
        "TimberTech Edge",
        "Deckorators Vista"
      ],
      luxury: [
        "Trex Transcend",
        "TimberTech AZEK",
        "Fiberon Paramount",
        "Ipe / Exotic Hardwood"
      ]
    },
    "epoxy-garage": {
      label: "Epoxy System Level",
      budget: [
        "Standard Epoxy",
        "Rust-Oleum EpoxyShield (Home Depot)",
        "Quikrete Epoxy (Lowe's)"
      ],
      standard: [
        "Flake Epoxy System",
        "Polycuramine Kits",
        "Urethane Topcoat System"
      ],
      luxury: [
        "High-Build Polyaspartic System",
        "Professional 2-Part Polyurea",
        "Quartz Broadcast System"
      ]
    },
    "masonry": {
      label: "Preferred Masonry / Paver Brand",
      budget: [
        "Sakrete / Quikrete",
        "Generic Concrete Pavers",
        "Standard Brick"
      ],
      standard: [
        "Cambridge Pavingstones",
        "Techo-Bloc",
        "Nicolock"
      ],
      luxury: [
        "Bluestone",
        "Natural Granite / Limestone",
        "Custom Imported Stone"
      ]
    },
    "driveway": {
      label: "Preferred Driveway System",
      budget: [
        "Standard Concrete",
        "Asphalt (Basic)"
      ],
      standard: [
        "Stamped Concrete",
        "Paver Driveway (Cambridge, Nicolock)"
      ],
      luxury: [
        "Natural Stone Driveway",
        "Heated Driveway System"
      ]
    },
    "power-wash": {
      label: "Preferred Cleaning Level",
      budget: [
        "Standard Detergent",
        "Basic Wash Only"
      ],
      standard: [
        "Premium House Wash Mix",
        "Concrete / Paver Cleaner"
      ],
      luxury: [
        "Full Restoration Package",
        "Sealing + Soft-Wash"
      ]
    }
  };

  // Scenario bands: Basic / Premium / Luxury
  const SCENARIO_CONFIG = {
    basic:  { label: "Basic",   factor: 0.90, desc: "Tighter budget, more standard selections." },
    premium:{ label: "Premium", factor: 1.00, desc: "Balanced mix of quality and value." },
    luxury: { label: "Luxury",  factor: 1.25, desc: "Higher-end finishes and options." }
  };

    // ==========================
  // SCOPE OF WORK + UPSELLS CONFIG
  // ==========================
  const SOW_CONFIG = {
    "masonry": {
      title: "Scope of Work – Masonry · Pavers · Concrete",
      bullets: [
        "Review site, elevations, and water flow to confirm pitch and drainage.",
        "Excavate and dispose of existing material in work area as noted in scope.",
        "Install compacted aggregate base, bedding layer, and reinforcement (if required).",
        "Set pavers/stone/concrete to agreed pattern, joints, and border details.",
        "Tool joints, wash down surfaces, and leave work area broom-clean."
      ]
    },
    "driveway": {
      title: "Scope of Work – Driveway / Parking Area",
      bullets: [
        "Confirm layout, vehicle load, and drainage/curb transitions.",
        "Demo and cart away existing surface as included in this estimate.",
        "Install compacted base, forms/edge restraint, and reinforcement (if applicable).",
        "Place and finish concrete/asphalt/pavers to agreed thickness and pattern.",
        "Final cleanup of driveway and adjacent walkways."
      ]
    },
    "roofing": {
      title: "Scope of Work – Roofing",
      bullets: [
        "Protect landscaping, siding, and walkways around the home.",
        "Remove roofing layers as listed in the estimate and inspect deck.",
        "Install underlayment, flashings, and ventilation per manufacturer standards.",
        "Install selected shingle/roof system and accessories.",
        "Clean roof, gutters, and grounds of roofing debris and fasteners."
      ]
    },
    "siding": {
      title: "Scope of Work – Siding",
      bullets: [
        "Confirm wall areas, trim details, and any framing repair needs.",
        "Remove existing siding materials as specified.",
        "Install approved housewrap or weather-resistive barrier.",
        "Install new siding, trims, and accessories per manufacturer guidelines.",
        "Seal, caulk, and clean up siding work area."
      ]
    },
    "windows": {
      title: "Scope of Work – Windows & Exterior Doors",
      bullets: [
        "Verify window/door counts, swing, clearances, and safety egress where applicable.",
        "Protect interior/exterior finishes around work areas.",
        "Remove existing units, install new windows/doors plumb, level, and square.",
        "Insulate, flash, and seal per manufacturer guidelines.",
        "Install interior/exterior trim as applicable and clean glass/frames."
      ]
    },
    "exterior-paint": {
      title: "Scope of Work – Exterior Painting / Facade",
      bullets: [
        "Wash, scrape, and sand loose or failing paint in work areas.",
        "Spot prime bare or repaired substrates with appropriate primer.",
        "Apply specified number of finish coats to siding, trims, and details.",
        "Protect roofing, windows, doors, and landscaping during work.",
        "Remove masking, clean up, and provide basic touch-up kit on request."
      ]
    },
    "deck": {
      title: "Scope of Work – Deck / Patio Build or Rebuild",
      bullets: [
        "Confirm layout, elevation, stairs, and railing locations.",
        "Install footings and framing per code and approved layout.",
        "Install decking boards and rail system as specified.",
        "Install any trims, fascia, and stair details included in scope.",
        "Clean work area and remove construction debris."
      ]
    },
    "fence": {
      title: "Scope of Work – Fence Install / Replacement",
      bullets: [
        "Verify fence line, property markers, and gate locations with homeowner.",
        "Remove and dispose of existing fence materials as included in scope.",
        "Install posts in concrete or per fence system guidelines.",
        "Install rails, panels, and gates with hardware and latches.",
        "Clean up site and remove excess materials."
      ]
    },
    "waterproofing": {
      title: "Scope of Work – Waterproofing & Foundation Sealing",
      bullets: [
        "Inspect interior/exterior conditions and identify water entry paths.",
        "Prepare walls/areas and perform crack repair or joint treatment as specified.",
        "Install sealers, membranes, or drainage components included in scope.",
        "Coordinate with sump/drainage components if part of project.",
        "Clean work area; moisture performance may depend on site conditions."
      ]
    },
    "power-wash": {
      title: "Scope of Work – Power / Soft Washing",
      bullets: [
        "Pre-rinse surfaces and wet sensitive landscaping as needed.",
        "Apply appropriate cleaning solution to siding, masonry, or flatwork.",
        "Rinse with controlled pressure/soft-wash techniques per surface type.",
        "Spot-treat stubborn areas within reason.",
        "Rinse walkways and leave area tidy."
      ]
    },
    "landscaping": {
      title: "Scope of Work – Landscaping & Seasonal Care",
      bullets: [
        "Perform mowing, trimming, and edging in included areas.",
        "Remove basic leaves/debris as specified for the visit/season.",
        "Maintain beds (weeding/pruning) per agreed scope.",
        "Bag or cart away yard waste as noted.",
        "Blow off walkways and hard surfaces."
      ]
    },
    "exterior-lighting": {
      title: "Scope of Work – Exterior Lighting & Smart Security",
      bullets: [
        "Confirm fixture locations, light levels, and control methods.",
        "Mount fixtures and run wiring per code and product guidelines.",
        "Install transformers, timers, or smart controls as specified.",
        "Aim and adjust fixtures for safety and appearance.",
        "Test system operation and review basic use with homeowner."
      ]
    },
    "sidewalk": {
      title: "Scope of Work – Sidewalk / DOT Concrete",
      bullets: [
        "Sawcut and remove existing sidewalk panels as included.",
        "Prepare subgrade and install compacted base to required thickness.",
        "Set forms and pour concrete to required thickness and scoring pattern.",
        "Finish, edge, and broom per NYC / local standards.",
        "Strip forms, backfill edges, and clean site."
      ]
    },
    "gutters": {
      title: "Scope of Work – Gutter Install / Repair",
      bullets: [
        "Inspect gutter runs, downspout locations, and drainage path.",
        "Remove existing gutters/guards where included.",
        "Install new gutters, hangers, and downspouts per layout.",
        "Seal joints and test basic flow.",
        "Clean up and remove gutter debris/materials."
      ]
    },
    "interior-paint": {
      title: "Scope of Work – Interior Painting",
      bullets: [
        "Protect floors, furniture, and adjacent finishes in work areas.",
        "Patch minor nail holes and small surface imperfections.",
        "Spot prime repairs and apply specified finish coats to walls/ceilings/trims.",
        "Remove masking and reinstall basic cover plates as applicable.",
        "Clean work areas and leave space swept/vacuumed."
      ]
    },
    "flooring": {
      title: "Scope of Work – Flooring (LVP / Tile / Hardwood)",
      bullets: [
        "Verify subfloor condition and transitions to adjacent rooms.",
        "Remove existing flooring as listed in estimate.",
        "Prepare subfloor (leveling/basic repair) within included scope.",
        "Install new flooring, trims, and transitions as specified.",
        "Clean surface and remove packaging/debris."
      ]
    },
    "drywall": {
      title: "Scope of Work – Drywall / Plaster / Skim Coat",
      bullets: [
        "Protect floors and nearby finishes from dust.",
        "Hang/repair board or lath/plaster surfaces as scoped.",
        "Tape, mud, and sand to an agreed finish level.",
        "Spot prime repaired areas once dry.",
        "Collect demolition dust/debris and remove from site as included."
      ]
    },
    "interior-doors": {
      title: "Scope of Work – Interior Doors & Trim",
      bullets: [
        "Confirm door sizes, swings, and hardware preferences.",
        "Remove existing doors/trim as included.",
        "Install new slabs/frames, adjust for smooth operation.",
        "Install casing, base, and other trim items in scope.",
        "Patch nail holes and leave ready for paint or touch-up."
      ]
    },
    "closets": {
      title: "Scope of Work – Closet / Storage Buildouts",
      bullets: [
        "Confirm shelving layout, hanging sections, and specialty features.",
        "Install rails, panels, rods, and shelving per system design.",
        "Secure fasteners into suitable framing or anchors.",
        "Adjust doors/fronts if part of scope.",
        "Clean up and remove packaging."
      ]
    },
    "interior-lighting": {
      title: "Scope of Work – Interior Lighting / Smart Lighting",
      bullets: [
        "Confirm fixture locations, switching, and dimming needs.",
        "Cut openings and run wiring per code where included.",
        "Install fixtures, trims, and controls/smart switches.",
        "Test operation and basic programming if smart devices.",
        "Patch small access holes as scoped (if applicable)."
      ]
    },
    "bathroom": {
      title: "Scope of Work – Bathroom Remodel",
      bullets: [
        "Protect adjacent rooms and paths to work area.",
        "Demo fixtures, finishes, and walls/floors as included in scope.",
        "Rough-in plumbing, electrical, and ventilation per plan.",
        "Install tile, fixtures, vanity, and accessories per selections.",
        "Grout, caulk, and clean up bathroom ready for final painting/finishes."
      ]
    },
    "kitchen": {
      title: "Scope of Work – Kitchen Remodel",
      bullets: [
        "Protect floors/adjacent rooms and set up dust control where practical.",
        "Demo cabinets, tops, appliances, and finishes as listed.",
        "Rough-in plumbing, electrical, and ventilation to support new layout.",
        "Install cabinets, countertops, backsplash, and fixtures per selections.",
        "Coordinate appliance set-in (by others or by us if included) and clean up."
      ]
    },
    "basement": {
      title: "Scope of Work – Basement Finishing",
      bullets: [
        "Review layout, clearances, and egress requirements.",
        "Frame walls/ceilings and rough-in MEP as scoped.",
        "Insulate, drywall, and finish surfaces to agreed level.",
        "Install flooring, trims, and doors included in scope.",
        "Clean up work areas; final paint or extras per estimate."
      ]
    },
    "garage-conversion": {
      title: "Scope of Work – Garage Conversion / Remodel",
      bullets: [
        "Confirm layout, insulation, and egress requirements.",
        "Demo existing finishes as necessary for conversion.",
        "Frame, insulate, and rough-in electrical/MEP per design.",
        "Install wall/ceiling finishes, flooring, and trims as scoped.",
        "Clean up and leave space ready for final furnishings."
      ]
    },
    "epoxy-garage": {
      title: "Scope of Work – Epoxy Garage Floor",
      bullets: [
        "Inspect concrete and perform basic crack/spall repair as included.",
        "Mechanically prep floor (grinding/etching) for coating bond.",
        "Apply primer, epoxy/flake build, and topcoat per system.",
        "Allow proper cure time and re-open for light use as directed.",
        "Clean up and remove dust and masking."
      ]
    },
    "smart-home": {
      title: "Scope of Work – Smart Home Upgrades",
      bullets: [
        "Confirm device locations, Wi-Fi coverage, and app ecosystem.",
        "Install doorbells, cameras, locks, and hubs per plan.",
        "Run low-voltage wiring where included and allowed.",
        "Pair devices to app and perform basic testing.",
        "Provide simple overview of controls (not full IT support)."
      ]
    },
    "handyman": {
      title: "Scope of Work – Small Repairs / Handyman Visit",
      bullets: [
        "Complete punch-list items agreed for the visit window.",
        "Provide basic materials (anchors, screws, caulk) within reason.",
        "Advise if any items require a larger project or separate estimate.",
        "Clean up work areas at end of visit.",
        "Time and materials are limited to booked duration."
      ]
    },
    "soundproofing": {
      title: "Scope of Work – Soundproofing",
      bullets: [
        "Identify primary noise paths and target walls/ceilings.",
        "Install sound-rated assemblies (insulation, channels, board) as scoped.",
        "Seal perimeter gaps and penetrations with acoustical sealant.",
        "Finish surfaces to a paint-ready or specified level.",
        "Clean up and remove construction debris."
      ]
    },
    "moisture-control": {
      title: "Scope of Work – Mold / Moisture Prevention (Non-Remediation)",
      bullets: [
        "Identify moisture sources and targeted treatment areas.",
        "Apply sealers, coatings, or ventilation strategies as included.",
        "Address small non-structural cracks or joints within scope.",
        "Recommend further remediation/engineering if issues exceed scope.",
        "Clean work areas after treatments."
      ]
    }
  };

  const UPSELL_CONFIG = {
    "masonry": {
      title: "Popular Upgrades for Masonry Projects",
      bullets: [
        "Upgrade to premium paver or natural stone lines for a richer look.",
        "Add contrasting borders, inlays, or step lighting for curb appeal.",
        "Include sealer and joint sand stabilization for longer life."
      ]
    },
    "driveway": {
      title: "Popular Upgrades for Driveways",
      bullets: [
        "Add decorative border or apron at street/front entry.",
        "Upgrade to stamped or exposed aggregate concrete.",
        "Include drainage channels or trench drains where needed."
      ]
    },
    "roofing": {
      title: "Popular Roofing Upgrades",
      bullets: [
        "Upgrade to higher-end architectural/composite shingles.",
        "Add ice/water shield in additional areas for extra protection.",
        "Improve ventilation with ridge vents or attic fans."
      ]
    },
    "siding": {
      title: "Popular Siding Upgrades",
      bullets: [
        "Upgrade to fiber cement or premium vinyl profiles.",
        "Add decorative trims, crown details, or accent shakes.",
        "Include additional insulation or housewrap upgrades."
      ]
    },
    "windows": {
      title: "Popular Window & Door Upgrades",
      bullets: [
        "Upgrade to higher-efficiency glass or premium lines (Andersen, Marvin, etc.).",
        "Add interior casing/trim packages for a finished look.",
        "Include exterior aluminum capping or color upgrades."
      ]
    },
    "exterior-paint": {
      title: "Popular Exterior Paint Upgrades",
      bullets: [
        "Upgrade to premium or specialty coatings for longer life.",
        "Add accent colors to doors, shutters, and trims.",
        "Include additional prep on heavily weathered areas."
      ]
    },
    "deck": {
      title: "Popular Deck Upgrades",
      bullets: [
        "Upgrade to composite or PVC decking and rail systems.",
        "Add lighting to steps, posts, or rails.",
        "Include privacy screens, benches, or planters."
      ]
    },
    "fence": {
      title: "Popular Fence Upgrades",
      bullets: [
        "Upgrade to decorative panels or custom gate designs.",
        "Add privacy or lattice toppers.",
        "Include sealing or stain on wood fences."
      ]
    },
    "waterproofing": {
      title: "Popular Waterproofing Upgrades",
      bullets: [
        "Add interior drains or sump pump system where appropriate.",
        "Upgrade to longer-warranty membranes or coatings.",
        "Include monitoring or alarm devices for water events."
      ]
    },
    "power-wash": {
      title: "Popular Power Wash Upgrades",
      bullets: [
        "Add surface sealing for concrete, pavers, or stone.",
        "Include gutter whitening or rust-stain treatments.",
        "Bundle driveway, walkways, and patio in one visit."
      ]
    },
    "landscaping": {
      title: "Popular Landscaping Upgrades",
      bullets: [
        "Add seasonal color plantings and mulch refresh.",
        "Include simple lighting around paths and beds.",
        "Upgrade to a recurring maintenance package."
      ]
    },
    "exterior-lighting": {
      title: "Popular Exterior Lighting Upgrades",
      bullets: [
        "Upgrade fixtures to architectural or smart lines.",
        "Add path, step, and accent lighting for layered effect.",
        "Integrate security cameras or smart doorbells."
      ]
    },
    "sidewalk": {
      title: "Popular Sidewalk Upgrades",
      bullets: [
        "Add decorative broom or stamp patterns (where allowed).",
        "Include transition repairs to stoops or drive entries.",
        "Add sealer to help with stain resistance."
      ]
    },
    "gutters": {
      title: "Popular Gutter Upgrades",
      bullets: [
        "Add gutter guards to reduce clogging and maintenance.",
        "Upgrade downspouts and outlets for better flow.",
        "Tie downspouts into extensions or drainage solutions."
      ]
    },
    "interior-paint": {
      title: "Popular Interior Paint Upgrades",
      bullets: [
        "Upgrade to premium or washable paints for high-use areas.",
        "Add accent walls, ceilings, or trim colors.",
        "Include painting of doors, trims, and built-ins."
      ]
    },
    "flooring": {
      title: "Popular Flooring Upgrades",
      bullets: [
        "Upgrade to wider planks or higher-end finishes.",
        "Add sound underlayment where helpful (multi-family/condos).",
        "Include stair treads, nosings, and railing touch-ups."
      ]
    },
    "drywall": {
      title: "Popular Drywall/Finishing Upgrades",
      bullets: [
        "Upgrade to a higher smoothness level where feasible.",
        "Add decorative trims, beams, or panel details.",
        "Include full-room repainting after skim coat."
      ]
    },
    "interior-doors": {
      title: "Popular Door & Trim Upgrades",
      bullets: [
        "Upgrade to solid-core or specialty doors.",
        "Add higher profile casings/baseboards.",
        "Include upgraded hardware (hinges, levers, handles)."
      ]
    },
    "closets": {
      title: "Popular Closet Upgrades",
      bullets: [
        "Upgrade to custom built-ins or drawers.",
        "Add lighting and mirrors inside closet.",
        "Include premium finishes or glass doors."
      ]
    },
    "interior-lighting": {
      title: "Popular Interior Lighting Upgrades",
      bullets: [
        "Add dimmers or smart switches for scenes.",
        "Upgrade to higher-end fixtures or trims.",
        "Include under-cabinet or cove lighting where applicable."
      ]
    },
    "bathroom": {
      title: "Popular Bathroom Upgrades",
      bullets: [
        "Upgrade to frameless glass, niche shelving, and linear drains.",
        "Add heated floors or towel warmers.",
        "Include higher-end fixtures and vanity packages."
      ]
    },
    "kitchen": {
      title: "Popular Kitchen Upgrades",
      bullets: [
        "Upgrade to custom cabinets, pull-outs, and organizers.",
        "Add under-cabinet lighting and integrated outlets.",
        "Include higher-end counters, backsplashes, and hardware."
      ]
    },
    "basement": {
      title: "Popular Basement Upgrades",
      bullets: [
        "Add media wall, bar area, or built-ins.",
        "Upgrade to sound-rated assemblies for theater spaces.",
        "Include upgraded flooring and lighting packages."
      ]
    },
    "garage-conversion": {
      title: "Popular Garage Conversion Upgrades",
      bullets: [
        "Add mini-split heating/cooling system.",
        "Include built-in storage or office cabinetry.",
        "Upgrade doors, windows, and trim packages."
      ]
    },
    "epoxy-garage": {
      title: "Popular Garage Floor Upgrades",
      bullets: [
        "Upgrade to polyaspartic or quartz systems.",
        "Add more decorative flake or metallic finishes.",
        "Include stem wall or cove base coating."
      ]
    },
    "smart-home": {
      title: "Popular Smart Home Upgrades",
      bullets: [
        "Expand to whole-home smart lighting.",
        "Add extra cameras or sensors at key locations.",
        "Integrate with voice/control systems where available."
      ]
    },
    "handyman": {
      title: "Popular Small Job Add-Ons",
      bullets: [
        "Bundle multiple small repairs into one visit.",
        "Add minor caulking and touch-up painting.",
        "Install small accessories (shelves, hooks, rods) while on site."
      ]
    },
    "soundproofing": {
      title: "Popular Soundproofing Upgrades",
      bullets: [
        "Add additional mass layers or specialty boards.",
        "Include upgraded doors and seals at openings.",
        "Combine with smart-home white noise solutions."
      ]
    },
    "moisture-control": {
      title: "Popular Moisture Prevention Upgrades",
      bullets: [
        "Add dehumidification or basic ventilation solutions.",
        "Upgrade to extended-warranty sealers or coatings.",
        "Combine with waterproofing/drainage improvements where needed."
      ]
    }
  };

  // ==========================
  // HELPERS
  // ==========================
  function formatMoney(num){
    return "$" + Math.round(num).toLocaleString("en-US");
  }

  function formatMonthly(num){
    if (!num || num <= 0) return "$0/mo";
    return "$" + Math.round(num).toLocaleString("en-US") + "/mo";
  }

  function rebuildScopeOptions(cfg){
    scopeSelect.innerHTML = '<option value="">Select scope…</option>';
    if (!cfg.scopes) return;
    Object.entries(cfg.scopes).forEach(([value, sc]) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = sc.label;
      scopeSelect.appendChild(opt);
    });
  }

  function resetAdvanced(){
    if (advMasonry) advMasonry.style.display = "none";
    if (advRoof)    advRoof.style.display    = "none";
    if (advSiding)  advSiding.style.display  = "none";
    if (advWindows) advWindows.style.display = "none";
    if (advStyle)   advStyle.style.display   = "none";
  }

  function updateRegionNote(){
    if (!regionNoteEl) return;
    regionNoteEl.style.display = (boroughEl.value === "outside") ? "block" : "none";
  }

  function updatePermitHelper(svc){
    if (!permitBox) return;
    const cfg = SERVICE_CONFIG[svc];
    if (!cfg){
      permitBox.style.display = "none";
      permitBox.innerHTML = "";
      return;
    }
    let msg = "";
    if (cfg.permit === "likely"){
      msg = "<strong>Permit likely required:</strong> This type of project often needs DOB / municipal filings. We confirm permits in your written estimate.";
    } else if (cfg.permit === "maybe"){
      msg = "<strong>Permit may be required:</strong> Some versions of this project need permits depending on scope, structural changes, and local rules.";
    } else {
      msg = "<strong>Most jobs do NOT require a permit:</strong> Simple versions of this project are usually cosmetic only. We’ll confirm during your walkthrough.";
    }
    permitBox.innerHTML = msg;
    permitBox.style.display = "block";
  }

  // SMART ADD-ONS: render dynamic panel based on selected service
  function renderAddonPanel(svc){
    if (!addonsPanel) return;

    const cfg = ADDON_CONFIG[svc];
    addonsPanel.innerHTML = "";
    extraAddonsValue = 0;

    if (!cfg){
      addonsPanel.style.display = "none";
      return;
    }

    addonsPanel.style.display = "";
    let html = `
      <h4 class="addons-title">${cfg.title}</h4>
      <p class="addons-subnote">${cfg.subnote}</p>
      <div class="addons-list">
    `;

    cfg.items.forEach(item => {
      html += `
        <label class="addon-item">
          <input
            type="checkbox"
            class="addon-checkbox"
            data-addon-id="${item.id}"
            data-addon-low="${item.low}"
            data-addon-high="${item.high}"
          >
          <span class="addon-label">${item.label}</span>
          <span class="addon-price">+ ${formatMoney(item.low)} – ${formatMoney(item.high)}</span>
        </label>
      `;
    });

    html += `
      </div>
      <p class="addons-total-row">
        Selected add-ons approx:
        <span id="est-addons-total-val">$0</span>
      </p>
    `;

    addonsPanel.innerHTML = html;

    const checkboxes = addonsPanel.querySelectorAll(".addon-checkbox");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        let total = 0;
        const boxes = addonsPanel.querySelectorAll(".addon-checkbox");
        boxes.forEach(box => {
          if (box.checked){
            const low  = Number(box.dataset.addonLow)  || 0;
            const high = Number(box.dataset.addonHigh) || 0;
            const avg  = (low + high) / 2;
            total += avg;
          }
        });
        extraAddonsValue = total;
        const totalSpan = addonsPanel.querySelector("#est-addons-total-val");
        if (totalSpan){
          totalSpan.textContent = formatMoney(extraAddonsValue);
        }
      });
    });
  }

  // Collect selected smart add-ons (for PDF/email if needed)
  function getSelectedSmartAddons(){
    if (!addonsPanel) return [];
    const boxes = addonsPanel.querySelectorAll(".addon-checkbox");
    const selected = [];
    boxes.forEach(box => {
      if (box.checked){
        const wrapper = box.closest(".addon-item");
        const labelEl = wrapper ? wrapper.querySelector(".addon-label") : null;
        selected.push({
          label: labelEl ? labelEl.textContent : (box.dataset.addonId || "Add-On"),
          low: Number(box.dataset.addonLow) || 0,
          high: Number(box.dataset.addonHigh) || 0,
          avg: ((Number(box.dataset.addonLow) || 0) + (Number(box.dataset.addonHigh) || 0)) / 2
        });
      }
    });
    return selected;
  }

  // 🔧 FIXED: safely show/hide area vs scope UI + advanced blocks
  function updateVisibility(){
    const svc = serviceEl.value;
    const cfg = SERVICE_CONFIG[svc];
    if (!cfg) return;

    // Area vs scope rows
    if (cfg.mode === "area"){
      sizeRow.style.display  = "";
      scopeRow.style.display = "none";  // ✅ FIXED: added closing quote + semicolon
      sizeLabel.textContent  = cfg.label || "Approx. size";
    } else {
      sizeRow.style.display  = "none";
      scopeRow.style.display = "";
      rebuildScopeOptions(cfg);
    }

    // Lead row visibility for lead-sensitive services
    if (cfg.leadSensitive && leadRow){
      leadRow.style.display = "";
    } else if (leadRow) {
      leadRow.style.display = "none";
      if (leadEl) leadEl.checked = false;
    }

    // Advanced section toggles (basic – just some common cases)
    resetAdvanced();
    if (svc === "masonry" || svc === "driveway" || svc === "sidewalk"){
      if (advMasonry) advMasonry.style.display = "";
    }
    if (svc === "roofing"){
      if (advRoof) advRoof.style.display = "";
    }
    if (svc === "siding" || svc === "exterior-paint"){
      if (advSiding) advSiding.style.display = "";
    }
    if (svc === "windows" || svc === "doors"){
      if (advWindows) advWindows.style.display = "";
    }
    if (advStyle && (svc === "kitchen" || svc === "bathroom" || svc === "basement")){
      advStyle.style.display = "";
    }

    // Permit helper + brand row + smart add-ons
    updatePermitHelper(svc);
    updateBrandRow(svc);
    renderAddonPanel(svc);
  }

  function updateBrandRow(svc){
    if (!brandRow) return;
    const cfg = BRAND_CONFIG[svc];
    if (!cfg){
      brandRow.style.display = "none";
      brandLabel.textContent = "Preferred Brand (optional)";
      brandSelect.innerHTML = '<option value="">No preference</option>';
      return;
    }

    brandRow.style.display = "";
    brandLabel.textContent = cfg.label || "Preferred Brand";

    const finish = finishEl.value || "standard";
    const tierList =
      finish === "luxury" ? cfg.luxury :
      finish === "premium" ? cfg.standard :
      cfg.budget || cfg.standard || [];

    let html = '<option value="">No preference</option>';
    tierList.forEach(b => {
      html += `<option value="${b}">${b}</option>`;
    });
    brandSelect.innerHTML = html;
  }

  function complexityScore(svc){
    // simple placeholder – could be expanded using advanced inputs
    const cfg = SERVICE_CONFIG[svc];
    if (!cfg) return 3;

    if (cfg.mode === "area"){
      const val = parseFloat(sizeInput.value || "0");
      if (!val) return 3;
      const ratio = (val - cfg.minArea) / (cfg.maxArea - cfg.minArea || 1);
      // 1–5
      return Math.max(1, Math.min(5, Math.round(1 + ratio * 4)));
    } else {
      // scope-based, treat mid/premium as more complex
      const scopeVal = scopeSelect.value;
      if (!scopeVal) return 3;
      if (scopeVal === "basic" || scopeVal === "simple" || scopeVal === "yard") return 2;
      if (scopeVal === "premium" || scopeVal === "gut" || scopeVal === "enhanced") return 5;
      return 3;
    }
  }

  function computeBaseRange(svc){
    const cfg = SERVICE_CONFIG[svc];
    if (!cfg) return null;

    let baseLow, baseHigh;

    if (cfg.mode === "area"){
      const raw = parseFloat(sizeInput.value || "0");
      if (!raw || raw <= 0) return null;

      const area = Math.max(cfg.minArea, Math.min(cfg.maxArea, raw));
      baseLow  = Math.max(cfg.minLow,  cfg.perSqLow  * area);
      baseHigh = Math.max(cfg.minHigh, cfg.perSqHigh * area);
    } else {
      const scopeVal = scopeSelect.value;
      if (!scopeVal || !cfg.scopes || !cfg.scopes[scopeVal]) return null;
      baseLow  = cfg.scopes[scopeVal].low;
      baseHigh = cfg.scopes[scopeVal].high;
    }

    // Regional & building multipliers
    const boroFactor     = BOROUGH_FACTOR[boroughEl.value || "staten-island"] || 1;
    const buildingFactor = BUILDING_FACTOR[buildingEl.value || "house"] || 1;
    const finishFactor   = FINISH_FACTOR[finishEl.value || "standard"] || 1;
    const urgencyFactor  = URGENCY_FACTOR[urgencyEl.value || "flex"] || 1;

    let low  = baseLow  * boroFactor * buildingFactor * finishFactor * urgencyFactor;
    let high = baseHigh * boroFactor * buildingFactor * finishFactor * urgencyFactor;

    // Simple bumps for demo / dumpster / permit / lead
    if (demoEl && demoEl.checked){
      low  *= 1.05;
      high *= 1.08;
    }
    if (dumpsterEl && dumpsterEl.checked){
      low  += 650;
      high += 1400;
    }
    if (permitEl && permitEl.checked){
      low  *= 1.03;
      high *= 1.06;
    }
    if (leadEl && leadEl.checked && cfg.leadSensitive){
      low  *= 1.06;
      high *= 1.12;
    }

    // Smart add-ons
    low  += extraAddonsValue * 0.9;
    high += extraAddonsValue * 1.1;

    return { low, high };
  }
  function buildResultHTML(svc, range){
    if (!range) {
      return `
        <div class="est-result-inner est-result-empty">
          <p>Please enter size or scope so we can show a ballpark range.</p>
        </div>
      `;
    }

    const svcLabel   = SERVICE_LABEL[svc] || "Project";
    const finishKey  = finishEl.value || "standard";
    const urgencyKey = urgencyEl.value || "flex";

    const comp       = complexityScore(svc);
    const avg        = (range.low + range.high) / 2;
    const basicBand  = avg * SCENARIO_CONFIG.basic.factor;
    const premiumBand= avg * SCENARIO_CONFIG.premium.factor;
    const luxuryBand = avg * SCENARIO_CONFIG.luxury.factor;

    const monthly12  = avg / 12;
    const monthly24  = avg / 24;

    const sow    = SOW_CONFIG[svc];
    const upsell = UPSELL_CONFIG[svc];
    const addons = getSelectedSmartAddons();

    return `
      <div class="est-result-inner">
        <div class="est-headline-row">
          <h3>${svcLabel}</h3>
          <p class="est-subline">
            Finish: <strong>${FINISH_LABEL[finishKey] || "Standard"}</strong> ·
            Timing: <strong>${URGENCY_LABEL[urgencyKey] || "Flexible"}</strong>
          </p>
        </div>

        <div class="est-main-range">
          <p class="est-range-label">Ballpark project range (NYC-adjusted):</p>
          <p class="est-range-values">
            <span class="est-range-low">${formatMoney(range.low)}</span>
            <span class="est-range-dash"> – </span>
            <span class="est-range-high">${formatMoney(range.high)}</span>
          </p>
          <p class="est-range-note">Not a quote. Final price depends on walkthrough, selections, and access.</p>
        </div>

        <div class="est-bands-grid">
          <div class="est-band-card">
            <h4>${SCENARIO_CONFIG.basic.label}</h4>
            <p class="est-band-range">${formatMoney(basicBand * 0.9)} – ${formatMoney(basicBand * 1.1)}</p>
            <p class="est-band-desc">${SCENARIO_CONFIG.basic.desc}</p>
          </div>
          <div class="est-band-card est-band-card--primary">
            <h4>${SCENARIO_CONFIG.premium.label}</h4>
            <p class="est-band-range">${formatMoney(premiumBand * 0.95)} – ${formatMoney(premiumBand * 1.05)}</p>
            <p class="est-band-desc">${SCENARIO_CONFIG.premium.desc}</p>
          </div>
          <div class="est-band-card">
            <h4>${SCENARIO_CONFIG.luxury.label}</h4>
            <p class="est-band-range">${formatMoney(luxuryBand * 0.95)} – ${formatMoney(luxuryBand * 1.05)}</p>
            <p class="est-band-desc">${SCENARIO_CONFIG.luxury.desc}</p>
          </div>
        </div>

        <div class="est-monthly-row">
          <p>Rough idea if spread over time (subject to your lender/financing):</p>
          <p class="est-monthly-values">
            <span>~ ${formatMonthly(monthly12)} for ~12 months</span>
            <span>·</span>
            <span>~ ${formatMonthly(monthly24)} for ~24 months</span>
          </p>
        </div>

        <div class="est-meta-row">
          <div class="est-meta-item">
            <span class="est-meta-label">Complexity score</span>
            <span class="est-meta-value">${comp}/5</span>
          </div>
          <div class="est-meta-item">
            <span class="est-meta-label">Includes NYC / borough factor</span>
            <span class="est-meta-value">${boroughEl.options[boroughEl.selectedIndex]?.text || "N/A"}</span>
          </div>
        </div>

        ${sow ? `
        <div class="est-section">
          <h4>${sow.title}</h4>
          <ul class="est-bullets">
            ${sow.bullets.map(b => `<li>${b}</li>`).join("")}
          </ul>
        </div>
        ` : ""}

        ${upsell ? `
        <div class="est-section">
          <h4>${upsell.title}</h4>
          <ul class="est-bullets">
            ${upsell.bullets.map(b => `<li>${b}</li>`).join("")}
          </ul>
        </div>
        ` : ""}

        ${addons.length ? `
        <div class="est-section">
          <h4>Selected Smart Add-Ons</h4>
          <ul class="est-bullets">
            ${addons.map(a => `<li>${a.label} (${formatMoney(a.low)} – ${formatMoney(a.high)})</li>`).join("")}
          </ul>
        </div>
        ` : ""}

        <div class="est-section est-disclaimer">
          <p>
            This is a <strong>ballpark estimator only</strong>, not an offer or contract.
            A written estimate with exact scope, permit details, and payment schedule will follow
            after a walkthrough and design discussion with Hammer Brick & Home LLC.
          </p>
        </div>
      </div>
    `;
  }

  function runEstimate(){
    const svc = serviceEl.value;
    if (!svc){
      resultBox.innerHTML = `
        <div class="est-result-inner est-result-empty">
          <p>Select a service to see a ballpark range.</p>
        </div>
      `;
      return;
    }

    const range = computeBaseRange(svc);
    const html  = buildResultHTML(svc, range);
    resultBox.innerHTML = html;
  }

  // ==========================
  // EVENT WIRING
  // ==========================
  serviceEl.addEventListener("change", () => {
    updateVisibility();
    runEstimate();
  });

  boroughEl.addEventListener("change", () => {
    updateRegionNote();
    runEstimate();
  });

  buildingEl.addEventListener("change", runEstimate);
  finishEl.addEventListener("change", () => {
    updateBrandRow(serviceEl.value);
    runEstimate();
  });
  urgencyEl.addEventListener("change", runEstimate);
  if (leadEl)      leadEl.addEventListener("change", runEstimate);
  if (dumpsterEl)  dumpsterEl.addEventListener("change", runEstimate);
  if (demoEl)      demoEl.addEventListener("change", runEstimate);
  if (permitEl)    permitEl.addEventListener("change", runEstimate);
  if (sizeInput)   sizeInput.addEventListener("input", runEstimate);
  if (scopeSelect) scopeSelect.addEventListener("change", runEstimate);

  // Any advanced controls should trigger recompute as well:
  [masonryFocusEl, driveExistingEl, driveRemoveEl, driveAccessEl,
   roofTearoffEl, roofPitchEl, roofHeightEl,
   sidingRemoveEl, sidingStoriesEl,
   windowCountEl, doorCountEl,
   designStyleEl].forEach(el => {
    if (el) el.addEventListener("change", runEstimate);
  });

  // Prevent real submit – just compute and scroll to result
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runEstimate();
    if (resultBox && resultBox.scrollIntoView){
      resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Initial state
  updateRegionNote();
  if (serviceEl.value){
    updateVisibility();
    runEstimate();
  }

}); // end DOMContentLoaded

// ==========================
// STYLE INJECTION
// ==========================
function injectEstimatorExtraStyles(){
  if (document.getElementById("hb-estimator-extra-styles")) return;
  const style = document.createElement("style");
  style.id = "hb-estimator-extra-styles";
  style.textContent = `
    .est-result-inner{
      border-radius:18px;
      border:1px solid rgba(255,255,255,.08);
      padding:18px 20px;
      background:rgba(3,10,22,.9);
      box-shadow:0 18px 40px rgba(0,0,0,.6);
      color:#fff;
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,system-ui,sans-serif;
    }
    .est-result-empty{opacity:.9;font-size:.95rem;}
    .est-headline-row h3{margin:0;font-size:1.25rem;}
    .est-subline{margin:.2rem 0 0;font-size:.85rem;opacity:.85;}
    .est-main-range{margin-top:1rem;}
    .est-range-label{font-size:.9rem;opacity:.85;margin-bottom:.15rem;}
    .est-range-values{font-size:1.4rem;font-weight:600;}
    .est-range-low,.est-range-high{letter-spacing:.02em;}
    .est-range-dash{opacity:.7;margin:0 .15rem;}
    .est-range-note{font-size:.78rem;opacity:.7;margin-top:.25rem;}
    .est-bands-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
      gap:10px;
      margin-top:1rem;
    }
    .est-band-card{
      border-radius:14px;
      border:1px solid rgba(255,255,255,.08);
      padding:10px 12px;
      font-size:.8rem;
      background:linear-gradient(145deg,rgba(11,23,45,.95),rgba(4,10,20,.98));
    }
    .est-band-card--primary{
      border-color:rgba(231,191,99,.7);
      box-shadow:0 0 18px rgba(231,191,99,.25);
    }
    .est-band-card h4{
      margin:0 0 .3rem;
      font-size:.9rem;
    }
    .est-band-range{margin:0 0 .15rem;font-weight:600;}
    .est-band-desc{margin:0;opacity:.82;}
    .est-monthly-row{
      margin-top:1rem;
      padding:.6rem .75rem;
      border-radius:12px;
      background:rgba(10,22,45,.85);
      font-size:.8rem;
    }
    .est-monthly-row p{margin:0;}
    .est-monthly-values{
      margin-top:.2rem;
      display:flex;
      flex-wrap:wrap;
      gap:.4rem;
      font-weight:500;
    }
    .est-meta-row{
      margin-top:.8rem;
      display:flex;
      flex-wrap:wrap;
      gap:.75rem;
      font-size:.78rem;
      opacity:.85;
    }
    .est-meta-item{
      display:flex;
      gap:.25rem;
    }
    .est-meta-label{opacity:.75;}
    .est-section{
      margin-top:1rem;
      padding-top:.75rem;
      border-top:1px dashed rgba(255,255,255,.12);
      font-size:.8rem;
    }
    .est-section h4{
      margin:0 0 .35rem;
      font-size:.86rem;
    }
    .est-bullets{
      margin:0;
      padding-left:1.15rem;
    }
    .est-bullets li{margin-bottom:.15rem;}
    .est-disclaimer p{
      margin:0;
      font-size:.75rem;
      opacity:.75;
    }

    /* Smart Add-ons Panel */
    #est-addons-panel{
      margin-top:1rem;
      padding:.75rem .9rem;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.12);
      background:rgba(5,14,30,.9);
      font-size:.8rem;
      color:#fff;
    }
    #est-addons-panel .addons-title{
      margin:0 0 .25rem;
      font-size:.9rem;
    }
    #est-addons-panel .addons-subnote{
      margin:0 0 .4rem;
      font-size:.75rem;
      opacity:.8;
    }
    #est-addons-panel .addons-list{
      display:flex;
      flex-direction:column;
      gap:.3rem;
      margin-bottom:.4rem;
    }
    #est-addons-panel .addon-item{
      display:flex;
      align-items:center;
      gap:.4rem;
    }
    #est-addons-panel .addon-checkbox{margin:0;}
    #est-addons-panel .addon-label{flex:1;}
    #est-addons-panel .addon-price{
      font-weight:500;
      font-size:.8rem;
      opacity:.9;
    }
    #est-addons-panel .addons-total-row{
      margin:0;
      font-size:.78rem;
      display:flex;
      justify-content:space-between;
      gap:.4rem;
    }
    #est-addons-panel #est-addons-total-val{
      font-weight:600;
    }
  `;
  document.head.appendChild(style);
}



