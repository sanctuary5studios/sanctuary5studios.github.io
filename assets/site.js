/* Sanctuary Five Studios — shared site behaviour */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Theme toggle ---------- */
  function isDark() {
    var t = doc.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  $$('.theme-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      doc.setAttribute('data-theme', next);
      try { localStorage.setItem('s5-theme', next); } catch (e) {}
    });
  });

  /* ---------- Header shadow on scroll + back to top ---------- */
  var header = $('.site-header'), totop = $('.totop');
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (totop) totop.classList.toggle('show', y > 900);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- Services dropdown ---------- */
  $$('.dd').forEach(function (dd) {
    var btn = $('button', dd), timer;
    function set(open) { dd.setAttribute('data-open', open ? 'true' : 'false'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    btn.addEventListener('click', function () { set(dd.getAttribute('data-open') !== 'true'); });
    dd.addEventListener('mouseenter', function () { clearTimeout(timer); set(true); });
    dd.addEventListener('mouseleave', function () { timer = setTimeout(function () { set(false); }, 160); });
    dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });

  /* ---------- Mobile menu ---------- */
  var mbtn = $('.menu-btn'), mnav = $('.mnav'), scrim = $('.mnav-scrim');
  if (mbtn && mnav) {
    var setMenu = function (open) {
      document.body.classList.toggle('menu-open', open);
      mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var f = $('a,button', mnav); if (f) f.focus({ preventScroll: true }); }
      else mbtn.focus({ preventScroll: true });
    };
    mbtn.addEventListener('click', function () { setMenu(true); });
    $$('.mnav-close').forEach(function (c) { c.addEventListener('click', function () { setMenu(false); }); });
    if (scrim) scrim.addEventListener('click', function () { setMenu(false); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) { document.body.classList.remove('menu-open'); mbtn.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Spotlight cards ---------- */
  $$('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Rotating headline words ---------- */
  $$('.rotator').forEach(function (rot) {
    var words = $$('span', rot), i = 0;
    if (words.length < 2 || reduce) return;
    setInterval(function () {
      var cur = words[i]; i = (i + 1) % words.length; var nxt = words[i];
      cur.classList.remove('on'); cur.classList.add('out');
      nxt.classList.remove('out'); nxt.classList.add('on');
      setTimeout(function () { cur.classList.remove('out'); }, 500);
    }, 2400);
  });

  /* ---------- Hero network canvas ---------- */
  var cv = $('#heroCanvas');
  if (cv && cv.getContext && !reduce) {
    var ctx = cv.getContext('2d'), pts = [], W = 0, H = 0, mouse = { x: -999, y: -999 }, raf, visible = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var resize = function () {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, (W * H) / 16000));
      pts = [];
      for (var k = 0; k < n; k++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 });
    };
    var color = function () { return isDark() ? '120,160,255' : '47,111,235'; };
    var draw = function () {
      ctx.clearRect(0, 0, W, H);
      var c = color();
      for (var a = 0; a < pts.length; a++) {
        var p = pts[a];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        var dmx = p.x - mouse.x, dmy = p.y - mouse.y, dm = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dm < 140) { p.x += dmx / dm * .6; p.y += dmy / dm * .6; }
        for (var b = a + 1; b < pts.length; b++) {
          var q = pts[b], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 15000) {
            ctx.strokeStyle = 'rgba(' + c + ',' + (0.22 * (1 - d / 15000)) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(' + c + ',.55)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
      }
      if (visible) raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize);
    cv.parentElement.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var v = es[0].isIntersecting;
        if (v && !visible) { visible = true; draw(); } else if (!v) { visible = false; cancelAnimationFrame(raf); }
      }).observe(cv);
    }
  }

  /* ---------- Terminal typing ---------- */
  var term = $('#termBody');
  if (term) {
    var script = [
      ['<span class="p">sfs@studio</span>:<span class="k">~</span>$ ', 'sfs start --client "you"'],
      ['<span class="c"># listening to your goals…</span>', ''],
      ['<span class="ok">✔</span> ', 'discovery call booked'],
      ['<span class="ok">✔</span> ', 'roadmap drafted'],
      ['<span class="p">sfs@studio</span>:<span class="k">~</span>$ ', 'sfs build --with <span class="s">apps ai systems games</span>'],
      ['<span class="c">  ▸ designing</span> ', '████████████ 100%'],
      ['<span class="c">  ▸ building</span>  ', '████████████ 100%'],
      ['<span class="c">  ▸ testing</span>   ', '████████████ 100%'],
      ['<span class="ok">✔</span> ', 'shipped. <span class="c">ready when you are.</span>']
    ];
    if (reduce) {
      term.innerHTML = script.map(function (l) { return l[0] + l[1]; }).join('\n') + '\n<span class="caret"></span>';
    } else {
      var line = 0, ch = 0, out = '';
      var strip = function (s) { return s.replace(/<[^>]+>/g, ''); };
      var tick = function () {
        if (line >= script.length) {
          term.innerHTML = out + '<span class="caret"></span>';
          setTimeout(function () { line = 0; ch = 0; out = ''; tick(); }, 5000);
          return;
        }
        var pre = script[line][0], txt = script[line][1], plain = strip(txt);
        if (ch <= plain.length) {
          // type plain text, then swap in the highlighted version at the end of the line
          term.innerHTML = out + pre + (ch === plain.length ? txt : plain.slice(0, ch)) + '<span class="caret"></span>';
          ch++;
          setTimeout(tick, txt.indexOf('█') > -1 ? 22 : 38);
        } else {
          out += pre + txt + '\n'; line++; ch = 0;
          setTimeout(tick, 380);
        }
      };
      var started = false;
      var start = function () { if (!started) { started = true; tick(); } };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { if (es[0].isIntersecting) start(); }).observe(term);
      } else start();
    }
  }

  /* ---------- Selectable option buttons ---------- */
  $$('.opt').forEach(function (o) {
    o.addEventListener('click', function () {
      o.setAttribute('aria-pressed', o.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      var host = o.closest('[data-widget]');
      if (host) host.dispatchEvent(new CustomEvent('change-opts'));
    });
  });

  /* Service finder (home) */
  var finder = $('[data-widget="finder"]');
  if (finder) {
    var SERVICES = {
      games: { name: 'Mobile Games & Apps', url: '/games.html', num: '01' },
      ai: { name: 'AI Guidance & Setup', url: '/ai.html', num: '02' },
      software: { name: 'App & Software Development', url: '/software.html', num: '03' },
      process: { name: 'Process & Systems Improvement', url: '/process.html', num: '04' }
    };
    var res = $('.result', finder);
    finder.addEventListener('change-opts', function () {
      var score = {};
      $$('.opt[aria-pressed="true"]', finder).forEach(function (o) {
        o.getAttribute('data-s').split(' ').forEach(function (s) { score[s] = (score[s] || 0) + 1; });
      });
      var keys = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; });
      if (!keys.length) {
        res.classList.remove('has');
        res.innerHTML = '<p>Pick one or more goals above and we\'ll point you to the right team.</p>';
        return;
      }
      var top = SERVICES[keys[0]], also = keys.slice(1, 3).map(function (k) { return SERVICES[k].name; });
      res.classList.add('has');
      res.innerHTML = '<div><p class="mono" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase">Best match · ' + top.num + '</p><b>' + top.name + '</b>' +
        (also.length ? '<p>Also worth a look: ' + also.join(', ') + '</p>' : '') + '</div>' +
        '<div class="cta-row"><a class="btn ghost sm" href="' + top.url + '">Explore</a><a class="btn primary sm" href="/contact.html?service=' + keys[0] + '">Talk to us</a></div>';
    });
  }

  /* AI readiness check */
  var ready = $('[data-widget="readiness"]');
  if (ready) {
    var all = $$('.opt', ready).length, bar = $('.meter i', ready), rres = $('.result', ready);
    var msgs = [
      ['A blank canvas', 'Perfect starting point. We\'ll begin with the fundamentals and build real confidence, fast.'],
      ['Curious and exploring', 'You\'ve dipped a toe in. A structured session will turn experiments into everyday habits.'],
      ['Ready to level up', 'You have the basics. Now it\'s about workflows, consistency and getting the whole team on board.'],
      ['Ahead of the curve', 'Strong foundations. Let\'s look at automation, custom assistants and measurable results.']
    ];
    ready.addEventListener('change-opts', function () {
      var n = $$('.opt[aria-pressed="true"]', ready).length, pct = Math.round(n / all * 100);
      bar.style.width = pct + '%';
      var m = msgs[n === 0 ? 0 : Math.min(3, Math.ceil(n / all * 4) - 1)];
      rres.classList.add('has');
      rres.innerHTML = '<div><p class="mono" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase">' + n + ' of ' + all + ' · ' + pct + '%</p><b>' + m[0] + '</b><p>' + m[1] + '</p></div>' +
        '<a class="btn accent sm" href="/contact.html?service=ai">Get a tailored plan</a>';
    });
  }

  /* Time-back calculator (process) */
  var calc = $('[data-widget="calc"]');
  if (calc) {
    var people = $('#cPeople', calc), hours = $('#cHours', calc), share = $('#cShare', calc);
    var upd = function () {
      $('#oPeople', calc).textContent = people.value;
      $('#oHours', calc).textContent = hours.value + ' h';
      $('#oShare', calc).textContent = share.value + '%';
      var yearly = Math.round(people.value * hours.value * 46 * share.value / 100);
      $('#oYear', calc).textContent = yearly.toLocaleString();
      $('#oWeeks', calc).textContent = (yearly / 37.5).toFixed(1);
    };
    [people, hours, share].forEach(function (i) { i.addEventListener('input', upd); });
    upd();
  }

  /* ---------- Tabs ---------- */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function sel(t) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (j === null) return; e.preventDefault();
        var n = tabs[(j + tabs.length) % tabs.length]; sel(n); n.focus();
      });
    });
  });

  /* ---------- Contact form (opens the visitor's email app, pre-filled) ---------- */
  var form = $('#contactForm');
  if (form) {
    var params = new URLSearchParams(location.search), svc = params.get('service');
    if (svc && form.service) {
      var o = $('option[value="' + svc.replace(/[^a-z]/g, '') + '"]', form.service);
      if (o) form.service.value = o.value;
    }
    var phoneRow = $('#phoneRow'), meetRow = $('#timeRow');
    var syncMethod = function () {
      var m = (form.querySelector('input[name="method"]:checked') || {}).value;
      if (phoneRow) phoneRow.querySelector('input').required = m === 'Phone call';
      if (phoneRow) phoneRow.querySelector('label small').textContent = m === 'Phone call' ? '(required for a call)' : '(optional)';
      if (meetRow) meetRow.hidden = m === 'Email';
    };
    $$('input[name="method"]', form).forEach(function (r) { r.addEventListener('change', syncMethod); });
    syncMethod();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var f = form.elements, svcText = f.service.options[f.service.selectedIndex].text;
      var method = (form.querySelector('input[name="method"]:checked') || {}).value || 'Email';
      var lines = ['Name: ' + f.name.value, 'Email: ' + f.email.value];
      if (f.phone.value) lines.push('Phone: ' + f.phone.value);
      if (f.company.value) lines.push('Company: ' + f.company.value);
      lines.push('Interested in: ' + svcText, 'Preferred contact: ' + method);
      if (method !== 'Email' && f.when.value) lines.push('Best time: ' + f.when.value);
      lines.push('', f.message.value);
      var subject = 'Enquiry: ' + svcText + ' — ' + f.name.value;
      var to = form.getAttribute('data-to');
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      var st = $('#formStatus'); if (st) st.hidden = false;
    });
  }

  /* ---------- Copy-to-clipboard buttons ---------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.getAttribute('data-copy'), label = b.innerHTML;
      var done = function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.innerHTML = label; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {});
    });
  });

  /* Year */
  $$('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
