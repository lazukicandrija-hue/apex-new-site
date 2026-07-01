/* ============================================
   APEX REAL ESTATE — JAVASCRIPT ENGINE
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

  // -------- Preloader --------
  var preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        initHeroAnimations();
        initHeroParticles();
      }, 1200);
    });

    // Safety timeout for preloader
    setTimeout(function() {
      if (!preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    }, 4000);
  }

  // -------- Custom Cursor --------
  var cursorDot = document.getElementById('cursorDot');
  var cursorRing = document.getElementById('cursorRing');
  var mouseX = 0, mouseY = 0;
  var ringX = 0, ringY = 0;

  if (cursorDot && cursorRing && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX - 4 + 'px';
      cursorDot.style.top = mouseY - 4 + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX - 18 + 'px';
      cursorRing.style.top = ringY - 18 + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    var interactiveEls = document.querySelectorAll('a, button, input, textarea, select, .property-card, .blog-card, .pillar');
    for (var ie = 0; ie < interactiveEls.length; ie++) {
      (function(el) {
        el.addEventListener('mouseenter', function() { cursorRing.classList.add('hover'); });
        el.addEventListener('mouseleave', function() { cursorRing.classList.remove('hover'); });
      })(interactiveEls[ie]);
    }
  } else {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
  }

  // -------- Sticky Navbar --------
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // -------- Mobile Nav Toggle --------
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close nav on link click
    var navItems = document.querySelectorAll('[data-nav]');
    for (var ni = 0; ni < navItems.length; ni++) {
      navItems[ni].addEventListener('click', function() {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    }
  }

  // -------- Scroll Reveal --------
  var revealObserver;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('visible');
          revealObserver.unobserve(entries[i].target);
        }
      }
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    for (var ri = 0; ri < revealEls.length; ri++) {
      revealObserver.observe(revealEls[ri]);
    }
  } else {
    // Fallback for old browsers - show everything immediately
    var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    for (var rf = 0; rf < revealEls.length; rf++) {
      revealEls[rf].classList.add('visible');
    }
  }

  // Expose globally so CRM-loaded cards can re-trigger reveal
  window.initRevealObserver = function() {
    if (!revealObserver) return;
    var els = document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)');
    for (var i = 0; i < els.length; i++) {
      revealObserver.observe(els[i]);
    }
  };

  // -------- Hero Animations --------
  function initHeroAnimations() {
    var heroElements = document.querySelectorAll('.hero .reveal');
    for (var i = 0; i < heroElements.length; i++) {
      heroElements[i].classList.add('visible');
    }
  }

  // -------- Parallax Effect --------
  var parallaxImages = document.querySelectorAll('.parallax-img');

  if (parallaxImages.length > 0) {
    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY;
      for (var pi = 0; pi < parallaxImages.length; pi++) {
        var img = parallaxImages[pi];
        var rect = img.getBoundingClientRect();
        var elementTop = rect.top + scrollY;
        var offset = (scrollY - elementTop) * 0.15;
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          img.style.transform = 'translateY(' + offset + 'px) scale(1.1)';
        }
      }
    });
  }

  // -------- Counter Animation --------
  var counters = document.querySelectorAll('[data-count]');

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function(entries) {
      for (var ci = 0; ci < entries.length; ci++) {
        if (entries[ci].isIntersecting) {
          var target = entries[ci].target;
          var end = parseInt(target.getAttribute('data-count'));
          var duration = 2000;
          var startTime = Date.now();

          (function(t, e) {
            function updateCounter() {
              var elapsed = Date.now() - startTime;
              var progress = Math.min(elapsed / duration, 1);
              var eased = 1 - (1 - progress) * (1 - progress);
              var current = Math.floor(eased * e);
              t.textContent = current.toLocaleString();
              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                var nextEl = t.nextElementSibling;
                var label = (nextEl && nextEl.textContent) ? nextEl.textContent : '';
                if (label.indexOf('%') !== -1) {
                  t.textContent = e + '%';
                } else {
                  t.textContent = e + '+';
                }
              }
            }
            updateCounter();
          })(target, end);

          counterObserver.unobserve(target);
        }
      }
    }, { threshold: 0.5 });

    for (var c = 0; c < counters.length; c++) {
      counterObserver.observe(counters[c]);
    }
  }

  // -------- Property Filter --------
  var filterBtns = document.querySelectorAll('.filter-btn');

  function applyFilter(filter) {
    var allCards = document.querySelectorAll('.property-card');
    var visibleIndex = 0;
    for (var fi = 0; fi < allCards.length; fi++) {
      (function(card, idx) {
        var category = (card.getAttribute('data-category') || '').toLowerCase();
        var f = filter.toLowerCase();
        if (f === 'all' || category === f) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.display = 'block';
          var delay = visibleIndex * 80;
          visibleIndex++;
          setTimeout(function() {
            card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, delay);
        } else {
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(function() {
            card.style.display = 'none';
          }, 300);
        }
      })(allCards[fi], fi);
    }
  }

  for (var fb = 0; fb < filterBtns.length; fb++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        for (var b = 0; b < filterBtns.length; b++) {
          filterBtns[b].classList.remove('active');
        }
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        applyFilter(filter);
      });
    })(filterBtns[fb]);
  }

  // Expose globally so CRM cards can re-apply the active filter after loading
  window.reapplyPropertyFilter = function() {
    var activeBtn = document.querySelector('.filter-btn.active');
    if (activeBtn) {
      var filter = activeBtn.getAttribute('data-filter');
      if (filter && filter !== 'all') {
        applyFilter(filter);
      }
    }
  };

  // -------- AI Search Suggestions --------
  var searchInput = document.getElementById('aiSearchInput');
  var suggestions = document.querySelectorAll('[data-suggestion]');

  if (searchInput) {
    for (var si = 0; si < suggestions.length; si++) {
      (function(sugg) {
        sugg.addEventListener('click', function() {
          searchInput.value = sugg.getAttribute('data-suggestion');
          searchInput.focus();
          sugg.style.borderColor = '#D4AF37';
          sugg.style.color = '#D4AF37';
          sugg.style.background = 'rgba(212,175,55,0.1)';
        });
      })(suggestions[si]);
    }

    // AI Search button
    var aiSearchBtn = document.getElementById('aiSearchBtn');
    if (aiSearchBtn) {
      aiSearchBtn.addEventListener('click', function() {
        var query = searchInput.value.trim();
        if (query) {
          window.location.href = 'prodaja.html?q=' + encodeURIComponent(query);
        }
      });

      // Enter key support
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          aiSearchBtn.click();
        }
      });
    }
  }

  // -------- Contact Form --------
  var contactForm = document.getElementById('contactForm');
  var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-EOvcwDJ7oZ-KHPgTVmHrCEZYnqxzkHHx9AdQyKgNa7d-o1-eiSme_LAsl8eKwclU/exec';

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var submitBtn = document.getElementById('submitBtn');
      var originalText = submitBtn.textContent;

      submitBtn.textContent = 'Šalje se...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      var formData = {
        ime: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        telefon: document.getElementById('contactPhone').value.trim(),
        kategorija: document.getElementById('contactInterest').value,
        poruka: document.getElementById('contactMessage').value.trim(),
        datum: new Date().toLocaleString('sr-RS'),
        _t: Date.now()
      };

      // Build query string manually (no URLSearchParams for older browsers)
      var params = '';
      for (var key in formData) {
        if (formData.hasOwnProperty(key)) {
          if (params) params += '&';
          params += encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]);
        }
      }
      var img = new Image();
      img.src = GOOGLE_SCRIPT_URL + '?' + params;

      setTimeout(function() {
        submitBtn.textContent = '✓ Uspešno Poslato!';
        submitBtn.style.opacity = '1';
        submitBtn.style.background = 'linear-gradient(135deg, #2a7a2a, #3d9d3d)';

        if (typeof fbq === 'function') {
          fbq('track', 'Lead', {
            content_name: formData.kategorija || 'Kontakt forma',
            content_category: 'Website Lead'
          });
        }

        setTimeout(function() {
          contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      }, 300);
    });
  }

  // -------- Back to Top --------
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -------- Smooth Scroll for Anchor Links --------
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var ai = 0; ai < anchors.length; ai++) {
    (function(anchor) {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          var headerOffset = 80;
          var elementPosition = target.getBoundingClientRect().top;
          var offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    })(anchors[ai]);
  }

  // -------- Hero Scroll Indicator --------
  var heroScroll = document.getElementById('heroScroll');
  if (heroScroll) {
    heroScroll.addEventListener('click', function() {
      var nextSection = document.querySelector('.stats-bar');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // -------- Intersection Observer for Gold Line Animation --------
  var goldLines = document.querySelectorAll('.gold-line');
  if (goldLines.length > 0 && 'IntersectionObserver' in window) {
    var lineObserver = new IntersectionObserver(function(entries) {
      for (var li = 0; li < entries.length; li++) {
        if (entries[li].isIntersecting) {
          entries[li].target.style.width = '60px';
          entries[li].target.style.transition = 'width 1s cubic-bezier(0.16, 1, 0.3, 1)';
        }
      }
    }, { threshold: 0.5 });

    for (var gl = 0; gl < goldLines.length; gl++) {
      goldLines[gl].style.width = '0';
      lineObserver.observe(goldLines[gl]);
    }
  }

  // -------- Hero Floating Particles --------
  function initHeroParticles() {
    var canvas = document.getElementById('heroParticles');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var animationId;

    function resize() {
      var hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    var goldVariants = [
      { r: 212, g: 175, b: 55 },
      { r: 232, g: 212, b: 139 },
      { r: 184, g: 148, b: 31 },
      { r: 247, g: 231, b: 206 },
      { r: 255, g: 223, b: 120 }
    ];

    function createParticle(randomY) {
      var p = {};
      p.x = Math.random() * canvas.width;
      p.y = randomY ? Math.random() * canvas.height : canvas.height + 10;
      p.size = Math.random() * 2.5 + 0.5;
      p.speedY = Math.random() * 0.4 + 0.15;
      p.speedX = (Math.random() - 0.5) * 0.3;
      p.opacity = Math.random() * 0.5 + 0.15;
      p.wobbleAmp = Math.random() * 0.8 + 0.2;
      p.wobbleSpeed = Math.random() * 0.02 + 0.005;
      p.wobbleOffset = Math.random() * Math.PI * 2;
      p.life = 0;
      p.maxLife = Math.random() * 600 + 300;
      p.currentOpacity = 0;
      p.color = goldVariants[Math.floor(Math.random() * goldVariants.length)];
      return p;
    }

    function updateParticle(p) {
      p.life++;
      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(p.life * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * 0.1;

      var lifeRatio = p.life / p.maxLife;
      if (lifeRatio < 0.1) {
        p.currentOpacity = p.opacity * (lifeRatio / 0.1);
      } else if (lifeRatio > 0.8) {
        p.currentOpacity = p.opacity * (1 - (lifeRatio - 0.8) / 0.2);
      } else {
        p.currentOpacity = p.opacity;
      }
      p.currentOpacity *= 0.7 + Math.sin(p.life * 0.05) * 0.3;

      if (p.y < -10 || p.life >= p.maxLife) {
        var np = createParticle(false);
        p.x = np.x; p.y = np.y; p.size = np.size; p.speedY = np.speedY;
        p.speedX = np.speedX; p.opacity = np.opacity; p.wobbleAmp = np.wobbleAmp;
        p.wobbleSpeed = np.wobbleSpeed; p.wobbleOffset = np.wobbleOffset;
        p.life = np.life; p.maxLife = np.maxLife; p.color = np.color;
        p.currentOpacity = 0;
      }
    }

    function drawParticle(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color.r + ', ' + p.color.g + ', ' + p.color.b + ', ' + p.currentOpacity + ')';
      ctx.fill();

      if (p.size > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color.r + ', ' + p.color.g + ', ' + p.color.b + ', ' + (p.currentOpacity * 0.1) + ')';
        ctx.fill();
      }
    }

    // Create particles
    var particleCount = window.innerWidth < 768 ? 25 : 50;
    for (var i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var j = 0; j < particles.length; j++) {
        updateParticle(particles[j]);
        drawParticle(particles[j]);
      }
      animationId = requestAnimationFrame(animate);
    }

    // Only animate when hero is visible (performance)
    if ('IntersectionObserver' in window) {
      var heroObserver = new IntersectionObserver(function(entries) {
        for (var k = 0; k < entries.length; k++) {
          if (entries[k].isIntersecting) {
            animate();
          } else {
            cancelAnimationFrame(animationId);
          }
        }
      }, { threshold: 0 });
      heroObserver.observe(canvas.parentElement);
    } else {
      animate();
    }
  }

});

/* ============================================
   FLOATING CONTACT BUTTONS — Phone + Viber
   Visible on every page, bottom-right corner
   ============================================ */
(function() {
  // Create container
  var container = document.createElement('div');
  container.id = 'floatingContact';
  container.innerHTML =
    '<a href="tel:+381643335757" class="float-btn float-phone" aria-label="Pozovite nas" title="Pozovite: 064/333/5757">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
    '</a>' +
    '<a href="viber://chat?number=%2B381643335757" class="float-btn float-viber" aria-label="Viber poruka" title="Viber: 064/333/5757">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 0C9.473.028 5.333.344 3.243 2.238 1.663 3.818 1.06 6.158 1 9.098v.003c-.06 2.94-.14 8.46 5.18 10.14l.02.01-.01 2.32s-.04.94.58 1.13c.58.18.82-.18 2.32-1.92.82-.96 1.74-2.12 2.5-3.1 3.44.3 6.1-.38 6.4-.48.7-.22 4.66-.74 5.3-6.02.66-5.46-.32-8.92-2.08-10.48l-.02-.02C20.18 0.09 17.06-.05 15.3.01c-.52.02-1.62.06-2.7.12-.36.02-.72.04-1.06.06l-.14.01zM11.5 1.8h.08c1.72-.07 4.56-.01 6.14 1.18h.02c1.46 1.26 2.2 4.3 1.62 9.04-.52 4.24-3.58 4.62-4.18 4.82-.24.08-2.56.66-5.42.48 0 0-2.14 2.6-2.82 3.28-.1.12-.24.16-.32.14-.12-.04-.14-.18-.14-.38l.02-3.56c-4.34-1.38-4.08-6-4.04-8.32v-.02c.04-2.34.5-4.4 1.82-5.7C5.92 2.42 8.78 1.92 11.5 1.8zm.28 2.88c-.14 0-.28.12-.28.28s.12.3.28.3c1.46.04 2.72.56 3.7 1.5 1 .94 1.56 2.2 1.64 3.64 0 .16.14.28.3.28h.02c.16 0 .28-.14.28-.3-.1-1.62-.74-3.04-1.86-4.12-1.1-1.06-2.54-1.64-4.08-1.68zm-3.06.9c-.32-.02-.64.08-.88.36L7.3 6.56c-.34.4-.46.88-.34 1.36.26 1.1.8 2.76 2.02 4.6 1.1 1.62 3 3.74 5.72 4.88.38.16.78.12 1.12-.12l.62-.5c.5-.4.56-1.1.16-1.58l-1.36-1.6c-.34-.38-.88-.44-1.28-.14l-.66.48s-.42.3-.78.12c0 0-1.16-.58-2.14-1.74-.98-1.16-1.38-2.4-1.38-2.4-.14-.38.2-.74.2-.74l.56-.6c.32-.36.34-.9.02-1.32L8.56 5.96c-.24-.3-.56-.48-.88-.48l.04.1zm3.4 1.08c-.16 0-.28.14-.26.3.04.98.42 1.86 1.08 2.5.66.64 1.54 1.02 2.5 1.08.16 0 .3-.1.32-.26.02-.16-.1-.3-.26-.32-.8-.04-1.54-.36-2.1-.9-.56-.54-.88-1.28-.94-2.08-.02-.16-.16-.3-.34-.3v-.02zm.28 1.68c-.16 0-.28.14-.26.3.04.52.24.98.58 1.34.36.34.82.56 1.32.6.16 0 .3-.12.3-.28.02-.16-.1-.3-.26-.32-.34-.02-.66-.18-.9-.42-.24-.24-.38-.56-.4-.9-.02-.18-.18-.32-.38-.32z"/></svg>' +
    '</a>';

  document.body.appendChild(container);

  // Inject styles
  var style = document.createElement('style');
  style.textContent =
    '#floatingContact {' +
      'position: fixed;' +
      'bottom: 30px;' +
      'right: 24px;' +
      'z-index: 9999;' +
      'display: flex;' +
      'flex-direction: column;' +
      'gap: 14px;' +
      'animation: floatContactIn 0.6s ease 2s both;' +
    '}' +
    '@keyframes floatContactIn {' +
      'from { opacity: 0; transform: translateX(60px); }' +
      'to { opacity: 1; transform: translateX(0); }' +
    '}' +
    '.float-btn {' +
      'width: 52px;' +
      'height: 52px;' +
      'border-radius: 50%;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'color: #fff;' +
      'text-decoration: none;' +
      'box-shadow: 0 4px 20px rgba(0,0,0,0.35), 0 0 0 0 rgba(212,175,55,0);' +
      'transition: transform 0.3s ease, box-shadow 0.3s ease;' +
      'cursor: pointer;' +
    '}' +
    '.float-btn:hover {' +
      'transform: scale(1.12);' +
    '}' +
    '.float-btn svg {' +
      'width: 24px;' +
      'height: 24px;' +
      'flex-shrink: 0;' +
    '}' +
    '.float-phone {' +
      'background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%);' +
      'animation: phonePulse 2.5s ease-in-out infinite;' +
    '}' +
    '.float-phone:hover {' +
      'box-shadow: 0 6px 28px rgba(212,175,55,0.5);' +
    '}' +
    '@keyframes phonePulse {' +
      '0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.35), 0 0 0 0 rgba(212,175,55,0.4); }' +
      '50% { box-shadow: 0 4px 20px rgba(0,0,0,0.35), 0 0 0 10px rgba(212,175,55,0); }' +
    '}' +
    '.float-viber {' +
      'background: linear-gradient(135deg, #7360f2 0%, #59449e 100%);' +
    '}' +
    '.float-viber:hover {' +
      'box-shadow: 0 6px 28px rgba(115,96,242,0.5);' +
    '}' +
    '@media (max-width: 768px) {' +
      '#floatingContact { bottom: 20px; right: 16px; gap: 12px; }' +
      '.float-btn { width: 48px; height: 48px; }' +
      '.float-btn svg { width: 22px; height: 22px; }' +
    '}';

  document.head.appendChild(style);
})();

// -------- FAQ Accordion --------
(function() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  if (!faqQuestions.length) return;

  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      // Close all other answers
      faqQuestions.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling.classList.remove('open');
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (isOpen) {
        answer.classList.remove('open');
      } else {
        answer.classList.add('open');
      }
    });
  });
})();
