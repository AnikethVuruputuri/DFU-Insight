import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface CinematicHeroProps {
  onStartAnalysis: () => void;
}

// Phases of the cinematic intro
type IntroPhase = 'video-only' | 'revealing' | 'complete';

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  onStartAnalysis,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<IntroPhase>('video-only');
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const revealTriggeredRef = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  // Trigger the content reveal sequence
  const triggerReveal = useCallback(() => {
    if (revealTriggeredRef.current) return;
    revealTriggeredRef.current = true;
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    setPhase('revealing');

    // Mark intro as complete after the last animation finishes
    setTimeout(() => {
      setPhase('complete');
    }, 2200);
  }, []);

  // Reduced motion: skip intro entirely
  useEffect(() => {
    if (prefersReducedMotion) {
      triggerReveal();
    }
  }, [prefersReducedMotion, triggerReveal]);

  // Fallback: if video doesn't load within 4 seconds, reveal anyway
  useEffect(() => {
    if (videoFailed || prefersReducedMotion) return;

    fallbackTimerRef.current = setTimeout(() => {
      if (!revealTriggeredRef.current) {
        console.info('[CinematicHero] Fallback reveal triggered (video load timeout)');
        triggerReveal();
      }
    }, 4000);

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [videoFailed, prefersReducedMotion, triggerReveal]);

  // Video error handler
  const handleVideoError = useCallback(() => {
    setVideoFailed(true);
    console.info('[CinematicHero] Video failed to load, using fallback');
    triggerReveal();
  }, [triggerReveal]);

  // Video metadata loaded — we now know the duration
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setVideoDuration(video.duration);
    setVideoReady(true);
  }, []);

  // Video can play — attempt autoplay
  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    setVideoReady(true);

    // Reset to start
    if (video.currentTime > 0.5) {
      video.currentTime = 0;
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.info('[CinematicHero] Autoplay blocked:', err.message);
        // Autoplay blocked — reveal content immediately
        triggerReveal();
      });
    }
  }, [prefersReducedMotion, triggerReveal]);

  // Track video playback to trigger reveal at the right moment
  const handleTimeUpdate = useCallback(() => {
    if (revealTriggeredRef.current) return;

    const video = videoRef.current;
    if (!video || !videoDuration) return;

    // Start reveal ~3 seconds before end (or at 70% through, whichever is earlier)
    const revealThreshold = Math.min(videoDuration - 3, videoDuration * 0.7);
    if (video.currentTime >= revealThreshold) {
      triggerReveal();
    }
  }, [videoDuration, triggerReveal]);

  // Video ended — ensure content is revealed
  const handleEnded = useCallback(() => {
    if (!revealTriggeredRef.current) {
      triggerReveal();
    }
    // Restart looping manually to avoid flicker
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [triggerReveal]);

  const isRevealing = phase === 'revealing' || phase === 'complete';
  const skipAnimation = !!prefersReducedMotion;

  // Animation variants
  const fadeUp = (delay: number, y = 20) => ({
    initial: skipAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y },
    animate: isRevealing
      ? { opacity: 1, y: 0 }
      : skipAnimation
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y },
    transition: skipAnimation
      ? { duration: 0 }
      : {
          duration: 0.9,
          delay,
          ease: [0.25, 0.1, 0.25, 1.0] as const,
        },
  });

  return (
    <section className="relative w-full min-h-[calc(100vh-5rem)] lg:min-h-[580px] lg:max-h-[800px] flex items-center overflow-hidden bg-[#0a0604] border-b border-[#40372E]/60">
      {/* Layer 1: Deep warm-black base */}
      <div className="absolute inset-0 bg-[#0a0604]" />

      {/* Layer 2: Full-screen video background */}
      {!videoFailed && (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleVideoError}
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transition-opacity duration-1000 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ willChange: 'opacity' }}
          aria-hidden="true"
        >
          <source src="/media/dfu-hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Layer 3: Cinematic gradient overlay — dark left for text readability */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1500 ${
          isRevealing ? 'opacity-100' : 'opacity-40'
        }`}
        style={{
          background: `
            linear-gradient(
              to right,
              rgba(10, 6, 4, 0.92) 0%,
              rgba(10, 6, 4, 0.80) 30%,
              rgba(10, 6, 4, 0.40) 55%,
              rgba(10, 6, 4, 0.15) 75%,
              rgba(10, 6, 4, 0.25) 100%
            ),
            linear-gradient(
              to top,
              rgba(10, 6, 4, 0.75) 0%,
              transparent 35%,
              transparent 65%,
              rgba(10, 6, 4, 0.45) 100%
            )
          `,
        }}
      />

      {/* Layer 4: Hero content — positioned left with balanced, intentional spacing */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16">
        <div className="max-w-2xl space-y-7">
          {/* Main Headline */}
          <motion.h1
            {...fadeUp(0, 24)}
            className="text-4xl sm:text-6xl lg:text-7xl font-normal text-[#FFEDD7] tracking-display leading-display uppercase"
          >
            Understand <br />
            the wound. <br />
            <span className="text-[#B7AA98]">Interpret</span> <br />
            the evidence.
          </motion.h1>

          {/* Description */}
          <motion.p
            {...fadeUp(0.18, 16)}
            className="text-sm sm:text-base lg:text-lg text-[#B7AA98] font-light leading-relaxed max-w-xl"
          >
            An explainable AI research platform for diabetic foot-ulcer
            pathology classification and Wagner severity assessment. Powered
            by dual-branch deep representation alignment across convolutional
            and self-attention vision backbones.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            {...fadeUp(0.36, 14)}
            className="flex flex-wrap items-center gap-4 pt-1"
          >
            <button
              onClick={onStartAnalysis}
              className="px-6 py-3.5 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#DC5000]"
            >
              <span>Analyze an Image</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('problem');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-3.5 text-xs font-mono text-[#B7AA98] hover:text-[#FFEDD7] transition-colors flex items-center gap-1.5"
            >
              <span>Explore the Research</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#817568]" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Subtle scan line effect */}
      {!prefersReducedMotion && videoReady && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
          <div
            className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#DC5000] to-transparent opacity-30 shadow-[0_0_16px_rgba(220,80,0,0.4)]"
            style={{
              animation: 'cinematicScan 10s ease-in-out infinite alternate',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes cinematicScan {
          0% { left: 10%; opacity: 0.15; }
          50% { left: 55%; opacity: 0.5; }
          100% { left: 90%; opacity: 0.15; }
        }
      `}</style>
    </section>
  );
};
