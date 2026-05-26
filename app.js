/* =====================================================
   SOU KISEN · PORTFOLIO 2026
   Interactions: cursor / menu / page transitions / scroll
   ===================================================== */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  /* ---------- Custom Cursor ---------- */
  const cursor = $('#cursor');
  const ring = $('#cursorRing');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const tick = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    if (cursor) cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  // hover targets
  const hoverables = 'a, button, .card, .skill-grid li, .menu-list li, [data-target], .lightbox-trigger, .ft-slide, .photo-feature';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) ring?.classList.add('is-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) ring?.classList.remove('is-hover');
  });

  /* ---------- Menu Overlay ---------- */
  const menuBtn = $('#menuBtn');
  const menuOverlay = $('#menuOverlay');

  const openMenu = () => {
    menuOverlay.classList.add('is-open');
    menuBtn.classList.add('is-open');
    menuOverlay.setAttribute('aria-hidden', 'false');
  };
  const closeMenu = () => {
    menuOverlay.classList.remove('is-open');
    menuBtn.classList.remove('is-open');
    menuOverlay.setAttribute('aria-hidden', 'true');
  };
  menuBtn?.addEventListener('click', () => {
    menuOverlay.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  /* ---------- Page Transitions ---------- */
  const pageMask = $('#pageMask');
  const maskTarget = $('#maskTarget');
  const railCounter = $('#railCounter');
  const railBar = document.querySelector('.rail-bar i');

  const pages = {
    home:   { el: $('.page-home'),   label: 'PORTFOLIO',   idx: 1 },
    about:  { el: $('.page-home'),   label: 'ABOUT ME',    idx: 2, scrollTo: '#about' },
    photos: { el: $('.page-photos'), label: 'PHOTOGRAPHS', idx: 3 },
    arts:   { el: $('.page-arts'),   label: 'ARTS',        idx: 4 },
  };
  let current = 'home';

  const setActiveMenu = (target) => {
    $$('.menu-list li').forEach(li => {
      li.classList.toggle('is-active', li.dataset.target === target);
    });
  };
  const updateRail = (target) => {
    const p = pages[target];
    if (!p) return;
    if (railCounter) railCounter.textContent = `0${p.idx} / 04`;
    if (railBar) railBar.style.height = `${(p.idx / 4) * 100}%`;
  };

  const goTo = (target) => {
    const p = pages[target];
    if (!p) return;

    // Close menu (with a small delay so users see the click)
    if (menuOverlay.classList.contains('is-open')) {
      setTimeout(closeMenu, 80);
    }

    // Same "page-home" target: just scroll
    if (target === current && !p.scrollTo) return;
    if (p.el === pages[current].el && p.scrollTo) {
      const t = $(p.scrollTo);
      t?.scrollIntoView({ behavior: 'smooth' });
      current = target;
      setActiveMenu(target);
      updateRail(target);
      return;
    }

    // Full mask transition
    if (maskTarget) maskTarget.textContent = p.label;
    pageMask.classList.remove('is-out');
    pageMask.classList.add('is-in');

    setTimeout(() => {
      // swap pages
      $$('.page').forEach(pg => pg.classList.remove('is-active'));
      p.el.classList.add('is-active');
      window.scrollTo({ top: 0, behavior: 'instant' });

      // optional scroll target inside same page
      if (p.scrollTo) {
        setTimeout(() => $(p.scrollTo)?.scrollIntoView({ behavior: 'auto' }), 30);
      }

      current = target;
      setActiveMenu(target);
      updateRail(target);

      // exit mask
      requestAnimationFrame(() => {
        pageMask.classList.remove('is-in');
        pageMask.classList.add('is-out');
        setTimeout(() => pageMask.classList.remove('is-out'), 800);
      });
    }, 700);
  };

  // Menu link clicks
  $$('.menu-list li').forEach(li => {
    li.addEventListener('click', () => goTo(li.dataset.target));
  });
  // Brand → home
  $$('[data-target]').forEach(el => {
    if (el.matches('.menu-list li')) return;
    el.addEventListener('click', e => {
      e.preventDefault();
      goTo(el.dataset.target);
    });
  });

  // Scroll CTA
  $('#scrollCta')?.addEventListener('click', () => {
    $('#about')?.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Parallax: hexagon reacts to mouse ---------- */
  const hexStage = $('.hex-stage');
  if (hexStage) {
    window.addEventListener('mousemove', e => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      hexStage.style.transform = `translate(${dx * 14}px, ${dy * 14}px)`;
    });
  }

  /* ---------- Scroll progress on hero rail ---------- */
  const updateScrollBar = () => {
    if (!railBar || current !== 'home') return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(1, window.scrollY / max);
    const base = (pages.home.idx / 4) * 100;
    railBar.style.height = `${base + pct * (25)}%`;
  };
  window.addEventListener('scroll', updateScrollBar, { passive: true });

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('is-open')) closeMenu();
    if (e.key === 'm' || e.key === 'M') {
      menuOverlay.classList.contains('is-open') ? closeMenu() : openMenu();
    }
  });

  /* ---------- Lightbox ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbNum = $('#lbNum');
  const lbTitle = $('#lbTitle');
  const lbMeta = $('#lbMeta');
  const lbClose = $('#lbClose');
  const lbPrev = $('#lbPrev');
  const lbNext = $('#lbNext');

  let lbItems = [];
  let lbIndex = 0;

  const collectLbItems = () => {
    // Only collect triggers within the currently active page
    const activePage = $('.page.is-active');
    if (!activePage) return [];
    return [...activePage.querySelectorAll('.lightbox-trigger')];
  };

  const setLbContent = (el) => {
    if (!el) return;
    const src = el.dataset.src;
    if (!src) return;
    lbImg.src = src;
    lbNum.textContent = el.dataset.num || '';
    lbTitle.textContent = el.dataset.title || '';
    lbMeta.textContent = el.dataset.meta || '';
  };

  const openLb = (el) => {
    lbItems = collectLbItems();
    lbIndex = lbItems.indexOf(el);
    if (lbIndex < 0) lbIndex = 0;
    setLbContent(el);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const stepLb = (dir) => {
    if (!lbItems.length) return;
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    setLbContent(lbItems[lbIndex]);
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('.lightbox-trigger');
    if (t) {
      e.preventDefault();
      openLb(t);
    }
  });
  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); stepLb(-1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); stepLb(1); });
  lightbox.querySelector('.lb-bg').addEventListener('click', closeLb);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'ArrowRight') stepLb(1);
  });

  /* ---------- Featured horizontal scroll progress ---------- */
  const ftScroll = $('#ftScroll');
  const ftBar = $('#ftBar');
  const ftCounter = $('#ftCounter');
  if (ftScroll && ftBar && ftCounter) {
    const total = ftScroll.children.length;
    const updateFt = () => {
      const max = ftScroll.scrollWidth - ftScroll.clientWidth;
      const pct = max > 0 ? ftScroll.scrollLeft / max : 0;
      ftBar.style.left = `${pct * 82}%`;
      const idx = Math.min(total - 1, Math.round(pct * (total - 1))) + 1;
      ftCounter.textContent = `${String(idx).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    };
    ftScroll.addEventListener('scroll', updateFt, { passive: true });
    updateFt();

    // Drag-to-scroll for desktop
    let isDown = false, startX = 0, startLeft = 0;
    ftScroll.addEventListener('mousedown', (e) => {
      if (e.target.closest('.lightbox-trigger')) return;
      isDown = true; startX = e.pageX; startLeft = ftScroll.scrollLeft;
      ftScroll.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => { isDown = false; ftScroll.style.cursor = ''; });
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      ftScroll.scrollLeft = startLeft - (e.pageX - startX) * 1.4;
    });
  }

  /* ---------- Initial state ---------- */
  updateRail('home');
})();
