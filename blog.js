(function() {
  'use strict';

  // ===== Determine page type =====
  var isBlogPost = window.location.pathname.indexOf('blog-post') !== -1;
  var isBlogListing = window.location.pathname.indexOf('blog.html') !== -1 || 
                       (window.location.pathname.endsWith('/blog') );

  // ===== Mobile Nav Toggle =====
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    document.querySelectorAll('[data-nav]').forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // ===== Scroll Reveal =====
  function initRevealObserver() {
    var reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      reveals.forEach(function(el) { observer.observe(el); });
    } else {
      reveals.forEach(function(el) { el.classList.add('visible'); });
    }
  }

  // ===== Back to Top =====
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Star SVG helper =====
  var starSVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="#D4AF37" color="#D4AF37"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

  // ===== Create Blog Card HTML =====
  function createBlogCard(post) {
    var card = document.createElement('a');
    card.href = 'blog-post.html?slug=' + post.slug;
    card.className = 'blog-card reveal visible';
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';
    card.innerHTML = 
      '<div class="blog-img"><img src="' + post.image + '" alt="' + post.title + '" loading="lazy"></div>' +
      '<div class="blog-content">' +
        '<div class="blog-meta">' +
          '<span class="blog-category">' + post.category + '</span>' +
          '<span class="blog-date">' + post.dateFormatted + '</span>' +
        '</div>' +
        '<h3 class="blog-title">' + post.title + '</h3>' +
        '<p class="blog-excerpt">' + post.excerpt + '</p>' +
        '<span class="blog-link">Pročitajte više <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>' +
      '</div>';
    return card;
  }

  // ===== BLOG LISTING PAGE =====
  if (isBlogListing) {
    var grid = document.getElementById('blogGrid');
    var filterBtns = document.querySelectorAll('.blog-filter-btn');

    if (grid && typeof BLOG_POSTS !== 'undefined') {
      // Render all posts
      BLOG_POSTS.forEach(function(post) {
        var card = createBlogCard(post);
        card.dataset.category = post.category;
        grid.appendChild(card);
      });

      // Filter functionality
      filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          filterBtns.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');

          var filter = btn.dataset.filter;
          var cards = grid.querySelectorAll('.blog-card');
          var visibleCount = 0;

          cards.forEach(function(card, i) {
            if (filter === 'all' || card.dataset.category === filter) {
              card.style.display = '';
              card.style.animationDelay = (visibleCount * 0.08) + 's';
              visibleCount++;
            } else {
              card.style.display = 'none';
            }
          });

          // Show/hide no results
          var noResults = document.getElementById('blogNoResults');
          if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
          }
        });
      });
    }
  }

  // ===== BLOG POST PAGE =====
  if (isBlogPost) {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    var post = null;

    if (typeof BLOG_POSTS !== 'undefined' && slug) {
      post = BLOG_POSTS.find(function(p) { return p.slug === slug; });
    }

    if (post) {
      // Set page title and meta
      document.title = post.title + ' | APEX Real Estate Blog';
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', post.metaDescription);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', post.title);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', post.metaDescription);

      // Set hero
      var heroImg = document.getElementById('postHeroImg');
      if (heroImg) heroImg.src = post.image;
      var heroCategory = document.getElementById('postCategory');
      if (heroCategory) heroCategory.textContent = post.category;
      var heroTitle = document.getElementById('postTitle');
      if (heroTitle) heroTitle.textContent = post.title;
      var postDate = document.getElementById('postDate');
      if (postDate) postDate.textContent = post.dateFormatted;
      var postAuthor = document.getElementById('postAuthor');
      if (postAuthor) postAuthor.textContent = post.author;
      var postReadTime = document.getElementById('postReadTime');
      if (postReadTime) postReadTime.textContent = post.readTime + ' čitanja';

      // Set breadcrumb
      var breadcrumbTitle = document.getElementById('breadcrumbTitle');
      if (breadcrumbTitle) breadcrumbTitle.textContent = post.title;

      // Set content
      var contentEl = document.getElementById('blogPostContent');
      if (contentEl) contentEl.innerHTML = post.content;

      // Set tags
      var tagsEl = document.getElementById('postTags');
      if (tagsEl && post.tags) {
        post.tags.forEach(function(tag) {
          var tagEl = document.createElement('span');
          tagEl.className = 'blog-tag';
          tagEl.textContent = tag;
          tagsEl.appendChild(tagEl);
        });
      }

      // Render related posts
      var relatedGrid = document.getElementById('relatedPosts');
      if (relatedGrid) {
        var related = BLOG_POSTS.filter(function(p) { return p.slug !== slug; }).slice(0, 2);
        related.forEach(function(rPost) {
          relatedGrid.appendChild(createBlogCard(rPost));
        });
      }

      // Inject JSON-LD structured data
      var jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.metaDescription,
        "image": window.location.origin + '/' + post.image,
        "datePublished": post.date,
        "dateModified": post.date,
        "author": {
          "@type": "Organization",
          "name": "APEX Real Estate",
          "url": "https://www.apexrealestate.rs"
        },
        "publisher": {
          "@type": "Organization",
          "name": "APEX Real Estate",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.apexrealestate.rs/logo/apex-logo-transparent.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": window.location.href
        },
        "keywords": post.tags.join(', ')
      };
      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);

      // Show post content, hide not found
      var postContent = document.getElementById('postContentWrap');
      if (postContent) postContent.style.display = '';
      var notFound = document.getElementById('postNotFound');
      if (notFound) notFound.style.display = 'none';

    } else {
      // Post not found
      var postContent = document.getElementById('postContentWrap');
      if (postContent) postContent.style.display = 'none';
      var notFound = document.getElementById('postNotFound');
      if (notFound) notFound.style.display = '';
    }
  }

  // ===== Init =====
  document.addEventListener('DOMContentLoaded', function() {
    initRevealObserver();
  });

  // Run immediately if DOM already loaded
  if (document.readyState !== 'loading') {
    initRevealObserver();
  }

})();
