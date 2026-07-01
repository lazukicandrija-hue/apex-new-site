/* APEX — Novogradnja Project Detail JS */
document.addEventListener('DOMContentLoaded', function() {

  // Mobile Nav
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });
  }
  var navItems = document.querySelectorAll('[data-nav]');
  for (var n = 0; n < navItems.length; n++) {
    navItems[n].addEventListener('click', function() {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  // Gallery — single image, no carousel needed

  // Scroll Reveal
  var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) {
          entries[e].target.classList.add('visible');
          observer.unobserve(entries[e].target);
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    for (var r = 0; r < revealEls.length; r++) {
      observer.observe(revealEls[r]);
    }
  } else {
    // Fallback: show all elements immediately on older browsers
    for (var f = 0; f < revealEls.length; f++) {
      revealEls[f].classList.add('visible');
    }
  }

  // Back to Top
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Inquiry Form Submit
  var inquiryForm = document.getElementById('inquiryForm');
  var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-EOvcwDJ7oZ-KHPgTVmHrCEZYnqxzkHHx9AdQyKgNa7d-o1-eiSme_LAsl8eKwclU/exec';

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var submitBtn = inquiryForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;

      submitBtn.textContent = 'Šalje se...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      // Prikupi podatke
      var formData = {
        ime: (document.getElementById('inquiryName') || {}).value || '',
        telefon: (document.getElementById('inquiryPhone') || {}).value || '',
        email: (document.getElementById('inquiryEmail') || {}).value || '',
        poruka: (document.getElementById('inquiryMessage') || {}).value || '',
        kategorija: 'Novogradnja — ' + (document.title.split('—')[0] || '').trim(),
        datum: new Date().toLocaleString('sr-RS'),
        _t: Date.now()
      };

      // Pošalji
      var params = '';
      for (var key in formData) {
        if (formData.hasOwnProperty(key)) {
          if (params) params += '&';
          params += encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]);
        }
      }
      var img = new Image();
      img.src = GOOGLE_SCRIPT_URL + '?' + params;

      // Prikaži uspeh odmah
      setTimeout(function() {
        submitBtn.textContent = '✓ Uspešno Poslato!';
        submitBtn.style.opacity = '1';
        submitBtn.style.background = 'linear-gradient(135deg, #2a7a2a, #3d9d3d)';
        submitBtn.style.borderColor = '#3d9d3d';

        // Meta Pixel — Lead event
        if (typeof fbq === 'function') {
          fbq('track', 'Lead', {
            content_name: formData.kategorija || 'Novogradnja upit',
            content_category: 'Novogradnja Lead'
          });
        }

        setTimeout(function() {
          inquiryForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
          submitBtn.disabled = false;
        }, 3000);
      }, 300);
    });
  }
});
