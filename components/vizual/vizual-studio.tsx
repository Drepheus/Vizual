"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowUp, ChevronDown, ChevronUp, X } from "lucide-react";
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google";
import { useAuth } from "@/context/auth-context";

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

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  
  // Handle Try Now button click
  const handleTryNow = () => {
    if (loading) return;
    if (user) {
      router.push('/vizual/studio');
    } else {
      router.push('/login?redirect=/vizual/studio');
    }
  };
  
  // Typing animation state
  const [typingText, setTypingText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const prompts = [
    "Cinematic drone shot of a futuristic city",
    "A cute robot painting a canvas in a park",
    "Slow motion water droplets on a rose",
    "Cyberpunk street food vendor at night",
    "An astronaut floating through a nebula",
    "Time-lapse of clouds moving over mountains",
    "A golden retriever playing in autumn leaves",
    "Underwater view of a coral reef with fish",
    "A vintage car driving along a coastal road",
    "A magical library with flying books"
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
    <div ref={scrollRef} className={`relative w-full bg-black text-white selection:bg-white/20 ${inter.className}`}>
      
      {/* Navigation - Always visible */}
      <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 bg-black/40 backdrop-blur-xl border-b border-white/5 py-3 md:py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              onClick={() => router.push('/command-hub')}
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
              <a href="/vizual/studio" className="hover:text-white transition-colors">STUDIO</a>
              <a href="/vizual/api" className="hover:text-white transition-colors">API</a>
              <a href="/vizual/enterprise" className="hover:text-white transition-colors">ENTERPRISE</a>
              <a href="/vizual/community" className="hover:text-white transition-colors">COMMUNITY</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleTryNow}
              className="px-5 py-2 md:px-6 md:py-2 rounded-full bg-white text-black text-xs md:text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              TRY NOW
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 h-screen w-full">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="min-h-full min-w-full object-cover opacity-70"
          >
            <source src="/videos/RAYVID.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>

        {/* Hero Content */}
        <main className="relative z-10 flex flex-col items-center justify-between min-h-screen px-4 pt-24 pb-8 md:justify-center md:pt-20">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] text-center w-full break-words px-2 animate-on-scroll animate-fade-in-up animated">
              Use Your <br />
              <span className={`${spaceGrotesk.className} inline-block font-bold`}>
                <ChromeText>Imagination</ChromeText>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-xs md:max-w-2xl mx-auto font-light text-center leading-relaxed animate-on-scroll animate-fade-in-up animated delay-200">
              Production-ready images and videos with precision, speed, and control
            </p>
          </div>

          {/* Input Area */}
          <div className="w-full max-w-3xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[32px] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-1 flex flex-col transition-all duration-300 focus-within:bg-black/80 focus-within:border-white/20">
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
                   <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg shadow-white/10">
                      <ArrowUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Input Modal */}
          {showInputModal && (
            <div 
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
              onClick={() => setShowInputModal(false)}
            >
              <div 
                className="relative w-full max-w-sm bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 animate-scale-in border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setShowInputModal(false)}
                  className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Video Section */}
                <div className="relative aspect-[4/3] bg-black">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/videos/film.mp4" type="video/mp4" />
                  </video>
                </div>
                
                {/* Content Section */}
                <div className="p-4">
                  <p className="text-gray-500 text-[10px] uppercase tracking-[0.15em] mb-0.5 font-medium">INTRODUCING</p>
                  <h3 className={`text-base font-bold mb-1.5 ${spaceGrotesk.className}`}>Vizual Studio</h3>
                  <p className="text-gray-400 text-[11px] leading-relaxed mb-4">
                    Stop guessing. Start creating. Vizual Studio brings world-class AI video and image generation to your fingertips with natural language prompts and character consistency.
                  </p>
                  
                  {/* CTA Button - Refined */}
                  <button 
                    onClick={handleTryNow}
                    className="w-full py-2 rounded-lg bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/80 hover:text-white font-medium text-xs transition-all"
                  >
                    {user ? 'Open Studio' : 'Login to Continue'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Powered by Vizual AI */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-gray-500 text-sm">powered by</span>
              <span className={`text-white text-base font-bold ${playfair.className} italic`}>Vizual AI</span>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="relative z-20 w-full min-h-screen bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-10 tracking-tight">
            Do it all with <br />
            <span className={`${spaceGrotesk.className} inline-block`}>
              <ChromeText>Vizual Studio</ChromeText>
            </span>
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {/* Make Videos Card */}
            <div className="group relative bg-[#111] rounded-[32px] overflow-hidden border border-white/5 hover:border-white/10 transition-colors w-full max-w-md md:max-w-6xl">
              <div className="p-8 pb-0 text-center">
                <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-6">Make Videos</h3>
                <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                  Direct the perfect shot with start/end frames. Extend any video or say "loop" to make it loop.
                </p>
              </div>
              
              <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-[#1a1a1a] mt-auto">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                >
                  <source src="/videos/klingnextgen.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* No Prompt Engineering Section */}
      <section className="relative z-30 w-full min-h-screen bg-black py-24 px-4 flex items-center">
        <div className="max-w-7xl mx-auto text-center">
          <button 
            onClick={handleTryNow}
            className="mb-12 px-8 py-4 rounded-full bg-white text-black text-lg font-bold hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-white/20"
          >
            Start Vizualizing
          </button>
          
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
                <source src="/videos/veo2.mp4" type="video/mp4" />
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
      </section>

      {/* Film & Design Carousels */}
      <section className="relative z-40 w-full bg-black py-24 overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-scroll-left {
            animation: scroll-left 40s linear infinite;
          }
          .animate-scroll-right {
            animation: scroll-right 45s linear infinite;
          }
          .carousel-item {
            flex: 0 0 auto;
            width: 280px;
            height: 158px; /* 16:9 */
          }
          @media (min-width: 768px) {
            .carousel-item {
              width: 480px;
              height: 270px;
            }
          }
        `}} />

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </p>
          </div>
          
          <div className="flex gap-4 w-max animate-scroll-left hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/film.mp4" type="video/mp4" /></video>
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/film2.mp4" type="video/mp4" /></video>
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/film3.mp4" type="video/mp4" /></video>
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/film5.mp4" type="video/mp4" /></video>
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/film6.mp4" type="video/mp4" /></video>
                </div>
                <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                   <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/film7.mp4" type="video/mp4" /></video>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </p>
            </div>
            
            <div className="flex gap-4 w-max animate-scroll-right hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/ani.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/ani1.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/ani4.mp4" type="video/mp4" /></video>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </p>
            </div>
            
            <div className="flex gap-4 w-max animate-scroll-left hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/design.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/design2.mp4" type="video/mp4" /></video>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </p>
            </div>
            
            <div className="flex gap-4 w-max animate-scroll-right hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/product.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/product1.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/product2.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/product3.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/product4.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/product5.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/product6.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/product7.mp4" type="video/mp4" /></video>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </p>
            </div>
            
            <div className="flex gap-4 w-max animate-scroll-left hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/music.mp4" type="video/mp4" /></video>
                  </div>
                  <div className="carousel-item rounded-xl overflow-hidden relative group bg-gray-900">
                     <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"><source src="/videos/music2.mp4" type="video/mp4" /></video>
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
      </section>

      {/* Powered By Section */}
      <section className="relative z-50 w-full min-h-screen bg-black py-32 px-4 flex items-center">
        <div className="max-w-5xl mx-auto text-center">
          <p className={`text-3xl md:text-5xl font-medium leading-snug text-neutral-600 ${spaceGrotesk.className} animate-on-scroll animate-blur-in`}>
            Powered by <span className="text-white">Veo</span>, our world's most capable video generation model, designed for cinema. <span className="text-white">Imagen 3</span>, our most advanced image synthesis engine.
          </p>
        </div>
      </section>

      {/* New Freedoms Section */}
      <section className="relative z-60 w-full min-h-screen bg-black pb-32 px-4 flex items-center justify-center">
         <div className="relative w-full max-w-md md:max-w-6xl mx-auto aspect-[3/4] md:aspect-[21/9] rounded-[40px] overflow-hidden group">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            >
              <source src="/videos/veo1.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/20" />
            
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center z-10 p-4 leading-none select-none ${spaceGrotesk.className}`}>
               <span className="text-5xl md:text-7xl text-white font-bold tracking-tighter mb-2">New</span>
               <span className="text-6xl md:text-8xl text-white font-bold tracking-tighter mb-2">freedoms</span>
               <span className="text-5xl md:text-7xl text-white font-bold tracking-tighter mb-2">of</span>
               <span className="text-6xl md:text-8xl font-bold tracking-tighter flex justify-center">
                  <ChromeText>imagination</ChromeText>
               </span>
            </div>
         </div>
      </section>

      {/* Video Section Showcase */}
      <section className="relative z-[70] w-full bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl md:text-6xl font-bold text-center mb-6 tracking-tight ${spaceGrotesk.className} animate-on-scroll animate-fade-in-up`}>
            Seamless <ChromeText>Integration</ChromeText>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto animate-on-scroll animate-fade-in-up delay-200">
            See how Vizual fits naturally into your creative workflow
          </p>
          <div className="relative w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden border border-white/10 animate-on-scroll animate-scale-fade delay-300">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            >
              <source src="/videos/videsectionloop.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Portrait Video Feature Section */}
      <section className="relative z-[80] w-full bg-black py-24 px-4">
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
                <button className="px-8 py-4 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/10">
                  View Examples
                </button>
              </div>
            </div>
            
            {/* Portrait Video */}
            <div className="order-1 md:order-2 flex justify-center animate-on-scroll animate-fade-in-right delay-300">
              <div className="relative w-full max-w-[300px] md:max-w-[350px] aspect-[9/16] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-white/5">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/verticalvid.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Text to Image Section */}
      <section className="relative z-[85] w-full bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl md:text-6xl font-bold text-center mb-6 tracking-tight ${spaceGrotesk.className} animate-on-scroll animate-fade-in-up`}>
            Text to <ChromeText>Image</ChromeText>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto animate-on-scroll animate-fade-in-up delay-200">
            Transform your words into stunning visuals with unparalleled precision and creativity
          </p>
          <div className="relative w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden border border-white/10 animate-on-scroll animate-scale-fade delay-300">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            >
              <source src="/videos/text2image.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Character Consistency Section */}
      <section className="relative z-[90] w-full bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Portrait Video */}
            <div className="flex justify-center animate-on-scroll animate-fade-in-left">
              <div className="relative w-full max-w-[300px] md:max-w-[350px] aspect-[9/16] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-white/5">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/samchar.mp4" type="video/mp4" />
                </video>
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
              <ul className="space-y-4 text-gray-300 text-left max-w-lg mx-auto md:mx-0">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
                  <span>Same character, different scenes and poses</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
                  <span>Preserve facial features and expressions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
                  <span>Perfect for storytelling and brand mascots</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Avatar Demos Section */}
      <section className="relative z-[95] w-full bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl md:text-6xl font-bold text-center mb-6 tracking-tight ${spaceGrotesk.className} animate-on-scroll animate-fade-in-up`}>
            AI <ChromeText>Avatars</ChromeText>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto animate-on-scroll animate-fade-in-up delay-200">
            Create lifelike digital humans that speak, move, and express emotions naturally
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Avatar Scene Video */}
            <div className="relative rounded-[24px] overflow-hidden border border-white/10 bg-[#111] group animate-on-scroll animate-fade-in-up delay-300">
              <video
                controls
                preload="metadata"
                className="w-full aspect-video object-cover"
              >
                <source src="/videos/avatarscene.mp4" type="video/mp4" />
              </video>
              <div className="p-4">
                <h3 className={`text-xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>Scene Generation</h3>
                <p className="text-gray-400 text-sm">Full avatar in dynamic environments</p>
              </div>
            </div>
            
            {/* Two Avatars Video */}
            <div className="relative rounded-[24px] overflow-hidden border border-white/10 bg-[#111] group animate-on-scroll animate-fade-in-up delay-500">
              <video
                controls
                preload="metadata"
                className="w-full aspect-video object-cover"
              >
                <source src="/videos/twoavatars.mp4" type="video/mp4" />
              </video>
              <div className="p-4">
                <h3 className={`text-xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>Multi-Avatar Conversations</h3>
                <p className="text-gray-400 text-sm">Multiple avatars interacting together</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Zigzag Section */}
      <section className="relative z-[96] w-full bg-black py-24 px-4 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto space-y-32">
          
          {/* Feature 1 - Any Style */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="flex-1 order-2 md:order-1 animate-on-scroll animate-fade-in-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 rounded-full mb-6 border border-blue-500/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Any Style
              </span>
              <h3 className={`text-3xl md:text-4xl font-bold mb-5 leading-tight ${spaceGrotesk.className}`}>
                <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">From Cartoons to</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Realistic Scenes</span>
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Whether you want to animate a drawing, make your pet dance, or bring a <span className="text-blue-400 font-medium">product shot</span> to life, our AI video generator can create videos in any style, while preserving the original context and details.
              </p>
            </div>
            <div className="flex-1 order-1 md:order-2 animate-on-scroll animate-fade-in-right delay-200">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] group-hover:border-blue-500/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <video autoPlay loop muted playsInline className="w-full aspect-video object-cover">
                  <source src="/videos/ani.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* Feature 2 - Greater Realism */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="flex-1 animate-on-scroll animate-fade-in-left">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] group-hover:border-emerald-500/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <video autoPlay loop muted playsInline className="w-full aspect-video object-cover">
                  <source src="/videos/nature.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
            <div className="flex-1 animate-on-scroll animate-fade-in-right delay-200">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 rounded-full mb-6 border border-emerald-500/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Greater Realism
              </span>
              <h3 className={`text-3xl md:text-4xl font-bold mb-5 leading-tight ${spaceGrotesk.className}`}>
                <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">Add Greater Realism</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">with AI Motion</span>
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Vizual's artificial intelligence image to video feature uses advanced deep learning to create lifelike, immersive videos. Add drama, realism, or storytelling depth to any static image.
              </p>
            </div>
          </div>

          {/* Feature 3 - High-Quality Motion */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="flex-1 order-2 md:order-1 animate-on-scroll animate-fade-in-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-full mb-6 border border-purple-500/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                High-Quality Motion
              </span>
              <h3 className={`text-3xl md:text-4xl font-bold mb-5 leading-tight ${spaceGrotesk.className}`}>
                <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">Natural Movement</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Real-World Effects</span>
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Zoom, pan, and tilt with precision. Our image to video AI engine simulates realistic physics, lighting, and material interaction, from flowing hair and bouncing fabric to shimmering water.
              </p>
            </div>
            <div className="flex-1 order-1 md:order-2 animate-on-scroll animate-fade-in-right delay-200">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] group-hover:border-purple-500/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <video autoPlay loop muted playsInline className="w-full aspect-video object-cover">
                  <source src="/videos/film2.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generate Without Learning Curve Section */}
      <section className="relative z-[97] w-full bg-black py-24 px-4 overflow-hidden">
        {/* Animated background orb */}
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto">
          
          {/* First Row */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-32">
            <div className="flex-1 animate-on-scroll animate-fade-in-left">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${spaceGrotesk.className}`}>
                <span className="bg-[length:200%_auto] bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-shimmer">Generate AI videos</span>
                <br />
                <span className="bg-[length:200%_auto] bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-shimmer">without a learning curve</span>
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
                <video autoPlay loop muted playsInline className="w-full aspect-video object-cover">
                  <source src="/videos/fantasy.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 order-2 md:order-1 animate-on-scroll animate-fade-in-left">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${spaceGrotesk.className}`}>
                <span className="bg-[length:200%_auto] bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent animate-shimmer">Edit videos with</span>
                <br />
                <span className="bg-[length:200%_auto] bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent animate-shimmer">a text prompt</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Edit your videos with simple commands. Give simple commands like change the accent, delete scenes or add a funny intro and watch your videos come to life.
              </p>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl shadow-purple-500/5">
                <video autoPlay loop muted playsInline className="w-full aspect-video object-cover">
                  <source src="/videos/design.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Creators/Teams/Developers Section */}
      <section className="relative z-[98] w-full bg-black py-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* For Creators */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 animate-on-scroll animate-fade-in-up">
            <div className="flex items-start justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>For Creators</h3>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Create production-quality visual assets for your projects with unprecedented quality, speed, and style-consistency.
            </p>
          </div>

          {/* For Teams */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 animate-on-scroll animate-fade-in-up delay-200">
            <div className="flex items-start justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>For Teams</h3>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Bring your team's best ideas to life at scale, with our intuitive AI-first creative suite designed for collaboration and built for business.
            </p>
          </div>

          {/* For Developers */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 animate-on-scroll animate-fade-in-up delay-400">
            <div className="flex items-start justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>For Developers</h3>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Experience content creation excellence with Vizual's API. With unmatched scalability, effortlessly tailor outputs to your brand guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="relative z-[99] w-full bg-gradient-to-b from-black via-[#0a0a1a] to-black py-24 px-4 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
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
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord Server
            </a>
          </div>

          {/* Right - Floating Avatars */}
          <div className="flex-1 relative h-[400px] hidden md:block">
            {/* Avatar Grid - scattered floating effect */}
            {[
              { top: '5%', left: '10%', size: 'w-16 h-16', delay: '0s' },
              { top: '0%', left: '35%', size: 'w-14 h-14', delay: '0.5s' },
              { top: '10%', left: '60%', size: 'w-12 h-12', delay: '1s' },
              { top: '5%', left: '85%', size: 'w-14 h-14', delay: '0.3s' },
              { top: '25%', left: '0%', size: 'w-12 h-12', delay: '0.7s' },
              { top: '30%', left: '25%', size: 'w-16 h-16', delay: '0.2s' },
              { top: '25%', left: '50%', size: 'w-14 h-14', delay: '0.9s' },
              { top: '35%', left: '75%', size: 'w-12 h-12', delay: '0.4s' },
              { top: '50%', left: '5%', size: 'w-14 h-14', delay: '0.6s' },
              { top: '55%', left: '30%', size: 'w-12 h-12', delay: '0.1s' },
              { top: '50%', left: '55%', size: 'w-16 h-16', delay: '0.8s' },
              { top: '55%', left: '80%', size: 'w-14 h-14', delay: '0.35s' },
              { top: '75%', left: '15%', size: 'w-12 h-12', delay: '0.55s' },
              { top: '70%', left: '40%', size: 'w-14 h-14', delay: '0.25s' },
              { top: '75%', left: '65%', size: 'w-12 h-12', delay: '0.75s' },
              { top: '80%', left: '90%', size: 'w-14 h-14', delay: '0.45s' },
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos.size} rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white/10 overflow-hidden animate-float`}
                style={{ 
                  top: pos.top, 
                  left: pos.left,
                  animationDelay: pos.delay,
                }}
              >
                {/* Placeholder gradient - these would be actual user avatars */}
                <div className="w-full h-full bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30" />
              </div>
            ))}
            
            {/* Discord Logo Avatars scattered in */}
            <div className="absolute top-[20%] left-[45%] w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center animate-float" style={{ animationDelay: '0.65s' }}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div className="absolute top-[60%] left-[20%] w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center animate-float" style={{ animationDelay: '0.85s' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="relative z-[100] w-full bg-black py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 text-sm uppercase tracking-widest mb-10 animate-on-scroll animate-fade-in-up">Powered by Industry Leaders</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 animate-on-scroll animate-fade-in-up delay-200">
            <img src="/images/veo3-logo.png" alt="Veo 3" className="h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <img src="/images/kling-ai-logo.png" alt="Kling AI" className="h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <img src="/images/hailuo-ai-logo.png" alt="Hailuo AI" className="h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            <img src="/images/percify-logo.png" alt="Percify" className="h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-[101] w-full bg-black py-32 px-4 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent pointer-events-none" />
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
      </section>

      {/* Footer */}
      <footer className="relative z-[100] w-full bg-black border-t border-white/10 pt-20 pb-10 px-6">
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
                <li><a href="#" className="hover:text-white transition-colors">Studio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
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
                <source src="/videos/grok-video-163f4b90-6e8d-43d2-88d0-6450a84086c0 (5).mp4" type="video/mp4" />
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
      </footer>
    </div>
  );
}
