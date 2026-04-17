/* ══════════════════════════════════════════════════════════════════
   BMG INTERIORS — MASTER JAVASCRIPT
   ══════════════════════════════════════════════════════════════════ */
;(function(){
'use strict';

const CDN_URL = window.BMG_CDN_URL || '';
let appBooted = false;

function safeRun(name, fn){
  try { fn(); }
  catch (err) { console.error(`[BMG] ${name} failed`, err); }
}

function boot(){
  if(appBooted) return;
  appBooted = true;

  const runInits = () => {
    safeRun('initHero', initHero);
    safeRun('initGSAP', initGSAP);
    safeRun('initReveal', initReveal);
    safeRun('initCounters', initCounters);
    safeRun('initMarquees', initMarquees);
    safeRun('initPortfolio', initPortfolio);
    safeRun('initShowcase', initShowcase);
    safeRun('initTestimonials', initTestimonials);
    safeRun('initAccordions', initAccordions);
    safeRun('initForms', initForms);
    safeRun('initMagnetic', initMagnetic);
    safeRun('initParallax', initParallax);
    safeRun('initCTA', initCTA);
    safeRun('initHeroSlideshow', initHeroSlideshow);
    safeRun('initLegacy', initLegacy);
  };

  initCinematicScroll().catch(() => {}).finally(runInits);
  // Also listen for footer load which contains the CTA modal
  window.addEventListener('footerLoaded', () => safeRun('initCTA', initCTA));
}

/* ── CURSOR ─────────────────────────────────────────────────────── */
const cur  = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
if(cur && ring){
  let mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my, cs=1, ts=1;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  });
  (function raf(){
    cs += (ts-cs)*.18;
    rx += (mx-rx)*.1; ry += (my-ry)*.1;
    cur.style.transform  = 'translate('+(mx-16)+'px,'+(my-16)+'px) scale('+cs.toFixed(3)+')';
    ring.style.transform = 'translate('+(rx-18)+'px,'+(ry-18)+'px) scale('+(1+(ts-1)*.4).toFixed(3)+')';
    requestAnimationFrame(raf);
  })();
  document.querySelectorAll('a,button,[data-cur]').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ ts=2; document.body.classList.add('c-hover'); });
    el.addEventListener('mouseleave',()=>{ ts=1; document.body.classList.remove('c-hover'); });
  });
  document.addEventListener('mouseleave',()=>document.body.classList.add('c-hide'));
  document.addEventListener('mouseenter',()=>document.body.classList.remove('c-hide'));
}

/* ── M.PNG CLICK BURST ──────────────────────────────────────────── */
// Disabled - click burst removed per user request

/* ── PAGE WIPE TRANSITIONS ──────────────────────────────────────── */
const wipe = document.getElementById('wipe');
function wipeOut(){
  if(!wipe) return;
  wipe.classList.remove('wipe-in');
  void wipe.offsetWidth; // force reflow so transition fires
  wipe.classList.add('wipe-out');
}
if(wipe){
  // on load &rarr; wipe out
  setTimeout(wipeOut, 60);

  // When navigating back/forward, bfcache restores the page with wipe-in still active.
  // The pageshow event fires on cache restoration (e.persisted === true) — clear it immediately.
  window.addEventListener('pageshow', e => { if(e.persisted) wipeOut(); });

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
  const entranceTl = G ? G.timeline({ delay: 0 }) : null;
  if (entranceTl && logoImg) {
    entranceTl
      .to(logoImg, { 
        opacity: 1, scale: 1, y: 0, 
        duration: 0.4, ease: "power3.out" 
      })
      .to(tag, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.2")
      .to(bottom, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.5");
    
    // Smooth breathing float
    G.to(logoImg, { y: -4, duration: 2, ease: "sine.inOut", repeat: -1, yoyo: true });
  }

  let done = false, finished = false, doneAt = null;
  const start = performance.now();
  const minDuration = 1200; // Total duration
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

  if (document.readyState === 'complete') setTimeout(markDone, 80);
  else window.addEventListener('load', () => setTimeout(markDone, 80), { once: true });
  
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
      const t = Math.min(1, (elapsed - doneAt) / 200); 
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
              setTimeout(boot, 200); 
            }
          });

          exitTl
            .to(".ld-curtain-up", { xPercent: -100, duration: 0.7, ease: "expo.inOut" }, 0)
            .to(".ld-curtain-dn", { xPercent: 100, duration: 0.7, ease: "expo.inOut" }, 0.03)
            .to([logoImg, tag, bottom], { 
              opacity: 0, y: -30, scale: 0.95, 
              duration: 0.35, ease: "power3.in",
              stagger: 0.03,
              overwrite: true 
            }, 0)
            .to(".ld-ring, .ld-ring2, .ld-ring3, .ld-glow", {
              opacity: 0,
              duration: 0.2, ease: "power2.in",
              overwrite: true
            }, 0);
        } else {
          boot(); // Fallback if GSAP is missing
        }
        
        setTimeout(() => { loader.style.display = 'none'; }, 650);
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

// Loader/timeline/network edge-case guard: ensure app initializes.
setTimeout(boot, 3500);

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

function ensureBlogsMenuLink(){
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

function restrictHeaderMenu() {
  const wanted = [
    { href: 'index.html', label: 'Home' },
    { href: 'portfolio.html', label: 'Portfolio' },
    { href: 'about.html', label: 'About' },
    { href: 'blogs.html', label: 'Blogs' },
    { href: 'contact.html', label: 'Contact' },
  ];

  const desktopMenu = document.querySelector('.nav-ul');
  if (desktopMenu) {
    const byHref = new Map();
    desktopMenu.querySelectorAll('a[href]').forEach(a => {
      byHref.set(a.getAttribute('href'), a);
    });

    desktopMenu.innerHTML = '';
    wanted.forEach(item => {
      const li = document.createElement('li');
      const existing = byHref.get(item.href);
      const a = existing || document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.classList.remove('cur');
      li.appendChild(a);
      desktopMenu.appendChild(li);
    });
  }

  const mobileMenu = document.getElementById('nav-mob');
  if (mobileMenu) {
    const byHref = new Map();
    mobileMenu.querySelectorAll('a[href]').forEach(a => {
      const text = (a.textContent || '').trim().toLowerCase();
      if (text.includes('start a project')) return;
      const href = a.getAttribute('href');
      if (!byHref.has(href)) byHref.set(href, a);
    });

    mobileMenu.querySelectorAll('a').forEach(a => a.remove());
    wanted.forEach(item => {
      const existing = byHref.get(item.href);
      const a = existing || document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.classList.remove('cur');
      mobileMenu.appendChild(a);
    });
  }

  const navRight = document.querySelector('.nav-r');
  if (navRight) navRight.remove();
}

restrictHeaderMenu();

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

/* ── HERO SLIDESHOW — video slider ──────────────────────────────── */
function initHeroSlideshow(){
  const container = document.getElementById('hero-slideshow');
  if(!container) return;

  const fallbackImages = [
    'https://pub-3c8161b71644435fa8e9341666f0af9f.r2.dev/images/mehta-residence/photo-1.JPG',
    'https://pub-3c8161b71644435fa8e9341666f0af9f.r2.dev/images/projects/vertex-hq/photo-1.JPG',
    'https://pub-3c8161b71644435fa8e9341666f0af9f.r2.dev/images/projects/aurum-office/photo-1.webp'
  ];

  const vProbe = document.createElement('video');
  const canPlayHevc =
    !!(vProbe.canPlayType('video/mp4; codecs="hvc1"') || vProbe.canPlayType('video/mp4; codecs="hev1"'));

  const videos = [
    ['https://pub-3c8161b71644435fa8e9341666f0af9f.r2.dev/images/slider/4.mp4'],
    ['https://pub-3c8161b71644435fa8e9341666f0af9f.r2.dev/images/slider/3.mp4'],
    ['https://pub-3c8161b71644435fa8e9341666f0af9f.r2.dev/images/slider/2.mp4']
  ];

  let currentSlide    = 0;
  let isTransitioning = false;

  const DUR_IN  = 1.2;
  const DUR_OUT = 1.0;

  /* ── Build slides ── */
  const applySourceFallback = (vid, sources, onExhausted) => {
    let idx = 0;
    const tryNext = () => {
      if (idx >= sources.length) {
        if (onExhausted) onExhausted();
        return;
      }
      vid.src = sources[idx++];
      vid.load();
    };
    vid.addEventListener('error', tryNext);
    tryNext();
  };

  const createSlide = (sources, index) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (index === 0 ? ' active' : '');
    // promote each slide to its own GPU layer for tear-free crossfade
    slide.style.cssText = 'will-change:opacity;';

    const fallback = document.createElement('div');
    fallback.style.cssText = 'position:absolute;inset:0;background:center/cover no-repeat;display:none;';
    fallback.style.backgroundImage = `url('${fallbackImages[index] || fallbackImages[0]}')`;
    slide.appendChild(fallback);

    const vid = document.createElement('video');
    const showFallback = () => {
      fallback.style.display = 'block';
      vid.style.display = 'none';
    };
    applySourceFallback(vid, sources, showFallback);
    vid.muted      = true;
    vid.defaultMuted = true;
    vid.autoplay   = true;
    vid.setAttribute('muted', '');
    vid.setAttribute('autoplay', '');
    vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.loop       = false;
    // preload all videos so they're buffered before transition
    vid.preload    = 'auto';
    vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    vid.addEventListener('error', showFallback);
    if (!canPlayHevc) {
      setTimeout(() => {
        if (vid.readyState < 2) showFallback();
      }, 1800);
    }
    slide.appendChild(vid);
    return slide;
  };

  videos.forEach((sources, i) => container.appendChild(createSlide(sources, i)));
  const slides   = Array.from(container.querySelectorAll('.hero-slide'));
  const videoEls = slides.map(s => s.querySelector('video'));

  /* ── UI references ── */
  const progressEl = document.getElementById('hero-progress');
  const bulletsEl  = document.getElementById('hero-bullets');
  const curNumEl   = document.getElementById('hero-cur');
  const totalEl    = document.getElementById('hero-total');

  if (totalEl) totalEl.textContent = String(videos.length).padStart(2, '0');

  /* ── Progress bar ── */
  let progressRAF = null;
  const updateProgress = () => {
    if (!progressEl) return;
    const vid = videoEls[currentSlide];
    if (vid && vid.duration) {
      progressEl.style.cssText = `transition:none;width:${(vid.currentTime / vid.duration) * 100}%`;
    }
    progressRAF = requestAnimationFrame(updateProgress);
  };
  const startProgress = () => {
    if (progressEl) progressEl.style.cssText = 'transition:none;width:0%';
    if (progressRAF) cancelAnimationFrame(progressRAF);
    progressRAF = requestAnimationFrame(updateProgress);
  };
  const stopProgress = () => {
    if (progressRAF) { cancelAnimationFrame(progressRAF); progressRAF = null; }
    if (progressEl)  progressEl.style.cssText = 'transition:none;width:0%';
  };

  /* ── Pre-buffer a video so it's ready to play instantly ── */
  const primeVideo = (vid) => {
    return new Promise(resolve => {
      if (vid.readyState >= 3) { resolve(); return; } // HAVE_FUTURE_DATA
      const onReady = () => { vid.removeEventListener('canplay', onReady); resolve(); };
      vid.addEventListener('canplay', onReady);
      // safety: don't wait more than 1.5s
      setTimeout(resolve, 1500);
      if (vid.preload !== 'auto') { vid.preload = 'auto'; vid.load(); }
    });
  };

  /* ── Prefetch next slide starting from 80% through current video ── */
  let prefetchDone = [];
  let fallbackTicker = null;
  const prefetchNext = () => {
    const next = (currentSlide + 1) % videos.length;
    if (prefetchDone[next]) return;
    prefetchDone[next] = true;
    const v = videoEls[next];
    v.preload = 'auto';
    // silent play+immediate pause to force buffer fill on some browsers
    v.play().then(() => v.pause()).catch(() => {});
  };

  /* ── Slide transition ── */
  const changeSlide = (direction = 1, targetIndex = null) => {
    if (isTransitioning || slides.length < 2) return;
    isTransitioning = true;

    const nextIndex = targetIndex !== null
      ? targetIndex
      : (currentSlide + direction + videos.length) % videos.length;

    const outgoing = slides[currentSlide];
    const incoming = slides[nextIndex];
    const outVid   = videoEls[currentSlide];
    const inVid    = videoEls[nextIndex];

    stopProgress();

    if (bulletsEl) {
      Array.from(bulletsEl.children).forEach((b, idx) =>
        b.classList.toggle('active', idx === nextIndex));
    }

    // Wait for next video to be buffered before starting crossfade
    inVid.currentTime = 0;
    primeVideo(inVid).then(() => {
      inVid.play().catch(() => {});
      incoming.classList.add('active');

      if (window.gsap) {
        gsap.set(incoming, { opacity: 0, zIndex: 2 });
        gsap.set(outgoing, { zIndex: 1 });

        gsap.timeline({
          onComplete: () => {
            outgoing.classList.remove('active');
            outVid.pause();
            outVid.currentTime = 0;
            gsap.set(outgoing, { clearProps: 'all' });
            gsap.set(incoming, { clearProps: 'opacity,zIndex' });
            currentSlide    = nextIndex;
            isTransitioning = false;
            startProgress();
            if (curNumEl) curNumEl.textContent = String(nextIndex + 1).padStart(2, '0');
          }
        })
        .to(incoming, { opacity: 1, duration: DUR_IN,  ease: 'power2.inOut' }, 0)
        .to(outgoing, { opacity: 0, duration: DUR_OUT, ease: 'power2.inOut' }, 0);
      } else {
        incoming.style.opacity = '1';
        outgoing.style.opacity = '0';
        setTimeout(() => {
          outgoing.classList.remove('active');
          outVid.pause();
          outVid.currentTime = 0;
          incoming.style.opacity = '';
          outgoing.style.opacity = '';
          currentSlide    = nextIndex;
          isTransitioning = false;
          startProgress();
          if (curNumEl) curNumEl.textContent = String(nextIndex + 1).padStart(2, '0');
        }, Math.max(DUR_IN, DUR_OUT) * 1000);
      }
    });
  };

  /* ── Video timeupdate → prefetch next at 80% ── */
  videoEls.forEach((vid, i) => {
    vid.addEventListener('timeupdate', () => {
      if (i !== currentSlide || !vid.duration) return;
      if (vid.currentTime / vid.duration >= 0.80) prefetchNext();
    });
    vid.addEventListener('ended', () => {
      if (i === currentSlide) changeSlide(1);
    });
  });

  /* ── Bullet dots ── */
  if (bulletsEl) {
    videos.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'hero-bullet' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => {
        if (!isTransitioning && i !== currentSlide) changeSlide(0, i);
      });
      bulletsEl.appendChild(btn);
    });
  }

  const btnPrev = document.getElementById('hero-prev');
  const btnNext = document.getElementById('hero-next');
  if (btnPrev) btnPrev.onclick = () => changeSlide(-1);
  if (btnNext) btnNext.onclick = () => changeSlide(1);

  document.addEventListener('visibilitychange', () => {
    const vid = videoEls[currentSlide];
    if (!vid) return;
    if (document.hidden) { vid.pause(); stopProgress(); }
    else { vid.play().catch(() => {}); startProgress(); }
  });

  /* ── Kick off: wait for first video to be ready ── */
  primeVideo(videoEls[0]).then(() => {
    videoEls[0].play().catch(() => {});
    startProgress();
    // pre-buffer slide 2 immediately after slide 1 starts
    setTimeout(() => { prefetchDone[1] = true; primeVideo(videoEls[1]); }, 500);

    // If videos cannot decode (e.g., HEVC on some Linux builds), keep slideshow moving via timed crossfades.
    fallbackTicker = setInterval(() => {
      const v = videoEls[currentSlide];
      if (!v || !v.duration || v.paused) changeSlide(1);
    }, 6500);
  });

  /* ── Retry on first user interaction (mobile autoplay policy) ── */
  const retryPlay = () => {
    const vid = videoEls[currentSlide];
    if (vid && vid.paused) { vid.play().catch(() => {}); }
  };
  document.addEventListener('touchstart', retryPlay, { once: true, passive: true });
  document.addEventListener('click',      retryPlay, { once: true });
}

/* ── LEGACY SECTION ─────────────────────────────────────────────── */
function initLegacy(){
  const sec = document.querySelector('.legacy-sec');
  if (!sec) return;

  if (!window.gsap || !window.ScrollTrigger) return;

  const els = Array.from(sec.querySelectorAll('.legacy-num, .legacy-rule, .legacy-copy, .legacy-cta'));
  gsap.set(els, { opacity: 0, y: 18 });
  gsap.to(els, {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: sec, start: 'top 85%', once: true }
  });
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
  const cols = Array.from(document.querySelectorAll('.pw-col'));
  const filterBtns = Array.from(document.querySelectorAll('.pw-filter-btn'));
  const filterWrap = document.querySelector('.pw-filters');
  const accordion = document.querySelector('.pw-accordion');
  if(!cols.length) return;
  let activeIndex = 0;
  let frame = 0;
  let debounceTimer = 0;
  let selectedFilter = 'all';

  function activate(i){
    if(i < 0 || i >= cols.length) return;
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

  function syncActive(){
    cols.forEach((col,index)=>col.classList.toggle('active', activeIndex >= 0 && index === activeIndex));
  }

  function clearActive(){
    cancelAnimationFrame(frame);
    clearTimeout(debounceTimer);
    const firstVisible = cols.findIndex(col=>!col.classList.contains('is-muted'));
    activeIndex = firstVisible >= 0 ? firstVisible : 0;
    syncActive();
  }

  function applyFilter(filterKey, scroll = true, updateButtons = true){
    cols.forEach(col=>{
      const sector = col.dataset.sector || '';
      const match = !filterKey || filterKey === 'all' || sector === filterKey;
      col.classList.toggle('is-muted', !match);
    });

    if(updateButtons){
      selectedFilter = filterKey;
      filterBtns.forEach(btn=>{
        const isOn = btn.dataset.pwFilter === filterKey;
        btn.classList.toggle('on', isOn);
        btn.setAttribute('aria-selected', isOn ? 'true' : 'false');
      });
    }

    clearActive();

    if(scroll && accordion){
      accordion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  syncActive();

  if(filterBtns.length){
    filterBtns.forEach(btn=>{
      const key = btn.dataset.pwFilter || 'all';
      btn.addEventListener('click', ()=>applyFilter(key));
      btn.addEventListener('pointerenter', ()=>applyFilter(key, false, false));
    });

    if(filterWrap){
      filterWrap.addEventListener('pointerleave', ()=>applyFilter(selectedFilter, false, true));
    }

    const initial = filterBtns.find(btn=>btn.classList.contains('on')) || filterBtns[0];
    if(initial){
      applyFilter(initial.dataset.pwFilter || 'all', false);
    }
  }

  /* ── Detect touch-primary device ── */
  const isTouch = () => window.matchMedia('(hover:none)').matches;

  cols.forEach((col,i)=>{
    col.addEventListener('pointerenter',()=>{
      if(!isTouch()) activate(i);
    });
    col.addEventListener('pointerleave',()=>{
      if(!isTouch()) clearTimeout(debounceTimer);
    });
    col.addEventListener('focusin',()=>activate(i));

    col.addEventListener('click',(e)=>{
      if(isTouch()){
        /* First tap: expand the column. Second tap on active: navigate. */
        if(i !== activeIndex){
          e.preventDefault();
          /* Cancel any pending debounce so activate runs immediately */
          cancelAnimationFrame(frame);
          clearTimeout(debounceTimer);
          activeIndex = i;
          cols.forEach((c,idx)=>c.classList.toggle('active', idx === activeIndex));
          return;
        }
      }
      location.href='portfolio.html';
    });
  });

  if(accordion){
    accordion.addEventListener('pointerleave', ()=>{ if(!isTouch()) clearActive(); });
  }
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
    let rafId=null, dx=0, dy=0;
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      dx=(e.clientX-r.left-r.width/2)*.3;
      dy=(e.clientY-r.top-r.height/2)*.3;
      if(!rafId) rafId=requestAnimationFrame(()=>{
        btn.style.transform=`translate(${dx}px,${dy}px)`;
        rafId=null;
      });
    });
    btn.addEventListener('mouseleave',()=>{
      if(rafId){cancelAnimationFrame(rafId);rafId=null;}
      btn.style.transform='';
    });
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
