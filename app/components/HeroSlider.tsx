"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Video slide data
// ---------------------------------------------------------------------------
const SLIDES = [
  { src: "/images/slider/1.MP4", label: "Slide 1" },
  { src: "/images/slider/2.MP4", label: "Slide 2" },
] as const;

const FADE_DURATION_S = 1.3;
const FADE_EASE = [0.25, 0.1, 0.25, 1.0] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  return (
    <section
      aria-label="Hero video slider"
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
          <video
            key={SLIDES[current].src}
            src={SLIDES[current].src}
            autoPlay
            muted
            playsInline
            onEnded={advance}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Subtle bottom gradient only — keeps nav readable without darkening video */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, transparent 55%, rgba(6,6,6,.50) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

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
            aria-label={`Go to slide ${i + 1}: ${slide.label}`}
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
