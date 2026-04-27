/* ============================================
   APEX — Property Detail Page Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Gallery ---
  const images = [
    'assets/images/properties/stan-centar-1/1.jpg',
    'assets/images/properties/stan-centar-1/2.jpg',
    'assets/images/properties/stan-centar-1/3.jpg',
    'assets/images/properties/stan-centar-1/4.jpg',
    'assets/images/properties/stan-centar-1/5.jpg',
    'assets/images/properties/stan-centar-1/6.jpg',
    'assets/images/properties/stan-centar-1/7.jpg',
    'assets/images/properties/stan-centar-1/8.jpg',
    'assets/images/properties/stan-centar-1/9.jpg',
    'assets/images/properties/stan-centar-1/10.jpg',
    'assets/images/properties/stan-centar-1/11.jpg',
    'assets/images/properties/stan-centar-1/12.jpg'
  ];

  let currentIndex = 0;
  const mainImg = document.getElementById('galleryMainImg');
  const counter = document.getElementById('galleryCounter');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');

  function showImage(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    currentIndex = index;

    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = images[currentIndex];
      mainImg.style.opacity = '1';
    }, 200);

    counter.textContent = `${currentIndex + 1} / ${images.length}`;

    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === currentIndex);
    });

    // Scroll active thumb into view
    const activeThumb = thumbs[currentIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.index);
      showImage(idx);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === 'Escape' && lightbox) closeLightbox();
  });

  // Touch swipe
  let touchStartX = 0;
  const galleryMain = document.querySelector('.gallery-main');
  if (galleryMain) {
    galleryMain.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryMain.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showImage(currentIndex + 1);
        else showImage(currentIndex - 1);
      }
    }, { passive: true });
  }

  // --- Lightbox ---
  let lightbox = null;

  function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close">&times;</button>
      <img src="" alt="Uvećana slika">
    `;
    document.body.appendChild(lightbox);

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function openLightbox() {
    if (!lightbox) createLightbox();
    lightbox.querySelector('img').src = images[currentIndex];
    requestAnimationFrame(() => lightbox.classList.add('active'));
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mainImg) {
    mainImg.addEventListener('click', openLightbox);
  }

  // --- Navbar scroll ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // --- Back to top ---
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 300);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
