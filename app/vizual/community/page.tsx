"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Sparkles, TrendingUp, Play, Image as ImageIcon, Grid3X3, Filter, Maximize2, X } from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

// Chrome/Silver gradient text component
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

const CreationCard = ({ creation, heightClass, active, onHover, onLeave, onClick }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (active && videoRef.current) {
      // Load video only when needed
      if (!hasLoaded) {
        videoRef.current.load();
        setHasLoaded(true);
      }
      videoRef.current.play().catch(() => { });
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active, hasLoaded]);

  return (
    <div
      className="break-inside-avoid group cursor-pointer"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ contain: 'layout style paint' }}
    >
      <div className={`relative ${heightClass} rounded-2xl overflow-hidden bg-[#0F0F0F] border border-white/5 group-hover:border-white/20 transition-colors duration-300`}>
        {/* Video/Image */}
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="none"
          poster="/images/omi-preview.png"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 will-change-transform"
        >
          <source src={creation.src} type="video/mp4" />
        </video>

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />

        {/* Author Badge - Top */}
        <div className={`absolute top-4 left-4 flex items-center gap-3 transition-all duration-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}>
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {creation.author.charAt(0)}
          </div>
          <span className="text-sm font-medium text-white/90 drop-shadow-md">{creation.author}</span>
        </div>

        {/* Like Badge - Top Right */}
        <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 transition-all duration-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}>
          <Heart className="w-3.5 h-3.5 text-white/80" />
          <span className="text-xs font-medium text-white/90">{creation.likes.toLocaleString()}</span>
        </div>

        {/* Bottom Content */}
        <div className={`absolute bottom-0 left-0 right-0 p-5 transition-all duration-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
          <p className="text-sm text-gray-300 line-clamp-2 mb-4 leading-relaxed font-light">
            {creation.prompt}
          </p>

          {/* Remix Button - Premium Monochrome */}
          <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs tracking-wide uppercase hover:bg-gray-200 transition-all shadow-lg flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Remix This
          </button>
        </div>
      </div>
    </div>
  );
};

// Expanded Modal Component
const ExpandedModal = ({ creation, onClose }: { creation: any, onClose: () => void }) => {
  if (!creation) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-[#0F0F0F] border border-white/10">
        <video
          autoPlay
          loop
          controls
          playsInline
          className="w-full h-full object-contain"
        >
          <source src={creation.src} type="video/mp4" />
        </video>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
          <h3 className={`text-2xl font-bold mb-2 ${spaceGrotesk.className}`}>{creation.author}</h3>
          <p className="text-gray-300">{creation.prompt}</p>
        </div>
      </div>
    </div>
  );
};

// Sample community creations data
const communityCreations = [
  { id: 1, type: "video", src: "/videos/film.mp4", author: "StudioPro", likes: 2453, prompt: "Cinematic sunrise over a misty mountain range" },
  { id: 2, type: "video", src: "/videos/ani.mp4", author: "AnimeMaster", likes: 1892, prompt: "Anime hero transformation sequence" },
  { id: 3, type: "video", src: "/videos/product.mp4", author: "BrandLab", likes: 3201, prompt: "Luxury perfume bottle floating in water" },
  { id: 4, type: "video", src: "/videos/film2.mp4", author: "CinematicAI", likes: 987, prompt: "Film noir detective walking through rain" },
  { id: 5, type: "video", src: "/videos/design.mp4", author: "DesignFlow", likes: 1567, prompt: "Abstract fluid art motion graphics" },
  { id: 6, type: "video", src: "/videos/ani1.mp4", author: "TokyoDreams", likes: 2891, prompt: "Cyberpunk city with neon lights" },
  { id: 7, type: "video", src: "/videos/product1.mp4", author: "ProductViz", likes: 743, prompt: "Sneaker rotating on black background" },
  { id: 8, type: "video", src: "/videos/film3.mp4", author: "VFXWizard", likes: 1234, prompt: "Slow motion water splash with dramatic lighting" },
  { id: 9, type: "video", src: "/videos/music.mp4", author: "SoundScape", likes: 2156, prompt: "Music visualizer with pulsing geometry" },
  { id: 10, type: "video", src: "/videos/design2.mp4", author: "ArtisticAI", likes: 876, prompt: "Geometric patterns morphing into nature" },
  { id: 11, type: "video", src: "/videos/film5.mp4", author: "DreamMaker", likes: 3456, prompt: "Fantasy castle emerging from clouds" },
  { id: 12, type: "video", src: "/videos/product2.mp4", author: "LuxuryViz", likes: 654, prompt: "Watch commercial with light reflections" },
  { id: 13, type: "video", src: "/videos/ani4.mp4", author: "AnimeStudio", likes: 1789, prompt: "Magical girl power-up transformation" },
  { id: 14, type: "video", src: "/videos/film6.mp4", author: "SciFiLab", likes: 2345, prompt: "Spaceship flying through asteroid field" },
  { id: 15, type: "video", src: "/videos/music2.mp4", author: "BeatVisuals", likes: 987, prompt: "EDM music video with abstract shapes" },
  { id: 16, type: "video", src: "/videos/product3.mp4", author: "TechReview", likes: 1123, prompt: "Smartphone product reveal animation" },
];

const categories = [
  "All", "Film", "Animated", "Products", "Design", "Music", "Sci-Fi", "Nature", "Abstract"
];

const filters = [
  { name: "Trending", icon: <TrendingUp className="w-4 h-4" /> },
  { name: "All", icon: <Grid3X3 className="w-4 h-4" /> },
  { name: "Video", icon: <Play className="w-4 h-4" /> },
];

export default function CommunityPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("Trending");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className={`relative w-full min-h-screen bg-black text-white ${inter.className}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 md:py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              onClick={() => router.push('/vizual')}
              className="cursor-pointer flex items-center gap-2 group"
            >
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
              <a href="/vizual/community" className="text-white transition-colors">COMMUNITY</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/vizual/studio')}
              className="px-5 py-2 md:px-6 md:py-2 rounded-full bg-white text-black text-xs md:text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              CREATE
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <h1 className={`text-4xl md:text-7xl font-bold mb-6 tracking-tight ${spaceGrotesk.className}`}>
            Community <ChromeText>Creations</ChromeText>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light">
            Explore the next generation of AI-generated media created by the Vizual community.
          </p>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center gap-6 mt-12 border-b border-white/5 pb-8">
            {/* Sort & Type Filters */}
            <div className="flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10">
              {filters.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => setActiveFilter(filter.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeFilter === filter.name
                    ? "bg-white text-black shadow-lg shadow-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {filter.icon}
                  <span>{filter.name}</span>
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 flex-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === category
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-transparent text-gray-500 border-transparent hover:text-white hover:border-white/10"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {communityCreations.map((creation, index) => {
              // Vary heights for masonry effect
              const heights = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-[5/4]"];
              const heightClass = heights[index % heights.length];

              return (
                <CreationCard
                  key={creation.id}
                  creation={creation}
                  heightClass={heightClass}
                  active={hoveredCard === creation.id}
                  onHover={() => setHoveredCard(creation.id)}
                  onLeave={() => setHoveredCard(null)}
                  onClick={() => setHoveredCard(creation.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Load More */}
      <div className="flex justify-center pb-32">
        <button className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-medium text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95">
          Load More
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M25 20 L85 50 L25 80 V20 Z" fill="currentColor" />
            </svg>
            <span className={`font-bold ${spaceGrotesk.className}`}>VIZUAL</span>
          </div>
          <p className="text-gray-600 text-xs uppercase tracking-wider">© 2025 Vizual AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
