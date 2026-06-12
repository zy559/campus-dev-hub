"use client";

import { useState, useEffect, useCallback } from "react";

interface CarouselSlide {
  id: string;
  image?: string;      // fallback CSS background (e.g. gradient)
  img?: string;        // preferred: <img src>, renders with object-cover
  title: string;
  description: string;
  link?: string;
}

interface AutoCarouselProps {
  slides: CarouselSlide[];
  interval?: number;
}

export default function AutoCarousel({ slides, interval = 4000 }: AutoCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval, paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="精选内容轮播"
    >
      <div className="relative min-h-[320px] sm:min-h-[360px]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              i === active
                ? "opacity-100 translate-x-0"
                : i < active
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
            aria-hidden={i !== active}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}`}
          >
            {/* Background: image or CSS gradient */}
            {slide.img ? (
              <img
                src={slide.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                loading={i === 0 ? "eager" : "lazy"}
              />
            ) : (
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ background: slide.image }}
              />
            )}
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-2xl" />

            {/* Text content */}
            <div className="relative flex items-end h-full min-h-[320px] sm:min-h-[360px] p-8 sm:p-12">
              <div className="max-w-lg">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-sm">
                  {slide.title}
                </h3>
                <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-4 drop-shadow-sm">
                  {slide.description}
                </p>
                {slide.link && (
                  <a
                    href={slide.link}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white transition-colors"
                  >
                    了解更多
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-all"
            aria-label="上一张"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-all"
            aria-label="下一张"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" role="tablist">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === active ? "bg-white w-8" : "bg-white/50 hover:bg-white/70"
              }`}
              role="tab"
              aria-selected={i === active}
              aria-label={`第 ${i + 1} 张`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
