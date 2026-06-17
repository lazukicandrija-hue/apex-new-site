/* ============================================
   APEX — Novogradnja Page JavaScript
   Dynamic project loading from CRM
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // -------- Mobile Nav Toggle --------
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
  });

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });

  // -------- Scroll Reveal --------
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // -------- Back to Top --------
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // -------- Hero image fallback --------
  const heroImg = document.getElementById('novoHeroImg');
  if (heroImg) {
    heroImg.addEventListener('error', () => {
      heroImg.src = 'assets/images/about-bg.png';
    });
  }

  // -------- Dynamic CRM Projects --------
  const CRM_API = 'https://crm.apexrealestate.rs/api/sync/projects';
  const grid = document.getElementById('projectsGrid');

  // Slugs that already have dedicated hardcoded HTML pages (skip these from dynamic)
  const HARDCODED_SLUGS = {
    'klisa': 'novogradnja-sunnyline.html',
    'telep': 'novogradnja-telep.html'
  };

  function createProjectCard(project, index) {
    const images = JSON.parse(project.images || '[]');
    const heroImage = images.length > 0
      ? 'https://crm.apexrealestate.rs' + images[0]
      : 'assets/images/about-bg.png';

    // Use dedicated page if exists, otherwise use generic project page
    const href = HARDCODED_SLUGS[project.slug]
      || ('novogradnja-projekat.html?slug=' + project.slug);

    const staggerClass = 'stagger-' + ((index % 4) + 1);
    const unitCount = project.available_count || project.total_units || 0;
    const unitLabel = unitCount === 1 ? 'stan' : (unitCount < 5 ? 'stana' : 'stanova');

    const card = document.createElement('a');
    card.href = href;
    card.className = 'project-card reveal ' + staggerClass;
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';

    card.innerHTML =
      '<div class="project-card-img">' +
        '<img src="' + heroImage + '" alt="Novogradnja ' + project.name + ', ' + project.location + '" loading="lazy" onerror="this.src=\'assets/images/about-bg.png\'">' +
        '<span class="project-badge new">Novo</span>' +
      '</div>' +
      '<div class="project-card-info">' +
        '<h3 class="project-card-name">' + project.name + '</h3>' +
        '<div class="project-card-location">📍 ' + project.location + '</div>' +
        '<div class="project-card-meta">' +
          '<div class="project-card-price">' +
            '<span class="price-label">Cena</span>' +
            '<span class="price-value">Na upit</span>' +
          '</div>' +
          '<div class="project-card-area">' + unitCount + ' ' + unitLabel + '</div>' +
        '</div>' +
      '</div>';

    return card;
  }

  if (grid) {
    fetch(CRM_API)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var projects = data.projects || [];
        projects.forEach(function(project, i) {
          var card = createProjectCard(project, i);
          grid.appendChild(card);

          // Observe for reveal animation
          setTimeout(function() {
            revealObserver.observe(card);
          }, 50);
        });
      })
      .catch(function(err) {
        console.warn('Could not load CRM projects:', err);
      });
  }

});
