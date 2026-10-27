/* Portfolio behaviour: settings, theme, menu, loader, hero reveal, scroll reveals, works slider, lightbox, back-to-top. */
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Apply site settings (js/config.js) ---------- */
  var cfg = window.SITE || {};
  var val = function (k) { return (cfg[k] || '').toString().trim(); };
  var hide = function (el) { el.hidden = true; };

  ['youtube', 'tiktok', 'instagram', 'linkedin'].forEach(function (k) {
    document.querySelectorAll('[data-social="' + k + '"]').forEach(function (li) {
      if (val(k)) li.querySelector('a').href = val(k); else hide(li);
    });
  });
  var media = document.querySelector('[data-media]');
  if (media && !val('youtube') && !val('tiktok') && !val('instagram')) hide(media);

  /* Contact rows keep their icon; the value goes in [data-text] when present */
  function fill(a, text) {
    var t = a.querySelector('[data-text]') || a;
    var at = text.indexOf('@');
    t.textContent = at > 0 ? text.slice(0, at) : text;
    if (at > 0) { t.appendChild(document.createElement('wbr')); t.appendChild(document.createTextNode(text.slice(at))); }
  }
  var email = val('email'), phone = val('phone'), whatsapp = val('whatsapp');
  document.querySelectorAll('[data-email]').forEach(function (row) {
    if (!email) return hide(row);
    var a = row.querySelector('a'); a.href = 'mailto:' + email; fill(a, email);
  });
  document.querySelectorAll('[data-email-btn]').forEach(function (btn) {
    if (email) btn.href = 'mailto:' + email; else hide(btn);
  });
  document.querySelectorAll('[data-phone]').forEach(function (row) {
    if (!phone) return hide(row);
    var a = row.querySelector('a'); a.href = 'tel:' + phone.replace(/[^\d+]/g, ''); fill(a, phone);
  });
  document.querySelectorAll('[data-whatsapp], [data-whatsapp-btn]').forEach(function (el) {
    var a = el.tagName === 'A' ? el : el.querySelector('a');
    if (whatsapp) a.href = whatsapp; else hide(el);
  });
  /* Social cards show the handle, e.g. @name, taken from the profile URL */
  document.querySelectorAll('[data-social] [data-handle]').forEach(function (h) {
    var url = val(h.closest('[data-social]').dataset.social);
    var name = url.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop().replace(/^@/, '');
    h.textContent = name ? '@' + name : '';
  });
  if (val('necReg')) {
    var nec = document.querySelector('[data-nec]');
    nec.querySelector('[data-nec-number]').textContent = val('necReg');
    nec.hidden = false;
  }
  var cvLinks = document.querySelectorAll('[data-cv]');
  var cv = val('cv');
  if (!cv) cvLinks.forEach(hide);
  else {
    cvLinks.forEach(function (a) { a.href = cv; });
    if (/^https?:$/.test(location.protocol) && window.fetch) {
      fetch(cv, { method: 'HEAD' }).then(function (r) {
        var type = r.headers.get('content-type') || '';
        if (!r.ok || type.indexOf('text/html') === 0) cvLinks.forEach(hide);
      }).catch(function () { cvLinks.forEach(hide); });
    }
  }

  /* ---------- Theme ---------- */
  var themeBtn = document.getElementById('themeToggle');
  var darkMQ = matchMedia('(prefers-color-scheme: dark)');
  function theme() { return root.dataset.theme || (darkMQ.matches ? 'dark' : 'light'); }
  function syncTheme() {
    var t = theme();
    themeBtn.dataset.mode = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  themeBtn.addEventListener('click', function () {
    var next = theme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  });
  if (darkMQ.addEventListener) darkMQ.addEventListener('change', syncTheme);
  syncTheme();

  /* ---------- Full-screen menu ---------- */
  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menuToggle');
  var mainEl = document.getElementById('main');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      root.style.overflow = 'hidden';
      mainEl.setAttribute('inert', '');
      menu.querySelector('a').focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      root.style.overflow = '';
      mainEl.removeAttribute('inert');
      setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 900);
    }
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Hero name: split into letters for the reveal ---------- */
  var i = 0;
  document.querySelectorAll('.hero-name .word').forEach(function (w) {
    var text = w.textContent; w.textContent = '';
    for (var c = 0; c < text.length; c++) {
      var s = document.createElement('span');
      s.className = 'char'; s.textContent = text[c]; s.style.setProperty('--i', i++);
      w.appendChild(s);
    }
  });

  /* ---------- Loader, then hero reveal ---------- */
  var hero = document.querySelector('.hero');
  function reveal() { hero.classList.add('is-revealed'); }
  if (root.classList.contains('is-loading')) {
    setTimeout(function () {
      root.classList.add('loader-done');
      setTimeout(reveal, 200);
      setTimeout(function () { root.classList.remove('is-loading', 'loader-done'); }, 800);
      try { sessionStorage.setItem('seen', '1'); } catch (e) {}
    }, 1400);
  } else {
    requestAnimationFrame(function () { requestAnimationFrame(reveal); });
  }

  /* ---------- Scroll reveals (blur-up) ---------- */
  function onView(nodes, cls, threshold) {
    if (reduce || !hasIO) { nodes.forEach(function (n) { n.classList.add(cls); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add(cls); io.unobserve(en.target); }
      });
    }, { threshold: threshold, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }
  onView(document.querySelectorAll('.reveal'), 'is-in', 0.12);

  /* ---------- Dialog: image lightbox ---------- */
  var dialog = document.getElementById('projectDialog');
  var body = document.getElementById('projectBody');
  var countEl = document.getElementById('projectCount');
  var prevBtn = document.getElementById('projectPrev');
  var nextBtn = document.getElementById('projectNext');
  var opener = null, group = [], gi = 0;

  function openDialog() {
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    }
    body.scrollTop = 0;
    root.style.overflow = 'hidden';
    if (window.syncSlider) window.syncSlider();
  }
  function showImage(n) {
    gi = (n + group.length) % group.length;
    var el = group[gi];
    var thumb = el.querySelector('img');
    body.innerHTML = '';
    var img = document.createElement('img');
    img.className = 'pd-image';
    img.src = el.dataset.src || thumb.currentSrc || thumb.src;
    img.alt = el.dataset.alt || thumb.alt;
    var h = document.createElement('h2');
    h.id = 'projectHeading'; h.textContent = el.dataset.title;
    var p = document.createElement('p');
    p.textContent = el.dataset.meta || '';
    body.append(img, h, p);
    var multi = group.length > 1;
    prevBtn.hidden = nextBtn.hidden = !multi;
    countEl.textContent = multi ? (gi + 1) + ' / ' + group.length : '';
  }
  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    el.addEventListener('click', function () {
      group = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox="' + el.dataset.lightbox + '"]'));
      opener = el;
      showImage(group.indexOf(el));
      openDialog();
    });
  });
  prevBtn.addEventListener('click', function () { showImage(gi - 1); });
  nextBtn.addEventListener('click', function () { showImage(gi + 1); });
  dialog.addEventListener('keydown', function (e) {
    if (prevBtn.hidden) return;
    if (e.key === 'ArrowLeft') showImage(gi - 1);
    if (e.key === 'ArrowRight') showImage(gi + 1);
  });

  document.getElementById('projectClose').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () {
    root.style.overflow = '';
    if (opener) opener.focus({ preventScroll: true });
    if (window.syncSlider) window.syncSlider();
  });

  /* ---------- Latest works: auto-sliding strip; pauses on hover, focus, touch, off-screen or open dialog ---------- */
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var track = slider.querySelector('[data-slider-track]');
    var cards = track.querySelectorAll('.card');
    var bar = slider.querySelector('[data-slider-progress]');
    var current = slider.querySelector('[data-slider-current]');
    var playBtn = document.querySelector('[data-slider-play]');
    var section = slider.closest('section');
    var idx = 0, stopped = reduce, hovering = false, focused = false, touching = false, visible = true;

    var sync = window.syncSlider = function () {
      var paused = stopped || hovering || focused || touching || !visible || document.hidden || dialog.open;
      slider.classList.toggle('is-paused', paused);
      section.classList.toggle('is-stopped', stopped);
      playBtn.setAttribute('aria-label', stopped ? 'Play slideshow' : 'Pause slideshow');
    };
    function restartBar() { bar.classList.remove('is-running'); void bar.offsetWidth; bar.classList.add('is-running'); }
    function pad() { return parseFloat(getComputedStyle(track).paddingLeft) || 0; }
    function go(n) {
      idx = (n + cards.length) % cards.length;
      track.scrollTo({ left: cards[idx].offsetLeft - pad(), behavior: reduce ? 'auto' : 'smooth' });
      setCurrent();
      restartBar();
    }
    function setCurrent() { current.textContent = (idx + 1 < 10 ? '0' : '') + (idx + 1); }
    /* Keep the counter in step when people scroll or swipe the strip themselves */
    var scrollT;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollT);
      scrollT = setTimeout(function () {
        var x = track.scrollLeft + pad(), best = 0, bestD = Infinity;
        cards.forEach(function (c, n) { var d = Math.abs(c.offsetLeft - x); if (d < bestD) { bestD = d; best = n; } });
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4 && bestD > 4) best = cards.length - 1;
        if (best !== idx) { idx = best; setCurrent(); restartBar(); }
      }, 120);
    }, { passive: true });

    bar.addEventListener('animationend', function () {
      if (stopped) return;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      go(atEnd ? 0 : idx + 1);
    });
    document.querySelector('[data-slider-next]').addEventListener('click', function () { go(idx + 1); });
    document.querySelector('[data-slider-prev]').addEventListener('click', function () { go(idx - 1); });
    playBtn.addEventListener('click', function () { stopped = !stopped; if (!stopped) restartBar(); sync(); });

    track.addEventListener('mouseenter', function () { hovering = true; sync(); });
    track.addEventListener('mouseleave', function () { hovering = false; sync(); });
    track.addEventListener('focusin', function () { focused = true; sync(); });
    track.addEventListener('focusout', function () { focused = false; sync(); });
    track.addEventListener('touchstart', function () { touching = true; sync(); }, { passive: true });
    track.addEventListener('touchend', function () { setTimeout(function () { touching = false; sync(); }, 2500); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(idx + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(idx - 1); e.preventDefault(); }
    });
    document.addEventListener('visibilitychange', sync);

    if (hasIO && !reduce) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.3 }).observe(track);
      var seenIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-seen'); seenIO.unobserve(en.target); } });
      }, { root: track, threshold: 0.4 });
      cards.forEach(function (c) { seenIO.observe(c); });
    } else {
      cards.forEach(function (c) { c.classList.add('is-seen'); });
    }

    setCurrent();
    restartBar();
    sync();
  }

  /* ---------- Back to top: appears after the hero, ring shows scroll progress ---------- */
  var toTop = document.querySelector('.to-top');
  var ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? scrollY / max : 0;
    toTop.style.setProperty('--p', p.toFixed(4));
    toTop.classList.toggle('is-shown', scrollY > innerHeight * 0.6);
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
