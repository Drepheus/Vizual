"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Sparkles, TrendingUp, Play, Image as ImageIcon, Grid3X3, Filter, Maximize2, X } from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";
import { HoverBorderGradient } from "@/src/components/ui/hover-border-gradient";

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
        {/* Video/Image */}
        {creation.type === 'image' || (creation.src && creation.src.match(/\.(jpg|jpeg|png|webp)$/i)) ? (
          <img
            src={creation.src}
            alt={creation.prompt}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 will-change-transform"
          />
        ) : (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="none"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 will-change-transform"
          >
            <source src={creation.src} type="video/mp4" />
          </video>
        )}

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />

        {/* Author Badge - Top */}
        <div className={`absolute top-4 left-4 flex items-center gap-3 transition-all duration-200 ${active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}>
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-lg overflow-hidden">
            {creation.authorAvatar ? (
              <img src={creation.authorAvatar} alt={creation.author} className="w-full h-full object-cover" />
            ) : (
              creation.author.charAt(0)
            )}
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
          <HoverBorderGradient
            containerClassName="rounded-xl w-full"
            as="button"
            className="w-full bg-white text-black flex items-center justify-center gap-2 py-2.5 font-bold text-xs tracking-wide uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Remix This
          </HoverBorderGradient>
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
        {creation.type === 'image' || (creation.src && creation.src.match(/\.(jpg|jpeg|png|webp)$/i)) ? (
          <img
            src={creation.src}
            alt={creation.prompt}
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            autoPlay
            loop
            controls
            playsInline
            className="w-full h-full object-contain"
          >
            <source src={creation.src} type="video/mp4" />
          </video>
        )}

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
  // Film & Cinematic
  { id: 1, type: "video", src: "/videos/film.mp4", author: "StudioPro", likes: 2453, prompt: "Cinematic sunrise over a misty mountain range" },
  { id: 4, type: "video", src: "/videos/film2.mp4", author: "CinematicAI", likes: 987, prompt: "Film noir detective walking through rain" },
  { id: 8, type: "video", src: "/videos/film3.mp4", author: "VFXWizard", likes: 1234, prompt: "Slow motion water splash with dramatic lighting" },
  { id: 11, type: "video", src: "/videos/film5.mp4", author: "DreamMaker", likes: 3456, prompt: "Fantasy castle emerging from clouds" },
  { id: 14, type: "video", src: "/videos/film6.mp4", author: "SciFiLab", likes: 2345, prompt: "Spaceship flying through asteroid field" },
  { id: 17, type: "video", src: "/videos/film7.mp4", author: "CineMaster", likes: 1876, prompt: "Dramatic establishing shot of cyberpunk city" },
  { id: 18, type: "video", src: "/videos/Professional_Mode_A_fully_three_dimensional_shark_.mp4", author: "DeepSea", likes: 4532, prompt: "A fully three dimensional shark swimming in deep ocean" },
  { id: 19, type: "video", src: "/videos/Professional_Mode_Vertical_9_16_cinematic_10_secon.mp4", author: "VerticalCine", likes: 3221, prompt: "Cinematic 9:16 vertical shot, 10 seconds" },
  { id: 20, type: "video", src: "/videos/Standard_Mode_9x16_A_romantic_comedy_film_set_in_a.mp4", author: "RomComAI", likes: 1543, prompt: "A romantic comedy film set in a cozy cafe" },
  { id: 21, type: "video", src: "/videos/veo-hero.mp4", author: "VeoCreator", likes: 2890, prompt: "Hero shot generated with Veo model" },
  { id: 22, type: "video", src: "/videos/veo1.mp4", author: "VeoUser1", likes: 1102, prompt: "Surreal landscape drift" },
  { id: 23, type: "video", src: "/videos/veo2.mp4", author: "VeoUser2", likes: 1450, prompt: "Abstract fluid dynamics" },
  { id: 24, type: "video", src: "/videos/veo3.mp4", author: "VeoUser3", likes: 1670, prompt: "Kinetic typography animation" },

  // Animated & Anime
  { id: 2, type: "video", src: "/videos/ani.mp4", author: "AnimeMaster", likes: 1892, prompt: "Anime hero transformation sequence" },
  { id: 6, type: "video", src: "/videos/ani1.mp4", author: "TokyoDreams", likes: 2891, prompt: "Cyberpunk city with neon lights" },
  { id: 13, type: "video", src: "/videos/ani4.mp4", author: "AnimeStudio", likes: 1789, prompt: "Magical girl power-up transformation" },
  { id: 25, type: "video", src: "/videos/avatar.mp4", author: "AvatarGen", likes: 2100, prompt: "3D Avatar character expressions" },
  { id: 26, type: "video", src: "/videos/avatarscene.mp4", author: "SceneBuilder", likes: 1950, prompt: "Avatar interacting with environment" },
  { id: 27, type: "video", src: "/videos/twoavatars.mp4", author: "DualPersona", likes: 2340, prompt: "Two avatars conversation scene" },
  { id: 28, type: "video", src: "/videos/Standard_Mode_animated_moment_where_cats_appro.mp4", author: "CatLover", likes: 5600, prompt: "Animated moment where cats approach curiously" },
  { id: 29, type: "video", src: "/videos/rockbug.mp4", author: "CreatureFeat", likes: 1230, prompt: "Rock bug creature crawling on terrain" },
  { id: 30, type: "video", src: "/videos/samchar.mp4", author: "CharDesign", likes: 1450, prompt: "Sam character walk cycle" },

  // Products
  { id: 3, type: "video", src: "/videos/product.mp4", author: "BrandLab", likes: 3201, prompt: "Luxury perfume bottle floating in water" },
  { id: 7, type: "video", src: "/videos/product1.mp4", author: "ProductViz", likes: 743, prompt: "Sneaker rotating on black background" },
  { id: 12, type: "video", src: "/videos/product2.mp4", author: "LuxuryViz", likes: 654, prompt: "Watch commercial with light reflections" },
  { id: 16, type: "video", src: "/videos/product3.mp4", author: "TechReview", likes: 1123, prompt: "Smartphone product reveal animation" },
  { id: 31, type: "video", src: "/videos/product4.mp4", author: "AdAgency", likes: 2100, prompt: "Cosmetic cream jar spin" },
  { id: 32, type: "video", src: "/videos/product5.mp4", author: "PromoGen", likes: 1890, prompt: "Energy drink condensation closeup" },
  { id: 33, type: "video", src: "/videos/product6.mp4", author: "CommercialAI", likes: 2450, prompt: "Automotive studio lighting reveal" },
  { id: 34, type: "video", src: "/videos/product7.mp4", author: "MarketPro", likes: 3100, prompt: "Headphones expanding view" },

  // Abstract & Design
  { id: 5, type: "video", src: "/videos/design.mp4", author: "DesignFlow", likes: 1567, prompt: "Abstract fluid art motion graphics" },
  { id: 10, type: "video", src: "/videos/design2.mp4", author: "ArtisticAI", likes: 876, prompt: "Geometric patterns morphing into nature" },
  { id: 35, type: "video", src: "/videos/matrixcode.mp4", author: "NeoVis", likes: 4500, prompt: "Green falling code matrix rain" },
  { id: 36, type: "video", src: "/videos/RAYVID.mp4", author: "RayTracer", likes: 1200, prompt: "Raytraced glass refraction experiment" },
  { id: 37, type: "video", src: "/videos/intro.mp4", author: "IntroMaker", likes: 980, prompt: "Dynamic logo reveal intro" },
  { id: 38, type: "video", src: "/videos/text2image.mp4", author: "Txt2Img", likes: 1150, prompt: "Morphing text to image transition" },

  // Music
  { id: 9, type: "video", src: "/videos/music.mp4", author: "SoundScape", likes: 2156, prompt: "Music visualizer with pulsing geometry" },
  { id: 15, type: "video", src: "/videos/music2.mp4", author: "BeatVisuals", likes: 987, prompt: "EDM music video with abstract shapes" },

  // Sci-Fi & Fantasy
  { id: 39, type: "video", src: "/videos/fantasy.mp4", author: "FantasyWorld", likes: 2300, prompt: "Mystical forest with glowing mushrooms" },
  { id: 40, type: "video", src: "/videos/fantasy1.mp4", author: "MythicAI", likes: 2100, prompt: "Dragon flying over ancient ruins" },
  { id: 41, type: "video", src: "/videos/fantasy2.mp4", author: "EpicTales", likes: 2500, prompt: "Wizard casting spell in tower" },
  { id: 42, type: "video", src: "/videos/fantasy3.mp4", author: "Visionary", likes: 1980, prompt: "Floating islands in the sky" },
  { id: 43, type: "video", src: "/videos/fantasy4.mp4", author: "Dreamer", likes: 2200, prompt: "Underwater city of Atlantis" },
  { id: 44, type: "video", src: "/videos/fantasy6.mp4", author: "Imagineer", likes: 2400, prompt: "Elf warrior in enchanted woods" },
  { id: 45, type: "video", src: "/videos/grok-video-163f4b90-6e8d-43d2-88d0-6450a84086c0 (5).mp4", author: "GrokUser", likes: 1300, prompt: "Complex AI generated chaotic scene" },
  { id: 46, type: "video", src: "/videos/klingdemovid.mp4", author: "KlingAI", likes: 1560, prompt: "Kling model capability demonstration" },
  { id: 47, type: "video", src: "/videos/klingmodel.mp4", author: "KlingOfficial", likes: 1780, prompt: "Model architecture visualization" },
  { id: 48, type: "video", src: "/videos/klingnextgen.mp4", author: "NextGen", likes: 1900, prompt: "Next generation video synthesis preview" },
  { id: 49, type: "video", src: "/videos/Text_Description__Inside_the_dimly_lit_spacecraft__an_astronaut_adjusts_his_helmet__his1740034595211.mp4", author: "SpaceExplorer", likes: 3200, prompt: "Inside dimly lit spacecraft, astronaut adjusts helmet" },
  { id: 50, type: "video", src: "/videos/the_action_figure_breaks_out_of_the_package__then_he_grabs_the_gun_and_fights_his_enemi1745044493806.mp4", author: "ActionToy", likes: 4100, prompt: "Action figure breaks out of package and fights enemies" },

  // Nature & Misc
  { id: 51, type: "video", src: "/videos/nature.mp4", author: "NatureLover", likes: 1800, prompt: "Peaceful river flowing through forest" },
  { id: 52, type: "video", src: "/videos/dogclimb.mp4", author: "PetLife", likes: 2200, prompt: "Cute dog climbing on furniture" },
  { id: 53, type: "video", src: "/videos/examples.mp4", author: "DemoReel", likes: 1500, prompt: "Compilation of various generative styles" },
  { id: 54, type: "video", src: "/videos/modelsvidspol.mp4", author: "Tester", likes: 900, prompt: "Comparing different model outputs" },
  { id: 55, type: "video", src: "/videos/verticalvid.mp4", author: "MobileFirst", likes: 1100, prompt: "Vertical format social media content" },
  { id: 56, type: "video", src: "/videos/videsectionloop.mp4", author: "Looper", likes: 1300, prompt: "Seamless background loop" },
  { id: 57, type: "video", src: "/videos/vidpreview.mp4", author: "Previwer", likes: 1400, prompt: "Quick preview of new features" },

  // Blueprints & Others
  { id: 58, type: "video", src: "/images/blueprints/caphone.mp4", author: "Blueprint", likes: 800, prompt: "California Phone blueprint animation" },
  { id: 59, type: "video", src: "/images/blueprints/frogkidrocket.mp4", author: "RocketDesign", likes: 950, prompt: "Frog Kid Rocket concept art" },
  { id: 60, type: "video", src: "/images/categories/design/kling_20250810_Image_to_Video_A_futurist_4820_0.mp4", author: "Futurist", likes: 3600, prompt: "Futuristic city design visualization" },

  // Featured Media
  { id: 61, type: "video", src: "/videos/mediafeaturedvids/imagehairvid.mp4", author: "HairSim", likes: 1250, prompt: "Detailed hair simulation render" },
  { id: 62, type: "video", src: "/videos/mediafeaturedvids/imageto%20vid.mp4", author: "Img2Vid", likes: 1350, prompt: "Image to video conversion demo" },
  { id: 63, type: "video", src: "/videos/mediafeaturedvids/imagetovid.mp4", author: "MotionGen", likes: 1450, prompt: "Static image brought to life" },
  { id: 64, type: "video", src: "/videos/mediafeaturedvids/multimodelvid1.mp4", author: "MultiModel", likes: 1650, prompt: "Multi-model generation comparison" },
  { id: 65, type: "video", src: "/videos/mediafeaturedvids/replicate-prediction-nxmrtf1fsdrma0cv4qrbq5grzg.mp4", author: "Replicate", likes: 1550, prompt: "AI prediction output visualization" },
  { id: 66, type: "video", src: "/videos/mediafeaturedvids/videxample.mp4", author: "ExampleUser", likes: 1150, prompt: "General video generation example" },

  // Pages & Loops
  { id: 67, type: "video", src: "/videos/pages/blackluma.mp4", author: "LumaUser", likes: 900, prompt: "Black and white luma fade" },
  { id: 68, type: "video", src: "/videos/pages/dreammachinge.mp4", author: "DreamMachine", likes: 2100, prompt: "Abstract dream machine visualization" },
  { id: 69, type: "video", src: "/videos/pages/luma.mp4", author: "LumaGen", likes: 1800, prompt: "Luma model generation showcase" },
  { id: 70, type: "video", src: "/videos/pages/lumaraysection.mp4", author: "RaySection", likes: 1600, prompt: "Raytracing section demo" },
  { id: 71, type: "video", src: "/videos/pages/photon.mp4", author: "Photon", likes: 2200, prompt: "Particle physics visualization" },
  { id: 72, type: "video", src: "/videos/pages/promptvizual.mp4", author: "PromptViz", likes: 1050, prompt: "Visualizing the prompt process" },
  { id: 73, type: "video", src: "/videos/pages/ray2.mp4", author: "RayTracer2", likes: 1950, prompt: "Advanced raytracing effects" },
  { id: 74, type: "video", src: "/videos/pages/ray3darkspace.mp4", author: "DarkSpace", likes: 1750, prompt: "Dark space environment render" },
  { id: 75, type: "video", src: "/videos/pages/stillvid.mp4", author: "StillLife", likes: 850, prompt: "Cinemagraph style still video" },
  { id: 76, type: "video", src: "/videos/pages/veobox.mp4", author: "VeoBox", likes: 1450, prompt: "3D box spinning with Veo textures" },
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
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);

  // Real Data State
  const [realCreations, setRealCreations] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchCreations = async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/community/feed?page=${pageNum}&limit=12`);
      if (res.ok) {
        const newItems = await res.json();
        if (newItems.length < 12) setHasMore(false);
        // reset only on explicit refresh, else append
        setRealCreations(prev => pageNum === 0 ? newItems : [...prev, ...newItems]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreations(0);
  }, []);

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
            {[...realCreations, ...communityCreations].map((creation, index) => {
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
        <button
          onClick={() => {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchCreations(nextPage);
          }}
          disabled={loading || !hasMore}
          className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-medium text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Loading...' : hasMore ? 'Load More' : 'No More Items'}
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
