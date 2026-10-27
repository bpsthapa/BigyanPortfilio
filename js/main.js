/* Portfolio behaviour: settings, theme, menu, loader, hero reveal, drawings, project dialog. */
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  var email = val('email'), phone = val('phone');
  var emailRow = document.querySelector('[data-email]');
  var emailBtn = document.querySelector('[data-email-btn]');
  if (email) {
    var ea = emailRow.querySelector('a'); ea.href = 'mailto:' + email; ea.textContent = email;
    emailBtn.href = 'mailto:' + email;
  } else { hide(emailRow); hide(emailBtn); }
  var phoneRow = document.querySelector('[data-phone]');
  if (phone) {
    var pa = phoneRow.querySelector('a'); pa.href = 'tel:' + phone.replace(/[^\d+]/g, ''); pa.textContent = phone;
  } else { hide(phoneRow); }
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

  /* ---------- Mobile menu ---------- */
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuToggle');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });

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

  /* ---------- Project images: use a real render when one is added ---------- */
  document.querySelectorAll('img.render').forEach(function (img) {
    var ok = function () { img.classList.add('is-loaded'); img.closest('.work-figure').classList.add('has-render'); };
    var bad = function () { img.remove(); };
    if (img.complete) { if (img.naturalWidth) ok(); else bad(); }
    else { img.addEventListener('load', ok); img.addEventListener('error', bad); }
  });

  /* ---------- Line drawings draw themselves on scroll ---------- */
  var drawings = document.querySelectorAll('.work-grid .drawing');
  if (reduce || !('IntersectionObserver' in window)) {
    drawings.forEach(function (d) { d.classList.add('is-drawn'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-drawn'); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    drawings.forEach(function (d) { io.observe(d); });
  }

  /* ---------- Project dialog ---------- */
  var dialog = document.getElementById('projectDialog');
  var body = document.getElementById('projectBody');
  var opener = null;
  document.querySelectorAll('[data-project]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      body.innerHTML = '';
      var fig = btn.querySelector('.work-figure').cloneNode(true);
      var drawing = fig.querySelector('.drawing');
      if (drawing) {
        drawing.classList.remove('is-drawn');
        requestAnimationFrame(function () { requestAnimationFrame(function () { drawing.classList.add('is-drawn'); }); });
      }
      body.appendChild(fig);
      body.appendChild(document.getElementById(btn.dataset.project).content.cloneNode(true));
      opener = btn;
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      body.scrollTop = 0;
      root.style.overflow = 'hidden';
    });
  });
  /* ---------- Project samples slider: autoplays, pauses on hover, focus, off-screen or open dialog ---------- */
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var list = slider.querySelector('.slides');
    var bar = slider.querySelector('[data-slider-progress]');
    var current = slider.querySelector('[data-slider-current]');
    var playBtn = slider.querySelector('[data-slider-play]');
    var thumbs = [];
    var idx = 0, stopped = reduce, hovering = false, focused = false, visible = true;

    slides.forEach(function (slide, n) {
      var img = slide.querySelector('img');
      var t = document.createElement('button');
      t.type = 'button'; t.className = 'slider-thumb';
      t.setAttribute('aria-label', 'Show image ' + (n + 1) + ': ' + slide.querySelector('.work-title').textContent);
      var ti = document.createElement('img');
      ti.src = img.src; ti.alt = ''; ti.loading = 'lazy'; ti.decoding = 'async';
      t.appendChild(ti);
      t.addEventListener('click', function () { go(n, n < idx); });
      slider.querySelector('[data-slider-thumbs]').appendChild(t);
      thumbs.push(t);
    });

    function sync() {
      var paused = stopped || hovering || focused || !visible || document.hidden || dialog.open;
      slider.classList.toggle('is-paused', paused);
      slider.classList.toggle('is-stopped', stopped);
      playBtn.setAttribute('aria-label', stopped ? 'Play slideshow' : 'Pause slideshow');
      list.setAttribute('aria-live', stopped ? 'polite' : 'off');
    }
    function restartBar() { bar.classList.remove('is-running'); void bar.offsetWidth; bar.classList.add('is-running'); }
    function go(n, back) {
      n = (n + slides.length) % slides.length;
      if (n === idx) return;
      slider.classList.toggle('is-reverse', !!back);
      slides.forEach(function (s) { s.classList.remove('is-leaving'); });
      slides[idx].classList.replace('is-active', 'is-leaving');
      idx = n;
      show();
    }
    function show() {
      slides.forEach(function (s, n) {
        var on = n === idx;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('inert'); else s.setAttribute('inert', '');
        thumbs[n].setAttribute('aria-current', on ? 'true' : 'false');
      });
      current.textContent = (idx + 1 < 10 ? '0' : '') + (idx + 1);
      restartBar();
    }

    bar.addEventListener('animationend', function () { if (!stopped) go(idx + 1); });
    slider.querySelector('[data-slider-next]').addEventListener('click', function () { go(idx + 1); });
    slider.querySelector('[data-slider-prev]').addEventListener('click', function () { go(idx - 1, true); });
    playBtn.addEventListener('click', function () { stopped = !stopped; if (!stopped) restartBar(); sync(); });

    list.addEventListener('mouseenter', function () { hovering = true; sync(); });
    list.addEventListener('mouseleave', function () { hovering = false; sync(); });
    slider.addEventListener('focusin', function (e) { focused = e.target.closest('.slides') !== null; sync(); });
    slider.addEventListener('focusout', function () { focused = false; sync(); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(idx + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(idx - 1, true); e.preventDefault(); }
    });
    document.addEventListener('visibilitychange', sync);
    dialog.addEventListener('close', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(slider);
    }

    /* Swipe on touch screens; a swipe must not also open the image */
    var startX = null, swiped = false;
    list.addEventListener('pointerdown', function (e) { startX = e.clientX; swiped = false; });
    list.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 50) { swiped = true; go(dx < 0 ? idx + 1 : idx - 1, dx > 0); }
    });
    list.addEventListener('click', function (e) { if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);

    show();
    sync();
  }

  /* Project samples reuse the same dialog to show the full image */
  document.querySelectorAll('[data-sample]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      body.innerHTML = '';
      var thumb = btn.querySelector('img');
      var img = document.createElement('img');
      img.className = 'pd-image'; img.src = thumb.src; img.alt = thumb.alt;
      var h = document.createElement('h2');
      h.id = 'projectHeading'; h.textContent = btn.querySelector('.work-title').textContent;
      var p = document.createElement('p');
      p.textContent = btn.querySelector('.work-meta').textContent;
      body.append(img, h, p);
      opener = btn;
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      if (slider) slider.classList.add('is-paused');
      body.scrollTop = 0;
      root.style.overflow = 'hidden';
    });
  });
  document.getElementById('projectClose').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { root.style.overflow = ''; if (opener) opener.focus(); });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
