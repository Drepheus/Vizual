"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Rocket, Crown, Zap, ArrowRight, Play, Pause } from "lucide-react";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const WELCOME_VIDEOS = [
  "/videos/grokquick6.mp4",
  "/videos/grokquick2.mp4",
  "/videos/grokquick5.mp4",
];

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fadeClass, setFadeClass] = useState("opacity-100");
  const [entered, setEntered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Entrance animation
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setEntered(true), 50);
      return () => clearTimeout(t);
    } else {
      setEntered(false);
    }
  }, [isOpen]);

  // Auto-advance videos
  const handleVideoEnd = () => {
    setFadeClass("opacity-0");
    setTimeout(() => {
      setCurrentVideo((prev) => (prev + 1) % WELCOME_VIDEOS.length);
      setFadeClass("opacity-100");
    }, 400);
  };

  // Play new video when currentVideo changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentVideo]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-500 ${entered ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Modal Container - Portrait Split Screen */}
      <div
        className={`relative z-10 flex w-full max-w-[900px] h-[min(88vh,720px)] rounded-[24px] overflow-hidden shadow-2xl shadow-black/40 border border-white/[0.08] transition-all duration-700 ease-out ${
          entered
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        {/* ═══════════════ LEFT PANEL — Content ═══════════════ */}
        <div className="relative flex flex-col w-[55%] max-sm:w-full bg-[#08080c] overflow-y-auto">
          {/* Animated gradient border on right edge */}
          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent max-sm:hidden" />

          {/* Top glow accent */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:rotate-90 duration-300"
          >
            <X size={16} className="text-gray-400" />
          </button>

          {/* Content */}
          <div className="relative flex flex-col justify-between h-full px-7 sm:px-9 pt-10 pb-7">
            {/* Header */}
            <div>
              {/* Beta badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] mb-5 transition-all duration-700 delay-200 ${
                  entered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                <Rocket size={13} className="text-gray-300" />
                <span className="text-[11px] font-semibold text-gray-300 tracking-[0.15em] uppercase">
                  Beta Access
                </span>
              </div>

              {/* Heading */}
              <h1
                className={`${spaceGrotesk.className} text-[28px] sm:text-[34px] font-bold leading-[1.15] mb-4 transition-all duration-700 delay-300 ${
                  entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <span className="text-white">Welcome to </span>
                <span
                  className="bg-clip-text text-transparent animate-chrome-shimmer"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #666666 0%, #888888 15%, #ffffff 30%, #e8e8e8 45%, #b8b8b8 60%, #888888 75%, #666666 100%)',
                    backgroundSize: '200% 100%',
                  }}
                >
                  Vizual
                </span>
              </h1>

              <p
                className={`text-gray-400 text-[15px] leading-relaxed mb-7 transition-all duration-700 delay-400 ${
                  entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                You&apos;re in! As a beta tester, you get{" "}
                <span className="text-white font-medium">unlimited generations</span>{" "}
                on the free plan to explore and create.
              </p>

              {/* Feature cards */}
              <div className="space-y-3">
                {/* Free tier */}
                <div
                  className={`group relative p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 delay-500 ${
                    entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
                      <Sparkles size={16} className="text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-semibold mb-0.5">Free Plan</h3>
                      <p className="text-gray-500 text-[13px] leading-snug">
                        Unlimited image & video generations with our standard models. No credit card needed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upgraded tiers */}
                <div
                  className={`group relative p-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.18] transition-all duration-500 delay-[600ms] ${
                    entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  {/* Corner shimmer */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/[0.04] to-transparent rounded-tr-2xl pointer-events-none" />
                  <div className="flex items-start gap-3.5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.14] flex items-center justify-center">
                      <Crown size={16} className="text-white/80" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-semibold mb-0.5">
                        Upgraded Plans{" "}
                        <span className="text-[10px] font-medium text-white/60 bg-white/[0.08] px-2 py-0.5 rounded-full ml-1.5">
                          THE MAGIC
                        </span>
                      </h3>
                      <p className="text-gray-500 text-[13px] leading-snug">
                        Access premium models like{" "}
                        <span className="text-white/70">Flux Pro</span>,{" "}
                        <span className="text-white/70">Ideogram</span>, and{" "}
                        <span className="text-white/70">Seedance</span>{" "}
                        — the real power behind studio-quality results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div
              className={`mt-6 transition-all duration-700 delay-700 ${
                entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {/* Divider */}
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

              {/* Tip */}
              <div className="flex items-center gap-2 mb-5">
                <Zap size={13} className="text-white/40" />
                <p className="text-[12px] text-gray-500">
                  <span className="text-gray-400">Pro tip:</span> Try the free models first, then upgrade when you&apos;re ready for the next level.
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={onClose}
                className="group w-full relative overflow-hidden py-3.5 px-6 rounded-2xl font-semibold text-[15px] transition-all duration-300 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
              >
                {/* Button bg - white/silver */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white transition-opacity duration-300" />
                {/* Hover shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-white to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Travelling shine */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <span className="relative flex items-center justify-center gap-2 text-black">
                  Start Creating
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════ RIGHT PANEL — Video Showcase ═══════════════ */}
        <div className="relative w-[45%] max-sm:hidden bg-black flex flex-col">
          {/* Video */}
          <div className="relative flex-1 overflow-hidden">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover transition-opacity duration-400 ${fadeClass}`}
              src={WELCOME_VIDEOS[currentVideo]}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

            {/* Top label */}
            <div
              className={`absolute top-4 left-4 right-4 flex items-center justify-between transition-all duration-700 delay-500 ${
                entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                <span className="text-[10px] font-semibold text-white/70 tracking-[0.15em] uppercase">
                  Made with Vizual
                </span>
              </div>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Play / Pause */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={togglePlayPause}
                  className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
                >
                  {isPlaying ? (
                    <Pause size={14} className="text-white" />
                  ) : (
                    <Play size={14} className="text-white ml-0.5" />
                  )}
                </button>
                <span className="text-[11px] text-white/50 font-medium">
                  {currentVideo + 1} / {WELCOME_VIDEOS.length}
                </span>
              </div>

              {/* Video dots */}
              <div className="flex items-center gap-2">
                {WELCOME_VIDEOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFadeClass("opacity-0");
                      setTimeout(() => {
                        setCurrentVideo(i);
                        setFadeClass("opacity-100");
                      }, 300);
                    }}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === currentVideo
                        ? "flex-1 bg-gradient-to-r from-white to-gray-400"
                        : "flex-1 bg-white/15 hover:bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
