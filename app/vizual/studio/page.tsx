"use client";

import { useState, useEffect, useRef } from "react";
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
  PanelLeft,
  Tv,
  Play,
  Palette,
  Wand2,
  Settings,
  CreditCard,
  LogOut,
  Bell,
  Shield,
  Moon,
  Heart,
  Timer,
  Zap,
  ArrowRightFromLine
} from "lucide-react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Inter, Space_Grotesk } from "next/font/google";
import { Vortex } from "@/components/ui/vortex";
import { ProjectsView } from "@/components/vizual/projects-view";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

type CreationMode = "IMAGE" | "VIDEO";
type TabMode = "STYLE" | "REFERENCE" | "MODIFY" | "IMAGE REFERENCE" | "REMIX";

const STYLE_PRESETS = [
  { name: "Cinematic", icon: "film" },
  { name: "Anime", icon: "user" },
  { name: "3D Animation", icon: "box" },
  { name: "Cartoon", icon: "smile" },
  { name: "Brainrot", icon: "zap" },
  { name: "Realistic", icon: "camera" },
  { name: "Noir", icon: "moon" },
];

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

const extensionLoadingStates = [
  { text: "Analyzing video frames" },
  { text: "Upscaling resolution" },
  { text: "Interpolating frames" },
  { text: "Enhancing details" },
  { text: "Finalizing render" },
];

const MODE_SUBOPTIONS: Record<number, { title: string; promptSuffix?: string }[]> = {
  1: [ // Make visuals for
    { title: "Products", promptSuffix: "product photography" },
    { title: "Avatar", promptSuffix: "character avatar" },
    { title: "Environment", promptSuffix: "environment design" },
    { title: "Social Media", promptSuffix: "social media post" },
  ],
  2: [ // Make a video of
    { title: "Music Video", promptSuffix: "music video" },
    { title: "Short Film", promptSuffix: "short film" },
    { title: "Advertisement", promptSuffix: "advertisement" },
    { title: "Vlog", promptSuffix: "vlog style" },
  ],
  3: [ // Use this @style
    ...STYLE_PRESETS.map(s => ({ title: s.name, promptSuffix: `${s.name} style` }))
  ]
};

export default function VizualStudioApp() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isGuestMode } = useGuestMode();
  const [creationMode, setCreationMode] = useState<CreationMode>("VIDEO");
  const [activeTab, setActiveTab] = useState<TabMode>("STYLE");

  // Reset active tab when creation mode changes
  useEffect(() => {
    if (creationMode === 'IMAGE') {
      setActiveTab('IMAGE REFERENCE');
    } else {
      setActiveTab('STYLE');
    }
  }, [creationMode]);
  const [currentView, setCurrentView] = useState<'STUDIO' | 'PROJECTS'>('STUDIO');
  const [prompt, setPrompt] = useState("");
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [enhancerPrompt, setEnhancerPrompt] = useState("");
  const [showEnhancerModal, setShowEnhancerModal] = useState(false);
  const [showTimerSlider, setShowTimerSlider] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isAudio, setIsAudio] = useState(false); // Renamed from isDraft
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [model, setModel] = useState(VIDEO_MODELS[0].name); // Initialize with first video model
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [uploadPopup, setUploadPopup] = useState<'image' | 'video' | null>(null);

  // Attachments State
  const [attachments, setAttachments] = useState<{ id: string; url: string; file?: File; type: 'image' | 'video' }[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [showFlowTV, setShowFlowTV] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [expandBilling, setExpandBilling] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const [isExtending, setIsExtending] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showColorPaletteModal, setShowColorPaletteModal] = useState(false);
  const [showStyleGuideModal, setShowStyleGuideModal] = useState(false);

  // Mode Selection States
  const [modeStep, setModeStep] = useState<0 | 1>(0);
  const [selectedModeId, setSelectedModeId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
            label="Studio"
            active={currentView === 'STUDIO'}
            expanded={sidebarExpanded}
            onClick={() => setCurrentView('STUDIO')}
          />
          <NavItem
            icon={<Lightbulb size={20} />}
            label="Inspiration"
            active={inspirationOpen}
            expanded={sidebarExpanded}
            onClick={() => setInspirationOpen(!inspirationOpen)}
          />
          <NavItem
            icon={<Compass size={20} />}
            label="Community"
            expanded={sidebarExpanded}
            onClick={() => router.push('/vizual/community')}
          />
        </nav>

        {/* Bottom Section - Feedback & Profile */}
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} pt-4 border-t border-white/5 mt-4 flex-shrink-0 space-y-2`}>
          <NavItem
            icon={<MessageSquareQuote size={20} />}
            label="Feedback"
            expanded={sidebarExpanded}
            onClick={() => setShowFeedbackModal(true)}
          />
          <button
            onClick={() => setShowAccountModal(true)}
            className={`w-full flex items-center gap-3 ${sidebarExpanded ? 'px-2' : 'justify-center'} py-2 rounded-lg hover:bg-white/5 transition-colors`}
          >
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
          <ProjectsView onAction={(action, card) => {
            setCurrentView('STUDIO');

            // Common setup
            if (card.prompt) setPrompt(card.prompt);
            if (card.src) {
              setAttachments(prev => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  url: card.src,
                  type: card.type === 'video' ? 'video' : 'image'
                }
              ]);
            }

            switch (action) {
              case 'MODIFY':
                // For images, "Modify" usually means Remix/Image-to-Image
                // For video, it maps to Modify tab
                if (card.type === 'video') {
                  setCreationMode('VIDEO');
                  setActiveTab('MODIFY');
                } else {
                  setCreationMode('IMAGE');
                  setActiveTab('REMIX'); // Remix allows image modification
                }
                break;

              case 'MAKE_VIDEO':
                setCreationMode('VIDEO');
                setActiveTab('REFERENCE'); // Image-to-Video uses Reference tab
                break;

              case 'REFERENCE':
                if (card.type === 'video') {
                  setCreationMode('VIDEO');
                  setActiveTab('REFERENCE');
                } else {
                  setCreationMode('IMAGE');
                  setActiveTab('IMAGE REFERENCE');
                }
                break;

              case 'MORE_LIKE_THIS':
              case 'COPY_PROMPT':
                // Just set prompt mostly, maybe set mode
                setCreationMode(card.type === 'video' ? 'VIDEO' : 'IMAGE');
                break;

              case 'REFRAME':
                setCreationMode('IMAGE');
                setActiveTab('REMIX'); // Reframe usually involves outpainting/remixing
                break;
            }
          }} />
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

            <button
              onClick={() => setShowAccountModal(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
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
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to generate more images with this prompt?")) {
                              handleGenerate();
                            }
                          }}
                          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10"
                        >
                          <RefreshCw size={14} />
                          <span className="hidden sm:inline">Create More</span>
                          <span className="sm:hidden">Create</span>
                        </button>
                        <button
                          onClick={() => setInspirationOpen(true)}
                          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10"
                        >
                          <Sparkles size={14} />
                          Inspiration
                        </button>
                        <button
                          onClick={() => {
                            // Simulate setting the generated image as a reference
                            const mockUrl = "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop";
                            setAttachments(prev => [...prev, { id: crypto.randomUUID(), url: mockUrl, type: 'image' }]);
                            // Switch to reference tab to show it being used
                            setActiveTab(creationMode === "IMAGE" ? "IMAGE REFERENCE" : "REFERENCE");
                            alert("Image added to reference!");
                          }}
                          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-xs md:text-sm border border-white/10"
                          title="Use as a reference"
                        >
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
                        : ["STYLE", "REFERENCE", "MODIFY"]).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => {
                              setActiveTab(tab as TabMode);
                              if (tab === "STYLE") {
                                setShowStyleModal(true);
                              }
                            }}
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

                    {/* Attachments Preview List */}
                    {attachments.length > 0 && (
                      <div className="absolute -top-24 left-4 z-[100] flex gap-4 overflow-x-auto max-w-[90%] pb-2 px-1">
                        {attachments.map((att) => (
                          <div key={att.id} className="relative group shrink-0">
                            {/* Main Preview */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl relative bg-black">
                              {att.type === 'video' ? (
                                <video src={att.url} className="w-full h-full object-cover" autoPlay loop muted />
                              ) : (
                                <img src={att.url} alt="Preview" className="w-full h-full object-cover" />
                              )}
                              {/* Pulse overlay effect */}
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse" />
                            </div>

                            {/* Close Button */}
                            <button
                              onClick={() => {
                                setAttachments(prev => prev.filter(item => item.id !== att.id));
                                if (attachments.length === 1 && fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 hover:scale-100"
                            >
                              <X size={12} />
                            </button>

                            {/* Connection Line */}
                            <div className="absolute top-full left-1/2 w-0.5 h-4 bg-gradient-to-b from-white/20 to-transparent" />
                          </div>
                        ))}
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
                        {/* Image Upload */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const newAttachments: { id: string; url: string; file?: File; type: 'image' | 'video' }[] = [];

                              Array.from(e.target.files).forEach(file => {
                                const url = URL.createObjectURL(file);
                                const type = file.type.startsWith('video') ? 'video' : 'image';
                                newAttachments.push({ id: crypto.randomUUID(), url, file, type });
                              });

                              setAttachments(prev => [...prev, ...newAttachments]);
                            }
                            // Reset input value
                            e.target.value = '';
                          }}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                          title="Upload Image"
                        >
                          <ImageIcon size={18} />
                        </button>

                        {/* AI Enhancer */}
                        <button
                          onClick={() => setShowEnhancerModal(true)}
                          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                          title="AI Enhancer"
                        >
                          <Wand2 size={18} />
                        </button>

                        <div className="w-px h-5 bg-white/10 mx-2" />

                        {/* Video Timer */}
                        <div className="relative">
                          <button
                            onClick={() => setShowTimerSlider(!showTimerSlider)}
                            className={`p-2 rounded-lg transition-colors ${showTimerSlider ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                            title="Set Duration"
                          >
                            <Timer size={18} />
                          </button>

                          {/* Timer Slider Popup */}
                          {showTimerSlider && (
                            <div className="absolute bottom-full left-0 mb-2 p-4 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl w-64 z-[200]">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</span>
                                <span className="text-xs text-white font-mono">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
                              </div>
                              <input
                                type="range" min="0" max="300" value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                              />
                              <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                                <span>0s</span>
                                <span>5m</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Video Extender */}
                        <button
                          onClick={() => {
                            if (attachments.length === 0 && !generatedContent) {
                              // If no file uploaded AND no generated content to extend
                              alert("Please upload a file or generate content first.");
                              return;
                            }
                            setIsExtending(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                          title="Extend Clip"
                        >
                          <ArrowRightFromLine size={18} />
                        </button>
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center gap-2 md:gap-4 justify-between sm:justify-end">
                        {/* Audio Toggle - Hidden on very small screens */}
                        <div className="hidden xs:flex items-center gap-2">
                          <span className="text-xs text-gray-400">Audio</span>
                          <button
                            onClick={() => setIsAudio(!isAudio)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${isAudio ? 'bg-white/30' : 'bg-white/10'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isAudio ? 'left-5' : 'left-0.5'}`} />
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
      )
      }


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
                  onClick={() => {
                    if (modeStep === 1) {
                      setModeStep(0);
                    } else {
                      setShowModeModal(false);
                    }
                  }}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all z-20 group"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-white transition-colors" />
                </button>

                {/* Back Button (Step 1 only) */}
                {modeStep === 1 && (
                  <button
                    onClick={() => setModeStep(0)}
                    className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all z-20 group"
                  >
                    <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                )}

                {/* Header */}
                <div className="text-center pt-8 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-8">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 mb-3 sm:mb-4">
                    <Sparkles size={12} className="sm:w-[14px] sm:h-[14px] text-purple-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-gray-300 tracking-wider uppercase">Creative Studio</span>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent ${spaceGrotesk.className}`}>
                    {modeStep === 0 ? "Choose Your Mode" : "Refine Selection"}
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-md mx-auto px-2">
                    {modeStep === 0 ? "Select a creative template to jumpstart your vision" : "Select a specific style or category"}
                  </p>
                </div>

                {/* Template Cards */}
                <div className="px-3 sm:px-6 pb-6 sm:pb-8 space-y-2 sm:space-y-3 max-h-[55vh] sm:max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {modeStep === 0 ? (
                    templateModes.map((mode, index) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          // Check if this mode has sub-options
                          if (MODE_SUBOPTIONS[mode.id]) {
                            setSelectedModeId(mode.id);
                            setModeStep(1);
                          } else {
                            // Direct select if no sub-options
                            setPrompt(mode.title);
                            if (mode.title.toLowerCase().includes("video")) setCreationMode("VIDEO");
                            else setCreationMode("IMAGE");
                            setShowModeModal(false);
                          }
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
                    ))
                  ) : (
                    // STEP 2: Sub-options
                    MODE_SUBOPTIONS[selectedModeId!]?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const basePrompt = templateModes.find(m => m.id === selectedModeId)?.title || "";
                          const finalPrompt = selectedModeId === 3 // Use this style
                            ? option.promptSuffix || ""
                            : selectedModeId === 1 // Make visuals for
                              ? `${basePrompt} ${option.title.toLowerCase()} - ${option.promptSuffix}`
                              : `${basePrompt} ${option.title.toLowerCase()} - ${option.promptSuffix}`;

                          setPrompt(finalPrompt);

                          // Set logic based on mode ID
                          if (selectedModeId === 1 || selectedModeId === 3) setCreationMode("IMAGE");
                          if (selectedModeId === 2) setCreationMode("VIDEO");

                          setShowModeModal(false);
                          setModeStep(0);
                        }}
                        className="w-full flex items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] hover:from-white/[0.08] hover:to-white/[0.04] border border-white/[0.06] hover:border-white/20 transition-all duration-300 group text-left active:scale-[0.98]"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-white/20 group-hover:bg-white/[0.06] flex items-center justify-center transition-all duration-300">
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-0.5 group-hover:text-white transition-colors">
                            {option.title}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 group-hover:text-gray-400">
                            Select to apply {option.promptSuffix}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        )
      }

      {/* Inspiration Right Sidebar */}
      <aside className={`
        fixed right-0 top-0 h-full z-50
        w-80 md:w-96
        bg-[#0d0d0d] border-l border-white/10
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${inspirationOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className={`text-lg font-bold uppercase tracking-wider ${spaceGrotesk.className}`}>Inspiration</h2>
          <button
            onClick={() => setInspirationOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Prompt Ideas Section */}
          <div className="px-5 mb-6">
            <h3 className={`text-sm font-semibold text-white mb-3 ${spaceGrotesk.className}`}>Cosmic Heroic Action</h3>
            <div className="overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none" onWheel={(e) => { if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY; }}>
              <div className="flex gap-3 w-max">
                {[
                  { prompt: "A dynamic hero mid-air, nebulae and galaxies swirling around, comet streaks enhancing motion." },
                  { prompt: "Hero illuminated by starburst, reflective metallic costume glowing amidst mystical outer space elements." },
                  { prompt: "Warrior standing on asteroid, cosmic storm raging behind, ethereal energy radiating from hands." },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(item.prompt)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all min-w-[200px] max-w-[200px] text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                    <p className="text-xs text-gray-400 group-hover:text-gray-300 line-clamp-3">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* More Prompt Categories */}
          <div className="px-5 mb-6">
            <h3 className={`text-sm font-semibold text-white mb-3 ${spaceGrotesk.className}`}>Futuristic Celestial Design</h3>
            <div className="overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none" onWheel={(e) => { if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY; }}>
              <div className="flex gap-3 w-max">
                {[
                  { prompt: "Sleek crystalline board glowing with energy, blending futuristic design and cosmic mysticism." },
                  { prompt: "Neon-lit spacecraft hovering above alien landscape, bioluminescent flora illuminating the scene." },
                  { prompt: "Cybernetic angel with holographic wings ascending through a digital nebula." },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(item.prompt)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all min-w-[200px] max-w-[200px] text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                    <p className="text-xs text-gray-400 group-hover:text-gray-300 line-clamp-3">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-4" />

          {/* Visual Inspiration Section */}
          <div className="px-5">
            <h3 className={`text-sm font-semibold text-white mb-3 ${spaceGrotesk.className}`}>Visual Inspiration</h3>
            <div className="overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none" onWheel={(e) => { if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY; }}>
              <div className="flex gap-3 w-max">
                {/* Flow TV Card */}
                <button
                  onClick={() => setShowFlowTV(true)}
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/10 hover:border-white/20 transition-all min-w-[140px] group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-black/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Tv size={28} className="text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-white">Flow TV</span>
                  <span className="text-[10px] text-gray-500">Google Labs</span>
                </button>

                {/* More visual cards */}
                <button
                  onClick={() => setShowColorPaletteModal(true)}
                  className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all min-w-[140px] group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Palette size={28} className="text-pink-400" />
                  </div>
                  <span className="text-xs font-medium text-white">Color Palettes</span>
                  <span className="text-[10px] text-gray-500">Explore Colors</span>
                </button>

                <button
                  onClick={() => setShowStyleGuideModal(true)}
                  className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all min-w-[140px] group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Wand2 size={28} className="text-cyan-400" />
                  </div>
                  <span className="text-xs font-medium text-white">Style Guide</span>
                  <span className="text-[10px] text-gray-500">View Guide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Inspiration Overlay (mobile) */}
      {
        inspirationOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setInspirationOpen(false)}
          />
        )
      }

      {/* Flow TV Modal */}
      {
        showFlowTV && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-white/10">
              <div className="flex items-center gap-3">
                <Tv size={20} className="text-purple-400" />
                <span className={`font-semibold ${spaceGrotesk.className}`}>Flow TV</span>
                <span className="text-xs text-gray-500">by Google Labs</span>
              </div>
              <button
                onClick={() => setShowFlowTV(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            {/* Iframe */}
            <div className="flex-1 w-full">
              <iframe
                src="https://labs.google/flow/tv/channel/downside-up/tViwFuHm1Lu18C5GghLC"
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
                title="Flow TV"
              />
            </div>
          </div>
        )
      }

      {/* AI Enhancer Modal */}
      {
        showEnhancerModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div
              className="absolute inset-0"
              onClick={() => setShowEnhancerModal(false)}
            />
            <div className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Wand2 className="text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold text-white ${spaceGrotesk.className}`}>AI Enhancer</h3>
                  <p className="text-gray-400 text-xs mt-1">Transform your ideas into cinematic prompts</p>
                </div>
              </div>

              <textarea
                className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors mb-6 resize-none text-sm leading-relaxed"
                placeholder="Describe your basic idea here (e.g., A futuristic city)..."
                value={enhancerPrompt}
                onChange={(e) => setEnhancerPrompt(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEnhancerModal(false)}
                  className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!enhancerPrompt.trim()) return;
                    const enhanced = `${enhancerPrompt} - Cinematic lighting, highly detailed, 8k resolution, photorealistic, masterpiece, trending on artstation, unreal engine 5 render.`;
                    setPrompt(enhanced);
                    setShowEnhancerModal(false);
                    setEnhancerPrompt("");
                  }}
                  className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Wand2 size={16} />
                  Enhance
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Account Settings Modal */}
      {
        showAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAccountModal(false)}
            />
            <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative h-24 bg-gradient-to-r from-neutral-800 to-neutral-900">
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-md"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Profile Info */}
              <div className="px-6 pb-6 mt-[-40px]">
                <div className="relative w-20 h-20 rounded-full bg-black p-1 mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    A
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-black rounded-full" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>Guest User</h3>
                    <p className="text-sm text-gray-400">guest@vizual.ai</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-white">
                    Free Plan
                  </div>
                </div>

                {/* Usage Stats - Updated to visual style per request */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">Monthly Credits</span>
                    <span className="text-xs font-bold text-white">12 / 50</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[24%]" />
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                  <div className="overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setExpandBilling(!expandBilling)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                          <CreditCard size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Billing & Plans</span>
                      </div>
                      <ChevronRight size={16} className={`text-gray-500 group-hover:text-white transition-transform ${expandBilling ? 'rotate-90' : ''}`} />
                    </button>

                    {expandBilling && (
                      <div className="pl-14 pr-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Current Plan</span>
                            <span className="text-white font-medium">Free</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Billing</span>
                            <span className="text-white font-medium">Monthly</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowAccountModal(false);
                            setShowPricingModal(true);
                          }}
                          className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    )}
                  </div>

                  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        <Bell size={18} />
                      </div>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white">Notifications</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </button>

                  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        <Shield size={18} />
                      </div>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white">Security</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-white" />
                  </button>

                  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                        <Moon size={18} />
                      </div>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white">Appearance</span>
                    </div>
                    <span className="text-xs text-gray-500">Dark</span>
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                  <button className="text-xs text-gray-500 hover:text-white transition-colors">
                    Privacy Policy
                  </button>
                  <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Style Selection Modal */}
      {showStyleModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowStyleModal(false)}
          />
          <div className="relative w-full max-w-3xl bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>Select Style</h3>
              <button
                onClick={() => setShowStyleModal(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.name}
                  onClick={() => {
                    setPrompt((prev) => prev ? `${prev}, ${style.name} style` : `${style.name} style`);
                    setShowStyleModal(false);
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                >
                  {/* Placeholder Gradient Backgrounds */}
                  <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110 
                    ${style.name === 'Cinematic' ? 'from-amber-900 to-black' :
                      style.name === 'Anime' ? 'from-pink-500 to-purple-900' :
                        style.name === '3D Animation' ? 'from-blue-500 to-cyan-900' :
                          style.name === 'Cartoon' ? 'from-yellow-400 to-orange-600' :
                            style.name === 'Brainrot' ? 'from-green-500 to-red-500' :
                              style.name === 'Realistic' ? 'from-gray-300 to-gray-700' :
                                'from-gray-900 to-black'}`}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-white font-medium text-sm">{style.name}</span>
                  </div>

                  {/* Icon Overlay */}
                  <div className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-md rounded-full text-white/70 group-hover:text-white transition-colors">
                    <Sparkles size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
      }

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFeedbackModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">We value your input! Let us know how we can improve.</p>
            <textarea className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 mb-4 resize-none focus:outline-none focus:border-white/30" placeholder="Type your feedback here..." />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowFeedbackModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={() => {
                // Simulate submission
                alert("Feedback submitted! Thank you.");
                setShowFeedbackModal(false);
              }} className="px-5 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-200">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowPricingModal(false)}
          />
          <div className="relative w-full max-w-4xl bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-white/10 rounded-full text-white z-10"
            >
              <X size={20} />
            </button>

            {/* Pro Plan */}
            <div className="flex-1 p-8 border-r border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white">
                <Sparkles size={24} />
              </div>
              <h3 className={`text-2xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>Pro</h3>
              <div className="text-3xl font-bold text-white mb-6">$29<span className="text-sm text-gray-400 font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8 text-sm text-gray-300 text-left w-full max-w-xs">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" /> Unlimited Generations</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" /> Fast Processing</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" /> Commercial Usage</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors mt-auto">
                Upgrade to Pro
              </button>
            </div>

            {/* Ultra Plan */}
            <div className="flex-1 p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-4 text-white relative z-10">
                <Zap size={24} />
              </div>
              <h3 className={`text-2xl font-bold text-white mb-2 relative z-10 ${spaceGrotesk.className}`}>Ultra</h3>
              <div className="text-3xl font-bold text-white mb-6 relative z-10">$99<span className="text-sm text-gray-400 font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8 text-sm text-gray-300 text-left w-full max-w-xs relative z-10">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mt-1.5" /> Everything in Pro</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mt-1.5" /> Priority Access</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mt-1.5" /> Exclusive Models</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold hover:brightness-110 transition-all mt-auto relative z-10">
                Get Ultra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MultiStep Loader */}
      <MultiStepLoader
        loadingStates={extensionLoadingStates}
        loading={isExtending}
        duration={2000}
      />

      {
        isExtending && (
          <button
            className="fixed top-4 right-4 text-white z-[120] bg-black/50 p-2 rounded-full hover:bg-black/70"
            onClick={() => setIsExtending(false)}
          >
            <X className="h-10 w-10" />
          </button>
        )
      }

      {/* Color Palette Modal */}
      {showColorPaletteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowColorPaletteModal(false)} />
          <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>Color Palettes</h3>
              <button onClick={() => setShowColorPaletteModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Palette 1 */}
              <div className="space-y-2">
                <div className="h-32 rounded-xl flex overflow-hidden">
                  <div className="flex-1 bg-[#0a0a0a]"></div>
                  <div className="flex-1 bg-[#1a1a1a]"></div>
                  <div className="flex-1 bg-white"></div>
                  <div className="flex-1 bg-blue-500"></div>
                </div>
                <p className="text-sm font-medium text-white">Cyber Dark</p>
              </div>
              {/* Palette 2 */}
              <div className="space-y-2">
                <div className="h-32 rounded-xl flex overflow-hidden">
                  <div className="flex-1 bg-purple-900"></div>
                  <div className="flex-1 bg-purple-600"></div>
                  <div className="flex-1 bg-pink-500"></div>
                  <div className="flex-1 bg-orange-400"></div>
                </div>
                <p className="text-sm font-medium text-white">Sunset Synth</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style Guide Modal */}
      {showStyleGuideModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowStyleGuideModal(false)} />
          <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>Style Guide</h3>
              <button onClick={() => setShowStyleGuideModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-8">
              {/* Typography */}
              <section>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Typography</h4>
                <div className="space-y-4 border border-white/10 p-4 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Display (Space Grotesk)</p>
                    <h1 className={`text-4xl font-bold text-white ${spaceGrotesk.className}`}>The quick brown fox</h1>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Body (Inter)</p>
                    <p className="text-base text-gray-300">The quick brown fox jumps over the lazy dog. A visual creation tool for the modern era.</p>
                  </div>
                </div>
              </section>

              {/* Buttons */}
              <section>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Buttons</h4>
                <div className="flex flex-wrap gap-4 border border-white/10 p-4 rounded-xl">
                  <button className="px-4 py-2 bg-white text-black rounded-lg font-medium text-sm">Primary Action</button>
                  <button className="px-4 py-2 bg-white/10 text-white border border-white/10 rounded-lg font-medium text-sm">Secondary Action</button>
                  <button className="px-4 py-2 bg-transparent text-gray-400 hover:text-white rounded-lg font-medium text-sm">Ghost Button</button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
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
