"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useGuestMode } from "@/context/guest-mode-context";
import {
  LayoutGrid,
  Lightbulb,
  Pencil,
  HelpCircle,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  Sparkles,
  MessageSquareQuote,
  MoreHorizontal,
  Image as ImageIcon,
  Plus,
  Video,
  Infinity,
  Send,
  RefreshCw,
  Menu,
  X,
  Home,
  FolderKanban,
  Compass,
  Library,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";
import { Vortex } from "@/components/ui/vortex";
import { ProjectsView } from "@/components/vizual/projects-view";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

type CreationMode = "IMAGE" | "VIDEO";
type TabMode = "KEYFRAME" | "REFERENCE" | "MODIFY" | "IMAGE REFERENCE" | "REMIX";

// Models Configuration
const IMAGE_MODELS = [
  // Black Forest Labs
  {
    id: "flux-schnell",
    name: "FLUX Schnell",
    description: "Black Forest Labs",
    cost: "$0.003",
    detail: "333 images / $1"
  },
  {
    id: "flux-1.1-pro-ultra",
    name: "FLUX 1.1 Pro Ultra",
    description: "Black Forest Labs",
    cost: "$0.06",
    detail: "16 images / $1"
  },

  // PrunaAI
  {
    id: "p-image",
    name: "PrunaAI P-Image",
    description: "High efficiency",
    cost: "$0.005",
    detail: "200 images / $1"
  },

  // Google
  {
    id: "imagen-4-fast",
    name: "Imagen 4 Fast",
    description: "Google DeepMind",
    cost: "$0.02",
    detail: "50 images / $1"
  },
  {
    id: "imagen-3-fast",
    name: "Imagen 3 Fast",
    description: "Google DeepMind",
    cost: "$0.025",
    detail: "40 images / $1"
  },
  {
    id: "imagen-4-ultra",
    name: "Imagen 4 Ultra",
    description: "Google DeepMind",
    cost: "$0.06",
    detail: "16 images / $1"
  },

  // Ideogram
  {
    id: "ideogram-v3-turbo",
    name: "Ideogram v3 Turbo",
    description: "Ideogram",
    cost: "$0.03",
    detail: "33 images / $1"
  },

  // ByteDance
  {
    id: "seedream-4",
    name: "SeaDream 4",
    description: "ByteDance",
    cost: "$0.03",
    detail: "33 images / $1"
  },
  {
    id: "seedream-4.5",
    name: "SeaDream 4.5",
    description: "ByteDance",
    cost: "$0.04",
    detail: "25 images / $1"
  },

  // Nano
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    description: "Nano",
    cost: "$0.15",
    detail: "66 images / $10"
  }
];

const VIDEO_MODELS = [
  // ByteDance
  {
    id: "seedance-1-pro-fast",
    name: "Seedance 1 Pro Fast",
    description: "ByteDance (480p-1080p)",
    cost: "From $0.015/s",
    detail: "approx 66s / $1"
  },
  {
    id: "seedance-1-lite",
    name: "Seedance 1 Lite",
    description: "ByteDance (480p-1080p)",
    cost: "From $0.018/s",
    detail: "approx 55s / $1"
  },
  {
    id: "seedance-1-pro",
    name: "Seedance 1 Pro",
    description: "ByteDance (480p-1080p)",
    cost: "From $0.03/s",
    detail: "approx 33s / $1"
  },

  // Wan (Wavespeed/Wan-Video)
  {
    id: "wan-2.5-i2v",
    name: "Wan 2.5 I2V",
    description: "Wan Video (480p-1080p)",
    cost: "From $0.05/s",
    detail: "20s / $1"
  },
  {
    id: "wan-2.5-t2v",
    name: "Wan 2.5 T2V",
    description: "Wan Video (480p-1080p)",
    cost: "From $0.05/s",
    detail: "20s / $1"
  },
  {
    id: "wan-2.5-t2v-fast",
    name: "Wan 2.5 T2V Fast",
    description: "Wan Video (720p-1080p)",
    cost: "From $0.068/s",
    detail: "approx 14s / $1"
  },
  {
    id: "wan-2.1-t2v-720p",
    name: "Wan 2.1 T2V",
    description: "WavespeedAI (720p)",
    cost: "$0.24/s",
    detail: "41s / $10"
  },
  {
    id: "wan-2.1-i2v-720p",
    name: "Wan 2.1 I2V",
    description: "WavespeedAI (720p)",
    cost: "$0.25/s",
    detail: "40s / $10"
  },

  // Pixverse
  {
    id: "pixverse-v4.5",
    name: "Pixverse v4.5",
    description: "Pixverse (360p-1080p)",
    cost: "From $0.06/s",
    detail: "Variable by resolution"
  },

  // Kling
  {
    id: "kling-v2.5-turbo-pro",
    name: "Kling v2.5 Turbo Pro",
    description: "Kuaishou",
    cost: "$0.07/s",
    detail: "approx 14s / $1"
  },

  // Minimax
  {
    id: "hailuo-2.3-fast",
    name: "Hailuo 2.3 Fast",
    description: "Minimax (6s-10s)",
    cost: "From $0.19/vid",
    detail: "approx 52 vids / $10"
  },
  {
    id: "hailuo-2.3",
    name: "Hailuo 2.3",
    description: "Minimax (6s-10s)",
    cost: "From $0.28/vid",
    detail: "approx 35 vids / $10"
  },

  // OpenAI
  {
    id: "sora-2",
    name: "Sora 2",
    description: "OpenAI",
    cost: "$0.10/s",
    detail: "Standard quality"
  },
  {
    id: "sora-2-own-key",
    name: "Sora 2 (Own Key)",
    description: "OpenAI Direct",
    cost: "Direct Bill",
    detail: "Pay OpenAI directly"
  },

  // Google
  {
    id: "veo-3-fast",
    name: "Veo 3 Fast",
    description: "Google DeepMind",
    cost: "From $0.10/s",
    detail: "10s / $1 (No Audio)"
  },
  {
    id: "veo-3.1-fast",
    name: "Veo 3.1 Fast",
    description: "Google DeepMind",
    cost: "From $0.10/s",
    detail: "10s / $1 (No Audio)"
  },
  {
    id: "veo-3",
    name: "Veo 3",
    description: "Google DeepMind",
    cost: "From $0.20/s",
    detail: "50s / $10 (No Audio)"
  },
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    description: "Google DeepMind",
    cost: "From $0.20/s",
    detail: "50s / $10 (No Audio)"
  },
  {
    id: "veo-2",
    name: "Veo 2",
    description: "Google DeepMind",
    cost: "$0.50/s",
    detail: "20s / $10"
  }
];

export default function VizualStudioApp() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isGuestMode } = useGuestMode();
  const [creationMode, setCreationMode] = useState<CreationMode>("VIDEO");
  const [activeTab, setActiveTab] = useState<TabMode>("KEYFRAME");

  // Reset active tab when creation mode changes
  useEffect(() => {
    if (creationMode === 'IMAGE') {
      setActiveTab('IMAGE REFERENCE');
    } else {
      setActiveTab('KEYFRAME');
    }
  }, [creationMode]);
  const [currentView, setCurrentView] = useState<'STUDIO' | 'PROJECTS'>('STUDIO');
  const [prompt, setPrompt] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [model, setModel] = useState(VIDEO_MODELS[0].name); // Initialize with first video model
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [uploadPopup, setUploadPopup] = useState<'image' | 'video' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Update selected model when mode changes
  useEffect(() => {
    if (creationMode === "IMAGE") {
      setModel(IMAGE_MODELS[0].name);
    } else {
      setModel(VIDEO_MODELS[0].name);
    }
  }, [creationMode]);

  // Template/inspiration modes
  const templateModes = [
    {
      id: 1,
      title: "Make visuals for",
      description: "a closeup photo of California poppies in pastel lighting",
      icon: "image"
    },
    {
      id: 2,
      title: "Make a video of",
      description: "a bunny in 3d cartoon style playing guitar in front of a waterfall",
      icon: "video"
    },
    {
      id: 3,
      title: "Use this @style",
      description: "to make a Greek stone sculpture",
      icon: "style"
    },
    {
      id: 4,
      title: "Generate cinematic",
      description: "drone shot of a futuristic cyberpunk city at night",
      icon: "film"
    },
    {
      id: 5,
      title: "Create a timelapse of",
      description: "clouds moving over mountain peaks at golden hour",
      icon: "clock"
    }
  ];

  // Sample generation result
  const [generatedContent, setGeneratedContent] = useState<{
    prompt: string;
    description: string;
    keywords: string[];
  } | null>(null);

  // Redirect to login if not authenticated and not in guest mode
  useEffect(() => {
    if (!loading && !user && !isGuestMode) {
      router.push('/login?redirect=/vizual/studio');
    }
  }, [user, loading, router, isGuestMode]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    // Simulate AI response with highlighted keywords
    const keywords = prompt.match(/\b\w{4,}\b/g)?.slice(0, 5) || [];
    setGeneratedContent({
      prompt: prompt,
      description: `I've created four distinct ${creationMode.toLowerCase()}s based on your prompt "${prompt}", each with unique artistic interpretation and cinematic quality.`,
      keywords: keywords
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isGuestMode) {
    return null;
  }

  const currentModels = creationMode === "IMAGE" ? IMAGE_MODELS : VIDEO_MODELS;

  return (
    <div className={`h-screen bg-[#0a0a0a] text-white flex overflow-hidden ${inter.className}`}>
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Expandable/Collapsible */}
      <aside className={`
        fixed md:relative z-50 flex-shrink-0
        ${sidebarExpanded ? 'w-56' : 'w-16'} 
        bg-black border-r border-white/5 
        flex flex-col py-4
        h-full
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Close button - mobile only, only visible when sidebar is open */}
        {sidebarOpen && (
          <button
            className="absolute top-4 right-[-40px] md:hidden p-2 bg-black/50 rounded-r-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        )}

        {/* Logo & Toggle Row */}
        <div className={`flex items-center ${sidebarExpanded ? 'justify-between px-4' : 'justify-center'} mb-4 flex-shrink-0`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/vizual')}>
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white flex-shrink-0">
              <path d="M25 20 L85 50 L25 80 V20 Z" fill="currentColor" />
            </svg>
            {sidebarExpanded && <span className={`font-bold text-sm uppercase tracking-wide ${spaceGrotesk.className}`}>VIZUAL.AI</span>}
          </div>
          {/* Collapse/Expand button - visible on desktop */}
          <button
            className="hidden md:flex p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarExpanded ? <PanelLeftClose size={18} className="text-gray-400" /> : <PanelLeft size={18} className="text-gray-400" />}
          </button>
        </div>

        {/* Create New Button */}
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} mb-4 flex-shrink-0`}>
          <button
            onClick={() => { setCurrentView('STUDIO'); setShowModeModal(true); }}
            className={`w-full flex items-center gap-2 ${sidebarExpanded ? 'px-3 justify-start' : 'justify-center'} py-2.5 rounded-lg bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-white font-medium text-sm`}
          >
            <Plus size={18} />
            {sidebarExpanded && <span>Create New</span>}
          </button>
        </div>

        {/* Nav Items */}
        <nav className={`flex-1 flex flex-col gap-1 ${sidebarExpanded ? 'px-3' : 'px-2'} overflow-y-auto`}>
          <NavItem
            icon={<FolderKanban size={20} />}
            label="Projects"
            active={currentView === 'PROJECTS'}
            expanded={sidebarExpanded}
            onClick={() => setCurrentView('PROJECTS')}
          />
          <NavItem
            icon={<Home size={20} />}
            label="Dashboard"
            active={currentView === 'STUDIO'}
            expanded={sidebarExpanded}
            onClick={() => setCurrentView('STUDIO')}
          />
          <NavItem icon={<Compass size={20} />} label="Explore" expanded={sidebarExpanded} />
          <NavItem icon={<Library size={20} />} label="My Library" expanded={sidebarExpanded} />
        </nav>

        {/* Bottom Section - User Profile */}
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} pt-4 border-t border-white/5 mt-4 flex-shrink-0`}>
          <button className={`w-full flex items-center gap-3 ${sidebarExpanded ? 'px-2' : 'justify-center'} py-2 rounded-lg hover:bg-white/5 transition-colors`}>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              A
            </div>
            {sidebarExpanded && (
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-white truncate">Guest User</div>
              </div>
            )}
            {sidebarExpanded && <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      {currentView === 'PROJECTS' ? (
        <main className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
          <ProjectsView />
        </main>
      ) : (
        <div className="flex-1 flex flex-col w-full min-w-0">
          {/* Top Header */}
          <header className="h-14 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-3 md:px-6 flex-shrink-0 relative z-30">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="relative flex-1 md:flex-none flex items-center gap-4">
              {/* Create Mode Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium hover:text-gray-300 transition-colors"
                >
                  <span className="text-gray-400 hidden sm:inline">CREATE AND MODIFY</span>
                  <span className={`font-bold ${spaceGrotesk.className}`}>{creationMode}</span>
                  <ChevronDown size={16} />
                </button>

                {showModeDropdown && (
                  <div className="absolute top-full left-0 mt-2 min-w-[140px] bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden z-50 shadow-xl">
                    {/* Backdrop for click away */}
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowModeDropdown(false)} />
                    <button
                      onClick={() => { setCreationMode("IMAGE"); setShowModeDropdown(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <ImageIcon size={16} />
                      IMAGE
                    </button>
                    <button
                      onClick={() => { setCreationMode("VIDEO"); setShowModeDropdown(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <Video size={16} />
                      VIDEO
                    </button>
                  </div>
                )}
              </div>

              {/* Model Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium hover:text-gray-300 transition-colors"
                >
                  <span className="text-gray-400 hidden sm:inline">MODEL</span>
                  <span className={`font-bold ${spaceGrotesk.className}`}>{model}</span>
                  <ChevronDown size={16} />
                </button>

                {showModelDropdown && (
                  <div className="absolute top-full left-0 mt-2 min-w-[280px] sm:min-w-[320px] bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden z-50 shadow-2xl max-h-[80vh] overflow-y-auto">
                    {/* Backdrop for click away */}
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowModelDropdown(false)} />
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Select {creationMode === 'IMAGE' ? 'Image' : 'Video'} Model
                    </div>
                    {currentModels.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setModel(m.name); setShowModelDropdown(false); }}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-white/50 flex items-start justify-between gap-4 group"
                      >
                        <div>
                          <div className="text-sm font-medium text-white mb-0.5 group-hover:text-blue-400 transition-colors">{m.name}</div>
                          <div className="text-xs text-gray-500">{m.description}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold text-gray-300">{m.cost}</div>
                          <div className="text-[10px] text-gray-600">{m.detail}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/20 text-white">
                A
              </div>
              <span className="hidden sm:inline">Account</span>
            </button>
          </header>

          {/* Main Canvas Area */}
          <main className="flex-1 relative flex flex-col bg-black">
            <Vortex
              backgroundColor="black"
              rangeY={800}
              particleCount={500}
              baseHue={0}
              saturation="0%"
              lightness="65%"
              className="flex flex-col w-full h-full"
            >
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 md:px-8 py-6">
                {generatedContent ? (
                  <div className="max-w-3xl w-full">
                    {/* Describe Section */}
                    <div className="mb-8">
                      <h3 className="text-xs font-medium text-gray-500 mb-3 tracking-wider">DESCRIBE</h3>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {generatedContent.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 md:px-3 py-1 rounded-full border border-white/30 text-xs md:text-sm bg-white/5"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">
                        {generatedContent.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-8">
                        <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10">
                          <RefreshCw size={14} />
                          <span className="hidden sm:inline">Create More</span>
                          <span className="sm:hidden">Create</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10">
                          <Sparkles size={14} />
                          Inspiration
                        </button>
                        <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10" title="Use as a reference">
                          <MessageSquareQuote size={14} />
                          Start From Here
                        </button>
                        <button className="p-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors border border-white/10">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Generation Grid (2x2) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Mock Image 1 */}
                        <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative group cursor-pointer">
                          <img
                            src="https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop"
                            alt="Generated 1"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        {/* Mock Image 2 */}
                        <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative group cursor-pointer">
                          <img
                            src="https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=3072&auto=format&fit=crop"
                            alt="Generated 2"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        {/* Mock Failed 1 */}
                        <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900/50 border border-white/5 flex flex-col items-center justify-center text-gray-500 gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <X size={14} />
                          </div>
                          <span className="text-xs">Generation Failed</span>
                        </div>
                        {/* Mock Failed 2 */}
                        <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900/50 border border-white/5 flex flex-col items-center justify-center text-gray-500 gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <X size={14} />
                          </div>
                          <span className="text-xs">Generation Failed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center px-4">
                    <h2 className={`text-2xl md:text-4xl font-bold mb-4 ${spaceGrotesk.className}`}>
                      What will you create?
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base mb-8">
                      Describe your vision below and let Vizual bring it to life with AI-powered {creationMode.toLowerCase()} generation.
                    </p>

                    {/* Mode Button */}
                    <button
                      onClick={() => setShowModeModal(true)}
                      className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 transition-all hover:scale-105 text-sm font-medium flex items-center gap-2 mx-auto"
                    >
                      <Sparkles size={18} />
                      Explore Modes
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Input Area */}
              <div className="w-full p-4 md:p-6 shrink-0 z-20">
                <div className="max-w-4xl mx-auto">
                  {/* Tabs */}
                  <div className="flex flex-col items-center justify-center gap-4 mb-3 md:mb-4">
                    <div className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto">
                      {(creationMode === "IMAGE"
                        ? ["IMAGE REFERENCE", "REMIX"]
                        : ["KEYFRAME", "REFERENCE", "MODIFY"]).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab as TabMode)}
                            className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab
                              ? "bg-white/15 text-white border border-white/20"
                              : "text-gray-500 hover:text-gray-300"
                              }`}
                          >
                            {tab}
                          </button>
                        ))}
                    </div>

                    {/* Image Reference Upload Area */}
                    {creationMode === "IMAGE" && activeTab === "IMAGE REFERENCE" && (
                      <div className="flex gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {[1, 2, 3].map((i) => (
                          <button key={i} className="w-24 h-24 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-300 group">
                            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                              <Plus size={16} />
                            </div>
                            <span className="text-[10px]">Upload Ref</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input Container - Floating transparency */}
                  <div className="bg-[#111]/80 backdrop-blur-md rounded-2xl border border-white/10 p-3 md:p-4 shadow-2xl relative">

                    {/* Media Upload Popup */}
                    {uploadPopup && (
                      <div className="absolute bottom-full left-0 mb-2 ml-0 md:ml-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="w-32 h-40 bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                          {/* Close Button */}
                          <button
                            onClick={() => setUploadPopup(null)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                          >
                            <X size={12} />
                          </button>

                          {/* Upload Area */}
                          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
                            <Plus size={24} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">{uploadPopup}</span>

                          {/* Gradient Glow */}
                          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Text Input */}
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="What do you want to see..."
                      className="w-full bg-transparent text-white placeholder-gray-500 text-base md:text-lg resize-none focus:outline-none mb-3 md:mb-4 min-h-[50px] md:min-h-[60px]"
                      rows={2}
                    />

                    {/* Bottom Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                      {/* Left Icons */}
                      <div className="flex items-center gap-1 justify-center sm:justify-start">
                        <button
                          onClick={() => setUploadPopup(uploadPopup === 'image' ? null : 'image')}
                          className={`p-2 rounded-lg transition-colors ${uploadPopup === 'image' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                          <ImageIcon size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                          <Plus size={18} />
                        </button>
                        <div className="w-px h-5 bg-white/10 mx-2" />
                        <button
                          onClick={() => setUploadPopup(uploadPopup === 'video' ? null : 'video')}
                          className={`p-2 rounded-lg transition-colors ${uploadPopup === 'video' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                          <Video size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                          <Infinity size={18} />
                        </button>
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center gap-2 md:gap-4 justify-between sm:justify-end">
                        {/* Draft Toggle - Hidden on very small screens */}
                        <div className="hidden xs:flex items-center gap-2">
                          <span className="text-xs text-gray-400">DRAFT</span>
                          <button
                            onClick={() => setIsDraft(!isDraft)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${isDraft ? 'bg-white/30' : 'bg-white/10'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isDraft ? 'left-5' : 'left-0.5'}`} />
                          </button>
                        </div>

                        {/* Model/Aspect Ratio */}
                        <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-gray-400">
                          <span className="hidden sm:inline">{creationMode}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="text-white font-medium">{model}</span>
                          <span>·</span>
                          <span>{aspectRatio}</span>
                          <ChevronDown size={14} />
                        </div>

                        {/* Send Button */}
                        <button
                          onClick={handleGenerate}
                          disabled={!prompt.trim()}
                          className={`p-2 md:p-2.5 rounded-full transition-colors ${prompt.trim()
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-white/10 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Vortex>
          </main>
        </div>
      )}


      {/* Mode Selection Modal */}
      {
        showModeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl">
              {/* Floating gradient orbs - monochrome */}
              <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-r from-white/10 to-gray-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-r from-gray-500/10 to-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-r from-gray-800/20 to-neutral-800/20 rounded-full blur-3xl" />
            </div>

            {/* Click to close backdrop */}
            <div
              className="absolute inset-0"
              onClick={() => setShowModeModal(false)}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
              {/* Glowing border effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 rounded-[20px] sm:rounded-[32px] blur-sm opacity-60" />

              {/* Main container */}
              <div className="relative bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-[20px] sm:rounded-[32px] border border-white/10 overflow-hidden">
                {/* Top glow line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setShowModeModal(false)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all hover:rotate-90 duration-300 z-20 group"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-white transition-colors" />
                </button>

                {/* Header */}
                <div className="text-center pt-8 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-8">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 mb-3 sm:mb-4">
                    <Sparkles size={12} className="sm:w-[14px] sm:h-[14px] text-purple-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-gray-300 tracking-wider uppercase">Creative Studio</span>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent ${spaceGrotesk.className}`}>
                    Choose Your Mode
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-md mx-auto px-2">
                    Select a creative template to jumpstart your vision
                  </p>
                </div>

                {/* Template Cards */}
                <div className="px-3 sm:px-6 pb-6 sm:pb-8 space-y-2 sm:space-y-3 max-h-[55vh] sm:max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {templateModes.map((mode, index) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setPrompt(mode.description);
                        setShowModeModal(false);
                      }}
                      className="w-full flex items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] hover:from-white/[0.08] hover:to-white/[0.04] border border-white/[0.06] hover:border-white/20 transition-all duration-300 group text-left relative overflow-hidden active:scale-[0.98]"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: 'transform 0.8s ease-out, opacity 0.3s' }} />

                      {/* Minimal Icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-white/20 group-hover:bg-white/[0.06] flex items-center justify-center transition-all duration-300">
                          {mode.icon === 'image' && <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />}
                          {mode.icon === 'video' && <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />}
                          {mode.icon === 'style' && <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />}
                          {mode.icon === 'film' && <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />}
                          {mode.icon === 'clock' && <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />}
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 group-hover:text-white transition-colors">
                          {mode.title}
                        </h3>
                        <p className="text-gray-500 group-hover:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed transition-colors duration-300 line-clamp-2">
                          {mode.description}
                        </p>
                      </div>

                      {/* Arrow indicator - hidden on mobile */}
                      <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-white/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

// Navigation Item Component
function NavItem({ icon, label, active = false, expanded = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; expanded?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${expanded ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-lg transition-all duration-200 ${active
        ? 'bg-white/10 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      title={label}
    >
      <span className="flex-shrink-0">{icon}</span>
      {expanded && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}
