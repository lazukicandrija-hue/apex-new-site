/* APEX — Novogradnja Project Detail JS */
document.addEventListener('DOMContentLoaded', () => {

  // Mobile Nav
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

  // Gallery — single image, no carousel needed

  // Scroll Reveal
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => observer.observe(el));

  // Back to Top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Inquiry Form Submit
  const inquiryForm = document.getElementById('inquiryForm');
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-EOvcwDJ7oZ-KHPgTVmHrCEZYnqxzkHHx9AdQyKgNa7d-o1-eiSme_LAsl8eKwclU/exec';

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'Šalje se...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      // Prikupi podatke
      const formData = {
        ime: (document.getElementById('inquiryName') || {}).value || '',
        telefon: (document.getElementById('inquiryPhone') || {}).value || '',
        email: (document.getElementById('inquiryEmail') || {}).value || '',
        poruka: (document.getElementById('inquiryMessage') || {}).value || '',
        kategorija: 'Novogradnja — ' + (document.title.split('—')[0] || '').trim(),
        datum: new Date().toLocaleString('sr-RS'),
        _t: Date.now()
      };

      // Pošalji
      const params = new URLSearchParams(formData).toString();
      const img = new Image();
      img.src = GOOGLE_SCRIPT_URL + '?' + params;

      // Prikaži uspeh odmah
      setTimeout(() => {
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

        setTimeout(() => {
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
