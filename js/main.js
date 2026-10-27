/* Portfolio behaviour: settings, theme, smooth scroll, menu, loader, hero reveal, scroll animations, works slider, lightbox, back-to-top. */
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

  /* ---------- Smooth scrolling (Lenis, js/vendor); off for reduced motion ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4 });
    (function tick(t) { lenis.raf(t); requestAnimationFrame(tick); })(performance.now());
  }
  function stopScroll() { root.style.overflow = 'hidden'; if (lenis) lenis.stop(); }
  function startScroll() { root.style.overflow = ''; if (lenis) lenis.start(); }

  /* In-page links glide to their section instead of jumping */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || !lenis || a.classList.contains('skip') || e.defaultPrevented) return;
    var id = a.getAttribute('href');
    var target = id === '#top' ? 0 : (id.length > 1 && document.querySelector(id));
    if (target === null || target === false) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: target === 0 ? 0 : -24, duration: 1.4 });
    if (history.pushState) history.pushState(null, '', id);
  });

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
      stopScroll();
      mainEl.setAttribute('inert', '');
      menu.querySelector('a').focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      startScroll();
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

  /* ---------- Big headings: wrap each word so it can rise out of a mask ---------- */
  document.querySelectorAll('.display').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', words.join(' '));
    h.textContent = '';
    words.forEach(function (w, n) {
      var outer = document.createElement('span'), inner = document.createElement('span');
      outer.className = 'w'; outer.setAttribute('aria-hidden', 'true');
      inner.textContent = w; inner.style.setProperty('--i', n);
      outer.appendChild(inner); h.appendChild(outer);
      if (n < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
    h.classList.add('split');
  });

  /* Siblings that enter together come in one after another */
  document.querySelectorAll('.reveal').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
    var n = sibs.indexOf(el);
    if (n > 0) el.style.setProperty('--d', (Math.min(n, 6) * 0.09).toFixed(2) + 's');
  });
  document.querySelectorAll('.works .card').forEach(function (c, n) { c.style.setProperty('--d', (n * 0.12).toFixed(2) + 's'); });

  /* ---------- Scroll reveals ---------- */
  function onView(nodes, cls, threshold) {
    if (reduce || !hasIO) { nodes.forEach(function (n) { n.classList.add(cls); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add(cls); io.unobserve(en.target); }
      });
    }, { threshold: threshold, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }
  onView(document.querySelectorAll('.reveal, .split, .works'), 'is-in', 0.12);

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
    stopScroll();
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
    startScroll();
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

  /* ---------- Scroll-driven motion: back-to-top ring, parallax, hero drift ---------- */
  var toTop = document.querySelector('.to-top');
  var words = document.querySelectorAll('.hero-name .word');
  var script = document.querySelector('.hero-script');
  var layers = reduce ? [] : Array.prototype.map.call(document.querySelectorAll('[data-speed]'), function (img) {
    return { img: img, frame: img.parentElement.closest('figure, button, div') || img.parentElement, speed: parseFloat(img.dataset.speed) || 0 };
  });
  var ticking = false;
  function onScroll() {
    var y = scrollY, vh = innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    toTop.style.setProperty('--p', (max > 0 ? y / max : 0).toFixed(4));
    toTop.classList.toggle('is-shown', y > vh * 0.6);

    if (!reduce && y < vh * 1.5) {
      /* The two lines of the name slide apart and the script lifts away */
      if (words[0]) words[0].style.translate = (-y * 0.12).toFixed(1) + 'px 0';
      if (words[1]) words[1].style.translate = (y * 0.08).toFixed(1) + 'px 0';
      if (script) script.style.translate = '0 ' + (-y * 0.16).toFixed(1) + 'px';
    }
    /* Images drift inside their frames, never past the extra room they were given */
    layers.forEach(function (l) {
      var r = l.frame.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var room = r.height * 0.065;
      var shift = -(r.top + r.height / 2 - vh / 2) * l.speed;
      l.img.style.translate = '0 ' + Math.max(-room, Math.min(room, shift)).toFixed(1) + 'px';
    });
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Text band: speeds up with scroll speed and follows the scroll direction ---------- */
  var band = document.querySelector('[data-marquee]');
  var bandAnim = band && !reduce && band.getAnimations ? band.getAnimations()[0] : null;
  if (bandAnim) {
    var lastY = scrollY, dir = 1, rate = 1, bandVisible = true;
    if (hasIO) new IntersectionObserver(function (en) { bandVisible = en[0].isIntersecting; }).observe(band);
    (function spin() {
      var v = scrollY - lastY; lastY = scrollY;
      if (v) dir = v > 0 ? 1 : -1;
      var target = dir * (1 + Math.min(Math.abs(v) * 0.35, 6));
      rate += (target - rate) * 0.08;
      if (bandVisible) bandAnim.playbackRate = rate;
      requestAnimationFrame(spin);
    })();
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
