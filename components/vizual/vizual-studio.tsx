"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { ArrowUp, ChevronDown, ChevronUp, X, PenTool, Palette, Sparkles, Zap, Layout, CreditCard, ArrowUpRight, Mail, Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google";
import { useAuth } from "@/context/auth-context";
import { useGuestMode } from "@/context/guest-mode-context";
import { motion, AnimatePresence } from "framer-motion";
import Aurora from "./Aurora";
import { HoverBorderGradient } from "@/src/components/ui/hover-border-gradient";

// CDN base URL for video assets
const CDN_BASE = "https://storage.googleapis.com/vizual-cdn-assets";

// Chrome/Silver gradient text component with shimmer animation
const ChromeText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span
    className={`bg-clip-text text-transparent animate-chrome-shimmer ${className}`}
    style={{
      backgroundImage: 'linear-gradient(90deg, #666666 0%, #888888 15%, #ffffff 30%, #e8e8e8 45%, #b8b8b8 60%, #888888 75%, #666666 100%)',
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </span>
);

// HoverVideo component - two modes:
// 1. autoPlay=true: plays when visible, pauses when not (for hero/single videos)
// 2. autoPlay=false: plays on hover (desktop) or tap (mobile) - for video grids like Categories
const HoverVideo = ({ src, className = "", autoPlay = false, poster }: { src: string; className?: string; autoPlay?: boolean; poster?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const mobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(mobile);
    // On mobile, try to load video immediately for first frame
    if (mobile && videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  // Intersection observer - handles visibility-based autoplay for single videos
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasVisible = isVisible;
          setIsVisible(entry.isIntersecting);
          
          if (entry.isIntersecting) {
            // AutoPlay mode: play when visible
            if (autoPlay && videoRef.current) {
              videoRef.current.play().catch(() => { });
              setIsPlaying(true);
            }
          } else {
            // Pause when not visible (both modes)
            if (videoRef.current && isPlaying) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [autoPlay, isPlaying, isVisible]);

  // Desktop hover: Play on mouse enter (only for non-autoPlay mode)
  const handleMouseEnter = () => {
    if (!autoPlay && !isMobile && videoRef.current && isVisible) {
      videoRef.current.play().catch(() => { });
      setIsPlaying(true);
    }
  };

  // Desktop hover: Pause on mouse leave (only for non-autoPlay mode)
  const handleMouseLeave = () => {
    if (!autoPlay && !isMobile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Mobile: Toggle play on tap (only for non-autoPlay mode)
  const handleTap = () => {
    if (!autoPlay && isMobile && videoRef.current && isVisible) {
      if (isPlaying) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => { });
        setIsPlaying(true);
      }
    }
  };

  // Handle video loaded - show first frame for non-autoPlay
  const handleLoadedData = () => {
    setHasLoaded(true);
    if (videoRef.current && !autoPlay && !isPlaying) {
      videoRef.current.currentTime = 0.1; // Show first frame
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${!autoPlay ? 'cursor-pointer' : ''} ${className}`}
      style={{
        contentVisibility: 'auto',
        contain: 'layout style paint'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
    >
      {/* Placeholder gradient - shown while video not loaded */}
      {!hasLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-600 via-neutral-700 to-neutral-800 flex items-center justify-center">
          {/* Play button indicator */}
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white/80 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      {/* Video */}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        poster={poster}
        preload={isMobile ? "auto" : (isVisible ? "metadata" : "none")}
        className={`w-full h-full object-cover transition-opacity duration-200 ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadedData={handleLoadedData}
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Play indicator on mobile when not playing (only for non-autoPlay) */}
      {!autoPlay && isMobile && !isPlaying && hasLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom hook for scroll-triggered animations - optimized with early detection
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Use requestAnimationFrame for smoother class updates
        requestAnimationFrame(() => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
              // Unobserve after animation to reduce overhead
              observer.unobserve(entry.target);
            }
          });
        });
      },
      {
        threshold: 0.05, // Trigger earlier
        rootMargin: '50px 0px 0px 0px' // Start animating before fully in view
      }
    );

    const elements = ref.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
};

const inter = Inter({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export function VizualStudio() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setGuestMode } = useGuestMode();
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handle Try Now button click
  const handleTryNow = () => {
    if (loading) return;
    if (user) {
      router.push('/vizual/studio');
    } else {
      setShowInputModal(false);
      setShowLoginModal(true);
    }
  };

  // State for email sign-in
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Initiating Google Login with redirect:', redirectUrl);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('authRedirectUrl', '/vizual/studio');
      }
      const supabase = getBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        console.error('Google sign-in error:', error);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleEmailAuth = async () => {
    if (!emailInput.trim() || !passwordInput.trim()) return;
    if (isSignUp && !fullNameInput.trim()) return;

    setEmailLoading(true);
    setEmailMessage("");

    try {
      const supabase = getBrowserSupabaseClient();

      if (isSignUp) {
        // Sign Up Logic
        const { error } = await supabase.auth.signUp({
          email: emailInput,
          password: passwordInput,
          options: {
            data: {
              full_name: fullNameInput,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        setEmailMessage("Account created! Check your email to confirm.");
      } else {
        // Sign In Logic
        const { error } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput,
        });

        if (error) throw error;
        // Successful login will be handled by AuthContext/redirect logic
        router.push('/vizual/studio');
      }
    } catch (err: any) {
      setEmailMessage(err.message || "Authentication failed");
    } finally {
      setEmailLoading(false);
    }
  };

  // Typing animation state
  const [typingText, setTypingText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const prompts = [
    "A T-Rex skateboarding in 1990s Venice Beach, VHS style",
    "POV: Falling into a black hole made of neon gummy bears",
    "A cyberpunk samurai slicing a raindrop in half at 1000fps",
    "A hamster leading a Spartan army into battle, epic cinematic",
    "An underwater city illuminated by bioluminescent jellyfish",
    "A futuristic fashion show on the surface of Mars",
    "A dragon made of storm clouds breathing lightning",
    "A capybara hosting a late night talk show",
    "A time-lapse of a city growing from nature in 5 seconds",
    "A slow motion explosion of colorful paint powder in 8K"
  ];

  useEffect(() => {
    const currentPrompt = prompts[promptIndex % prompts.length];
    const typeSpeed = isDeleting ? 30 : 80;
    const pauseTime = 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && typingText === currentPrompt) {
        setTimeout(() => setIsDeleting(true), pauseTime);
        return;
      }

      if (isDeleting && typingText === "") {
        setIsDeleting(false);
        setPromptIndex((prev) => prev + 1);
        return;
      }

      setTypingText(prev => {
        if (isDeleting) return prev.slice(0, -1);
        return currentPrompt.slice(0, prev.length + 1);
      });
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, promptIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showInputModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showInputModal]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize scroll animations
  const scrollRef = useScrollAnimation();

  return (
    <div
      ref={scrollRef}
      className={`relative w-full bg-black text-white selection:bg-white/20 ${inter.className}`}
      style={{
        // Mobile scroll optimization
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
    >

      {/* Navigation - Always visible */}
      <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 bg-black/40 backdrop-blur-xl border-b border-white/5 py-3 md:py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              onClick={() => router.push('/')}
              className="cursor-pointer flex items-center gap-2 group"
            >
              {/* Logo Icon */}
              <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transition-transform group-hover:scale-110 md:w-6 md:h-6">
                <path d="M25 20 L85 50 L25 80 V20 Z" fill="currentColor" />
              </svg>
              <div className="font-bold text-lg md:text-xl tracking-tight flex items-center">
                <ChromeText>VIZUAL</ChromeText>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
              <button onClick={handleTryNow} className="hover:text-white transition-colors">STUDIO</button>
              <a href="/vizual/api" className="hover:text-white transition-colors">API</a>
              <a href="/vizual/enterprise" className="hover:text-white transition-colors">ENTERPRISE</a>
              <a href="/vizual/community" className="hover:text-white transition-colors">COMMUNITY</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              onClick={handleTryNow}
              className="bg-white text-black flex items-center px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold"
            >
              TRY NOW
            </HoverBorderGradient>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 h-screen w-full">
        {/* Background Video - Optimized for instant playback */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="min-h-full min-w-full object-cover opacity-70 will-change-transform"
            style={{ contentVisibility: 'auto' }}
          >
            <source src={`${CDN_BASE}/videos/veo2.mp4`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>

        {/* Hero Content */}
        <main className="relative z-10 flex flex-col items-center justify-between min-h-screen px-4 pt-24 pb-8 md:justify-center md:pt-20">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] text-center w-full break-words px-2"
            >
              Use Your <br />
              <span className={`${spaceGrotesk.className} inline-block font-bold`}>
                <ChromeText>Imagination</ChromeText>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-xs md:max-w-2xl mx-auto font-light text-center leading-relaxed"
            >
              Production-ready images and videos with precision, speed, and control
            </motion.p>
          </div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="w-full max-w-3xl mx-auto relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[32px] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-1 flex flex-col transition-all duration-300 focus-within:bg-black/80 focus-within:border-white/20"
            >
              <div className="flex flex-col min-h-[180px] md:min-h-[140px] p-5">
                <textarea
                  placeholder="Tell me more about your character..."
                  className="w-full bg-transparent text-white placeholder-gray-500 text-xl md:text-2xl resize-none focus:outline-none mb-4 font-light"
                  style={{ scrollbarWidth: 'none' }}
                  onChange={(e) => {
                    if (e.target.value.length === 1 && !showInputModal) {
                      setShowInputModal(true);
                      e.target.value = '';
                      e.target.blur();
                    }
                  }}
                />

                <div className="mt-auto flex justify-end items-center pr-2 pb-1">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black hover:bg-gray-200 flex items-center justify-center shadow-lg shadow-white/10"
                  >
                    <ArrowUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Input Modal */}
          {/* Modal moved to root for z-index */}

          {/* Powered by Vizual AI */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-gray-500 text-sm">powered by</span>
              <span className={`text-white text-base font-bold ${playfair.className} italic`}>Omi AI & Google</span>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="relative z-20 w-full min-h-screen bg-black py-24 px-4 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <Aurora speed={0.5} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-10 tracking-tight">
            Do it all with <br />
            <span className={`${spaceGrotesk.className} inline-block`}>
              <ChromeText>Vizual Studio</ChromeText>
            </span>
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {/* Make Videos Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative bg-[#111] rounded-[32px] overflow-hidden border border-white/5 hover:border-white/10 transition-colors w-full max-w-md md:max-w-6xl"
            >
              <div className="p-8 pb-0 text-center">
                <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-6">Make Videos</h3>
                <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                  Create short vids, long vids, social media viral vids, cinematic vids and more...
                </p>
              </div>

              <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-[#1a1a1a] mt-auto">
                <HoverVideo
                  src={`${CDN_BASE}/videos/klingnextgen.mp4`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  autoPlay={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-20 pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section >

      {/* No Prompt Engineering Section */}
      < section className="relative z-30 w-full min-h-screen bg-black py-24 px-4 flex items-center" >
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-12">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              onClick={handleTryNow}
              className="bg-white text-black flex items-center px-6 py-3 text-lg font-bold"
            >
              Start Vizualizing
            </HoverBorderGradient>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-16 tracking-tight leading-tight">
            No prompt <br />
            engineering needed,
          </h2>

          <div className="relative w-full max-w-md md:max-w-6xl mx-auto aspect-[3/4] md:aspect-[21/9] rounded-[40px] overflow-hidden group mb-12 transition-all duration-500">
            {/* Background Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={`${CDN_BASE}/videos/RAYVID.mp4`} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
              <div className={`${spaceGrotesk.className} text-6xl md:text-8xl mb-8 tracking-tighter transform -translate-y-8 flex justify-center font-bold`}>
                <ChromeText>just ask</ChromeText>
              </div>
              <div className="h-12 flex items-center justify-center">
                <p className="text-xl md:text-3xl text-white/90 font-light tracking-wide">
                  {typingText}<span className="animate-pulse ml-1">|</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section >

      {/* Film & Design Carousels */}
      < section className="relative z-40 w-full bg-black py-24 overflow-hidden" >
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes scroll-left {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          @keyframes scroll-right {
            0% { transform: translate3d(-50%, 0, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }
          .animate-scroll-left {
            animation: scroll-left 40s linear infinite;
            will-change: transform;
            backface-visibility: hidden;
            transform: translateZ(0);
          }
          .animate-scroll-right {
            animation: scroll-right 45s linear infinite;
            will-change: transform;
            backface-visibility: hidden;
            transform: translateZ(0);
          }
          .carousel-item {
            flex: 0 0 auto;
            width: 280px;
            height: 158px; /* 16:9 */
            contain: layout style paint;
          }
          @media (min-width: 768px) {
            .carousel-item {
              width: 480px;
              height: 270px;
            }
          }
          /* Pause animations on mobile when scrolling */
          @media (max-width: 767px) {
            .animate-scroll-left,
            .animate-scroll-right {
              animation-duration: 60s; /* Slower on mobile */
            }
          }
          /* Respect reduced motion preference */
          @media (prefers-reduced-motion: reduce) {
            .animate-scroll-left,
            .animate-scroll-right {
              animation: none;
            }
          }
        `}} />

        {/* How It Works Section */}
        <section className="relative z-40 w-full bg-black py-24 px-4 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-6xl font-bold mb-6 tracking-tight ${spaceGrotesk.className}`}>
                How it <ChromeText>Works</ChromeText>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                From idea to reality in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Prompt", desc: "Type a prompt, upload an image, or provide a video reference.", icon: <PenTool className="w-8 h-8 text-white/80" /> },
                { title: "Select Style", desc: "Choose from our curated library of cinematic and artistic styles.", icon: <Palette className="w-8 h-8 text-white/80" /> },
                { title: "Generate", desc: "Watch as our advanced AI brings your vision to life in seconds.", icon: <Sparkles className="w-8 h-8 text-white/80" /> }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                  className="relative group p-8 rounded-[32px] bg-[#111] border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/[0.02]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors border border-white/5 shadow-2xl shadow-black/50">
                    {step.icon}
                  </div>
                  <h3 className={`text-2xl font-bold text-white mb-4 ${spaceGrotesk.className}`}>{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Vizual Section */}
        <section className="relative z-40 w-full bg-[#050505] py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-4xl md:text-6xl font-bold text-center mb-16 tracking-tight ${spaceGrotesk.className}`}>
              Why is Vizual <ChromeText>Different?</ChromeText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Newest Models", desc: "Instant access to the latest state-of-the-art AI models without waitlists.", icon: <Zap className="w-6 h-6 text-white" /> },
                { title: "Simple Interface", desc: "Professional tools wrapped in an intuitive design. No learning curve required.", icon: <Layout className="w-6 h-6 text-white" /> },
                { title: "Pay As You Go", desc: "Freedom from subscriptions. Only pay for what you generate, when you need it.", icon: <CreditCard className="w-6 h-6 text-white" /> }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                  className="relative group p-8 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Header with See More */}
        <div className="max-w-7xl mx-auto px-4 mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className={`text-4xl md:text-5xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>Categories</h2>
            <p className="text-gray-400 text-lg">Explore what you can create with Vizual</p>
          </div>
          <button
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
          >
            <span className="text-white font-medium">{categoriesExpanded ? 'See Less' : 'See More'}</span>
            {categoriesExpanded ? (
              <ChevronUp className="w-5 h-5 text-white transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white transition-transform group-hover:translate-y-0.5" />
            )}
          </button>
        </div>

        {/* Film Section - Always visible */}
        <div className="mb-16">
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <h3 className={`text-3xl md:text-4xl font-bold text-white mb-2 ${spaceGrotesk.className} animate-on-scroll animate-fade-in-up`}>Film</h3>
            <p className="text-gray-400 text-base hover:text-white cursor-pointer transition-colors inline-flex items-center gap-2">
              View model preference chart
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </p>
          </div>

          <div className="flex gap-4 w-max animate-scroll-left hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                  <HoverVideo src={`${CDN_BASE}/videos/film.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                  <HoverVideo src={`${CDN_BASE}/videos/film2.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                  <HoverVideo src={`${CDN_BASE}/videos/film3.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                  <HoverVideo src={`${CDN_BASE}/videos/film5.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                  <HoverVideo src={`${CDN_BASE}/videos/film6.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                  <HoverVideo src={`${CDN_BASE}/videos/film7.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Collapsible Categories */}
        <div className={`overflow-hidden transition-all duration-700 ease-in-out ${categoriesExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {/* Animated Section */}
          <div className="mt-16">
            <div className="max-w-7xl mx-auto px-4 mb-8">
              <h3 className={`text-3xl md:text-4xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>Animated</h3>
              <p className="text-gray-400 text-base hover:text-white cursor-pointer transition-colors inline-flex items-center gap-2">
                Explore animated styles
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </p>
            </div>

            <div className="flex gap-4 w-max animate-scroll-right hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/ani.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/ani1.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/ani4.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Design Section */}
          <div className="mt-16">
            <div className="max-w-7xl mx-auto px-4 mb-8">
              <h3 className={`text-3xl md:text-4xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>Design</h3>
              <p className="text-gray-400 text-base hover:text-white cursor-pointer transition-colors inline-flex items-center gap-2">
                View model preference chart
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </p>
            </div>

            <div className="flex gap-4 w-max animate-scroll-left hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/design.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/design2.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="mt-16">
            <div className="max-w-7xl mx-auto px-4 mb-8">
              <h3 className={`text-3xl md:text-4xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>Products</h3>
              <p className="text-gray-400 text-base hover:text-white cursor-pointer transition-colors inline-flex items-center gap-2">
                Showcase your products
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </p>
            </div>

            <div className="flex gap-4 w-max animate-scroll-right hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/product.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/product1.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/product2.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/product3.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/product4.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/product5.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/product6.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/product7.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Music Section */}
          <div className="mt-16">
            <div className="max-w-7xl mx-auto px-4 mb-8">
              <h3 className={`text-3xl md:text-4xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>Music</h3>
              <p className="text-gray-400 text-base hover:text-white cursor-pointer transition-colors inline-flex items-center gap-2">
                Visualize your sound
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </p>
            </div>

            <div className="flex gap-4 w-max animate-scroll-left hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/music.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                    <HoverVideo src={`${CDN_BASE}/videos/music2.mp4`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* And More Section */}
          <div className="mt-16">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h3 className={`text-4xl md:text-6xl font-bold text-white mb-4 ${spaceGrotesk.className} animate-on-scroll animate-fade-in-up`}>
                and more...
              </h3>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto animate-on-scroll animate-fade-in-up delay-200">
                Whatever you can imagine, Vizual can create. Explore endless possibilities across every creative category.
              </p>
            </div>
          </div>
        </div>
      </section >

      {/* Powered By Section */}
      < section className="relative z-50 w-full min-h-screen bg-black py-32 px-4 flex items-center" >
        <div className="max-w-5xl mx-auto text-center">
          <p className={`text-3xl md:text-5xl font-medium leading-snug text-neutral-600 ${spaceGrotesk.className} animate-on-scroll animate-blur-in`}>
            Powered by the world's best AI models: <span className="text-white">Omi AI</span>, <span className="text-white">Veo</span>, <span className="text-white">LumaLabs</span>, <span className="text-white">Kling</span>, <span className="text-white">WAN</span>, <span className="text-white">Seedance</span>, <span className="text-white">Imagen 3</span>, and more coming soon.
          </p>
        </div>
      </section >

      {/* New Freedoms Section */}
      < section className="relative z-60 w-full min-h-screen bg-black pb-32 px-4 flex items-center justify-center" >
        <div className="relative w-full max-w-md md:max-w-6xl mx-auto aspect-[3/4] md:aspect-[21/9] rounded-[40px] overflow-hidden group">
          <HoverVideo src={`${CDN_BASE}/videos/veo1.mp4`} className="absolute inset-0 w-full h-full object-cover opacity-70" autoPlay={true} />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          <div className={`absolute inset-0 flex flex-col items-center justify-center text-center z-10 p-4 leading-none select-none ${spaceGrotesk.className} pointer-events-none`}>
            <span className="text-5xl md:text-7xl text-white font-bold tracking-tighter mb-2">New</span>
            <span className="text-6xl md:text-8xl text-white font-bold tracking-tighter mb-2">freedoms</span>
            <span className="text-5xl md:text-7xl text-white font-bold tracking-tighter mb-2">of</span>
            <span className="text-6xl md:text-8xl font-bold tracking-tighter flex justify-center">
              <ChromeText>imagination</ChromeText>
            </span>
          </div>
        </div>
      </section >

      {/* Video Section Showcase */}
      <section className="relative z-[70] w-full bg-white text-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl md:text-6xl font-bold text-center mb-6 tracking-tight ${spaceGrotesk.className} animate-on-scroll animate-fade-in-up`}>
            Seamless <ChromeText>Integration</ChromeText>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto animate-on-scroll animate-fade-in-up delay-200">
            See how Vizual fits naturally into your creative workflow
          </p>
          <div className="relative w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden border border-black/10 shadow-2xl shadow-black/5 animate-on-scroll animate-scale-fade delay-300">
            <HoverVideo src={`${CDN_BASE}/videos/videsectionloop.mp4`} className="w-full h-auto" autoPlay={true} />
          </div>
        </div>
      </section>

      {/* Portrait Video Feature Section */}
      < section className="relative z-[80] w-full bg-black py-24 px-4" >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Text Content */}
            <div className="order-2 md:order-1 text-center md:text-left">
              <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight ${spaceGrotesk.className} animate-on-scroll animate-fade-in-left`}>
                Create for <br />
                <span className="inline-block">
                  <ChromeText>Every Format</ChromeText>
                </span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-lg animate-on-scroll animate-fade-in-left delay-200">
                From cinematic widescreen to vertical social content. Vizual adapts to your vision, not the other way around.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={handleTryNow}
                  className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all transform hover:scale-105"
                >
                  Try It Free
                </button>
                <button
                  onClick={() => router.push('/vizual/community')}
                  className="px-8 py-4 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/10"
                >
                  View Examples
                </button>
              </div>
            </div>

            {/* Portrait Video */}
            <div className="order-1 md:order-2 flex justify-center animate-on-scroll animate-fade-in-right delay-300">
              <div className="relative w-full max-w-[300px] md:max-w-[350px] aspect-[9/16] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-white/5">
                <HoverVideo src={`${CDN_BASE}/videos/verticalvid.mp4`} className="w-full h-full object-cover" autoPlay={true} />
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Text to Image Section */}
      <section className="relative z-[85] w-full bg-white text-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl md:text-6xl font-bold text-center mb-6 tracking-tight ${spaceGrotesk.className} animate-on-scroll animate-fade-in-up`}>
            Text to <ChromeText>Image</ChromeText>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto animate-on-scroll animate-fade-in-up delay-200">
            Transform your words into stunning visuals with unparalleled precision and creativity
          </p>
          <div className="relative w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden border border-black/10 shadow-2xl shadow-black/5 animate-on-scroll animate-scale-fade delay-300">
            <HoverVideo src={`${CDN_BASE}/videos/text2image.mp4`} className="w-full h-auto" autoPlay={true} />
          </div>
        </div>
      </section>

      {/* Character Consistency Section */}
      < section className="relative z-[90] w-full bg-black py-24 px-4" >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Portrait Video */}
            <div className="flex justify-center animate-on-scroll animate-fade-in-left">
              <div className="relative w-full max-w-[300px] md:max-w-[350px] aspect-[9/16] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-white/5">
                <HoverVideo src={`${CDN_BASE}/videos/samchar.mp4`} className="w-full h-full object-cover" autoPlay={true} />
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center md:text-left">
              <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight ${spaceGrotesk.className} animate-on-scroll animate-fade-in-right`}>
                Character <br />
                <span className="inline-block">
                  <ChromeText>Consistency</ChromeText>
                </span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
                Keep your characters looking the same across every scene. From the first frame to the last, maintain perfect visual coherence for your stories.
              </p>
              <motion.ul
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: { transition: { staggerChildren: 0.2 } }
                }}
                className="space-y-4 text-gray-300 text-left max-w-lg mx-auto md:mx-0"
              >
                {[
                  "Same character, different scenes and poses",
                  "Preserve facial features and expressions",
                  "Perfect for storytelling and brand mascots"
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </section >

      {/* Avatar Demos Section */}
      < section className="relative z-[95] w-full bg-black py-24 px-4" >
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl md:text-6xl font-bold text-center mb-6 tracking-tight ${spaceGrotesk.className} animate-on-scroll animate-fade-in-up`}>
            Conversational <ChromeText>Scene Generation</ChromeText>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto animate-on-scroll animate-fade-in-up delay-200">
            Create lifelike digital humans that speak, move, and express emotions naturally
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Avatar Scene Video */}
            <div className="relative rounded-[24px] overflow-hidden border border-white/10 bg-[#111] group animate-on-scroll animate-fade-in-up delay-300">
              <div className="relative w-full aspect-video bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900">
                <video
                  playsInline
                  controls
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={`${CDN_BASE}/videos/avatarscene.mp4`} type="video/mp4" />
                </video>
              </div>
              <div className="p-4">
                <h3 className={`text-xl font-bold mb-2 ${spaceGrotesk.className}`}>
                  <ChromeText>Scene Generation</ChromeText>
                </h3>
                <p className="text-gray-400 text-sm">Full avatar in dynamic environments</p>
              </div>
            </div>

            {/* Two Avatars Video */}
            <div className="relative rounded-[24px] overflow-hidden border border-white/10 bg-[#111] group animate-on-scroll animate-fade-in-up delay-500">
              <div className="relative w-full aspect-video bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900">
                <video
                  playsInline
                  controls
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={`${CDN_BASE}/videos/twoavatars.mp4`} type="video/mp4" />
                </video>
              </div>
              <div className="p-4">
                <h3 className={`text-xl font-bold mb-2 ${spaceGrotesk.className}`}>
                  <ChromeText>Multi-Avatar Conversations</ChromeText>
                </h3>
                <p className="text-gray-400 text-sm">Multiple avatars interacting together</p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Features Zigzag Section - WHITE THEME */}
      < section className="relative z-[96] w-full bg-white text-black py-24 px-4 overflow-hidden" >
        {/* Subtle background gradient */}
        < div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/50 to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto space-y-32">

          {/* Feature 1 - Any Style */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="flex-1 order-2 md:order-1 animate-on-scroll animate-fade-in-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-black/10 text-black rounded-full mb-6 border border-black/10">
                <Sparkles className="w-3 h-3 text-black" />
                Any Style
              </span>
              <h3 className={`text-3xl md:text-4xl font-bold mb-5 leading-tight ${spaceGrotesk.className}`}>
                From Cartoons to <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-600 via-gray-800 to-gray-600">Realistic Scenes</span>
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Whether you want to animate a drawing, make your pet dance, or bring a <span className="text-blue-600 font-medium">product shot</span> to life, our AI video generator can create videos in any style, while preserving the original context and details.
              </p>
            </div>
            <div className="flex-1 order-1 md:order-2 animate-on-scroll animate-fade-in-right delay-200">
              <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-gray-100 group-hover:border-blue-500/30 transition-colors duration-500 shadow-xl shadow-black/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <HoverVideo src={`${CDN_BASE}/videos/ani.mp4`} className="w-full aspect-video object-cover" autoPlay={true} />
              </div>
            </div>
          </div>

          {/* Feature 2 - Greater Realism */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="flex-1 animate-on-scroll animate-fade-in-left">
              <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-gray-100 group-hover:border-emerald-500/30 transition-colors duration-500 shadow-xl shadow-black/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <HoverVideo src={`${CDN_BASE}/videos/nature.mp4`} className="w-full aspect-video object-cover" autoPlay={true} />
              </div>
            </div>
            <div className="flex-1 animate-on-scroll animate-fade-in-right delay-200">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-black/10 text-black rounded-full mb-6 border border-black/10">
                <Zap className="w-3 h-3 text-black" />
                Greater Realism
              </span>
              <h3 className={`text-3xl md:text-4xl font-bold mb-5 leading-tight ${spaceGrotesk.className}`}>
                Add Greater Realism <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-600 via-gray-800 to-gray-600">with AI Motion</span>
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Vizual's artificial intelligence image to video feature uses advanced deep learning to create lifelike, immersive videos. Add drama, realism, or storytelling depth to any static image.
              </p>
            </div>
          </div>

          {/* Feature 3 - High-Quality Motion */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="flex-1 order-2 md:order-1 animate-on-scroll animate-fade-in-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-black/10 text-black rounded-full mb-6 border border-black/10">
                <Sparkles className="w-3 h-3 text-black" />
                High-Quality Motion
              </span>
              <h3 className={`text-3xl md:text-4xl font-bold mb-5 leading-tight ${spaceGrotesk.className}`}>
                Natural Movement <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-600 via-gray-800 to-gray-600">Real-World Effects</span>
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Zoom, pan, and tilt with precision. Our image to video AI engine simulates realistic physics, lighting, and material interaction, from flowing hair and bouncing fabric to shimmering water.
              </p>
            </div>
            <div className="flex-1 order-1 md:order-2 animate-on-scroll animate-fade-in-right delay-200">
              <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-gray-100 group-hover:border-purple-500/30 transition-colors duration-500 shadow-xl shadow-black/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <HoverVideo src={`${CDN_BASE}/videos/film2.mp4`} className="w-full aspect-video object-cover" autoPlay={true} />
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Generate Without Learning Curve Section */}
      < section className="relative z-[97] w-full bg-black py-24 px-4 overflow-hidden" >
        {/* Animated background orb */}
        < div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">

          {/* First Row */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-32">
            <div className="flex-1 animate-on-scroll animate-fade-in-left">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${spaceGrotesk.className}`}>
                Generate AI videos <br /> <ChromeText>without a learning curve</ChromeText>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Type your idea, add the specifics—like length, platform, voiceover accent, and get AI-generated high-quality videos that put your ideas into focus.
              </p>
              <button
                onClick={handleTryNow}
                className="group px-8 py-3 rounded-full border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 font-semibold flex items-center gap-2"
              >
                Create now
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
            <div className="flex-1">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-blue-500/5">
                <HoverVideo src={`${CDN_BASE}/videos/fantasy.mp4`} className="w-full aspect-video object-cover" autoPlay={true} />
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 order-2 md:order-1 animate-on-scroll animate-fade-in-left">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${spaceGrotesk.className}`}>
                Edit videos with <br /> <ChromeText>a text prompt</ChromeText>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Edit your videos with simple commands. Give simple commands like change the accent, delete scenes or add a funny intro and watch your videos come to life.
              </p>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl shadow-purple-500/5">
                <HoverVideo src={`${CDN_BASE}/videos/design.mp4`} className="w-full aspect-video object-cover" autoPlay={true} />
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* For Creators/Teams/Developers Section */}
      < section className="relative z-[98] w-full bg-black py-24 px-4" >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* For Creators */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>For Creators</h3>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Create production-quality visual assets for your projects with unprecedented quality, speed, and style-consistency.
            </p>
          </motion.div>

          {/* For Teams */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>For Teams</h3>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Bring your team's best ideas to life at scale, with our intuitive AI-first creative suite designed for collaboration and built for business.
            </p>
          </motion.div>

          {/* For Developers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>For Developers</h3>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Experience content creation excellence with Vizual's API. With unmatched scalability, effortlessly tailor outputs to your brand guidelines.
            </p>
          </motion.div>
        </div>
      </section >

      {/* Community Section */}
      < section className="relative z-[99] w-full bg-gradient-to-b from-black via-[#0a0a1a] to-black py-24 px-4 overflow-hidden" >
        {/* Background gradient orbs */}
        < div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">

          {/* Left Content */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block px-4 py-2 text-sm font-medium bg-white/5 border border-white/10 rounded-full text-gray-300 mb-6 animate-on-scroll animate-fade-in-up">
              Growing Community of Creators
            </span>
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${spaceGrotesk.className}`}>
              <span className="text-white">Be part of a </span>
              <ChromeText>creative</ChromeText>
              <br />
              <span className="text-white">community! </span>
              <span className="text-3xl">🌍</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Join thousands of creators, artists, and developers pushing the boundaries of AI-generated content.
            </p>
            <a
              href="https://discord.gg/vizual"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-all duration-300 shadow-lg shadow-[#5865F2]/25"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Join Discord Server
            </a>
          </div>

          {/* Right - Floating Avatars */}
          <div className="flex-1 relative h-[400px] hidden md:block">
            {/* Avatar Grid - scattered floating effect */}
            {[
              { top: '5%', left: '10%', size: 'w-16 h-16', delay: '0s', seed: 'Felix' },
              { top: '0%', left: '35%', size: 'w-14 h-14', delay: '0.5s', seed: 'Aneka' },
              { top: '10%', left: '60%', size: 'w-12 h-12', delay: '1s', seed: 'Zack' },
              { top: '5%', left: '85%', size: 'w-14 h-14', delay: '0.3s', seed: 'Molly' },
              { top: '25%', left: '0%', size: 'w-12 h-12', delay: '0.7s', seed: 'Sarah' },
              { top: '30%', left: '25%', size: 'w-16 h-16', delay: '0.2s', seed: 'John' },
              { top: '25%', left: '50%', size: 'w-14 h-14', delay: '0.9s', seed: 'Max' },
              { top: '35%', left: '75%', size: 'w-12 h-12', delay: '0.4s', seed: 'Luna' },
              { top: '50%', left: '5%', size: 'w-14 h-14', delay: '0.6s', seed: 'Sam' },
              { top: '55%', left: '30%', size: 'w-12 h-12', delay: '0.1s', seed: 'Kai' },
              { top: '50%', left: '55%', size: 'w-16 h-16', delay: '0.8s', seed: 'Omi' },
              { top: '55%', left: '80%', size: 'w-14 h-14', delay: '0.35s', seed: 'Leo' },
              { top: '75%', left: '15%', size: 'w-12 h-12', delay: '0.55s', seed: 'Zoe' },
              { top: '70%', left: '40%', size: 'w-14 h-14', delay: '0.25s', seed: 'Ray' },
              { top: '75%', left: '65%', size: 'w-12 h-12', delay: '0.75s', seed: 'Mia' },
              { top: '80%', left: '90%', size: 'w-14 h-14', delay: '0.45s', seed: 'Ben' },
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos.size} rounded-full border border-white/20 overflow-hidden animate-float bg-[#1a1a1a] shadow-lg`}
                style={{
                  top: pos.top,
                  left: pos.left,
                  animationDelay: pos.delay,
                }}
              >
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${pos.seed}`}
                  alt="Community member"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Discord Logo Avatars scattered in */}
            <div className="absolute top-[20%] left-[45%] w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center animate-float" style={{ animationDelay: '0.65s' }}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <div className="absolute top-[60%] left-[20%] w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center animate-float" style={{ animationDelay: '0.85s' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
          </div>
        </div>
      </section >

      {/* Partners Section */}
      < section className="relative z-[100] w-full bg-black py-16 px-4 border-t border-white/5" >
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 text-sm uppercase tracking-widest mb-10 animate-on-scroll animate-fade-in-up">Powered by Industry Leaders</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 animate-on-scroll animate-fade-in-up delay-200">
            <img src="/images/veo3-logo.svg" alt="Veo 3" className="h-8 md:h-10 hover:scale-105 transition-transform" />
            <img src="/images/kling-logo-new.jpg" alt="Kling AI" className="h-12 md:h-16 hover:scale-105 transition-transform" />
            <img src="/images/hailuo-ai-logo.svg" alt="Hailuo AI" className="h-8 md:h-10 hover:scale-105 transition-transform" />
            <img src="/images/percify-logo.png" alt="Percify" className="h-8 md:h-10 hover:scale-105 transition-transform" />
          </div>
        </div>
      </section >

      {/* Final CTA Section */}
      < section className="relative z-[101] w-full bg-black py-32 px-4 overflow-hidden" >
        {/* Background gradient effects */}
        < div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-6xl font-bold mb-6 leading-tight ${spaceGrotesk.className} animate-on-scroll animate-scale-fade`}>
            <span className="text-white">Ready to </span>
            <ChromeText>create</ChromeText>
            <span className="text-white">?</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-on-scroll animate-fade-in-up delay-200">
            Join thousands of creators using Vizual to bring their imagination to life. Start creating stunning AI-generated videos today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-on-scroll animate-fade-in-up delay-400">
            <button
              onClick={handleTryNow}
              className="group px-10 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-3"
            >
              Get Started Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <a
              href="/vizual/api"
              className="px-10 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-all duration-300"
            >
              View API Docs
            </a>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="relative z-[100] w-full bg-black border-t border-white/10 pt-20 pb-10 px-6" >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M25 20 L85 50 L25 80 V20 Z" fill="currentColor" />
              </svg>
              <span className={`text-2xl font-bold tracking-tight text-white ${spaceGrotesk.className}`}>VIZUAL</span>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Pioneering the future of generative media. We build tools that empower creators to imagine the impossible.
            </p>
          </div>

          {/* Links Column */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="/vizual/studio" className="hover:text-white transition-colors">Studio</a></li>
                <li><a href="/vizual/api" className="hover:text-white transition-colors">API</a></li>
                <li><a href="/vizual/enterprise" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/vizual/enterprise" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="/vizual/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/vizual/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/vizual/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/vizual/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Video Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="text-white font-bold mb-2">powered by <span className={`${playfair.className} italic`}>Vizual AI</span></h4>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              >
                <source src={`${CDN_BASE}/videos/grok-video-163f4b90-6e8d-43d2-88d0-6450a84086c0 (5).mp4`} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2025 Vizual AI Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </footer >

      {/* Input Modal */}
      <AnimatePresence>
        {showInputModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowInputModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-sm bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowInputModal(false)}
                className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="relative aspect-[4/3] bg-black">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src={`${CDN_BASE}/videos/film.mp4`} type="video/mp4" />
                </video>
              </div>

              <div className="p-4">
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.15em] mb-0.5 font-medium">INTRODUCING</p>
                <h3 className={`text-base font-bold mb-1.5 ${spaceGrotesk.className}`}>Vizual Studio</h3>
                <p className="text-gray-400 text-lg leading-snug mb-4">Stop guessing. Start creating.</p>
                <button onClick={handleTryNow} className="w-full py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md">
                  {user ? 'Open Studio' : 'Login to Continue'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-sm bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="p-8 pt-12">
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 border border-white/10 relative">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src={`${CDN_BASE}/videos/grok-video-163f4b90-6e8d-43d2-88d0-6450a84086c0 (5).mp4`} type="video/mp4" />
                    </video>
                  </div>
                </div>

                <h3 className={`text-2xl font-bold mb-2 text-white text-center ${spaceGrotesk.className}`}>Join Vizual</h3>
                <p className="text-gray-400 text-sm mb-8 text-center leading-relaxed">
                  Sign in to access your creative dashboard.
                </p>

                <div className="space-y-3">
                  {/* Google */}
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-[#0a0a0a] px-3 text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Email Sign In/Up */}
                  {!showEmailForm ? (
                    <button
                      onClick={() => setShowEmailForm(true)}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm group"
                    >
                      <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Continue with Email
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {isSignUp && (
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={fullNameInput}
                            onChange={(e) => setFullNameInput(e.target.value)}
                            placeholder="Full Name"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-gray-500 focus:border-white/20 focus:outline-none transition-all"
                          />
                        </div>
                      )}

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Email address"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-gray-500 focus:border-white/20 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Password"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-gray-500 focus:border-white/20 focus:outline-none transition-all"
                          onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        onClick={handleEmailAuth}
                        disabled={emailLoading || !emailInput || !passwordInput || (isSignUp && !fullNameInput)}
                        className="w-full py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {emailLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                      </button>

                      {emailMessage && (
                        <p className={`text-xs text-center ${emailMessage.includes('created') ? 'text-green-400' : 'text-red-400'}`}>
                          {emailMessage}
                        </p>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <button
                          onClick={() => {
                            setIsSignUp(!isSignUp);
                            setEmailMessage("");
                          }}
                          className="hover:text-white transition-colors underline"
                        >
                          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                        </button>
                        <button
                          onClick={() => {
                            setShowEmailForm(false);
                            setEmailMessage("");
                            setEmailInput("");
                            setPasswordInput("");
                            setFullNameInput("");
                          }}
                          className="hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-6 text-[10px] text-zinc-600 text-center">
                  By continuing, you agree to our Terms.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
