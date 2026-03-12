/* ══════════════════════════════════════════════════════════════════
   BMG INTERIORS — MASTER JAVASCRIPT
   ══════════════════════════════════════════════════════════════════ */
; (function () {
  'use strict';

  /* ── CURSOR ─────────────────────────────────────────────────────── */
  const cur = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');
  if (cur && ring) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    });
    (function raf() {
      rx += (mx - rx) * .1; ry += (my - ry) * .1;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(raf);
    })();
    document.querySelectorAll('a,button,[data-cur]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('c-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('c-hover'));
    });
    document.addEventListener('mouseleave', () => document.body.classList.add('c-hide'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('c-hide'));
  }

  /* ── PAGE WIPE TRANSITIONS ──────────────────────────────────────── */
  const wipe = document.getElementById('wipe');
  if (wipe) {
    // on load → wipe out
    setTimeout(() => { wipe.classList.add('wipe-out'); }, 60);
    // intercept clicks
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const h = a.getAttribute('href');
      if (!h || h.startsWith('#') || h.startsWith('mailto') || h.startsWith('tel') ||
        h.startsWith('http') || a.target === '_blank') return;
      e.preventDefault();
      wipe.classList.remove('wipe-out');
      wipe.classList.add('wipe-in');
      setTimeout(() => { location.href = h; }, 680);
    });
    // fix: reset wipe on back button
    window.addEventListener('pageshow', e => {
      if (e.persisted) {
        wipe.classList.remove('wipe-in');
        wipe.classList.add('wipe-out');
      }
    });
  }

  /* ── LOADER (home only) ─────────────────────────────────────────── */
  const loader = document.getElementById('loader');
  const ldBar = document.querySelector('.ld-bar');
  const ldNum = document.querySelector('.ld-num');
  if (loader) {
    const duration = 2000;
    const start = performance.now();
    const iv = setInterval(() => {
      const elapsed = performance.now() - start;
      const p = Math.min((elapsed / duration) * 100, 100);
      if (ldBar) ldBar.style.width = p + '%';
      if (ldNum) ldNum.textContent = Math.floor(p) + '%';
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          loader.classList.add('out');
          boot();
        }, 200);
      }
    }, 16);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }

  function boot() {
    initReveal();
    initHero();
    initCounters();
    initMarquees();
    initPortfolio();
    initTestimonials();
    initAccordions();
    initForms();
    initMagnetic();
    initParallax();
  }

  /* ── NAVBAR ─────────────────────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => { nav && nav.classList.toggle('sc', scrollY > 44); }, { passive: true });

  const ham = document.getElementById('ham');
  const mobMenu = document.getElementById('nav-mob');
  if (ham && mobMenu) {
    ham.addEventListener('click', () => { ham.classList.toggle('open'); mobMenu.classList.toggle('open'); });
    mobMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      ham.classList.remove('open'); mobMenu.classList.remove('open');
    }));
  }
  // active link
  ; (() => {
    const cur = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-ul a').forEach(a => {
      if (a.getAttribute('href') === cur) a.classList.add('cur');
    });
  })();

  /* ── SCROLL REVEAL ──────────────────────────────────────────────── */
  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { threshold: .1 });
    document.querySelectorAll('[data-r]').forEach(el => io.observe(el));

    // line clips
    const lio = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('.line-inner').forEach(i => i.classList.add('on')); lio.unobserve(e.target); } });
    }, { threshold: .15 });
    document.querySelectorAll('.line-clip-wrap').forEach(w => lio.observe(w));
  }

  /* ── HERO ANIMATIONS ────────────────────────────────────────────── */
  function initHero() {
    // word reveal
    document.querySelectorAll('[data-words]').forEach(el => {
      const words = el.getAttribute('data-words').split('|');
      const base = parseFloat(el.getAttribute('data-wd') || '0');
      el.innerHTML = words.map((w, i) =>
        `<span class="line-clip"><span class="line-inner" style="transition-delay:${(base + i * .11).toFixed(2)}s">${w}</span></span>`
      ).join('<span style="display:inline-block;width:.22em"></span>');
      requestAnimationFrame(() => el.querySelectorAll('.line-inner').forEach(s => s.classList.add('on')));
    });

    // char reveal
    document.querySelectorAll('[data-chars]').forEach(el => {
      const base = parseFloat(el.getAttribute('data-cd') || '0');
      const text = el.textContent;
      el.innerHTML = [...text].map((ch, i) =>
        `<span style="display:inline-block;opacity:0;transform:translateY(28px);
       transition:opacity .5s ${(base + i * .025).toFixed(3)}s cubic-bezier(.16,1,.3,1),
       transform .5s ${(base + i * .025).toFixed(3)}s cubic-bezier(.16,1,.3,1)">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('');
      requestAnimationFrame(() => el.querySelectorAll('span').forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; }));
    });

    // fade elements
    document.querySelectorAll('[data-fade]').forEach(el => {
      const d = parseFloat(el.getAttribute('data-fade') || '0');
      Object.assign(el.style, {
        opacity: '0', transform: 'translateY(18px)',
        transition: `opacity .8s ${d}s cubic-bezier(.16,1,.3,1),transform .8s ${d}s cubic-bezier(.16,1,.3,1)`
      });
      requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
    });

    // hero scroll click
    const scrollBtn = document.getElementById('hero-scroll');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => {
        const target = document.getElementById('projects');
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80, // adjust for sticky nav
            behavior: 'smooth'
          });
        }
      });
    }
  }

  /* ── COUNTERS ───────────────────────────────────────────────────── */
  function initCounters() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = parseInt(el.dataset.count);
        const dur = 2200;
        const t0 = performance.now();
        (function tick(now) {
          const t = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = Math.floor(eased * end);
          t < 1 ? requestAnimationFrame(tick) : (el.textContent = end);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: .5 });
    document.querySelectorAll('[data-count]').forEach(c => io.observe(c));
  }

  /* ── MARQUEES ───────────────────────────────────────────────────── */
  function initMarquees() {
    document.querySelectorAll('[data-mq]').forEach(track => {
      const items = JSON.parse(track.getAttribute('data-mq'));
      const html = items.map(t => `<span class="mqitem">${t}<span class="mqsep"></span></span>`).join('');
      track.innerHTML = html + html;
    });
  }

  /* ── PORTFOLIO FILTER ───────────────────────────────────────────── */
  function initPortfolio() {
    const btns = document.querySelectorAll('.fbtn');
    const items = document.querySelectorAll('[data-cat]');
    if (!btns.length) return;
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const f = btn.dataset.filter;
        items.forEach(it => {
          const show = f === 'all' || it.dataset.cat === f;
          it.classList.toggle('hide', !show);
        });
      });
    });
  }

  /* ── TESTIMONIALS ───────────────────────────────────────────────── */
  function initTestimonials() {
    const slides = document.querySelectorAll('.tslide');
    const dots = document.querySelectorAll('.tdot');
    if (!slides.length) return;
    let cur = 0;
    function show(i) {
      slides[cur].classList.remove('on'); if (dots[cur]) dots[cur].classList.remove('on');
      cur = i;
      slides[cur].classList.add('on'); if (dots[cur]) dots[cur].classList.add('on');
    }
    dots.forEach(d => d.addEventListener('click', () => show(+d.dataset.dot)));
    setInterval(() => show((cur + 1) % slides.length), 6500);
  }

  /* ── ACCORDIONS ─────────────────────────────────────────────────── */
  function initAccordions() {
    document.querySelectorAll('.acc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const open = btn.classList.contains('open');
        document.querySelectorAll('.acc-btn').forEach(b => {
          b.classList.remove('open');
          const p = b.nextElementSibling;
          if (p) { p.style.maxHeight = '0'; p.style.opacity = '0'; p.classList.remove('open'); }
          const ic = b.querySelector('.acc-icon'); if (ic) ic.style.transform = '';
        });
        if (!open) {
          btn.classList.add('open');
          const p = btn.nextElementSibling;
          if (p) { p.style.maxHeight = p.scrollHeight + 'px'; p.style.opacity = '1'; p.classList.add('open'); }
          const ic = btn.querySelector('.acc-icon'); if (ic) ic.style.transform = 'rotate(45deg)';
        }
      });
    });
  }

  /* ── FORMS ──────────────────────────────────────────────────────── */
  function initForms() {
    const form = document.getElementById('cf');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        // validate required fields
        let ok = true;
        form.querySelectorAll('[required]').forEach(f => {
          if (!f.value.trim()) { f.style.borderColor = 'rgba(255,80,80,.55)'; ok = false; }
          else f.style.borderColor = '';
        });
        if (!ok) return;
        const btn = form.querySelector('[type=submit]');
        if (btn) { btn.innerHTML = '<span>Sending&hellip;</span>'; btn.disabled = true; }
        setTimeout(() => {
          // if a #form-success element exists, use it; otherwise replace innerHTML
          const succ = document.getElementById('form-success');
          if (succ) { form.style.display = 'none'; succ.style.display = 'block'; }
          else {
            form.innerHTML = `<div style="text-align:center;padding:3.5rem 0">
          <div style="font-family:var(--fh);font-size:3rem;color:var(--brand);margin-bottom:1rem;animation:afadein .5s">✓</div>
          <div class="t-md" style="margin-bottom:.8rem">Message Received</div>
          <p class="body-s" style="max-width:380px;margin:0 auto">Thank you. We'll reach out within 24 hours to discuss your project in detail.</p>
        </div>`;
          }
        }, 1800);
      });
      form.querySelectorAll('.ff').forEach(ff => {
        const input = ff.querySelector('input,textarea,select');
        if (!input) return;
        function chk() { ff.classList.toggle('filled', input.value.length > 0); }
        input.addEventListener('focus', () => ff.classList.add('focused'));
        input.addEventListener('blur', () => { ff.classList.remove('focused'); chk(); });
        input.addEventListener('input', chk);
      });
    }
  }

  /* ── MAGNETIC BUTTONS ───────────────────────────────────────────── */
  function initMagnetic() {
    document.querySelectorAll('.btn-g,.btn-o').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * .3;
        const dy = (e.clientY - r.top - r.height / 2) * .3;
        btn.style.transform = `translate(${dx}px,${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ── PARALLAX ───────────────────────────────────────────────────── */
  function initParallax() {
    const pg = document.getElementById('hero-pg');
    if (!pg) return;
    window.addEventListener('scroll', () => {
      pg.style.transform = `translateY(${scrollY * .28}px)`;
    }, { passive: true });
  }

})();
