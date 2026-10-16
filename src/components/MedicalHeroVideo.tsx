import React, { useEffect, useRef, useState } from 'react';

interface MedicalHeroVideoProps {
  posterUrl?: string;
  videoMp4Url?: string;
  videoWebmUrl?: string;
}

export const MedicalHeroVideo: React.FC<MedicalHeroVideoProps> = ({
  posterUrl = '/media/dfu-medical-hero-poster.jpg',
  videoMp4Url = '/media/dfu-medical-hero.mp4',
  videoWebmUrl = '/media/dfu-medical-hero.webm',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || isReducedMotion || hasVideoError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (container) observer.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
        setIsPlaying(false);
      } else if (container) {
        const rect = container.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) {
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isReducedMotion, hasVideoError]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] bg-[#181411] rounded-xl border border-[#40372E] shadow-2xl overflow-hidden flex items-center justify-center select-none group"
    >
      {/* Video / Poster Stage with Warm Vignette */}
      {!isReducedMotion && !hasVideoError ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterUrl}
          onError={() => setHasVideoError(true)}
          onPlaying={() => setIsPlaying(true)}
          onLoadedData={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          className="w-full h-full object-cover object-center transition-opacity duration-1000 pointer-events-none select-none contrast-[1.03] saturate-[0.98] transform-gpu"
          aria-label="Cinematic medical visualization of an anatomical human foot with optical tomography scanning illumination"
        >
          <source src={videoWebmUrl} type="video/webm" />
          <source src={videoMp4Url} type="video/mp4" />
          <img
            src={posterUrl}
            alt="Anatomical human foot side profile with optical medical tomography scanning line"
            className="w-full h-full object-cover object-center"
          />
        </video>
      ) : (
        <div className="relative w-full h-full">
          <img
            src={posterUrl}
            alt="Anatomical human foot side profile with optical medical tomography scanning line"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* Subtle Warm Dark Cinema Scrim */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#100904]/80 via-transparent to-[#100904]/20" />

      {/* Delicate Sweeping Optical Beam Line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#DC5000] to-transparent opacity-40 shadow-[0_0_16px_rgba(220,80,0,0.5)]"
          style={{
            animation: 'cinematicScan 10s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Bottom Technical Monospace Tag */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-[#817568] pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC5000]" />
          <span className="text-[#B7AA98] tracking-wider">FIGURE 1.0 · LATERAL PROJECTION</span>
        </div>
        <div className="hidden sm:block tracking-wider">
          384×384 INPUT MATRIX · 30 FPS
        </div>
      </div>

      <style>{`
        @keyframes cinematicScan {
          0% {
            left: 10%;
            opacity: 0.2;
          }
          50% {
            left: 55%;
            opacity: 0.65;
          }
          100% {
            left: 90%;
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};
