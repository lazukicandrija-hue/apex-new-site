/* ============================================
   APEX REAL ESTATE — JAVASCRIPT ENGINE
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // -------- Preloader --------
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = 'auto';
      initHeroAnimations();
      initHeroParticles();
    }, 1200);
  });

  // Safety timeout for preloader
  setTimeout(() => {
    if (!preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }, 4000);

  // -------- Custom Cursor --------
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
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
    const interactiveEls = document.querySelectorAll('a, button, input, textarea, select, .property-card, .blog-card, .pillar');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });
  } else {
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }

  // -------- Sticky Navbar --------
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });

  // -------- Mobile Nav Toggle --------
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
  });

  // Close nav on link click
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });

  // -------- Scroll Reveal --------
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

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el));

  // Expose globally so CRM-loaded cards can re-trigger reveal
  window.initRevealObserver = function() {
    document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)').forEach(el => revealObserver.observe(el));
  };

  // -------- Hero Animations --------
  function initHeroAnimations() {
    const heroElements = document.querySelectorAll('.hero .reveal');
    heroElements.forEach(el => el.classList.add('visible'));
  }

  // -------- Parallax Effect --------
  const parallaxImages = document.querySelectorAll('.parallax-img');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    parallaxImages.forEach(img => {
      const rect = img.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const offset = (scrollY - elementTop) * 0.15;

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        img.style.transform = `translateY(${offset}px) scale(1.1)`;
      }
    });
  });

  // -------- Counter Animation --------
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const end = parseInt(target.getAttribute('data-count'));
        const duration = 2000;
        const startTime = Date.now();

        function updateCounter() {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out quad
          const eased = 1 - (1 - progress) * (1 - progress);
          const current = Math.floor(eased * end);

          target.textContent = current.toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            // Add + or % if needed
            const label = target.nextElementSibling?.textContent || '';
            if (label.includes('%')) {
              target.textContent = end + '%';
            } else {
              target.textContent = end + '+';
            }
          }
        }

        updateCounter();
        counterObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  // -------- Property Filter --------
  const filterBtns = document.querySelectorAll('.filter-btn');

  function applyFilter(filter) {
    // Query cards dynamically so CRM-loaded ones are included
    const allCards = document.querySelectorAll('.property-card');
    let visibleIndex = 0;
    allCards.forEach((card) => {
      const category = (card.getAttribute('data-category') || '').toLowerCase();
      const f = filter.toLowerCase();

      if (f === 'all' || category === f) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.display = 'block';

        const delay = visibleIndex * 80;
        visibleIndex++;
        setTimeout(() => {
          card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, delay);
      } else {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      applyFilter(filter);
    });
  });

  // Expose globally so CRM cards can re-apply the active filter after loading
  window.reapplyPropertyFilter = function() {
    const activeBtn = document.querySelector('.filter-btn.active');
    if (activeBtn) {
      const filter = activeBtn.getAttribute('data-filter');
      if (filter && filter !== 'all') {
        applyFilter(filter);
      }
    }
  };

  // -------- AI Search Suggestions --------
  const searchInput = document.getElementById('aiSearchInput');
  const suggestions = document.querySelectorAll('[data-suggestion]');

  suggestions.forEach(sugg => {
    sugg.addEventListener('click', () => {
      searchInput.value = sugg.getAttribute('data-suggestion');
      searchInput.focus();

      // Trigger visual feedback
      sugg.style.borderColor = '#D4AF37';
      sugg.style.color = '#D4AF37';
      sugg.style.background = 'rgba(212,175,55,0.1)';
    });
  });

  // AI Search button — redirect to prodaja page with search query
  const aiSearchBtn = document.getElementById('aiSearchBtn');
  aiSearchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = 'prodaja.html?q=' + encodeURIComponent(query);
    }
  });

  // Enter key support
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      aiSearchBtn.click();
    }
  });

  function addAiMessage(text, type) {
    const conversation = document.getElementById('aiConversation');
    const msg = document.createElement('div');
    msg.className = `ai-msg ${type}`;

    if (type === 'bot') {
      msg.innerHTML = text;
    } else {
      msg.textContent = text;
    }

    msg.style.opacity = '0';
    msg.style.transform = 'translateY(10px)';
    conversation.appendChild(msg);

    requestAnimationFrame(() => {
      msg.style.transition = 'all 0.4s ease';
      msg.style.opacity = '1';
      msg.style.transform = 'translateY(0)';
    });
  }

  function showTypingIndicator() {
    document.getElementById('aiTyping').style.display = 'flex';
  }

  function hideTypingIndicator() {
    document.getElementById('aiTyping').style.display = 'none';
  }

  function generateAiResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('penthouse') || q.includes('vrh') || q.includes('pogled')) {
      return `Na osnovu vašeg upita pronašao sam <span class="highlight">2 idealna penthouse-a</span>:<br><br>
        🏛 <span class="highlight">Sky Penthouse</span> — Centar, 185m², panoramski pogled<br>
        🌅 <span class="highlight">Sunset Terrace</span> — 195m², ekskluzivna terasa<br><br>
        Obe nekretnine imaju pogled na grad i premium završnu obradu. Želite više detalja?`;
    } else if (q.includes('vila') || q.includes('bazen') || q.includes('kuć')) {
      return `Pronašao sam savršenu nekretninu za vas:<br><br>
        🏡 <span class="highlight">Villa Panorama</span> — Fruška Gora, 340m², infinity bazen<br>
        🌊 <span class="highlight">Waterfront Rezidencija</span> — Dunavski kej, 310m², privatni pristup vodi<br><br>
        Obe vile nude maksimalnu privatnost i luksuz. Kontaktirajte nas za zakazivanje razgledanja.`;
    } else if (q.includes('duplex') || q.includes('dva nivoa') || q.includes('sprat')) {
      return `Za ljubitelje duplex prostora, preporučujem:<br><br>
        🎨 <span class="highlight">Art Duplex Rezidencija</span> — Grbavica, 220m², galerijski dizajn<br><br>
        Ovaj jedinstveni prostor kombinuje modernu umetnost sa vrhunskim materijalima. Idealan za one koji cene originalnost.`;
    } else {
      return `Hvala na upitu! Na osnovu "<span class="highlight">${query}</span>", pretražujem našu bazu od <span class="highlight">45+ premium nekretnina</span>.<br><br>
        Za najdetaljnije rezultate, predlažem da zakažete besplatnu konsultaciju sa našim timom koji će personalizovati pretragu prema vašim specifičnim željama.<br><br>
        📞 Pozovite nas: <span class="highlight">064/333/5757</span>`;
    }
  }

  // -------- Contact Form --------
  const contactForm = document.getElementById('contactForm');
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-EOvcwDJ7oZ-KHPgTVmHrCEZYnqxzkHHx9AdQyKgNa7d-o1-eiSme_LAsl8eKwclU/exec';

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Šalje se...';
    submitBtn.style.opacity = '0.7';
    submitBtn.disabled = true;

    // Prikupi podatke
    const formData = {
      ime: document.getElementById('contactName').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      telefon: document.getElementById('contactPhone').value.trim(),
      kategorija: document.getElementById('contactInterest').value,
      poruka: document.getElementById('contactMessage').value.trim(),
      datum: new Date().toLocaleString('sr-RS')
    };

    // Pošalji kao GET request (sa timestamp-om da browser ne kešira)
    formData._t = Date.now();
    const params = new URLSearchParams(formData).toString();
    const img = new Image();
    img.src = GOOGLE_SCRIPT_URL + '?' + params;

    // Prikaži uspeh odmah (kratka pauza samo za vizuelni feedback)
    setTimeout(() => {
      submitBtn.textContent = '✓ Uspešno Poslato!';
      submitBtn.style.opacity = '1';
      submitBtn.style.background = 'linear-gradient(135deg, #2a7a2a, #3d9d3d)';

      // Meta Pixel — Lead event
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: formData.kategorija || 'Kontakt forma',
          content_category: 'Website Lead'
        });
      }

      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    }, 300);
  });

  // -------- Back to Top --------
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // -------- Smooth Scroll for Anchor Links --------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // -------- Hero Scroll Indicator --------
  const heroScroll = document.getElementById('heroScroll');
  if (heroScroll) {
    heroScroll.addEventListener('click', () => {
      const nextSection = document.querySelector('.stats-bar');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // -------- Intersection Observer for Gold Line Animation --------
  const goldLines = document.querySelectorAll('.gold-line');
  const lineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = '60px';
        entry.target.style.transition = 'width 1s cubic-bezier(0.16, 1, 0.3, 1)';
      }
    });
  }, { threshold: 0.5 });

  goldLines.forEach(line => {
    line.style.width = '0';
    lineObserver.observe(line);
  });

  // -------- Hero Floating Particles --------
  function initHeroParticles() {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
      const hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
        // Stagger initial y positions
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = Math.random() * 0.4 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.15;
        this.fadeSpeed = Math.random() * 0.003 + 0.001;
        this.wobbleAmp = Math.random() * 0.8 + 0.2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.005;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.life = 0;
        this.maxLife = Math.random() * 600 + 300;

        // Gold color variations
        const goldVariants = [
          { r: 212, g: 175, b: 55 },
          { r: 232, g: 212, b: 139 },
          { r: 184, g: 148, b: 31 },
          { r: 247, g: 231, b: 206 },
          { r: 255, g: 223, b: 120 }
        ];
        this.color = goldVariants[Math.floor(Math.random() * goldVariants.length)];
      }

      update() {
        this.life++;
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.life * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp * 0.1;

        // Fade in and out over life
        const lifeRatio = this.life / this.maxLife;
        if (lifeRatio < 0.1) {
          this.currentOpacity = this.opacity * (lifeRatio / 0.1);
        } else if (lifeRatio > 0.8) {
          this.currentOpacity = this.opacity * (1 - (lifeRatio - 0.8) / 0.2);
        } else {
          this.currentOpacity = this.opacity;
        }

        // Twinkle effect
        this.currentOpacity *= 0.7 + Math.sin(this.life * 0.05) * 0.3;

        if (this.y < -10 || this.life >= this.maxLife) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`;
        ctx.fill();

        // Glow effect for larger particles
        if (this.size > 1.5) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity * 0.1})`;
          ctx.fill();
        }
      }
    }

    // Create particles
    const particleCount = window.innerWidth < 768 ? 25 : 50;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    }

    // Only animate when hero is visible (performance)
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate();
        } else {
          cancelAnimationFrame(animationId);
        }
      });
    }, { threshold: 0 });

    heroObserver.observe(canvas.parentElement);
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
