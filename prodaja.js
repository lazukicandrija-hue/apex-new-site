/* =============================================
   PRODAJA PAGE - CRM LOADING + FILTERING
   ============================================= */

(function() {
  'use strict';

  const CRM_API = 'https://crm.apexrealestate.rs/api/sync/properties';
  const grid = document.getElementById('prodajaGrid');
  const spinner = document.getElementById('loadingSpinner');
  const noResults = document.getElementById('noResults');
  const resultsCount = document.getElementById('resultsCount');

  // Filter elements
  const fLokacija = document.getElementById('filterLokacija');
  const fTip = document.getElementById('filterTip');
  const fCenaOd = document.getElementById('filterCenaOd');
  const fCenaDo = document.getElementById('filterCenaDo');
  const fPovrsinaOd = document.getElementById('filterPovrsinaOd');
  const fPovrsinaDo = document.getElementById('filterPovrsinaDo');
  const fStruktura = document.getElementById('filterStruktura');
  const sortBy = document.getElementById('sortBy');
  const searchBtn = document.getElementById('filterSearchBtn');
  const resetBtn = document.getElementById('filterResetBtn');

  let allProperties = [];

  // ---- Show all sales properties (Sekundarni Stanovi, Starogradnja, Kuće, Lokali) ----
  const PRODAJA_TYPES = ['Sekundarni Stanovi', 'Starogradnja', 'Kuće', 'Lokali'];

  // Format number with dot separators: 100000 → 100.000
  function formatWithDots(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Parse formatted string back to number: "100.000" → 100000
  function parseFormatted(str) {
    if (!str) return 0;
    return Number(str.replace(/\./g, ''));
  }

  // Auto-format input field on typing
  function setupPriceInput(input) {
    input.addEventListener('input', function() {
      var raw = this.value.replace(/[^\d]/g, '');
      if (raw === '') { this.value = ''; return; }
      this.value = formatWithDots(parseInt(raw, 10));
    });
  }

  setupPriceInput(fCenaOd);
  setupPriceInput(fCenaDo);

  function formatPrice(price) {
    return '€' + formatWithDots(price);
  }

  function createCard(prop) {
    const firstImage = prop.images && prop.images.length > 0 ? prop.images[0] : null;
    const badge = prop.type === 'Kuće' ? 'Kuća' : prop.type === 'Lokali' ? 'Lokal' : 'Prodaja';

    const card = document.createElement('a');
    card.href = 'property.html?id=' + prop.id;
    card.className = 'prodaja-card';

    const imgHTML = firstImage
      ? '<div class="prodaja-card-img">' +
          '<img src="' + firstImage + '" alt="' + prop.title + '" loading="lazy">' +
          '<span class="prodaja-card-badge">' + badge + '</span>' +
        '</div>'
      : '<div class="prodaja-card-img">' +
          '<div class="prodaja-card-coming-soon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>' +
            '<span>Foto uskoro</span>' +
          '</div>' +
          '<span class="prodaja-card-badge">' + badge + '</span>' +
        '</div>';

    card.innerHTML = imgHTML +
      '<div class="prodaja-card-info">' +
        '<span class="prodaja-card-location">' + prop.location + '</span>' +
        '<h3 class="prodaja-card-title">' + prop.title + '</h3>' +
        '<div class="prodaja-card-features">' +
          '<span class="prodaja-card-feature">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>' +
            prop.area + 'm²' +
          '</span>' +
          '<span class="prodaja-card-feature">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M21 7H3"/></svg>' +
            prop.rooms + (prop.rooms === 1 ? ' soba' : ' sobe') +
          '</span>' +
        '</div>' +
        '<div class="prodaja-card-footer">' +
          '<span class="prodaja-card-price">' + formatPrice(prop.price) + '</span>' +
          '<span class="prodaja-card-link">Detaljnije <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>' +
        '</div>' +
      '</div>';

    return card;
  }

  // Read search query from URL (?q=...)
  var urlParams = new URLSearchParams(window.location.search);
  var searchQuery = urlParams.get('q') || '';

  // Smart search: parse query into structured filters
  var smartSearch = { rooms: 0, maxPrice: 0, location: '', textWords: [] };

  if (searchQuery) {
    var q = searchQuery.toLowerCase().trim();

    // Room count keywords
    var roomMap = {
      'garsonjera': 1, 'garsonjer': 1,
      'jednosoban': 1, 'jednosobni': 1, 'jednosobna': 1,
      'dvosoban': 2, 'dvosobni': 2, 'dvosobna': 2,
      'trosoban': 3, 'trosobni': 3, 'trosobna': 3,
      'cetvorosoban': 4, 'četvorosoban': 4, 'cetvorosobni': 4, 'četvorosobni': 4,
      'četvorosobna': 4, 'cetvorosobna': 4,
      'petosoban': 5, 'petosobni': 5, 'petosobna': 5
    };

    // Known locations (lowercase for matching)
    var knownLocations = [
      'liman', 'liman iv', 'liman 4', 'centar', 'novo naselje',
      'sajmište', 'sajmiste', 'detelinara', 'petrovaradin',
      'adamovićevo', 'adamovicevo', 'adamovićevo naselje', 'adamovicevo naselje',
      'telep', 'salajka', 'bulevar oslobođenja', 'bulevar oslobodjenja',
      'somborski bulevar', 'grbavica', 'podbara', 'klisa', 'futog'
    ];

    var words = q.split(/\s+/);
    var usedWords = {};

    // Check for room keywords
    words.forEach(function(w, i) {
      if (roomMap[w]) {
        smartSearch.rooms = roomMap[w];
        usedWords[i] = true;
      }
    });

    // Check for location (try multi-word first, then single word)
    var foundLocation = false;
    knownLocations.sort(function(a, b) { return b.length - a.length; }); // longest first
    knownLocations.forEach(function(loc) {
      if (!foundLocation && q.indexOf(loc) !== -1) {
        smartSearch.location = loc;
        foundLocation = true;
        // Mark used words
        var locWords = loc.split(/\s+/);
        words.forEach(function(w, i) {
          locWords.forEach(function(lw) {
            if (w === lw) usedWords[i] = true;
          });
        });
      }
    });

    // Check for price (numbers > 1000 = likely price)
    words.forEach(function(w, i) {
      var num = Number(w.replace(/\./g, ''));
      if (!isNaN(num) && num > 1000) {
        smartSearch.maxPrice = num;
        usedWords[i] = true;
      }
    });

    // Remaining words for text search (skip common filler words)
    var skipWords = ['stan', 'stana', 'stanu', 'na', 'u', 'za', 'sa', 'od', 'do', 'i', 'ili', 'prodaju', 'prodaja', 'kupovina', 'novom', 'sadu', 'novi', 'sad'];
    words.forEach(function(w, i) {
      if (!usedWords[i] && w.length > 2 && skipWords.indexOf(w) === -1) {
        smartSearch.textWords.push(w);
      }
    });

    // Auto-fill filter controls from smart search
    if (smartSearch.rooms) {
      var roomVal = smartSearch.rooms >= 5 ? '5' : String(smartSearch.rooms + 1);
      // struktura select: 2=jednosoban, 3=dvosoban, 4=trosoban, 5=4+
      if (smartSearch.rooms === 1) fStruktura.value = '2';
      else if (smartSearch.rooms === 2) fStruktura.value = '3';
      else if (smartSearch.rooms === 3) fStruktura.value = '4';
      else fStruktura.value = '5';
    }
    if (smartSearch.maxPrice) {
      fCenaDo.value = formatWithDots(smartSearch.maxPrice);
    }
  }

  function applyFilters() {
    var lokacija = fLokacija.value.toLowerCase();
    var tip = fTip.value.toLowerCase();
    var cenaOd = fCenaOd.value ? parseFormatted(fCenaOd.value) : 0;
    var cenaDo = fCenaDo.value ? parseFormatted(fCenaDo.value) : Infinity;
    var povrsinaOd = fPovrsinaOd.value ? Number(fPovrsinaOd.value) : 0;
    var povrsinaDo = fPovrsinaDo.value ? Number(fPovrsinaDo.value) : Infinity;
    var struktura = fStruktura.value ? Number(fStruktura.value) : 0;

    let filtered = allProperties.filter(function(p) {
      // Smart search: location from query
      if (smartSearch.location) {
        if (p.location.toLowerCase().indexOf(smartSearch.location) === -1) return false;
      }

      // Smart search: rooms from query
      if (smartSearch.rooms && !struktura) {
        if (smartSearch.rooms >= 5) { if (p.rooms < 4) return false; }
        else { if (p.rooms !== smartSearch.rooms) return false; }
      }

      // Smart search: max price from query
      if (smartSearch.maxPrice && cenaDo === Infinity) {
        if (p.price > smartSearch.maxPrice) return false;
      }

      // Smart search: remaining text words
      if (smartSearch.textWords.length > 0) {
        var searchable = (p.title + ' ' + p.location + ' ' + (p.description || '')).toLowerCase();
        var matchesAll = smartSearch.textWords.every(function(w) { return searchable.indexOf(w) !== -1; });
        if (!matchesAll) return false;
      }

      // Location filter
      if (lokacija && p.location.toLowerCase().indexOf(lokacija) === -1) return false;

      // Type filter
      if (tip) {
        if (tip === 'stan' && p.type !== 'Starogradnja' && p.type !== 'Sekundarni Stanovi') return false;
        if (tip === 'kuca' && p.type !== 'Kuće') return false;
        if (tip === 'lokal' && p.type !== 'Lokali') return false;
      }

      // Price filter
      if (p.price < cenaOd || p.price > cenaDo) return false;

      // Area filter
      if (p.area < povrsinaOd || p.area > povrsinaDo) return false;

      // Structure filter (rooms)
      if (struktura) {
        if (struktura === 5) {
          if (p.rooms < 4) return false;
        } else if (struktura === 1) {
          if (p.rooms > 1) return false;
        } else if (struktura === 2.5) {
          // Jednoiposoban = 1.5 rooms
          if (p.rooms !== 1.5) return false;
        } else {
          // struktura 2=jednosoban(1 room), 3=dvosoban(2 rooms), 4=trosoban(3 rooms)
          var targetRooms = struktura - 1;
          if (p.rooms !== targetRooms) return false;
        }
      }

      return true;
    });

    // Sort
    const sort = sortBy.value;
    filtered.sort(function(a, b) {
      switch(sort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'area-asc': return a.area - b.area;
        case 'area-desc': return b.area - a.area;
        default: return 0; // newest = default CRM order
      }
    });

    renderCards(filtered);
  }

  function renderCards(props) {
    grid.innerHTML = '';

    if (props.length === 0) {
      noResults.style.display = 'block';
      resultsCount.innerHTML = '<strong>0</strong> rezultata';
      return;
    }

    noResults.style.display = 'none';
    var label = searchQuery ? 'Pretraga: "' + searchQuery + '" — ' : 'Prodaja stanova Novi Sad — ';
    resultsCount.innerHTML = label + '<strong>' + props.length + '</strong> rezultata';

    props.forEach(function(prop, i) {
      var card = createCard(prop);
      card.style.animationDelay = (i * 0.05) + 's';
      grid.appendChild(card);
    });
  }

  function resetFilters() {
    fLokacija.value = '';
    fTip.value = '';
    fCenaOd.value = '';
    fCenaDo.value = '';
    fPovrsinaOd.value = '';
    fPovrsinaDo.value = '';
    fStruktura.value = '';
    sortBy.value = 'newest';
    smartSearch = { rooms: 0, maxPrice: 0, location: '', textWords: [] };
    searchQuery = '';
    // Clean URL
    if (window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    applyFilters();
  }

  // Populate location options dynamically from data
  function populateLocations(props) {
    var locations = {};
    props.forEach(function(p) {
      if (p.location) locations[p.location] = true;
    });
    var sorted = Object.keys(locations).sort();
    // Clear existing options except first
    while (fLokacija.options.length > 1) fLokacija.remove(1);
    sorted.forEach(function(loc) {
      var opt = document.createElement('option');
      opt.value = loc;
      opt.textContent = loc;
      fLokacija.appendChild(opt);
    });
  }

  // Event listeners — auto-apply on ANY change (no need to click Pretraži)
  searchBtn.addEventListener('click', applyFilters);
  resetBtn.addEventListener('click', resetFilters);

  // All selects: instant filter on change
  [fLokacija, fTip, fStruktura, sortBy].forEach(function(sel) {
    sel.addEventListener('change', applyFilters);
  });

  // Text/number inputs: debounced filter on input + Enter key
  var debounceTimer;
  [fCenaOd, fCenaDo, fPovrsinaOd, fPovrsinaDo].forEach(function(input) {
    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 300);
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { clearTimeout(debounceTimer); applyFilters(); }
    });
  });

  function handleData(props) {
    spinner.style.display = 'none';
    allProperties = props.filter(function(p) {
      return PRODAJA_TYPES.indexOf(p.type) !== -1;
    });
    if (allProperties.length === 0) {
      noResults.style.display = 'block';
      resultsCount.innerHTML = '<strong>0</strong> rezultata';
      return;
    }
    populateLocations(allProperties);
    if (smartSearch.location) {
      for (var i = 0; i < fLokacija.options.length; i++) {
        if (fLokacija.options[i].value.toLowerCase().indexOf(smartSearch.location) !== -1) {
          fLokacija.value = fLokacija.options[i].value;
          break;
        }
      }
    }
    applyFilters();
  }

  // Load from CRM with fallback
  fetch(CRM_API)
    .then(function(r) {
      if (!r.ok) throw new Error('CRM HTTP ' + r.status);
      return r.json();
    })
    .then(function(data) {
      if (!data.properties || data.properties.length === 0) {
        console.warn('CRM returned 0, using fallback');
        handleData(typeof FALLBACK_PROPERTIES !== 'undefined' ? FALLBACK_PROPERTIES : []);
        return;
      }
      handleData(data.properties);
    })
    .catch(function(err) {
      console.error('CRM error:', err, '— loading fallback');
      handleData(typeof FALLBACK_PROPERTIES !== 'undefined' ? FALLBACK_PROPERTIES : []);
    });

})();
