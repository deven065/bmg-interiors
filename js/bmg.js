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
    /* ── Letter-cycle animation via GSAP ── */
    const chars = loader.querySelectorAll('.ld-char');
    if (window.gsap && chars.length) {
      const G = gsap;
      function revealIn(onDone) {
        G.to(chars, { opacity:1, y:0, filter:'blur(0px)', duration:.6, stagger:.055, ease:'power3.out', onComplete: onDone });
      }
      function dissolveOut(onDone) {
        G.to(chars, { opacity:0, y:-18, filter:'blur(6px)', duration:.5, stagger:.045, ease:'power2.in', onComplete: onDone });
      }
      function resetDown(onDone) { G.set(chars, { y:20, filter:'blur(8px)' }); onDone(); }
      function cycle() {
        revealIn(() => G.delayedCall(.65, () => dissolveOut(() => G.delayedCall(.12, () => resetDown(cycle)))));
      }
      cycle();
    }

    const duration = 1600;
    const start = performance.now();
    const iv = setInterval(() => {
      const elapsed = performance.now() - start;
      const p = Math.min((elapsed / duration) * 100, 100);
      if (ldBar) ldBar.style.width = p + '%';
      if (ldNum) ldNum.textContent = Math.floor(p) + '%';
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          /* Kill char animation and snap to invisible BEFORE fading the loader,
             so the fading black backdrop never reveals ghost letter shadows */
          if (window.gsap && chars.length) {
            gsap.killTweensOf(chars);
            gsap.set(chars, { opacity: 0, filter: 'blur(0px)', y: 0 });
          }
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
    initGSAP();   // must be first — removes data-r from elements it controls
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

  /* ── PROJECT ACCORDION ──────────────────────────────────────────── */
  function initShowcase(){
    const cols = document.querySelectorAll('.pw-col');
    if(!cols.length) return;
    let activeIndex = Array.from(cols).findIndex(col => col.classList.contains('active'));
    if(activeIndex < 0) activeIndex = 0;
    let frame = 0;
    let debounceTimer = 0;

    function activate(i){
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
    activate(activeIndex);
    cols.forEach((col,i)=>{
      col.addEventListener('pointerenter',()=>activate(i));
      col.addEventListener('pointerleave',()=>clearTimeout(debounceTimer));
      col.addEventListener('focusin',()=>activate(i));
      col.addEventListener('click',()=>{ location.href='portfolio.html'; });
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

    /* Hand key elements off from IntersectionObserver to GSAP */
    document.querySelectorAll(
      '.stat-cell,.svc-card,.pi,.client-card,.cta-inner > *,.divider'
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
    G.to('.hero-img-bg',{
      scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true},
      y:'13%', ease:'none'
    });
    const asImgBg = document.querySelector('.as-img-bg');
    if(asImgBg) G.to(asImgBg,{
      scrollTrigger:{trigger:'.about-strip', start:'top bottom', end:'bottom top', scrub:1},
      y:'10%', ease:'none'
    });

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

    /* ── Service cards – clip from bottom ────────────────── */
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
