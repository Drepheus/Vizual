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
import Aurora from "@/components/vizual/Aurora";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

type CreationMode = "IMAGE" | "VIDEO";
type TabMode = "KEYFRAME" | "REFERENCE" | "MODIFY";

// Models Configuration
const IMAGE_MODELS = [
  {
    id: "flux-schnell",
    name: "FLUX Schnell",
    description: "Fastest efficient generation",
    cost: "$0.003",
    detail: "333 images / $1"
  },
  {
    id: "p-image",
    name: "PrunaAI P-Image",
    description: "High efficiency model",
    cost: "$0.005",
    detail: "200 images / $1"
  },
  {
    id: "imagen-4-fast",
    name: "Imagen 4 Fast",
    description: "Next-gen fast generation",
    cost: "$0.02",
    detail: "50 images / $1"
  },
  {
    id: "imagen-3-fast",
    name: "Imagen 3 Fast",
    description: "Google's fast model",
    cost: "$0.025",
    detail: "40 images / $1"
  },
  {
    id: "ideogram-v3-turbo",
    name: "Ideogram v3 Turbo",
    description: "Excellent typography",
    cost: "$0.03",
    detail: "33 images / $1"
  },
  {
    id: "seedream-4",
    name: "SeaDream 4",
    description: "ByteDance general model",
    cost: "$0.03",
    detail: "33 images / $1"
  },
  {
    id: "seedream-4.5",
    name: "SeaDream 4.5",
    description: "Enhanced quality",
    cost: "$0.04",
    detail: "25 images / $1"
  },
  {
    id: "flux-1.1-pro-ultra",
    name: "FLUX 1.1 Pro Ultra",
    description: "Premium detailed output",
    cost: "$0.06",
    detail: "16 images / $1"
  },
  {
    id: "imagen-4-ultra",
    name: "Imagen 4 Ultra",
    description: "Google's highest fidelity",
    cost: "$0.06",
    detail: "16 images / $1"
  },
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    description: "Target resolution 1K",
    cost: "$0.15",
    detail: "66 images / $10"
  }
];

const VIDEO_MODELS = [
  {
    id: "veo-2",
    name: "Veo 2",
    description: "Fluid cinematic motion",
    cost: "$0.10",
    detail: "per second"
  },
  {
    id: "kling-1.6",
    name: "Kling 1.6",
    description: "High coherence video",
    cost: "$0.15",
    detail: "per second"
  },
  {
    id: "luma-ray-2",
    name: "Luma Ray 2",
    description: "Dynamic scenes",
    cost: "$0.12",
    detail: "per second"
  }
];

export default function VizualStudioApp() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isGuestMode } = useGuestMode();
  const [creationMode, setCreationMode] = useState<CreationMode>("VIDEO");
  const [activeTab, setActiveTab] = useState<TabMode>("KEYFRAME");
  const [prompt, setPrompt] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [model, setModel] = useState(VIDEO_MODELS[0].name); // Initialize with first video model
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
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
    <div className={`min-h-screen bg-[#0a0a0a] text-white flex ${inter.className}`}>
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Expandable/Collapsible */}
      <aside className={`
        fixed md:relative z-50 md:z-auto
        ${sidebarExpanded ? 'w-56' : 'w-16'} 
        bg-black border-r border-white/5 
        flex flex-col py-4
        h-full md:h-auto
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
        <div className={`flex items-center ${sidebarExpanded ? 'justify-between px-4' : 'justify-center'} mb-4`}>
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
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} mb-4`}>
          <button
            onClick={() => setShowModeModal(true)}
            className={`w-full flex items-center gap-2 ${sidebarExpanded ? 'px-3 justify-start' : 'justify-center'} py-2.5 rounded-lg bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-white font-medium text-sm`}
          >
            <Plus size={18} />
            {sidebarExpanded && <span>Create New</span>}
          </button>
        </div>

        {/* Nav Items */}
        <nav className={`flex-1 flex flex-col gap-1 ${sidebarExpanded ? 'px-3' : 'px-2'}`}>
          <NavItem icon={<Home size={20} />} label="Dashboard" expanded={sidebarExpanded} />
          <NavItem icon={<FolderKanban size={20} />} label="Projects" active expanded={sidebarExpanded} />
          <NavItem icon={<Compass size={20} />} label="Explore" expanded={sidebarExpanded} />
          <NavItem icon={<Library size={20} />} label="My Library" expanded={sidebarExpanded} />
        </nav>

        {/* Bottom Section - User Profile */}
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} pt-4 border-t border-white/5 mt-4`}>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Top Header */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-3 md:px-6">
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
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </header>

        {/* Main Canvas Area */}
        <main className="flex-1 relative overflow-hidden overflow-y-auto">
          {/* Aurora Background */}
          <div className="absolute inset-0 bg-black">
            <Aurora
              colorStops={["#1a5a3a", "#3a1a5e", "#1a3a5a"]}
              blend={0.6}
              amplitude={0.8}
              speed={0.5}
            />
          </div>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8 py-6">
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
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10">
                      <RefreshCw size={14} />
                      <span className="hidden sm:inline">Show More</span>
                      <span className="sm:hidden">More</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10">
                      <Sparkles size={14} />
                      Brainstorm
                    </button>
                    <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10">
                      <MessageSquareQuote size={14} />
                      Reply
                    </button>
                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors border border-white/10">
                      <MoreHorizontal size={16} />
                    </button>
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
        </main>

        {/* Bottom Input Area */}
        <div className="border-t border-white/5 bg-black/30 backdrop-blur-xl p-3 md:p-4">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center justify-center gap-1 md:gap-2 mb-3 md:mb-4 overflow-x-auto">
              {(["KEYFRAME", "REFERENCE", "MODIFY"] as TabMode[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-gray-500 hover:text-gray-300"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Input Container */}
            <div className="bg-[#111] rounded-2xl border border-white/10 p-3 md:p-4">
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
                  <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                    <ImageIcon size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                    <Plus size={18} />
                  </button>
                  <div className="w-px h-5 bg-white/10 mx-2" />
                  <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
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
      </div>

      {/* Mode Selection Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl">
            {/* Floating gradient orbs - smaller on mobile */}
            <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
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
      )}
    </div>
  );
}

// Navigation Item Component
function NavItem({ icon, label, active = false, expanded = false }: { icon: React.ReactNode; label: string; active?: boolean; expanded?: boolean }) {
  return (
    <button
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
