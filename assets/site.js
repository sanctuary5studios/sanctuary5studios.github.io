/* Sanctuary Five Studios — shared site behaviour */
/* ---------------------------------------------------------
   SITE CONFIG
   formEndpoint: the address enquiries are POSTed to, e.g. a Formspree form
   ('https://formspree.io/f/xxxxxxxx'). It is a public form address, not a
   secret, so it is safe here. Leave it empty and forms fall back to opening
   the visitor's email app with the enquiry pre-filled.
   --------------------------------------------------------- */
var SFS_CONFIG = {
  formEndpoint: '',
  email: 'hello@sanctuaryfivestudios.com'
};

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
      ['<span class="p">sfs@studio</span>:<span class="k">~</span>$ ', 'sfs build --idea <span class="s">"yours"</span>'],
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
      if (list.classList.contains('life-track')) {
        var idx = tabs.indexOf(t), fill = $('.life-fill', list);
        tabs.forEach(function (x, k) { x.classList.toggle('done', k < idx); });
        if (fill) fill.style.width = (idx / (tabs.length - 1) * 80) + '%';
      }
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

  /* =========================================================
     Enquiry delivery (shared by every form)
     ========================================================= */
  function sendEnquiry(fields, subject) {
    var ep = (SFS_CONFIG.formEndpoint || '').trim();
    if (ep) {
      var payload = { _subject: subject };
      Object.keys(fields).forEach(function (k) { payload[k] = fields[k]; });
      return fetch(ep, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return { mode: 'sent' };
      });
    }
    var body = Object.keys(fields).map(function (k) { return k + ': ' + fields[k]; }).join('\n');
    location.href = 'mailto:' + SFS_CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    return Promise.resolve({ mode: 'mailto' });
  }
  var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>';
  var ICON_BAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5h.01"/></svg>';
  var mailLink = function () { return '<a href="mailto:' + SFS_CONFIG.email + '">' + SFS_CONFIG.email + '</a>'; };
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* Field validation: shows a message under each invalid field */
  function validate(scope) {
    var first = null;
    $$('input,select,textarea', scope).forEach(function (el) {
      if (el.closest('[hidden]') || el.type === 'radio' || el.type === 'checkbox' && !el.required) return;
      var err = document.getElementById(el.id + '-err'), ok = el.checkValidity();
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) {
        var msg = '';
        if (!ok) {
          if (el.validity.valueMissing) msg = el.type === 'checkbox' ? 'Please tick this box to continue.' : 'Please fill this in.';
          else if (el.validity.typeMismatch && el.type === 'email') msg = 'Please enter a valid email address.';
          else msg = el.validationMessage;
        }
        err.textContent = msg;
        if (err.id) el.setAttribute('aria-describedby', err.id);
      }
      if (!ok && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  function wireMethod(scope) {
    var phone = $('input[name="phone"]', scope), when = $('[data-when]', scope);
    var sync = function () {
      var m = ($('input[name="method"]:checked', scope) || {}).value || '';
      if (phone) {
        phone.required = m === 'Telephone';
        var sm = $('label[for="' + phone.id + '"] small', scope);
        if (sm) sm.textContent = m === 'Telephone' ? '(required for a call)' : '(optional)';
      }
      if (when) when.hidden = m === 'Email';
    };
    $$('input[name="method"]', scope).forEach(function (r) { r.addEventListener('change', sync); });
    sync();
  }

  /* ---------- Standard enquiry forms (contact, partnerships) ---------- */
  $$('form[data-enquiry]').forEach(function (form) {
    var params = new URLSearchParams(location.search);
    ['type', 'service'].forEach(function (k) {
      var v = (params.get(k) || '').replace(/[^a-z-]/g, ''), sel = $('select[name="' + k + '"]', form);
      if (v && sel) { var o = $('option[value="' + v + '"]', sel); if (o) sel.value = o.value; }
    });
    wireMethod(form);
    var status = $('.status', form), btn = $('button[type="submit"]', form), btnHtml = btn.innerHTML;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.hidden = true;
      if (!validate(form)) return;
      if ($('.hp input', form) && $('.hp input', form).value) { form.reset(); return; }
      var fields = {};
      $$('[data-label]', form).forEach(function (el) {
        if (el.closest('[hidden]')) return;
        var v;
        if (el.tagName === 'FIELDSET') { var c = $('input:checked', el); v = c ? c.value : ''; }
        else if (el.type === 'checkbox') v = el.checked ? 'Yes' : 'No';
        else if (el.tagName === 'SELECT') v = el.options[el.selectedIndex].text;
        else v = el.value.trim();
        if (v) fields[el.getAttribute('data-label')] = v;
      });
      var subject = (form.getAttribute('data-subject') || 'Website enquiry') + ': ' + (fields['Enquiry type'] || fields['Area of interest'] || 'General') + ' — ' + (fields['Name'] || '');
      btn.disabled = true; btn.textContent = 'Sending…';
      sendEnquiry(fields, subject).then(function (r) {
        status.className = 'status ' + (r.mode === 'sent' ? 'ok' : 'info');
        status.innerHTML = r.mode === 'sent'
          ? ICON_OK + '<div><b>Thank you, your enquiry has been sent.</b><br>We\'ll be in touch by ' + esc((fields['Preferred contact'] || 'email').toLowerCase()) + ' as soon as we can.</div>'
          : ICON_OK + '<div><b>Almost done.</b> Your email app should have opened with your enquiry filled in. Press send to deliver it. If nothing opened, email us at ' + mailLink() + '.</div>';
        status.hidden = false;
        if (r.mode === 'sent') form.reset(), wireMethod(form);
      }).catch(function () {
        status.className = 'status bad';
        status.innerHTML = ICON_BAD + '<div><b>Sorry, your enquiry couldn\'t be sent.</b> Please try again in a moment, or email us directly at ' + mailLink() + '.</div>';
        status.hidden = false;
      }).then(function () { btn.disabled = false; btn.innerHTML = btnHtml; status.focus && status.setAttribute('tabindex', '-1'); status.focus(); });
    });
  });

  /* ---------- Solution finder (guided enquiry) ---------- */
  $$('[data-widget="solution-finder"]').forEach(function (w) {
    var steps = $$('.wiz-step', w), cur = 0, bar = $('.wiz-bar i', w), count = $('.wiz-count', w);
    var need = function () { var c = $('input[name="need"]:checked', w); return c ? c.value : ''; };
    var labelOf = function (inp) { var l = inp.closest('label'); return l ? l.textContent.trim() : inp.value; };
    wireMethod(w);
    function show(i, focus) {
      cur = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
      if (count) count.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      if (steps[i].getAttribute('data-step') === 'details') {
        var n = need();
        $$('[data-for]', w).forEach(function (g) { g.hidden = g.getAttribute('data-for').split(' ').indexOf(n) === -1; });
      }
      $$('[data-for]', steps[i]).forEach(function (g) { g.hidden = g.getAttribute('data-for').split(' ').indexOf(need()) === -1; });
      if (steps[i].getAttribute('data-step') === 'review') buildSummary();
      if (focus) { var h = $('h3', steps[i]); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } w.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    }
    function stepValid(step) {
      var errBox = $('.step-err', step), ok = true;
      $$('fieldset.q[data-required]', step).forEach(function (fs) {
        if (fs.closest('[hidden]')) return;
        if (!$('input:checked', fs)) ok = false;
      });
      if (!ok) { if (errBox) errBox.textContent = 'Please choose an option for each question to continue.'; return false; }
      if (errBox) errBox.textContent = '';
      return validate(step);
    }
    function collect() {
      var out = {};
      out['Looking for'] = labelOf($('input[name="need"]:checked', w));
      $$('fieldset.q', w).forEach(function (fs) {
        if (fs.closest('[data-for][hidden]') || fs.getAttribute('data-skip') !== null) return;
        var v = $$('input:checked', fs).map(labelOf).join(', ');
        if (v) out[fs.getAttribute('data-label') || $('legend', fs).textContent.trim()] = v;
      });
      $$('[data-label]', w).forEach(function (el) {
        if (el.tagName === 'FIELDSET' || el.closest('[data-for][hidden],[data-when][hidden]')) return;
        var v = el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.value.trim();
        if (v) out[el.getAttribute('data-label')] = v;
      });
      var m = $('input[name="method"]:checked', w); if (m) out['Preferred contact'] = m.value;
      return out;
    }
    function buildSummary() {
      var d = collect(), dl = $('.summary', w);
      dl.innerHTML = Object.keys(d).filter(function (k) { return k !== 'Privacy notice accepted'; }).map(function (k) { return '<div><dt>' + esc(k) + '</dt><dd>' + esc(d[k]) + '</dd></div>'; }).join('');
    }
    $$('[data-next]', w).forEach(function (b) { b.addEventListener('click', function () { if (stepValid(steps[cur])) show(cur + 1, true); }); });
    $$('[data-back]', w).forEach(function (b) { b.addEventListener('click', function () { show(cur - 1, true); }); });
    $$('[data-edit]', w).forEach(function (b) { b.addEventListener('click', function () { show(0, true); }); });
    $$('input[name="need"]', w).forEach(function (r) { r.addEventListener('change', function () { var e = $('.step-err', steps[0]); if (e) e.textContent = ''; }); });
    var submit = $('[data-submit]', w), status = $('.status', w), done = $('.wiz-done', w);
    submit.addEventListener('click', function () {
      if ($('.hp input', w) && $('.hp input', w).value) return;
      var d = collect(), html = submit.innerHTML;
      submit.disabled = true; submit.textContent = 'Sending…'; status.hidden = true;
      sendEnquiry(d, 'Solution finder: ' + d['Looking for'] + ' — ' + (d['Name'] || '')).then(function (r) {
        var first = esc((d['Name'] || '').split(' ')[0]);
        var call = d['Free 15-minute discovery call'] === 'Yes' ? ' We\'ll also suggest some times for your free discovery call, subject to availability.' : '';
        $('h3', done).textContent = r.mode === 'sent' ? 'Thank you' + (first ? ', ' + first : '') + '. Your enquiry is with us.' : 'One last step: press send.';
        $('p', done).innerHTML = r.mode === 'sent'
          ? 'We\'ll review your requirements and get back to you by ' + esc((d['Preferred contact'] || 'email').toLowerCase()) + '.' + call
          : 'Your email app should have opened with your enquiry summary filled in. Press send to deliver it to us. If nothing opened, email us at ' + mailLink() + '.';
        steps.forEach(function (s) { s.hidden = true; });
        $('.wiz-top', w).hidden = true; $('.wiz-bar', w).hidden = true;
        done.hidden = false; var h = $('h3', done); h.setAttribute('tabindex', '-1'); h.focus();
      }).catch(function () {
        status.className = 'status bad';
        status.innerHTML = ICON_BAD + '<div><b>Sorry, your enquiry couldn\'t be sent.</b> Please try again, or email us directly at ' + mailLink() + '.</div>';
        status.hidden = false;
      }).then(function () { submit.disabled = false; submit.innerHTML = html; });
    });
    var restart = $('[data-restart]', w);
    if (restart) restart.addEventListener('click', function () {
      $$('input', w).forEach(function (i) { if (i.type === 'radio' || i.type === 'checkbox') i.checked = false; else i.value = ''; });
      $$('textarea', w).forEach(function (t) { t.value = ''; });
      var em = $('input[name="method"][value="Email"]', w); if (em) em.checked = true;
      wireMethod(w);
      done.hidden = true; $('.wiz-top', w).hidden = false; $('.wiz-bar', w).hidden = false; show(0, true);
    });
    show(0, false);
  });

  /* ---------- Project filters (Innovation Lab) ---------- */
  $$('.filters').forEach(function (bar) {
    var btns = $$('button', bar), grid = document.getElementById(bar.getAttribute('aria-controls'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter');
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var shown = 0;
        $$('.proj', grid).forEach(function (p) { p.hidden = f !== 'all' && (p.getAttribute('data-status') || '').split(' ').indexOf(f) === -1; if (!p.hidden) shown++; });
        var empty = $('.proj-empty'); if (empty) { empty.hidden = shown > 0; if (!shown) empty.classList.add('in'); }
      });
    });
  });

  /* ---------- Snuggle Hollow: illustrated valley ---------- */
  $$('.hollow-hero').forEach(function (hh) {
    var btns = $$('[data-set-time]', hh);
    function setT(t) {
      hh.setAttribute('data-time', t);
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set-time') === t ? 'true' : 'false'); });
    }
    // The Hollow follows the visitor's own clock, without a fade on first load
    var h = new Date().getHours();
    hh.classList.add('instant');
    setT(h >= 5 && h < 10 ? 'morning' : h >= 10 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'golden' : 'night');
    requestAnimationFrame(function () { requestAnimationFrame(function () { hh.classList.remove('instant'); }); });
    btns.forEach(function (b) { b.addEventListener('click', function () { setT(b.getAttribute('data-set-time')); }); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { hh.classList.toggle('paused', !es[0].isIntersecting); }).observe(hh);
    }
    if (!reduce && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      var layers = $$('[data-depth]', hh), queued = 0, px = 0, py = 0;
      hh.addEventListener('pointermove', function (e) {
        var r = hh.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / r.height - 0.5;
        if (queued) return;
        queued = requestAnimationFrame(function () {
          queued = 0;
          layers.forEach(function (l) {
            var d = +l.getAttribute('data-depth');
            l.style.transform = 'translate(' + (-px * 28 * d).toFixed(1) + 'px,' + (-py * 10 * d).toFixed(1) + 'px)';
          });
        });
      });
      hh.addEventListener('pointerleave', function () { layers.forEach(function (l) { l.style.transform = ''; }); });
    }
  });

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
