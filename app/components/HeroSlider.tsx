"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Slide data — update src/alt to match your actual images
// ---------------------------------------------------------------------------
const SLIDES = [
  { src: "/images/slider/1.jpg", alt: "Luxury Interior Design Mumbai" },
  { src: "/images/slider/2.jpg", alt: "Modern Home Interiors" },
  { src: "/images/slider/3.jpg", alt: "Premium Interior Design" },
  { src: "/images/slider/4.jpg", alt: "Elegant Living Spaces" },
  { src: "/images/slider/5.jpg", alt: "Contemporary Interiors" },
  { src: "/images/slider/6.jpg", alt: "Bespoke Interior Solutions" },
] as const;

// ---------------------------------------------------------------------------
// Timing constants
// ---------------------------------------------------------------------------
// Slide interval: 5.5 s — crossfade starts BEFORE the image feels static.
// Ken Burns runs for 9 s, so the zoom is always in motion when the fade
// begins. Perceived view time = 5.5 s + 1.3 s overlap = ~6.8 s total.
const SLIDE_DURATION_MS = 5500;
const FADE_DURATION_S   = 1.3;   // smooth crossfade; matches FADE_MS in JS

// Per-slide Ken Burns: uniform scale (1.06) with subtle per-slide focal
// points. x/y fixed at ±0.5% / ±0.3% — motion sensed, never seen.
const KEN_BURNS = [
  { scale: 1.06, x: "-0.5%", y: "-0.3%", transformOrigin: "55% 52%" },
  { scale: 1.06, x:  "0.5%", y:  "0.3%", transformOrigin: "45% 48%" },
  { scale: 1.06, x: "-0.5%", y: "-0.3%", transformOrigin: "50% 55%" },
  { scale: 1.06, x:  "0.5%", y:  "0.3%", transformOrigin: "52% 45%" },
  { scale: 1.06, x: "-0.5%", y:  "0.3%", transformOrigin: "48% 52%" },
  { scale: 1.06, x:  "0.5%", y: "-0.3%", transformOrigin: "53% 50%" },
] as const;

// [0.25, 0.1, 0.25, 1.0] — classic cinematic easeInOut.
// Gentle start and end with no asymmetric snap.
const KB_EASE   = [0.25, 0.1, 0.25, 1.0] as const;
const FADE_EASE = [0.25, 0.1, 0.25, 1.0] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [advance]);

  const kb = KEN_BURNS[current % KEN_BURNS.length];

  return (
    <section
      aria-label="Hero image slider"
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Slides                                                               */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION_S, ease: FADE_EASE }}
        >
          {/*
           * Ken Burns layer — scale + directional drift unique to each slide.
           * Duration exceeds the slide lifetime so the motion never freezes
           * mid-fade; the animation is still in progress when the next slide
           * crossfades in, which is the key to a cinematic feel.
           */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1, x: "0%", y: "0%" }}
            animate={{ scale: kb.scale, x: kb.x, y: kb.y }}
            transition={{
              duration: 9, // always > SLIDE_DURATION_MS — zoom never stops mid-fade
              ease: KB_EASE,
            }}
            style={{ transformOrigin: kb.transformOrigin }}
          >
            <Image
              src={SLIDES[current].src}
              alt={SLIDES[current].alt}
              fill
              priority={current === 0}
              className="object-cover"
              sizes="100vw"
              quality={90}
            />
          </motion.div>

          {/*
           * Depth overlay: three composited layers create a film-like look.
           * Vertical gradient anchors UI chrome, horizontal guards text,
           * radial vignette darkens corners while keeping the centre luminous.
           */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                "linear-gradient(180deg, rgba(6,6,6,.28) 0%, rgba(6,6,6,.06) 38%, rgba(6,6,6,.70) 100%)",
                "linear-gradient(90deg,  rgba(6,6,6,.52) 0%, rgba(6,6,6,.06) 52%, transparent 100%)",
                "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 45%, rgba(6,6,6,.28) 100%)",
              ].join(", "),
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/*
       * Film grain overlay — a looping SVG feTurbulence noise texture.
       * Opacity kept at 3% so it adds tactile depth without being visible
       * as a pattern. The 0.18 s animation cycle makes it feel like
       * genuine analog film rather than a static texture.
       *
       * This layer sits above all slides but below the nav so controls
       * remain fully interactive.
       */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{ opacity: 0.03 }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
              stitchTiles="stitch"
            >
              <animate
                attributeName="seed"
                from="0"
                to="100"
                dur="0.18s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Indicator nav — thin lines, understated luxury                       */}
      {/* ------------------------------------------------------------------ */}
      <nav
        aria-label="Slide indicators"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.alt}`}
            aria-current={i === current ? "true" : undefined}
            className={[
              "h-[2px] rounded-full transition-all duration-700 ease-in-out",
              i === current
                ? "w-10 bg-white"
                : "w-2 bg-white/35 hover:bg-white/60",
            ].join(" ")}
          />
        ))}
      </nav>
    </section>
  );
}
