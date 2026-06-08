/**
 * CLAUSTRO — Interactive Layer
 * Agente de Interactividad
 *
 * Modules:
 *  1. Navbar scroll behavior
 *  2. Mobile menu toggle
 *  3. Smooth scroll (anchor links)
 *  4. Scroll reveal (IntersectionObserver)
 *  5. Animated stat counters
 *  6. Hero parallax (subtle)
 *  7. Mockup bar animation on scroll
 */

'use strict';

/* ----------------------------------------------------------------
   Utility: runs callback once DOM is ready
---------------------------------------------------------------- */
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function () {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initStatCounters();
  initHeroParallax();
  initLightbox();
});

/* ================================================================
   1. NAVBAR — sticky scroll behavior
================================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > 20) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }

    lastScroll = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  updateNavbar();
}

/* ================================================================
   2. MOBILE MENU — toggle
================================================================ */
function initMobileMenu() {
  const burger     = document.getElementById('burgerBtn');
  const menu       = document.getElementById('mobileMenu');
  const menuLinks  = document.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');

  if (!burger || !menu) return;

  function openMenu() {
    menu.hidden = false;
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.hidden = true;
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function () {
    const isOpen = !menu.hidden;
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a link is clicked
  menuLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) {
      closeMenu();
      burger.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== burger && !burger.contains(e.target)) {
      closeMenu();
    }
  });
}

/* ================================================================
   3. SMOOTH SCROLL — native fallback for older browsers
================================================================ */
function initSmoothScroll() {
  // If CSS scroll-behavior is not supported, implement manually
  if (CSS.supports('scroll-behavior', 'smooth')) return;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ================================================================
   4. SCROLL REVEAL — IntersectionObserver
================================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after first reveal for performance
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

/* ================================================================
   5. STAT COUNTERS — animated numbers on scroll
================================================================ */
function initStatCounters() {
  const stats = document.querySelectorAll('.stat__num[data-target]');
  if (!stats.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stats.forEach(function (el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      el.textContent = target + suffix;
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(function (el) {
    observer.observe(el);
  });
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800; // ms
  const startTime = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function step(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutQuart(progress);
    const current  = Math.round(eased * target);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(step);
}

/* ================================================================
   6. HERO PARALLAX — subtle depth effect on scroll
================================================================ */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Only on desktop (avoid jank on mobile)
  const mq = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  if (!mq.matches) return;

  const orbs    = hero.querySelectorAll('.hero__orb');
  const title   = hero.querySelector('.hero__title');
  const subtitle = hero.querySelector('.hero__subtitle');

  let ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        const scrollY = window.scrollY;
        const heroH   = hero.offsetHeight;

        if (scrollY > heroH) {
          ticking = false;
          return;
        }

        const progress = scrollY / heroH;

        orbs.forEach(function (orb, i) {
          const speed = 0.15 + i * 0.08;
          orb.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
        });

        if (title) {
          title.style.transform = 'translateY(' + (scrollY * 0.1) + 'px)';
          title.style.opacity   = String(1 - progress * 1.2);
        }

        if (subtitle) {
          subtitle.style.transform = 'translateY(' + (scrollY * 0.07) + 'px)';
          subtitle.style.opacity   = String(1 - progress * 1.4);
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ================================================================
   7. LIGHTBOX — open gallery images full screen
================================================================ */
function initLightbox() {
  var lightbox      = document.getElementById('lightbox');
  var lbBackdrop    = document.getElementById('lightboxBackdrop');
  var lbClose       = document.getElementById('lightboxClose');
  var lbPrev        = document.getElementById('lightboxPrev');
  var lbNext        = document.getElementById('lightboxNext');
  var lbImg         = document.getElementById('lightboxImg');
  var lbTitle       = document.getElementById('lightboxTitle');
  var lbSub         = document.getElementById('lightboxSub');
  var lbDots        = document.getElementById('lightboxDots');

  if (!lightbox) return;

  // Collect all gallery items
  var items = Array.from(document.querySelectorAll('.galeria__item'));
  var currentIndex = 0;

  function getItemData(item) {
    var img     = item.querySelector('img');
    var title   = item.querySelector('.galeria__caption-title');
    var sub     = item.querySelector('.galeria__caption-sub');
    return {
      src:   img   ? img.src   : '',
      alt:   img   ? img.alt   : '',
      title: title ? title.textContent : '',
      sub:   sub   ? sub.textContent   : ''
    };
  }

  function buildDots() {
    lbDots.innerHTML = '';
    items.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'lightbox__dot' + (i === currentIndex ? ' lightbox__dot--active' : '');
      dot.setAttribute('aria-label', 'Ir a imagen ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      lbDots.appendChild(dot);
    });
  }

  function updateDots() {
    Array.from(lbDots.querySelectorAll('.lightbox__dot')).forEach(function (dot, i) {
      dot.classList.toggle('lightbox__dot--active', i === currentIndex);
    });
  }

  function show(index) {
    currentIndex = (index + items.length) % items.length;
    var data = getItemData(items[currentIndex]);

    // Animate image swap
    lbImg.style.opacity   = '0';
    lbImg.style.transform = 'scale(0.97)';

    setTimeout(function () {
      lbImg.src   = data.src;
      lbImg.alt   = data.alt;
      lbTitle.textContent = data.title;
      lbSub.textContent   = data.sub;
      lbImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      lbImg.style.opacity   = '1';
      lbImg.style.transform = 'scale(1)';
      updateDots();
    }, 120);

    // Show/hide nav arrows
    lbPrev.style.display = items.length > 1 ? '' : 'none';
    lbNext.style.display = items.length > 1 ? '' : 'none';
  }

  function goTo(index) {
    show(index);
  }

  function open(index) {
    currentIndex = index;
    var data = getItemData(items[currentIndex]);
    lbImg.src   = data.src;
    lbImg.alt   = data.alt;
    lbTitle.textContent = data.title;
    lbSub.textContent   = data.sub;
    lbImg.style.opacity   = '1';
    lbImg.style.transform = 'scale(1)';
    buildDots();
    lbPrev.style.display = items.length > 1 ? '' : 'none';
    lbNext.style.display = items.length > 1 ? '' : 'none';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  // Attach click to each gallery item
  items.forEach(function (item, i) {
    item.addEventListener('click', function () { open(i); });
  });

  // Controls
  lbClose.addEventListener('click', close);
  lbBackdrop.addEventListener('click', close);
  lbPrev.addEventListener('click', function (e) { e.stopPropagation(); show(currentIndex - 1); });
  lbNext.addEventListener('click', function (e) { e.stopPropagation(); show(currentIndex + 1); });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   show(currentIndex - 1);
    if (e.key === 'ArrowRight')  show(currentIndex + 1);
  });

  // Swipe support (touch)
  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? show(currentIndex + 1) : show(currentIndex - 1);
    }
  }, { passive: true });
}

/* ================================================================
   8. MOCKUP BAR ANIMATION — trigger on scroll visibility
================================================================ */
(function initMockupBars() {
  const fills = document.querySelectorAll('.solucion__mockup-fill');
  if (!fills.length) return;

  // Reset widths initially; CSS handles animation via keyframe
  // when the parent becomes visible via IntersectionObserver
  const wrapper = document.querySelector('.solucion__mockup');
  if (!wrapper) return;

  // Bars start at 0 via CSS, we add a class to trigger the keyframe
  wrapper.querySelectorAll('.solucion__mockup-fill').forEach(function (bar) {
    bar.style.width = '0';
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.solucion__mockup-fill').forEach(function (bar, i) {
            setTimeout(function () {
              bar.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
              bar.style.width = bar.style.getPropertyValue('--fill') || getComputedStyle(bar).getPropertyValue('--fill');
            }, i * 200);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(wrapper);
})();
