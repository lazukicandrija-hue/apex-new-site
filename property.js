/* ============================================
   APEX — Property Detail Page Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Check if this is a CRM-loaded property (has ?id= in URL)
  const isCRMProperty = new URLSearchParams(window.location.search).has('id');

  // --- Gallery ---
  // For CRM properties, the inline script in property.html handles gallery setup.
  // This script only handles the hardcoded property page (property-stan-centar.html).
  const hardcodedImages = [
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

  // Use the globally set CRM images if available, otherwise use hardcoded
  // The inline script in property.html sets window._galleryImages when CRM data loads
  let galleryImages = null;
  let currentIndex = 0;
  const mainImg = document.getElementById('galleryMainImg');
  const counter = document.getElementById('galleryCounter');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');

  function getImages() {
    // For CRM properties, use the images loaded by inline script
    // They are stored in the img src and thumbnail elements
    if (isCRMProperty) return null; // Don't override CRM gallery
    return hardcodedImages;
  }

  function showImage(index) {
    const images = galleryImages;
    if (!images || !mainImg) return;

    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    currentIndex = index;

    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = images[currentIndex];
      mainImg.style.opacity = '1';
    }, 200);

    if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;

    const thumbs = document.querySelectorAll('.gallery-thumb');
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === currentIndex);
    });

    // Scroll active thumb into view
    const activeThumb = thumbs[currentIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // Only set up hardcoded gallery controls for NON-CRM pages
  if (!isCRMProperty) {
    galleryImages = hardcodedImages;

    if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

    const thumbs = document.querySelectorAll('.gallery-thumb');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.index);
        showImage(idx);
      });
    });

    // Expose sync function for lightbox to update gallery
    window._syncGalleryToIndex = (idx) => {
      if (idx >= 0 && idx < galleryImages.length) {
        showImage(idx);
      }
    };
  }

  // Keyboard navigation for gallery (only when lightbox is NOT open)
  document.addEventListener('keydown', (e) => {
    if (isCRMProperty) return; // CRM gallery handles its own events
    // Don't navigate gallery if lightbox is open (lightbox handles its own keys)
    const lb = document.querySelector('.lightbox.active');
    if (lb) return;
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  // Touch swipe (only for hardcoded property pages)
  let touchStartX = 0;
  const galleryMain = document.querySelector('.gallery-main');
  if (galleryMain && !isCRMProperty) {
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

  // --- Lightbox with full navigation ---
  let lightbox = null;
  let lightboxIndex = 0;
  let lightboxTouchStartX = 0;

  function getLightboxImages() {
    // Gather all images from the gallery thumbnails (works for both CRM and hardcoded)
    const thumbImgs = document.querySelectorAll('.gallery-thumb img');
    if (thumbImgs.length > 0) {
      return Array.from(thumbImgs).map(img => img.src);
    }
    // Fallback: if no thumbs, try the main image
    if (mainImg && mainImg.src) return [mainImg.src];
    return [];
  }

  function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close">&times;</button>
      <button class="lightbox-nav lightbox-nav-prev" aria-label="Prethodna slika">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="lightbox-img-wrapper">
        <img src="" alt="Uvećana slika" class="lightbox-image">
      </div>
      <button class="lightbox-nav lightbox-nav-next" aria-label="Sledeća slika">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <span class="lightbox-counter"></span>
    `;
    document.body.appendChild(lightbox);

    // Close button
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

    // Click on backdrop closes
    lightbox.querySelector('.lightbox-img-wrapper').addEventListener('click', (e) => {
      if (e.target.classList.contains('lightbox-img-wrapper')) closeLightbox();
    });

    // Navigation buttons
    lightbox.querySelector('.lightbox-nav-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxNavigate(-1);
    });
    lightbox.querySelector('.lightbox-nav-next').addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxNavigate(1);
    });

    // Touch swipe on lightbox (entire lightbox, not just wrapper, for better mobile UX)
    lightbox.addEventListener('touchstart', (e) => {
      lightboxTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const diff = lightboxTouchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) lightboxNavigate(1);
        else lightboxNavigate(-1);
      }
    }, { passive: true });

    // Prevent background scroll when swiping in lightbox
    lightbox.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  function lightboxNavigate(direction) {
    const images = getLightboxImages();
    if (images.length <= 1) return;
    lightboxIndex = (lightboxIndex + direction + images.length) % images.length;
    updateLightboxImage(images);
  }

  function updateLightboxImage(images) {
    if (!lightbox) return;
    const img = lightbox.querySelector('.lightbox-image');
    const counterEl = lightbox.querySelector('.lightbox-counter');

    // Crossfade
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = images[lightboxIndex];
      img.style.opacity = '1';
    }, 150);

    if (counterEl) {
      counterEl.textContent = `${lightboxIndex + 1} / ${images.length}`;
    }

    // Also sync the gallery below (so when you close, it shows the same image)
    if (typeof window._syncGalleryToIndex === 'function') {
      window._syncGalleryToIndex(lightboxIndex);
    }
  }

  function openLightbox(startIndex) {
    if (!lightbox) createLightbox();
    const images = getLightboxImages();
    if (images.length === 0) return;

    // Determine starting index
    if (typeof startIndex === 'number') {
      lightboxIndex = startIndex;
    } else if (mainImg && mainImg.src) {
      // Find current main image in the array
      const idx = images.indexOf(mainImg.src);
      lightboxIndex = idx >= 0 ? idx : 0;
    } else {
      lightboxIndex = 0;
    }

    const img = lightbox.querySelector('.lightbox-image');
    img.src = images[lightboxIndex];
    img.style.opacity = '1';

    const counterEl = lightbox.querySelector('.lightbox-counter');
    if (counterEl) {
      counterEl.textContent = `${lightboxIndex + 1} / ${images.length}`;
    }

    // Hide nav if only one image
    const prevBtn = lightbox.querySelector('.lightbox-nav-prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav-next');
    if (prevBtn) prevBtn.style.display = images.length <= 1 ? 'none' : '';
    if (nextBtn) nextBtn.style.display = images.length <= 1 ? 'none' : '';
    if (counterEl) counterEl.style.display = images.length <= 1 ? 'none' : '';

    requestAnimationFrame(() => lightbox.classList.add('active'));
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Make openLightbox available globally for CRM inline script
  window._openLightbox = openLightbox;

  if (mainImg) {
    mainImg.addEventListener('click', () => openLightbox());
  }

  // Keyboard: arrows navigate, escape closes
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNavigate(-1);
    if (e.key === 'ArrowRight') lightboxNavigate(1);
  });

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
