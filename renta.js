/* =============================================
   RENTA PAGE - CRM LOADING + FILTERING
   ============================================= */

(function() {
  'use strict';

  const CRM_API = 'https://crm.apexrealestate.rs/api/sync/properties';
  const grid = document.getElementById('prodajaGrid');
  const spinner = document.getElementById('loadingSpinner');
  const noResults = document.getElementById('noResults');
  const resultsCount = document.getElementById('resultsCount');

  const fLokacija = document.getElementById('filterLokacija');
  const fCenaOd = document.getElementById('filterCenaOd');
  const fCenaDo = document.getElementById('filterCenaDo');
  const fPovrsinaOd = document.getElementById('filterPovrsinaOd');
  const fPovrsinaDo = document.getElementById('filterPovrsinaDo');
  const fStruktura = document.getElementById('filterStruktura');
  const sortBy = document.getElementById('sortBy');
  const searchBtn = document.getElementById('filterSearchBtn');
  const resetBtn = document.getElementById('filterResetBtn');

  let allProperties = [];

  // Format number with dot separators: 1000 → 1.000
  function formatWithDots(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function parseFormatted(str) {
    if (!str) return 0;
    return Number(str.replace(/\./g, ''));
  }

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
    return '€' + formatWithDots(price) + '/mes';
  }

  function createCard(prop) {
    const firstImage = prop.images && prop.images.length > 0 ? prop.images[0] : null;

    const card = document.createElement('a');
    card.href = 'property.html?id=' + prop.id;
    card.className = 'prodaja-card';

    const imgHTML = firstImage
      ? '<div class="prodaja-card-img">' +
          '<img src="' + firstImage + '" alt="' + prop.title + '" loading="lazy">' +
          '<span class="prodaja-card-badge">Izdavanje</span>' +
        '</div>'
      : '<div class="prodaja-card-img">' +
          '<div class="prodaja-card-coming-soon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>' +
            '<span>Foto uskoro</span>' +
          '</div>' +
          '<span class="prodaja-card-badge">Izdavanje</span>' +
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

  function applyFilters() {
    const lokacija = fLokacija.value.toLowerCase();
    const cenaOd = fCenaOd.value ? parseFormatted(fCenaOd.value) : 0;
    const cenaDo = fCenaDo.value ? parseFormatted(fCenaDo.value) : Infinity;
    const povrsinaOd = fPovrsinaOd.value ? Number(fPovrsinaOd.value) : 0;
    const povrsinaDo = fPovrsinaDo.value ? Number(fPovrsinaDo.value) : Infinity;
    const struktura = fStruktura.value ? Number(fStruktura.value) : 0;

    let filtered = allProperties.filter(function(p) {
      if (lokacija && p.location.toLowerCase().indexOf(lokacija) === -1) return false;
      if (p.price < cenaOd || p.price > cenaDo) return false;
      if (p.area < povrsinaOd || p.area > povrsinaDo) return false;
      if (struktura) {
        if (struktura === 5) { if (p.rooms < 4) return false; }
        else if (struktura === 1) { if (p.rooms > 1) return false; }
        else if (struktura === 2.5) { if (p.rooms !== 1.5) return false; }
        else { if (p.rooms !== (struktura - 1)) return false; }
      }
      return true;
    });

    const sort = sortBy.value;
    filtered.sort(function(a, b) {
      switch(sort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'area-asc': return a.area - b.area;
        case 'area-desc': return b.area - a.area;
        default: return 0;
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
    resultsCount.innerHTML = 'Stanovi za izdavanje — <strong>' + props.length + '</strong> rezultata';
    props.forEach(function(prop, i) {
      var card = createCard(prop);
      card.style.animationDelay = (i * 0.05) + 's';
      grid.appendChild(card);
    });
  }

  function resetFilters() {
    fLokacija.value = '';
    fCenaOd.value = '';
    fCenaDo.value = '';
    fPovrsinaOd.value = '';
    fPovrsinaDo.value = '';
    fStruktura.value = '';
    sortBy.value = 'newest';
    applyFilters();
  }

  function populateLocations(props) {
    var locations = {};
    props.forEach(function(p) { if (p.location) locations[p.location] = true; });
    var sorted = Object.keys(locations).sort();
    while (fLokacija.options.length > 1) fLokacija.remove(1);
    sorted.forEach(function(loc) {
      var opt = document.createElement('option');
      opt.value = loc;
      opt.textContent = loc;
      fLokacija.appendChild(opt);
    });
  }

  searchBtn.addEventListener('click', applyFilters);
  resetBtn.addEventListener('click', resetFilters);

  [fLokacija, fStruktura, sortBy].forEach(function(sel) {
    sel.addEventListener('change', applyFilters);
  });

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
      return p.type === 'Rente';
    });
    if (allProperties.length === 0) {
      noResults.style.display = 'block';
      resultsCount.innerHTML = '<strong>0</strong> rezultata';
      return;
    }
    populateLocations(allProperties);
    applyFilters();
  }

  fetch(CRM_API)
    .then(function(r) {
      if (!r.ok) throw new Error('CRM HTTP ' + r.status);
      return r.json();
    })
    .then(function(data) {
      if (!data.properties || data.properties.length === 0) {
        console.warn('CRM returned 0 rente, using fallback');
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
