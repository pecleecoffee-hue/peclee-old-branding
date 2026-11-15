/* Peclee: accessible overlays, product discovery and motion controls. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const productPanel = byId('panel');
  const imageDialog = byId('lightbox');
  const menu = byId('sheet');
  const burger = byId('bg');
  const video = byId('heroVideo');
  const motionButton = byId('motion-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const filterBindings = new WeakSet();
  let filter = 'all';
  let activeLayer = null;
  let productTrigger = null;
  let imageTrigger = null;
  let reconcileQueued = false;
  const language = () => typeof L !== 'undefined' && L === 'ar' ? 'ar' : 'en';
  const isOpen = el => Boolean(el && el.classList.contains('open'));
  const visible = el => Boolean(el && el.isConnected && el.getClientRects().length &&
    !el.closest('[inert]') && getComputedStyle(el).visibility !== 'hidden');
  const focus = el => { if (visible(el)) el.focus({ preventScroll: true }); };
  const focusables = el => [...el.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )].filter(visible);

  if (productPanel) productPanel.setAttribute('aria-labelledby', 'p-name');
  if (imageDialog) {
    imageDialog.setAttribute('role', 'dialog');
    imageDialog.setAttribute('aria-modal', 'true');
  }
  if (menu) menu.setAttribute('aria-label', 'Main navigation');
  const gallery = byId('p-stage');
  if (gallery) {
    gallery.tabIndex = 0;
    gallery.setAttribute('role', 'button');
    gallery.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        gallery.click();
      }
    });
  }

  function updateSwatches() {
    document.querySelectorAll('.csw').forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('on')));
    });
  }

  const stateObserver = new MutationObserver(() => {
    updateSwatches();
    document.querySelectorAll('#p-stage>div,#lb-stage>div,.tcard .frames>div').forEach(frame => {
      frame.setAttribute('aria-hidden', String(!frame.classList.contains('on')));
    });
  });
  ['rail-in','rows','p-colors','p-stage','lb-stage'].forEach(id => {
    const root=byId(id);
    if(root) stateObserver.observe(root,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  });

  function restoreProductFocus() {
    if (visible(productTrigger)) return focus(productTrigger);
    const index = typeof P !== 'undefined' && typeof curP !== 'undefined' && curP
      ? P.findIndex(product => product.id === curP.id) : -1;
    const row = document.querySelector(`#rows .prow[data-i="${index}"]`);
    if (visible(row)) return focus(row);
    focus(document.querySelector('.hd .logo'));
  }

  function reconcileOverlays() {
    reconcileQueued = false;
    const zoomOpen = isOpen(imageDialog);
    const productOpen = isOpen(productPanel);
    const menuOpen = isOpen(menu);
    if (productPanel) {
      productPanel.inert = !productOpen || zoomOpen;
      productPanel.setAttribute('aria-hidden', String(!productOpen || zoomOpen));
    }
    if (imageDialog) {
      imageDialog.inert = !zoomOpen;
      imageDialog.setAttribute('aria-hidden', String(!zoomOpen));
    }
    if (menu) {
      menu.inert = !menuOpen || productOpen || zoomOpen;
      menu.setAttribute('aria-hidden', String(!menuOpen || productOpen || zoomOpen));
    }
    const anyOpen = zoomOpen || productOpen || menuOpen;
    const main = document.querySelector('main');
    const header = byId('hd');
    const footer = document.querySelector('footer');
    if (main) main.inert = anyOpen;
    if (header) header.inert = zoomOpen || productOpen;
    if (footer) footer.inert = anyOpen;
    if (burger) burger.setAttribute('aria-expanded', String(menuOpen));
    document.body.classList.toggle('lock', anyOpen);
    const nextLayer = zoomOpen ? imageDialog : productOpen ? productPanel : menuOpen ? menu : null;
    if (nextLayer !== activeLayer) {
      const previousLayer = activeLayer;
      if (nextLayer === imageDialog) imageTrigger = document.activeElement;
      activeLayer = nextLayer;
      if (nextLayer === imageDialog) focus(byId('lb-close'));
      else if (nextLayer === productPanel) {
        focus(previousLayer === imageDialog ? gallery : byId('x'));
      } else if (nextLayer === menu) focus(focusables(menu)[0]);
      else if (previousLayer === productPanel) restoreProductFocus();
      else if (previousLayer === imageDialog) restoreProductFocus();
      else if (previousLayer === menu) focus(burger);
    }
  }

  function queueReconcile() {
    if (reconcileQueued) return;
    reconcileQueued = true;
    queueMicrotask(reconcileOverlays);
  }

  const overlayObserver = new MutationObserver(queueReconcile);
  [productPanel, imageDialog, menu].filter(Boolean).forEach(el => {
    overlayObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
  });

  document.addEventListener('keydown', e => {
    if (!activeLayer) return;
    if (e.key === 'Escape' && activeLayer === menu) {
      menu.classList.remove('open');
      if (burger) burger.classList.remove('on');
      queueReconcile();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables(activeLayer);
    if (!items.length) {
      e.preventDefault();
      activeLayer.tabIndex = -1;
      focus(activeLayer);
      return;
    }
    const current = document.activeElement;
    const atStart = current === items[0];
    const atEnd = current === items[items.length - 1];
    if (!activeLayer.contains(current) || (e.shiftKey ? atStart : atEnd)) {
      e.preventDefault();
      focus(e.shiftKey ? items[items.length - 1] : items[0]);
    }
  }, true);

  document.addEventListener('click', e => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    if (target.closest('.csw')) queueMicrotask(updateSwatches);
    const trigger = target.closest('a.tcard-link, #rows .prow');
    if (trigger && !target.closest('.csw')) productTrigger = trigger;
  }, true);

  function applyFilters() {
    const rows = [...document.querySelectorAll('#rows .prow')];
    let count = 0;
    rows.forEach(row => {
      const product = typeof P !== 'undefined' ? P[Number(row.dataset.i)] : null;
      const art = product && product.art;
      const matches = filter === 'all' || (filter === 'pour' && art === 'kettle') ||
        (filter === 'grind' && art === 'grinder') ||
        (filter === 'weigh' && (art === 'scale' || art === 'mini'));
      row.hidden = !matches;
      row.style.display = matches ? '' : 'none';
      if (matches) count++;
    });
    document.querySelectorAll('.tool-filter[data-filter]').forEach(button => {
      const selected = button.dataset.filter === filter;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('active', selected);
      button.classList.toggle('on', selected);
      if (!filterBindings.has(button)) {
        filterBindings.add(button);
        button.addEventListener('click', () => { filter = button.dataset.filter; applyFilters(); });
      }
    });
    const counter = byId('filter-count');
    if (counter) {
      counter.setAttribute('role', 'status');
      counter.setAttribute('aria-live', 'polite');
      counter.textContent = language() === 'ar' ? `${count} أدوات` : `${count} ${count === 1 ? 'tool' : 'tools'}`;
    }
  }

  function updateMotionButton() {
    if (!motionButton || !video) return;
    const playing = !video.paused;
    const label = language() === 'ar'
      ? playing ? 'إيقاف الحركة' : 'تشغيل الحركة'
      : playing ? 'Pause motion' : 'Play motion';
    motionButton.setAttribute('aria-label', label);
    motionButton.setAttribute('aria-pressed', String(playing));
    motionButton.title = label;
    motionButton.textContent = label;
  }

  function localizeExtras() {
    const lang = language();
    // Render the source's decorative asterisk in the brand colour, avoiding emoji fonts.
    const statement = document.querySelector('.band [data-t="band"]');
    if (statement && !statement.querySelector('.band-ornament')) {
      statement.textContent = statement.textContent.replace(/✳[\uFE0E\uFE0F]?/g, '').trim() + ' ';
      const ornament = document.createElement('span');
      ornament.className = 'band-ornament';
      ornament.setAttribute('aria-hidden', 'true');
      for (let n = 0; n < 4; n++) ornament.appendChild(document.createElement('i'));
      statement.appendChild(ornament);
    }
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      el.textContent = el.dataset[lang];
    });
    if (imageDialog) imageDialog.setAttribute('aria-label', lang === 'ar' ? 'صورة المنتج' : 'Product image');
    if (gallery) gallery.setAttribute('aria-label', lang === 'ar' ? 'تكبير صورة المنتج' : 'Enlarge product image');
    if (menu) menu.setAttribute('aria-label', lang === 'ar' ? 'القائمة الرئيسية' : 'Main navigation');
    updateSwatches();
    applyFilters();
    updateMotionButton();
    queueReconcile();
  }

  if (typeof render === 'function') {
    const originalRender = render;
    render = function (...args) {
      const result = originalRender.apply(this, args);
      localizeExtras();
      return result;
    };
  }
  if (typeof router === 'function') {
    const originalRouter = router;
    router = function (...args) {
      const result = originalRouter.apply(this, args);
      const route=currentRoute().split('/').filter(Boolean);
      const product=route[0]==='tools' && P.find(p=>p.id===route[1]);
      document.title=product ? `${product.name[language()]} — Peclee` : ({tools:language()==='ar'?'الأدوات — بيكلي':'The tools — Peclee',about:language()==='ar'?'عن بيكلي':'Our approach — Peclee',contact:language()==='ar'?'تواصل معنا — بيكلي':'Say hello — Peclee'}[route[0]] || 'Peclee — For the love of brewing');
      applyFilters();
      queueReconcile();
      return result;
    };
  }
  if (typeof fillPanel === 'function') {
    const originalFillPanel = fillPanel;
    fillPanel = function (...args) {
      if (productPanel && !isOpen(productPanel)) {
        if (!visible(productTrigger)) productTrigger = document.activeElement;
        productPanel.inert = false;
      }
      const result = originalFillPanel.apply(this, args);
      updateSwatches();
      queueReconcile();
      return result;
    };
  }

  if (video) {
    video.addEventListener('play', updateMotionButton);
    video.addEventListener('pause', updateMotionButton);
    if (motionButton) motionButton.addEventListener('click', () => {
      if (video.paused) video.play().catch(updateMotionButton);
      else video.pause();
      updateMotionButton();
    });
    const respectMotion = () => {
      if (reducedMotion.matches) {
        video.autoplay = false;
        video.removeAttribute('autoplay');
        video.pause();
      }
      updateMotionButton();
    };
    respectMotion();
    reducedMotion.addEventListener('change', respectMotion);
  }
  localizeExtras();
  reconcileOverlays();
})();
