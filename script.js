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
  const propertyCards = document.querySelectorAll('.property-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      propertyCards.forEach((card, index) => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter || category === 'all') {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.display = 'block';

          setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 80);
        } else {
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

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

  // AI Search button
  const aiSearchBtn = document.getElementById('aiSearchBtn');
  aiSearchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      // Skroluj do AI sekcije da korisnik vidi odgovor
      const aiSection = document.getElementById('ai-engine');
      if (aiSection) {
        const headerOffset = 80;
        const elementPosition = aiSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
      searchInput.blur();

      // Add user message to AI conversation
      setTimeout(() => {
        addAiMessage(query, 'user');
        showTypingIndicator();

        setTimeout(() => {
          hideTypingIndicator();
          const response = generateAiResponse(query);
          addAiMessage(response, 'bot');
        }, 2000);
      }, 800);
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

    // Prikaži uspeh
    setTimeout(() => {
      submitBtn.textContent = '✓ Uspešno Poslato!';
      submitBtn.style.opacity = '1';
      submitBtn.style.background = 'linear-gradient(135deg, #2a7a2a, #3d9d3d)';

      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    }, 1500);
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
