/* ══════════════════════════════════════════════════════════════════
   BMG INTERIORS — MASTER JAVASCRIPT
   ══════════════════════════════════════════════════════════════════ */
;(function(){
'use strict';

/* ── CURSOR ─────────────────────────────────────────────────────── */
const cur  = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
if(cur && ring){
  let mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx+'px'; cur.style.top = my+'px';
  });
  (function raf(){
    rx += (mx-rx)*.1; ry += (my-ry)*.1;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(raf);
  })();
  document.querySelectorAll('a,button,[data-cur]').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('c-hover'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('c-hover'));
  });
  document.addEventListener('mouseleave',()=>document.body.classList.add('c-hide'));
  document.addEventListener('mouseenter',()=>document.body.classList.remove('c-hide'));
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
if(wipe){
  // on load &rarr; wipe out
  setTimeout(()=>{ wipe.classList.add('wipe-out'); },60);
  // intercept clicks
  document.addEventListener('click', e=>{
    const a = e.target.closest('a[href]');
    if(!a) return;
    const h = a.getAttribute('href');
    if(!h || h.startsWith('#') || h.startsWith('mailto') || h.startsWith('tel') ||
       h.startsWith('http') || a.target==='_blank') return;
    e.preventDefault();
    wipe.classList.remove('wipe-out');
    wipe.classList.add('wipe-in');
    setTimeout(()=>{ location.href = h; }, 680);
  });
}

/* ── PREMIUM LOADER (Home Only) ────────────────────────────────── */
const loader = document.getElementById('loader');
const ldBar  = document.querySelector('.ld-bar');
const ldNum  = document.querySelector('.ld-num');

if (loader) {
  const G = window.gsap;
  const logoImg = loader.querySelector('.ld-logo img');
  const tag = loader.querySelector('.ld-tag');
  const bottom = loader.querySelector('.ld-bottom');

  // Initial State
  if (G && logoImg) {
    G.set(logoImg, { opacity: 0, scale: 0.94, y: 15 });
    G.set([tag, bottom], { opacity: 0, y: 12 });
  }

  // Entrance Timeline — minimal delay for instant feel
  const entranceTl = G ? G.timeline({ delay: 0.1 }) : null;
  if (entranceTl && logoImg) {
    entranceTl
      .to(logoImg, { 
        opacity: 1, scale: 1, y: 0, 
        duration: 1.2, ease: "power4.out" 
      })
      .to(tag, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.7")
      .to(bottom, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.8");
    
    // Smooth breathing float
    G.to(logoImg, { y: -4, duration: 2, ease: "sine.inOut", repeat: -1, yoyo: true });
  }

  let done = false, finished = false, doneAt = null;
  const start = performance.now();
  const minDuration = 2400; // Total duration
  const HOLD = 90; 

  // Very gentle ease-in to ensure we see the 0% -> 1% transition
  const easeIn = t => 1 - Math.pow(1 - t, 1.2);
  const smooth = t => t * t * (3 - 2 * t);

  if (ldBar) ldBar.style.width = '0%';
  if (ldNum) ldNum.textContent = '0%';

  const markDone = () => {
    const elapsed = performance.now() - start;
    if (elapsed >= minDuration) done = true;
    else setTimeout(() => { done = true; }, minDuration - elapsed);
  };

  if (document.readyState === 'complete') setTimeout(markDone, 200);
  else window.addEventListener('load', () => setTimeout(markDone, 120), { once: true });
  
  // Safety timeout
  setTimeout(() => { done = true; }, 8000);

  const tick = () => {
    if (finished) return;
    const elapsed = performance.now() - start;
    
    // Offset the start slightly to guarantee the 0% state is visible locally
    const adjustedElapsed = Math.max(0, elapsed - 60); 
    let pct;

    if (done) {
      if (doneAt === null) doneAt = elapsed;
      const t = Math.min(1, (elapsed - doneAt) / 450); 
      const fromPct = easeIn(Math.min(1, doneAt / minDuration)) * HOLD;
      pct = fromPct + (100 - fromPct) * smooth(t);
      
      if (t >= 1) {
        finished = true;
        if (ldBar) ldBar.style.width = '100%';
        if (ldNum) ldNum.textContent = '100%';
        
        // CINEMATIC EXIT ANIMATION
        loader.classList.add('out');
        if (G && logoImg) {
          if (entranceTl) entranceTl.progress(1);
          
          const exitTl = G.timeline({
            onStart: () => {
              // Trigger boot slightly after curtains start moving to sync with visibility
              setTimeout(boot, 450); 
            }
          });

          exitTl
            .to(".ld-curtain-up", { xPercent: -100, duration: 1.5, ease: "expo.inOut" }, 0)
            .to(".ld-curtain-dn", { xPercent: 100, duration: 1.5, ease: "expo.inOut" }, 0.05)
            .to([logoImg, tag, bottom], { 
              opacity: 0, y: -60, scale: 0.9, 
              duration: 0.85, ease: "power4.in",
              stagger: 0.05,
              overwrite: true 
            }, 0);
        } else {
          boot(); // Fallback if GSAP is missing
        }
        
        setTimeout(() => { loader.style.display = 'none'; }, 1300);
        return;
      }
    } else {
      const t = Math.min(1, adjustedElapsed / minDuration);
      pct = easeIn(t) * HOLD;
    }

    if (ldBar) ldBar.style.width = pct.toFixed(2) + '%';
    if (ldNum) ldNum.textContent = Math.floor(pct) + '%';
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
} else {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}

function boot(){
  // Initialize Cinematic Scroll first, and then everything else
  initCinematicScroll().then(() => {
    initHero();   // must be before GSAP to create .line-inner elements
    initGSAP();   
    initReveal();
    initCounters();
    initMarquees();
    initPortfolio();
    initShowcase();
    initTestimonials();
    initAccordions();
    initForms();
    initMagnetic();
    initParallax();
    initCTA();
    initHeroSlideshow();
  });
  // Also listen for footer load which contains the CTA modal
  window.addEventListener('footerLoaded', initCTA);
}

/* ── SUPER SMOOTH SCROLL (LENIS) ────────────────────────────────── */
function initCinematicScroll(){
  return new Promise((resolve) => {
    const canEnhance =
      window.matchMedia('(hover:hover) and (pointer:fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if(!canEnhance) {
      resolve();
      return;
    }

  const loadLenis = () => {
    return new Promise((resolve, reject) => {
      if (window.Lenis) return resolve();
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/lenis@1.1.20/dist/lenis.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  };

  loadLenis().then(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 2,
      infinite: false,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor links smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
  }).catch(err => {
    console.warn('Lenis failed to load, falling back to native scroll.', err);
  }).finally(() => {
    resolve();
  });
});
}

/* ── NAVBAR ─────────────────────────────────────────────────────── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll',()=>{ nav && nav.classList.toggle('sc', scrollY>44); },{passive:true});

const ham   = document.getElementById('ham');
const mobMenu = document.getElementById('nav-mob');
const closeMenuBtn = document.getElementById('nav-close');
if(ham && mobMenu){
  const openMenu = () => {
    ham.classList.add('open');
    ham.setAttribute('aria-expanded', 'true');
    mobMenu.classList.add('open');
    document.body.style.overflow = 'hidden';

    // GSAP Animation for a premium feel
    if (window.gsap) {
      const links = mobMenu.querySelectorAll('a');
      gsap.set(links, { y: 20, opacity: 0 });
      gsap.to(mobMenu, { 
        opacity: 1, 
        duration: 0.45, 
        ease: "power2.out" 
      });
      gsap.to(links, { 
        y: 0, 
        opacity: 1, 
        stagger: 0.07, 
        duration: 0.6, 
        ease: "power3.out", 
        delay: 0.15 
      });
    }
  };

  const closeMenu = () => {
    ham.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    if (window.gsap) {
      const links = mobMenu.querySelectorAll('a');
      gsap.to(links, { 
        y: -10, 
        opacity: 0, 
        stagger: 0.03, 
        duration: 0.3, 
        ease: "power2.in" 
      });
      gsap.to(mobMenu, { 
        opacity: 0, 
        duration: 0.4, 
        ease: "power2.inOut",
        onComplete: () => {
          mobMenu.classList.remove('open');
          gsap.set(links, { y: 0, opacity: 1 }); // Reset for next open
        }
      });
    } else {
      mobMenu.classList.remove('open');
    }
  };

  ham.setAttribute('aria-expanded', 'false');
  ham.addEventListener('click', () => {
    mobMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  mobMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMenu));
  closeMenuBtn && closeMenuBtn.addEventListener('click', closeMenu);
  mobMenu.addEventListener('click', (e)=>{ if(e.target === mobMenu) closeMenu(); });
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });
}
// active link
;(()=>{
  const cur = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-ul a').forEach(a=>{
    if(a.getAttribute('href')===cur) a.classList.add('cur');
  });
})();

/* ── SCROLL REVEAL ──────────────────────────────────────────────── */
function initReveal(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
  },{threshold:.1});
  document.querySelectorAll('[data-r]').forEach(el=>io.observe(el));

  // line clips
  const lio = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.querySelectorAll('.line-inner').forEach(i=>i.classList.add('on')); lio.unobserve(e.target); } });
  },{threshold:.15});
  document.querySelectorAll('.line-clip-wrap').forEach(w=>lio.observe(w));
}

/* ── HERO ANIMATIONS ────────────────────────────────────────────── */
function initHero(){
  // word reveal
  document.querySelectorAll('[data-words]').forEach(el=>{
    const words = el.getAttribute('data-words').split('|');
    const base  = parseFloat(el.getAttribute('data-wd')||'0');
    el.innerHTML = words.map((w,i)=>
      `<span class="line-clip"><span class="line-inner" style="transition-delay:${(base+i*.13).toFixed(2)}s">${w}</span></span>`
    ).join('<span style="display:inline-block;width:.22em"></span>');
    requestAnimationFrame(()=>el.querySelectorAll('.line-inner').forEach(s=>s.classList.add('on')));
  });

  // hero eyebrow gold line — grow from 0
  const eyeLine = document.querySelector('.hero-ey-line');
  if(eyeLine) requestAnimationFrame(()=>eyeLine.classList.add('on'));

  // char reveal
  document.querySelectorAll('[data-chars]').forEach(el=>{
    const base = parseFloat(el.getAttribute('data-cd')||'0');
    const text = el.textContent;
    el.innerHTML = [...text].map((ch,i)=>
      `<span style="display:inline-block;opacity:0;transform:translateX(28px);
       transition:opacity .5s ${(base+i*.025).toFixed(3)}s cubic-bezier(.16,1,.3,1),
       transform .5s ${(base+i*.025).toFixed(3)}s cubic-bezier(.16,1,.3,1)">${ch===' '?'&nbsp;':ch}</span>`
    ).join('');
    requestAnimationFrame(()=>el.querySelectorAll('span').forEach(s=>{s.style.opacity='1';s.style.transform='none';}));
  });

  // fade elements — blur-dissolve for hero-sub, classic slide for everything else
  document.querySelectorAll('[data-fade]').forEach(el=>{
    const d = parseFloat(el.getAttribute('data-fade')||'0');
    if(el.classList.contains('hero-sub')){
      Object.assign(el.style,{opacity:'0',transform:'translateY(10px)',filter:'blur(6px)',
        transition:`opacity 1.1s ${d}s cubic-bezier(.16,1,.3,1),transform 1.1s ${d}s cubic-bezier(.16,1,.3,1),filter 1s ${d}s cubic-bezier(.16,1,.3,1)`});
      requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='none'; el.style.filter='none'; });
    } else {
      Object.assign(el.style,{opacity:'0',transform:'translateX(18px)',
        transition:`opacity .8s ${d}s cubic-bezier(.16,1,.3,1),transform .8s ${d}s cubic-bezier(.16,1,.3,1)`});
      requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='none'; });
    }
  });
}

/* ── HERO SLIDESHOW ────────────────────────────────────────────── */
function initHeroSlideshow(){
  const container = document.getElementById('hero-slideshow');
  if(!container) return;

  const images = [
    '/images/slider/architecture.jpg',
    '/images/slider/1.jpg',
    '/images/slider/1.png',
    '/images/slider/2.jpg',
    '/images/slider/2.png',
    '/images/slider/3.jpg',
    '/images/slider/4.jpg',
    '/images/slider/5.jpg',
    '/images/slider/6.jpg',
    '/images/slider/interiordesign.jpg'
  ];

  const stripCount = 10;
  let currentSlide = 0;
  let isTransitioning = false;

  const createSlide = (imgSrc, index) => {
    const slide = document.createElement('div');
    slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
    
    // Set initial scale to 1.05 so we can zoom out to 1.0 without borders
    if (index === 0) gsap.set(slide, { scale: 1.05 });

    for(let i = 0; i < stripCount; i++){
      const strip = document.createElement('div');
      strip.className = 'hero-strip';
      strip.style.backgroundImage = `url(${imgSrc})`;
      strip.style.backgroundSize = '100vw 100vh';
      strip.style.backgroundPosition = `-${i * (100 / stripCount)}vw 0`;
      
      if(index === 0) {
        strip.style.transform = 'translateY(0)';
      }
      
      slide.appendChild(strip);
    }
    
    return slide;
  };

  images.forEach((img, i) => container.appendChild(createSlide(img, i)));

  const slides = container.querySelectorAll('.hero-slide');

  const changeSlide = (direction = 1) => {
    if(isTransitioning) return;
    isTransitioning = true;

    const nextIndex = (currentSlide + direction + images.length) % images.length;
    const current = slides[currentSlide];
    const next = slides[nextIndex];

    const enterFrom = direction === 1 ? '100%' : '-100%';
    const exitTo = direction === 1 ? '-100%' : '100%';

    // Initial state for next slide
    gsap.set(next.querySelectorAll('.hero-strip'), { translateY: enterFrom, opacity: 1 });
    gsap.set(next, { scale: 1.15 });
    next.classList.add('active');

    const tl = gsap.timeline({
      onComplete: () => {
        current.classList.remove('active');
        gsap.set(current, { scale: 1.05, translateY: 0 });
        currentSlide = nextIndex;
        isTransitioning = false;
      }
    });

    // 1. Zoom out current slide from 1.05 to 1.0
    tl.to(current, { 
      scale: 1, 
      duration: 1.0, 
      ease: "power2.inOut" 
    });

    // 2. Then proceed with strip animations
    tl.to(next.querySelectorAll('.hero-strip'), {
      translateY: '0%',
      duration: 1.3,
      stagger: 0.08,
      ease: 'expo.inOut'
    }, "-=0.6")
    .to(current.querySelectorAll('.hero-strip'), {
      translateY: exitTo,
      duration: 1.3,
      stagger: 0.08,
      ease: 'expo.inOut'
    }, "<");

    // 3. Zoom next slide out from 1.15 to 1.05
    tl.to(next, { 
      scale: 1.05, 
      duration: 1.6, 
      ease: "power2.out" 
    }, "-=1.1");
  };

  const btnPrev = document.getElementById('hero-prev');
  const btnNext = document.getElementById('hero-next');

  let slideInterval = setInterval(() => changeSlide(1), 5000);

  const resetInterval = () => {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => changeSlide(1), 5000);
  };

  if(btnPrev) btnPrev.onclick = () => { changeSlide(-1); resetInterval(); };
  if(btnNext) btnNext.onclick = () => { changeSlide(1); resetInterval(); };
}

/* ── COUNTERS ───────────────────────────────────────────────────── */
function initCounters(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el  = e.target;
      const end = parseInt(el.dataset.count);
      const dur = 2200;
      const t0  = performance.now();
      (function tick(now){
        const t     = Math.min((now-t0)/dur,1);
        const eased = 1-Math.pow(1-t,4);
        el.textContent = Math.floor(eased*end);
        t<1 ? requestAnimationFrame(tick) : (el.textContent=end);
      })(t0);
      io.unobserve(el);
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(c=>io.observe(c));
}

/* ── MARQUEES ───────────────────────────────────────────────────── */
function initMarquees(){
  document.querySelectorAll('[data-mq]').forEach(track=>{
    const items = JSON.parse(track.getAttribute('data-mq'));
    const html  = items.map(t=>`<span class="mqitem">${t}<span class="mqsep"></span></span>`).join('');
    track.innerHTML = html+html;
  });
}

/* ── PORTFOLIO FILTER ───────────────────────────────────────────── */
function initPortfolio(){
  const btns  = document.querySelectorAll('.fbtn');
  const items = document.querySelectorAll('[data-cat]');
  if(!btns.length) return;
  btns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      btns.forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.filter;
      items.forEach(it=>{
        const show = f==='all'||it.dataset.cat===f;
        it.classList.toggle('hide',!show);
      });
    });
  });
}

/* ── PROJECT ACCORDION ───────────────────────────────────────────── */
function initShowcase(){
  const cols = document.querySelectorAll('.pw-col');
  if(!cols.length) return;
  let activeIndex = Array.from(cols).findIndex(col=>col.classList.contains('active'));
  if(activeIndex < 0) activeIndex = 0;
  let frame = 0;
  let debounceTimer = 0;

  function activate(i){
    if(i === activeIndex) return;
    cancelAnimationFrame(frame);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(()=>{
      activeIndex = i;
      frame = requestAnimationFrame(()=>{
        cols.forEach((col,index)=>col.classList.toggle('active', index === activeIndex));
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
function initTestimonials(){
  const slides = document.querySelectorAll('.tslide');
  const dots   = document.querySelectorAll('.tdot');
  if(!slides.length) return;
  let cur = 0;
  function show(i){
    slides[cur].classList.remove('on'); if(dots[cur]) dots[cur].classList.remove('on');
    cur = i;
    slides[cur].classList.add('on');    if(dots[cur]) dots[cur].classList.add('on');
  }
  dots.forEach(d=>d.addEventListener('click',()=>show(+d.dataset.dot)));
  setInterval(()=>show((cur+1)%slides.length), 6500);
}

/* ── ACCORDIONS ─────────────────────────────────────────────────── */
function initAccordions(){
  document.querySelectorAll('.acc-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const open = btn.classList.contains('open');
      document.querySelectorAll('.acc-btn').forEach(b=>{
        b.classList.remove('open');
        const p = b.nextElementSibling;
        if(p){ p.style.maxHeight='0'; p.style.opacity='0'; p.classList.remove('open'); }
        const ic = b.querySelector('.acc-icon'); if(ic) ic.style.transform='';
      });
      if(!open){
        btn.classList.add('open');
        const p = btn.nextElementSibling;
        if(p){ p.style.maxHeight=p.scrollHeight+'px'; p.style.opacity='1'; p.classList.add('open'); }
        const ic = btn.querySelector('.acc-icon'); if(ic) ic.style.transform='rotate(45deg)';
      }
    });
  });
}

/* ── FORMS ──────────────────────────────────────────────────────── */
function initForms(){
  const form = document.getElementById('cf');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      // validate required fields
      let ok = true;
      form.querySelectorAll('[required]').forEach(f=>{
        if(!f.value.trim()){ f.style.borderColor='rgba(255,80,80,.55)'; ok=false; }
        else f.style.borderColor='';
      });
      if(!ok) return;
      const btn = form.querySelector('[type=submit]');
      if(btn){ btn.innerHTML='<span>Sending&hellip;</span>'; btn.disabled=true; }
      setTimeout(()=>{
        // if a #form-success element exists, use it; otherwise replace innerHTML
        const succ = document.getElementById('form-success');
        if(succ){ form.style.display='none'; succ.style.display='block'; }
        else{ form.innerHTML=`<div style="text-align:center;padding:3.5rem 0">
          <div style="font-family:var(--fh);font-size:3rem;color:var(--brand);margin-bottom:1rem;animation:afadein .5s">✓</div>
          <div class="t-md" style="margin-bottom:.8rem">Message Received</div>
          <p class="body-s" style="max-width:380px;margin:0 auto">Thank you. We'll reach out within 24 hours to discuss your project in detail.</p>
        </div>`; }
      }, 1800);
    });
    form.querySelectorAll('.ff').forEach(ff=>{
      const input = ff.querySelector('input,textarea,select');
      if(!input) return;
      function chk(){ ff.classList.toggle('filled', input.value.length>0); }
      input.addEventListener('focus', ()=>ff.classList.add('focused'));
      input.addEventListener('blur',  ()=>{ ff.classList.remove('focused'); chk(); });
      input.addEventListener('input', chk);
    });
  }
}

/* ── MAGNETIC BUTTONS ───────────────────────────────────────────── */
function initMagnetic(){
  document.querySelectorAll('.btn-g,.btn-o').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX-r.left-r.width/2)*.3;
      const dy = (e.clientY-r.top-r.height/2)*.3;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave',()=>{ btn.style.transform=''; });
  });
}

/* ── PARALLAX ───────────────────────────────────────────────────── */
function initParallax(){
  if(window.ScrollTrigger) return; // GSAP handles parallax when available
  const pg = document.getElementById('hero-pg');
  if(!pg) return;
  window.addEventListener('scroll',()=>{
    pg.style.transform = `translateY(${scrollY*.28}px)`;
  },{passive:true});
}

/* ── CTA MODAL TIMED ────────────────────────────────────────────── */
function initCTA() {
  const modal = document.getElementById('cta-modal');
  if(!modal || modal.dataset.init === 'true') return;
  console.log('initCTA called, modal found:', !!modal);
  modal.dataset.init = 'true';

  // Show after exactly 5 seconds
  const ctaTimer = setTimeout(() => {
    console.log('Showing CTA modal now (5s)');
    modal.classList.add('on');
    document.body.style.overflow = 'hidden'; 
  }, 5000);

  const close = () => {
    modal.classList.remove('on');
    document.body.style.overflow = '';
    sessionStorage.setItem('bmg_cta_shown', 'true');
  };

  const closeBtn = document.getElementById('cta-close-btn');
  const closeOverlay = document.getElementById('cta-close-overlay');

  if(closeBtn) closeBtn.onclick = close;
  if(closeOverlay) closeOverlay.onclick = close;

  // Form Handling
  const form = document.getElementById('cta-lead-form');
  const success = document.getElementById('cta-success');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      btn.disabled = true;
      btn.innerHTML = '<span>Processing...</span>';

      // Simulate API call
      setTimeout(() => {
        form.style.display = 'none';
        if (success) success.style.display = 'block';
        
        // Auto-close after 3 seconds on success
        setTimeout(close, 3000);
      }, 1500);
    });

    // Re-initialize form floating labels for the new form
    form.querySelectorAll('.ff').forEach(ff => {
      const input = ff.querySelector('input,textarea,select');
      if (!input) return;
      function chk() { ff.classList.toggle('filled', input.value.length > 0); }
      input.addEventListener('focus', () => ff.classList.add('focused'));
      input.addEventListener('blur', () => { ff.classList.remove('focused'); chk(); });
      input.addEventListener('input', chk);
      chk(); // init
    });
  }

  // ESC key to close
  window.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal.classList.contains('on')) close();
  });
}

/* ── GSAP ANIMATIONS ────────────────────────────────────────────── */
function initGSAP(){
  if(!window.gsap || !window.ScrollTrigger) return;
  const G = gsap;
  G.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({limitCallbacks:true, ignoreMobileResize:true});

  /* ScrollTrigger.normalizeScroll is handled by Lenis now */
  // try { ScrollTrigger.normalizeScroll({allowNestedScroll:true, ...}); } catch(_e){}

  /* Hand key elements off from IntersectionObserver to GSAP */
  document.querySelectorAll(
    '.stat-cell,.svc-card,.pi,.client-card,.cta-inner > *,.divider,.tl-grid,.tl-item'
  ).forEach(el=>{
    el.removeAttribute('data-r');
    el.removeAttribute('data-d');
    el.classList.remove('on');
    el.style.opacity = el.style.transform = el.style.transition = '';
  });

  /* ── HERO entrance timeline ─────────────────────────────── */
  const heroImg = document.getElementById('hero-img');
  const eyLine  = document.querySelector('.hero-ey-line');
  if(eyLine) G.set(eyLine, {scaleX:0, transformOrigin:'left center'});
  if(heroImg){ heroImg.classList.remove('on'); G.set(heroImg,{clipPath:'inset(0% 100% 0% 0%)',opacity:1}); }

  const tl = G.timeline({delay:0.2});
  tl
    .to('.hero-ey-line',         {scaleX:1, duration:.75, ease:'power3.inOut'}, 0)
    .from('.hero-ey .lbl',       {opacity:0, y:12, duration:.6, ease:'power3.out'}, .18)
    .from('.hero-h1 .line-inner',{yPercent:110, opacity:0, stagger:.07, duration:.88, ease:'power4.out'}, .36)
    .from('.hero-sub',           {opacity:0, y:22, duration:.72, ease:'power3.out'}, .88)
    .from('.hero-acts > *',      {opacity:0, y:16, stagger:.1, duration:.6, ease:'power3.out'}, 1.02)
    .to(heroImg||{},             {clipPath:'inset(0% 0% 0% 0%)', duration:1.35, ease:'power4.inOut'}, .48)
    .from('.hero-badge1',        {opacity:0, scale:.7, y:22, duration:.72, ease:'back.out(1.7)'}, 1.42)
    .from('.hero-badge2',        {opacity:0, scale:.7, y:-18, duration:.72, ease:'back.out(1.7)'}, 1.58)
    .from('#hero-scroll',        {opacity:0, y:16, duration:.6, ease:'power2.out'}, 1.72);

  /* ── Scroll-scrub parallax ──────────────────────────────── */
  G.to('#hero-pg',{
    scrollTrigger:{trigger:document.querySelector('.hero') ? '.hero' : '.phero', start:'top top', end:'bottom top', scrub:1.4},
    y:'30%', ease:'none'
  });
  G.to('.hero-slideshow',{
    scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:1.1},
    yPercent:7,
    scale:1.05,
    ease:'none'
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
  G.utils.toArray('.sec').forEach((sec,i)=>{
    G.fromTo(sec,
      {y:36, opacity:.72},
      {
        y:0,
        opacity:1,
        ease:'none',
        scrollTrigger:{
          trigger:sec,
          start:'top 92%',
          end:'top 58%',
          scrub:1 + (i % 3) * .08
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

  /* ── Marquee band ───────────────────────────────────────── */
  G.from('.mqband',{
    scrollTrigger:{trigger:'.mqband', start:'top 91%', once:true},
    opacity:0, y:20, duration:.7, ease:'power2.out'
  });

  /* ── Stats ──────────────────────────────────────────────── */
  G.from('.stat-cell',{
    scrollTrigger:{trigger:'.stat-grid', start:'top 82%', once:true},
    y:50, opacity:0, stagger:.1, duration:.78, ease:'power3.out'
  });

  /* ── Service cards &ndash; clip from bottom ──────────────────── */
  G.from('.svc-card',{
    scrollTrigger:{trigger:'.fsvc-grid', start:'top 80%', once:true},
    clipPath:'inset(0% 0% 100% 0%)', opacity:0,
    stagger:.14, duration:1, ease:'power3.inOut'
  });

  /* ── Portfolio grid (portfolio.html) ───────────────────── */
  if(document.querySelector('.pgrid')){
    G.from('.pi',{
      scrollTrigger:{trigger:'.pgrid', start:'top 90%', once:true},
      y:60, opacity:0,
      stagger:{each:.1, from:'start'}, duration:.9, ease:'power3.out'
    });
  }
  /* ── About strip ────────────────────────────────────────── */
  G.from('.as-img',{
    scrollTrigger:{trigger:'.about-strip', start:'top 77%', once:true},
    x:-60, opacity:0, duration:1.15, ease:'power3.out'
  });
  G.from('.about-strip > div:last-child > *',{
    scrollTrigger:{trigger:'.about-strip', start:'top 77%', once:true},
    x:44, opacity:0, stagger:.09, duration:.88, ease:'power3.out', delay:.1
  });

  /* ── Client logos ───────────────────────────────────────── */
  G.from('.client-card',{
    scrollTrigger:{trigger:'.client-grid', start:'top 82%', once:true},
    opacity:0, scale:.86, stagger:.03, duration:.55, ease:'power2.out'
  });

  /* ── CTA band ───────────────────────────────────────────── */
  G.from('.cta-inner > *',{
    scrollTrigger:{trigger:'.cta-band', start:'top 77%', once:true},
    y:42, opacity:0, stagger:.1, duration:.88, ease:'power3.out'
  });
  G.from('.cstrip-item',{
    scrollTrigger:{trigger:'.cstrip', start:'top 85%', once:true},
    y:24, opacity:0, stagger:.1, duration:.7, ease:'power3.out'
  });

  /* ── Dividers ───────────────────────────────────────────── */
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
