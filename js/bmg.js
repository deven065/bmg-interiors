/* ══════════════════════════════════════════════════════════════════
   BMG INTERIORS &mdash; MASTER JAVASCRIPT
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

  /* ── M.PNG CLICK BURST ──────────────────────────────────────────── */
  (function(){
    const CSS = `
      .m-orbit{
        position:fixed;pointer-events:none;z-index:999999;
        width:56px;height:56px;transform:translate(-50%,-50%);
        will-change:transform,opacity;
      }
      .m-orbit .m-mark{
        position:absolute;top:50%;left:50%;width:24px;height:24px;
        opacity:0;will-change:transform,opacity;
        filter:drop-shadow(0 0 8px rgba(255,204,0,.48));
        animation:morbit .82s cubic-bezier(.16,1,.3,1) forwards;
      }
      .m-orbit .m-circle{
        position:absolute;inset:0;border-radius:50%;
        border:1.6px solid rgba(255,204,0,.78);
        opacity:0;transform:scale(.36);
        will-change:transform,opacity;
        animation:mcircle .82s cubic-bezier(.16,1,.3,1) forwards;
      }
      .m-orbit .m-circle-2{
        border-color:rgba(255,204,0,.38);
        animation-delay:.08s;
      }
      @keyframes morbit{
        0%   {transform:translate(-50%,-50%) rotate(0deg)   translateY(-13px) rotate(0deg) scale(.55);opacity:0}
        18%  {opacity:1}
        84%  {opacity:1}
        100% {transform:translate(-50%,-50%) rotate(360deg) translateY(-13px) rotate(-360deg) scale(.82);opacity:0}
      }
      @keyframes mcircle{
        0%   {transform:scale(.36);opacity:0}
        22%  {opacity:1}
        100% {transform:scale(1.08);opacity:0}
      }
    `;
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    document.addEventListener('click', e=>{
      const x = e.clientX, y = e.clientY;

      const orbit = document.createElement('div');
      orbit.className = 'm-orbit';
      orbit.style.left = x+'px';
      orbit.style.top = y+'px';

      const circleA = document.createElement('div');
      circleA.className = 'm-circle';
      const circleB = document.createElement('div');
      circleB.className = 'm-circle m-circle-2';

      const img = document.createElement('img');
      img.className = 'm-mark';
      img.src = '/M.png';
      img.alt = '';

      orbit.appendChild(circleA);
      orbit.appendChild(circleB);
      orbit.appendChild(img);
      document.body.appendChild(orbit);

      const cleanup = ()=>{ orbit.remove(); };
      img.addEventListener('animationend', cleanup, {once:true});
      setTimeout(cleanup, 950);
    });
  })();

  /* ── PAGE WIPE TRANSITIONS ──────────────────────────────────────── */
  const wipe = document.getElementById('wipe');
  if (wipe) {
    // on load &rarr; wipe out
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
    const logoImg = loader.querySelector('.ld-logo img');
    const rings = loader.querySelectorAll('.ld-ring');

    if (ldBar) ldBar.style.width = '0%';
    if (ldNum) ldNum.textContent = '0%';

    if (window.gsap) {
      const G = gsap;
      if (logoImg) {
        G.set(logoImg, { opacity: 0, y: 16, scale: .9, filter: 'blur(6px)' });
        G.to(logoImg, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: .9,
          ease: 'power3.out'
        });
        G.to(logoImg, {
          y: -3,
          duration: 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });
      }

    }

    let done = false;
    let finished = false;
    let doneAt = null;
    const start = performance.now();
    const minDuration = 3000;
    const HOLD = 88;
    const COMPLETE = 520;

    const easeOut = t => 1 - Math.pow(1 - t, 2.2);
    const smooth  = t => t * t * (3 - 2 * t);

    const markDone = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= minDuration) {
        done = true;
      } else {
        setTimeout(() => { done = true; }, minDuration - elapsed);
      }
    };
    if (document.readyState === 'complete') {
      setTimeout(markDone, 120);
    } else {
      window.addEventListener('load', () => setTimeout(markDone, 120), { once: true });
    }
    setTimeout(() => { done = true; }, 8000);

    const tick = () => {
      if (finished) return;
      const elapsed = performance.now() - start;
      let pct;

      if (done) {
        if (doneAt === null) doneAt = elapsed;
        const dt = elapsed - doneAt;
        const t  = Math.min(1, dt / COMPLETE);
        const fromPct = easeOut(Math.min(1, doneAt / minDuration)) * HOLD;
        pct = fromPct + (100 - fromPct) * smooth(t);
        if (t >= 1) {
          finished = true;
          if (ldBar) ldBar.style.width = '100%';
          if (ldNum) ldNum.textContent = '100%';
          setTimeout(() => {
            loader.classList.add('out');
            boot();
          }, 220);
          return;
        }
      } else {
        const t = Math.min(1, elapsed / minDuration);
        pct = easeOut(t) * HOLD;
      }

      if (ldBar) ldBar.style.width = pct.toFixed(2) + '%';
      if (ldNum) ldNum.textContent = Math.floor(pct) + '%';

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }

  function boot() {
    initCinematicScroll();
    initGSAP();   // must be first &mdash; removes data-r from elements it controls
    initReveal();
    initHero();
    initCounters();
    initMarquees();
    initPortfolio();
    initShowcase();
    initTestimonials();
    initAccordions();
    initForms();
    initMagnetic();
    initParallax();
  }

  /* ── CINEMATIC SCROLL (DESKTOP) ────────────────────────────────── */
  function initCinematicScroll() {
    if (
      /portfolio\.html$/i.test(location.pathname) ||
      /interior-designer-in-mumbai\.html$/i.test(location.pathname) ||
      /2bhk-interior-design-in-mumbai\.html$/i.test(location.pathname) ||
      /interior-design-cost-in-mumbai\.html$/i.test(location.pathname)
    ) return;
    const canEnhance =
      window.matchMedia('(hover:hover) and (pointer:fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canEnhance) return;

    const root = document.scrollingElement || document.documentElement;
    let targetY = window.scrollY;
    let currentY = targetY;
    let rafId = 0;
    let lockSync = false;
    let lastTs = 0;

    const clamp = v => Math.max(0, Math.min(v, root.scrollHeight - innerHeight));
    const kick = () => { if (!rafId) rafId = requestAnimationFrame(tick); };

    function tick(ts) {
      const dt = lastTs ? Math.min(34, ts - lastTs) : 16;
      lastTs = ts;
      const ease = 1 - Math.pow(0.84, dt / 16);
      currentY += (targetY - currentY) * ease;
      if (Math.abs(targetY - currentY) < 0.45) {
        currentY = targetY;
        rafId = 0;
        lastTs = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }
      lockSync = true;
      window.scrollTo(0, currentY);
      lockSync = false;
      if (window.ScrollTrigger) ScrollTrigger.update();
    }

    window.addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : 1;
      const delta = Math.max(-180, Math.min(180, e.deltaY * unit * 0.92));
      targetY = clamp(targetY + delta);
      kick();
    }, { passive: false });

    window.addEventListener('keydown', e => {
      const k = e.key;
      let step = 0;
      if (k === 'ArrowDown') step = 88;
      else if (k === 'ArrowUp') step = -88;
      else if (k === 'PageDown' || k === ' ') step = innerHeight * 0.9;
      else if (k === 'PageUp') step = -innerHeight * 0.9;
      else if (k === 'Home') targetY = 0;
      else if (k === 'End') targetY = root.scrollHeight - innerHeight;
      else return;

      if (step) targetY = clamp(targetY + step);
      else targetY = clamp(targetY);
      kick();
    });

    window.addEventListener('resize', () => {
      targetY = clamp(window.scrollY);
      currentY = targetY;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      if (lockSync || rafId) return;
      targetY = currentY = window.scrollY;
    }, { passive: true });
  }

  /* ── NAVBAR ─────────────────────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => { nav && nav.classList.toggle('sc', scrollY > 44); }, { passive: true });

  function ensureBlogsMenuLink() {
    const desktopMenu = document.querySelector('.nav-ul');
    const mobileMenu = document.getElementById('nav-mob');

    const addDesktop = () => {
      if (!desktopMenu || desktopMenu.querySelector('a[href="blogs.html"]')) return;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = 'blogs.html';
      a.textContent = 'Blogs';
      li.appendChild(a);

      const contact = desktopMenu.querySelector('a[href="contact.html"]');
      const contactLi = contact ? contact.closest('li') : null;
      if (contactLi && contactLi.parentNode) contactLi.parentNode.insertBefore(li, contactLi);
      else desktopMenu.appendChild(li);
    };

    const addMobile = () => {
      if (!mobileMenu || mobileMenu.querySelector('a[href="blogs.html"]')) return;
      const a = document.createElement('a');
      a.href = 'blogs.html';
      a.textContent = 'Blogs';

      const contact = mobileMenu.querySelector('a[href="contact.html"]');
      if (contact && contact.parentNode) contact.parentNode.insertBefore(a, contact);
      else mobileMenu.appendChild(a);
    };

    addDesktop();
    addMobile();
  }

  ensureBlogsMenuLink();

  const ham = document.getElementById('ham');
  const mobMenu = document.getElementById('nav-mob');
  const closeMenuBtn = document.getElementById('nav-close');
  if (ham && mobMenu) {
    const openMenu = () => {
      ham.classList.add('open');
      ham.setAttribute('aria-expanded', 'true');
      mobMenu.classList.add('open');
    };

    const closeMenu = () => {
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      mobMenu.classList.remove('open');
    };

    ham.setAttribute('aria-expanded', 'false');
    ham.addEventListener('click', () => {
      mobMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    mobMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    closeMenuBtn && closeMenuBtn.addEventListener('click', closeMenu);
    mobMenu.addEventListener('click', (e) => { if (e.target === mobMenu) closeMenu(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
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
        `<span class="line-clip"><span class="line-inner" style="transition-delay:${(base + i * .13).toFixed(2)}s">${w}</span></span>`
      ).join('<span style="display:inline-block;width:.22em"></span>');
      requestAnimationFrame(() => el.querySelectorAll('.line-inner').forEach(s => s.classList.add('on')));
    });

    // hero eyebrow gold line — grow from 0
    const eyeLine = document.querySelector('.hero-ey-line');
    if (eyeLine) requestAnimationFrame(() => eyeLine.classList.add('on'));

    // char reveal
    document.querySelectorAll('[data-chars]').forEach(el => {
      const base = parseFloat(el.getAttribute('data-cd') || '0');
      const text = el.textContent;
      el.innerHTML = [...text].map((ch, i) =>
        `<span style="display:inline-block;opacity:0;transform:translateX(28px);
       transition:opacity .5s ${(base + i * .025).toFixed(3)}s cubic-bezier(.16,1,.3,1),
       transform .5s ${(base + i * .025).toFixed(3)}s cubic-bezier(.16,1,.3,1)">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('');
      requestAnimationFrame(() => el.querySelectorAll('span').forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; }));
    });

    // fade elements — blur-dissolve for hero-sub, classic slide for everything else
    document.querySelectorAll('[data-fade]').forEach(el => {
      const d = parseFloat(el.getAttribute('data-fade') || '0');
      if (el.classList.contains('hero-sub')) {
        Object.assign(el.style, {
          opacity: '0', transform: 'translateY(10px)', filter: 'blur(6px)',
          transition: `opacity 1.1s ${d}s cubic-bezier(.16,1,.3,1),transform 1.1s ${d}s cubic-bezier(.16,1,.3,1),filter 1s ${d}s cubic-bezier(.16,1,.3,1)`
        });
        requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; });
      } else {
        Object.assign(el.style, {
          opacity: '0', transform: 'translateX(18px)',
          transition: `opacity .8s ${d}s cubic-bezier(.16,1,.3,1),transform .8s ${d}s cubic-bezier(.16,1,.3,1)`
        });
        requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
      }
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

  /* ── PROJECT ACCORDION ──────────────────────────────────────────── */
  function initShowcase(){
    const cols = Array.from(document.querySelectorAll('.pw-col'));
    const filterBtns = Array.from(document.querySelectorAll('.pw-filter-btn'));
    const accordion = document.querySelector('.pw-accordion');
    if(!cols.length) return;
    let activeIndex = 0;
    let frame = 0;
    let debounceTimer = 0;

    function activate(i){
      if(i < 0 || i >= cols.length) return;
      if(i === activeIndex) return;
      cancelAnimationFrame(frame);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        activeIndex = i;
        frame = requestAnimationFrame(() => {
          cols.forEach((col, index) => col.classList.toggle('active', index === activeIndex));
        });
      }, 140);
    }

    function syncActive(){
      cols.forEach((col, index) => col.classList.toggle('active', activeIndex >= 0 && index === activeIndex));
    }

    function clearActive(){
      cancelAnimationFrame(frame);
      clearTimeout(debounceTimer);
      const firstVisible = cols.findIndex(col => !col.classList.contains('is-muted'));
      activeIndex = firstVisible >= 0 ? firstVisible : 0;
      syncActive();
    }

    function applyFilter(filterKey, scroll = true){
      cols.forEach(col => {
        const sector = col.dataset.sector || '';
        const match = !filterKey || filterKey === 'all' || sector === filterKey;
        col.classList.toggle('is-muted', !match);
      });

      filterBtns.forEach(btn => {
        const isOn = btn.dataset.pwFilter === filterKey;
        btn.classList.toggle('on', isOn);
        btn.setAttribute('aria-selected', isOn ? 'true' : 'false');
      });

      clearActive();

      if(scroll && accordion){
        accordion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    syncActive();

    if(filterBtns.length){
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.pwFilter || 'all'));
      });

      const initial = filterBtns.find(btn => btn.classList.contains('on')) || filterBtns[0];
      if(initial){
        applyFilter(initial.dataset.pwFilter || 'all', false);
      }
    }

    cols.forEach((col,i)=>{
      col.addEventListener('pointerenter',()=>activate(i));
      col.addEventListener('pointerleave',()=>clearTimeout(debounceTimer));
      col.addEventListener('focusin',()=>activate(i));
      col.addEventListener('click',()=>{ location.href='portfolio.html'; });
    });

    if(accordion){
      accordion.addEventListener('pointerleave', clearActive);
    }
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
    if(window.ScrollTrigger) return; // GSAP handles it
    const pg = document.getElementById('hero-pg');
    if (!pg) return;
    window.addEventListener('scroll', () => {
      pg.style.transform = `translateY(${scrollY * .28}px)`;
    }, { passive: true });
  }

  /* ── GSAP ANIMATIONS ────────────────────────────────────────────── */
  function initGSAP(){
    if(!window.gsap || !window.ScrollTrigger) return;
    const G = gsap;
    G.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({limitCallbacks:true, ignoreMobileResize:true});

    try {
      ScrollTrigger.normalizeScroll({ allowNestedScroll:true, momentum:self => Math.min(3, Math.abs(self.velocityY) / 1350) });
    } catch (_e) {}

    /* Hand key elements off from IntersectionObserver to GSAP */
    document.querySelectorAll(
      '.stat-cell,.svc-card,.pi,.client-card,.cta-inner > *,.divider,.tl-grid,.tl-item'
    ).forEach(el=>{
      el.removeAttribute('data-r');
      el.removeAttribute('data-d');
      el.classList.remove('on');
      el.style.opacity = el.style.transform = el.style.transition = '';
    });

    /* ── HERO entrance timeline ───────────────────────────── */
    const heroImg = document.querySelector('.ld-logo-wrap') ? document.getElementById('hero-img') : null;
    const eyLine  = document.querySelector('.hero-ey-line');
    if(eyLine) G.set(eyLine, {scaleX:0, transformOrigin:'left center'});
    if(heroImg){ heroImg.classList.remove('on'); G.set(heroImg,{clipPath:'inset(0 100% 0 0)',opacity:1}); }

    const tl = G.timeline({delay:0.2});
    tl
      .to('.hero-ey-line',         {scaleX:1, duration:.75, ease:'power3.inOut'}, 0)
      .from('.hero-ey .lbl',       {opacity:0, y:12, duration:.6, ease:'power3.out'}, .18)
      .from('.hero-h1 .line-inner',{yPercent:110, opacity:0, stagger:.07, duration:.88, ease:'power4.out'}, .36)
      .from('.hero-sub',           {opacity:0, y:22, duration:.72, ease:'power3.out'}, .88)
      .from('.hero-acts > *',      {opacity:0, y:16, stagger:.1, duration:.6, ease:'power3.out'}, 1.02)
      .to(heroImg||{},             {clipPath:'inset(0 0% 0 0)', duration:1.35, ease:'power4.inOut'}, .48)
      .from('.hero-badge1',        {opacity:0, scale:.7, y:22, duration:.72, ease:'back.out(1.7)'}, 1.42)
      .from('.hero-badge2',        {opacity:0, scale:.7, y:-18, duration:.72, ease:'back.out(1.7)'}, 1.58)
      .from('#hero-scroll',        {opacity:0, y:16, duration:.6, ease:'power2.out'}, 1.72);

    /* ── Scroll-scrub parallax ────────────────────────────── */
    G.to('#hero-pg',{
      scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:1.4},
      y:'30%', ease:'none'
    });
    G.to('.hero-video', {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 },
      yPercent: 9,
      scale: 1.06,
      ease: 'none'
    });
    G.to('.hero-img-bg',{
      scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true},
      y:'13%', ease:'none'
    });
    const asImgBg = document.querySelector('.as-img-bg');
    if(asImgBg) G.to(asImgBg,{
      scrollTrigger:{trigger:'.about-strip', start:'top bottom', end:'bottom top', scrub:1},
      y:'10%', ease:'none'
    });

    // cinematic section drift for a less template-like feel
    G.utils.toArray('.sec').forEach((sec, i) => {
      G.fromTo(sec,
        { y: 36, opacity: .72 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sec,
            start: 'top 92%',
            end: 'top 58%',
            scrub: 1 + (i % 3) * .08
          }
        }
      );
    });

    /* ── Timeline line (about.html) ────────────────────────── */
    const tlLine = document.querySelector('.tl-line');
    const tlGrid = document.querySelector('.tl-grid');
    if(tlLine && tlGrid){
      const tln = G.timeline({
        scrollTrigger:{trigger:tlGrid, start:'top 85%', once:true}
      });
      tln
        .from(tlLine, {scaleX:0, transformOrigin:'left center', duration:1.5, ease:'power3.inOut'})
        .from('.tl-item', {y:30, opacity:0, stagger:0.18, duration:0.9, ease:'power3.out'}, "-=0.6");
    }

    /* ── Marquee band ─────────────────────────────────────── */
    G.from('.mqband',{
      scrollTrigger:{trigger:'.mqband', start:'top 91%', once:true},
      opacity:0, y:20, duration:.7, ease:'power2.out'
    });

    /* ── Stats ────────────────────────────────────────────── */
    G.from('.stat-cell',{
      scrollTrigger:{trigger:'.stat-grid', start:'top 82%', once:true},
      y:50, opacity:0, stagger:.1, duration:.78, ease:'power3.out'
    });

    /* ── Service cards &ndash; clip from bottom ────────────────── */
    G.from('.svc-card',{
      scrollTrigger:{trigger:'.fsvc-grid', start:'top 80%', once:true},
      clipPath:'inset(0 0 100% 0)', opacity:0,
      stagger:.14, duration:1, ease:'power4.out'
    });

    /* ── Portfolio grid (portfolio.html) ─────────────────── */
    if(document.querySelector('.pgrid')){
      G.from('.pi',{
        scrollTrigger:{trigger:'.pgrid', start:'top 90%', once:true},
        y:60, opacity:0,
        stagger:{each:.1, from:'start'}, duration:.9, ease:'power3.out'
      });
    }
    /* ── About strip ──────────────────────────────────────── */
    G.from('.as-img',{
      scrollTrigger:{trigger:'.about-strip', start:'top 77%', once:true},
      x:-60, opacity:0, duration:1.15, ease:'power3.out'
    });
    G.from('.about-strip > div:last-child > *',{
      scrollTrigger:{trigger:'.about-strip', start:'top 77%', once:true},
      x:44, opacity:0, stagger:.09, duration:.88, ease:'power3.out', delay:.1
    });

    /* ── Client logos ─────────────────────────────────────── */
    G.from('.client-card',{
      scrollTrigger:{trigger:'.client-grid', start:'top 82%', once:true},
      opacity:0, scale:.86, stagger:.03, duration:.55, ease:'power2.out'
    });

    /* ── CTA band ─────────────────────────────────────────── */
    G.from('.cta-inner > *',{
      scrollTrigger:{trigger:'.cta-band', start:'top 77%', once:true},
      y:42, opacity:0, stagger:.1, duration:.88, ease:'power3.out'
    });
    G.from('.cstrip-item',{
      scrollTrigger:{trigger:'.cstrip', start:'top 85%', once:true},
      y:24, opacity:0, stagger:.1, duration:.7, ease:'power3.out'
    });

    /* ── Dividers ─────────────────────────────────────────── */
    document.querySelectorAll('.divider').forEach(d=>{
      G.from(d,{
        scrollTrigger:{trigger:d, start:'top 89%', once:true},
        scaleX:0, transformOrigin:'center', duration:1.3, ease:'power3.inOut'
      });
    });

    /* ensure all scroll positions are calculated correctly */
    ScrollTrigger.refresh();
  }

})();
