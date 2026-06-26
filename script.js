/**
 * ELIF & AHMET — PREMIUM WEDDING WEBSITE
 * script.js
 *
 * Features:
 *  1. Particle system (animated background)
 *  2. Mouse glow effect
 *  3. Navbar scroll behavior
 *  4. Hero parallax
 *  5. Countdown timer
 *  6. Intersection Observer (reveal animations)
 *  7. Photo gallery & lightbox modal
 *  8. RSVP form handling
 *  9. Background music toggle
 * 10. Floating buttons (scroll-to-top, hamburger)
 * 11. Back-to-top scroll awareness
 */

'use strict';

/* ============================================================
   1. PARTICLE SYSTEM
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  /** Resize canvas to match window */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /** Create a single particle */
  function createParticle() {
    return {
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.5 + 0.1,
      speed:   Math.random() * 0.4 + 0.1,
      angle:   Math.random() * Math.PI * 2,
      drift:   (Math.random() - 0.5) * 0.008,
    };
  }

  /** Initialize particles pool */
  function initPool() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 90);
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  /** Animation loop */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      // Move
      p.angle += p.drift;
      p.x += Math.cos(p.angle) * p.speed;
      p.y -= p.speed * 0.6; // float upward slightly

      // Wrap around
      if (p.y < -5) p.y = canvas.height + 5;
      if (p.x < -5) p.x = canvas.width + 5;
      if (p.x > canvas.width + 5) p.x = -5;

      // Draw gold sparkle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`;
      ctx.fill();
    });

    animFrame = requestAnimationFrame(draw);
  }

  // Init
  resize();
  initPool();
  draw();

  window.addEventListener('resize', () => {
    resize();
    initPool();
  });
})();


/* ============================================================
   2. MOUSE GLOW EFFECT
   ============================================================ */
(function initMouseGlow() {
  const glow = document.getElementById('mouse-glow');
  if (!glow) return;

  let mouseX = -1000, mouseY = -1000;
  let glowX  = -1000, glowY  = -1000;
  let raf;

  // Track mouse
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth follow
  function updateGlow() {
    const ease = 0.07;
    glowX += (mouseX - glowX) * ease;
    glowY += (mouseY - glowY) * ease;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    raf = requestAnimationFrame(updateGlow);
  }
  updateGlow();

  // Hide on touch devices
  window.addEventListener('touchstart', () => {
    glow.style.display = 'none';
    cancelAnimationFrame(raf);
  }, { once: true });
})();


/* ============================================================
   3. NAVBAR — SCROLL BEHAVIOR & HAMBURGER
   ============================================================ */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  /** Add 'scrolled' class past 60px */
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check

  /** Toggle hamburger menu */
  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('open');
      toggleMenu(!isOpen);
    });
  }

  // Close on link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      toggleMenu(false);
    }
  });
})();


/* ============================================================
   4. HERO PARALLAX
   ============================================================ */
(function initParallax() {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg) return;

  // Use scroll-driven animation if available, otherwise use JS
  if (CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    // CSS scroll-driven animation handles it — skip JS
    return;
  }

  let ticking = false;

  function applyParallax() {
    const scrollY = window.scrollY;
    const heroHeight = heroBg.parentElement.offsetHeight;
    if (scrollY <= heroHeight) {
      heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
})();


/* ============================================================
   5. COUNTDOWN TIMER
   ============================================================ */
(function initCountdown() {
  const WEDDING_DATE = new Date('2027-06-21T14:00:00');

  const elDays    = document.getElementById('days');
  const elHours   = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');

  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  /** Pad number to 2 digits */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Animate number change */
  function animateChange(el, newVal) {
    if (el.textContent !== newVal) {
      el.textContent = newVal;
      el.classList.remove('animate');
      void el.offsetWidth; // reflow
      el.classList.add('animate');
    }
  }

  function updateCountdown() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      // Wedding day!
      elDays.textContent    = '00';
      elHours.textContent   = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    animateChange(elDays,    pad(days));
    animateChange(elHours,   pad(hours));
    animateChange(elMinutes, pad(minutes));
    animateChange(elSeconds, pad(seconds));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();


/* ============================================================
   6. INTERSECTION OBSERVER — REVEAL ANIMATIONS
   ============================================================ */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  revealEls.forEach((el) => observer.observe(el));
})();


/* ============================================================
   7. GALLERY & LIGHTBOX MODAL
   ============================================================ */
(function initGallery() {
  const modal      = document.getElementById('gallery-modal');
  const modalImg   = document.getElementById('modal-img');
  const modalCap   = document.getElementById('modal-caption');
  const btnClose   = document.getElementById('modal-close');
  const btnPrev    = document.getElementById('modal-prev');
  const btnNext    = document.getElementById('modal-next');
  const galleryBtns = Array.from(document.querySelectorAll('.gallery-btn'));

  if (!modal || !galleryBtns.length) return;

  let currentIndex = 0;

  /** Open modal with a given index */
  function openModal(index) {
    currentIndex = index;
    const btn = galleryBtns[index];
    modalImg.src = btn.dataset.img;
    modalImg.alt = btn.querySelector('img').alt;
    modalCap.textContent = btn.dataset.caption || '';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  /** Close modal */
  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    galleryBtns[currentIndex].focus();
  }

  /** Navigate */
  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryBtns.length) % galleryBtns.length;
    openModal(currentIndex);
  }
  function showNext() {
    currentIndex = (currentIndex + 1) % galleryBtns.length;
    openModal(currentIndex);
  }

  // Attach click on gallery buttons
  galleryBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => openModal(i));
  });

  // Controls
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnPrev)  btnPrev.addEventListener('click',  showPrev);
  if (btnNext)  btnNext.addEventListener('click',  showNext);

  // Backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Touch swipe support
  let touchStartX = 0;
  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  modal.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? showNext() : showPrev();
    }
  }, { passive: true });
})();


/* ============================================================
   8. RSVP FORM
   ============================================================ */
(function initRSVP() {
  const form        = document.getElementById('rsvp-form');
  const successMsg  = document.getElementById('form-success');
  const submitBtn   = document.getElementById('rsvp-submit');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name    = document.getElementById('rsvp-name');
    const phone   = document.getElementById('rsvp-phone');
    const attend  = form.querySelector('input[name="attend"]:checked');

    let valid = true;

    // Clear previous errors
    [name, phone].forEach(el => el.classList.remove('input-error'));

    if (!name.value.trim()) {
      name.classList.add('input-error');
      name.focus();
      valid = false;
    }

    if (!phone.value.trim()) {
      phone.classList.add('input-error');
      if (valid) phone.focus();
      valid = false;
    }

    if (!attend) {
      valid = false;
      // Highlight attend options
      const opts = form.querySelectorAll('.attend-btn');
      opts.forEach(opt => {
        opt.style.borderColor = 'rgba(200,80,80,0.6)';
        setTimeout(() => (opt.style.borderColor = ''), 2000);
      });
    }

    if (!valid) return;

    // Simulate submit (no backend)
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Gönderiliyor...';

    setTimeout(() => {
      // Hide form fields, show success
      Array.from(form.children).forEach((el) => {
        if (el !== successMsg) el.style.display = 'none';
      });
      successMsg.classList.add('show');
      successMsg.setAttribute('aria-hidden', 'false');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1200);
  });

  // Remove error highlight on input
  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
  });
})();


/* ============================================================
   9. BACKGROUND MUSIC
   ============================================================ */
(function initMusic() {
  const btnMusic  = document.getElementById('fab-music');
  const audioEl   = document.getElementById('bg-music');
  if (!btnMusic || !audioEl) return;

  // Use a free royalty-free romantic piano loop from a public CDN
  // (Fallback: silent if URL fails)
  audioEl.src = 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=romantic-piano-115382.mp3';

  let isPlaying = false;

  function toggleMusic() {
    if (isPlaying) {
      audioEl.pause();
      isPlaying = false;
      btnMusic.classList.remove('playing');
      btnMusic.setAttribute('aria-pressed', 'false');
      btnMusic.setAttribute('aria-label', 'Müziği oynat');
    } else {
      audioEl.play().then(() => {
        isPlaying = true;
        btnMusic.classList.add('playing');
        btnMusic.setAttribute('aria-pressed', 'true');
        btnMusic.setAttribute('aria-label', 'Müziği durdur');
      }).catch(() => {
        // Autoplay blocked or URL failed — silent fail
        console.info('Music playback blocked or unavailable.');
      });
    }
  }

  btnMusic.addEventListener('click', toggleMusic);

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying) {
      audioEl.pause();
    } else if (!document.hidden && isPlaying) {
      audioEl.play().catch(() => {});
    }
  });
})();


/* ============================================================
   10. SCROLL-TO-TOP & BACK-TO-TOP VISIBILITY
   ============================================================ */
(function initScrollTop() {
  const btnTop   = document.getElementById('fab-top');
  const sentinel = document.querySelector('.scroll-sentinel');

  if (!btnTop) return;

  // Use container-scroll-state-queries if supported
  if (CSS.supports('container-type', 'scroll-state')) {
    // CSS handles visibility; JS only handles the click
  } else {
    // IntersectionObserver fallback
    if (sentinel) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            btnTop.classList.add('visible');
            document.body.classList.add('scrolled');
          } else {
            btnTop.classList.remove('visible');
            document.body.classList.remove('scrolled');
          }
        });
      });
      observer.observe(sentinel);
    } else {
      // Simple scroll-based fallback
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          btnTop.classList.add('visible');
          document.body.classList.add('scrolled');
        } else {
          btnTop.classList.remove('visible');
          document.body.classList.remove('scrolled');
        }
      }, { passive: true });
    }
  }

  // Scroll-to-top click
  btnTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   11. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = 72; // --nav-height
        const targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });
})();


/* ============================================================
   12. INPUT ERROR STYLES (injected via JS so no flash)
   ============================================================ */
(function injectErrorStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .input-error {
      border-color: rgba(220, 80, 80, 0.7) !important;
      box-shadow: 0 0 0 3px rgba(220, 80, 80, 0.15) !important;
      animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   13. GOLDEN BORDER PULSE ON SECTION ENTRY
   (adds a shimmer to section-title on reveal)
   ============================================================ */
(function initSectionGlow() {
  const titles = document.querySelectorAll('.section-title');
  if (!titles.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  titles.forEach((t) => observer.observe(t));
})();


/* ============================================================
   14. PERFORMANCE: lazy-load images that miss native loading
   ============================================================ */
(function initLazyFallback() {
  if ('loading' in HTMLImageElement.prototype) return; // native support

  const imgs = document.querySelectorAll('img[loading="lazy"]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
        observer.unobserve(img);
      }
    });
  });
  imgs.forEach((img) => observer.observe(img));
})();
