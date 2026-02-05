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
  Image,
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
  ArrowRightFromLine,
  Maximize2,
  Download,
  Radio,
  Coins,
  Rocket,
  Crown,
  Film,
  Clock,
  Star,
  Brain,
  Plug
} from "lucide-react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Inter, Space_Grotesk } from "next/font/google";
import { Vortex } from "@/components/ui/vortex";
import Aurora from "@/components/vizual/Aurora";
import { ProjectsView } from "@/components/vizual/projects-view";
import { Sidebar } from "@/components/vizual/sidebar";
import { useToast } from "@/components/ui/toast";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { getUserCreditsAndUsage, UserCreditsAndUsage, consumeImageGeneration } from "@/lib/usage-tracking";

const supabase = getBrowserSupabaseClient();

// Credit cost configuration per model
const MODEL_CREDIT_COSTS: Record<string, number | { perSecond: number }> = {
  // Image models
  'flux-schnell': 1,
  'flux-1.1-pro-ultra': 5,
  'p-image': 0.5,
  'imagen-4-fast': 2,
  'imagen-3-fast': 2.5,
  'imagen-4-ultra': 6,
  'ideogram-v3-turbo': 3,
  'seedream-4': 3,
  'seedream-4.5': 4,
  'nano-banana-pro': 15,
  // Video models (per second costs)
  'seedance-1-pro-fast': { perSecond: 1.5 },
  'seedance-1-lite': { perSecond: 1.8 },
  'seedance-1-pro': { perSecond: 3 },
  'wan-2.5-i2v': { perSecond: 5 },
  'wan-2.5-t2v': { perSecond: 5 },
  'wan-2.5-t2v-fast': { perSecond: 6.8 },
  'wan-2.1-t2v-720p': { perSecond: 24 },
  'wan-2.1-i2v-720p': { perSecond: 25 },
  'pixverse-v4.5': { perSecond: 6 },
  'kling-v2.5-turbo-pro': { perSecond: 7 },
  'hailuo-2.3-fast': 19, // Fixed cost per video
  'hailuo-2.3': 28, // Fixed cost per video
  'sora-2': { perSecond: 10 },
  'sora-2-own-key': 0, // Uses own API key
  'veo-3-fast': { perSecond: 10 },
  'veo-3.1-fast': { perSecond: 10 },
  'veo-3': { perSecond: 20 },
  'veo-3.1': { perSecond: 20 },
  'veo-2': { perSecond: 50 },
};

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

type CreationMode = "IMAGE" | "VIDEO";
type TabMode = "STYLE" | "REFERENCE" | "MODIFY" | "IMAGE REFERENCE" | "REMIX" | null;

const STYLE_PRESETS = [
  { name: "Cinematic", icon: "film", thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop" },
  { name: "Anime", icon: "user", thumbnail: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=400&auto=format&fit=crop" },
  { name: "3D Animation", icon: "box", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop" },
  { name: "Cartoon", icon: "smile", thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop" },
  { name: "Brainrot", icon: "zap", thumbnail: "https://images.unsplash.com/photo-1614728263952-84ea206f9c45?q=80&w=400&auto=format&fit=crop" },
  { name: "Realistic", icon: "camera", thumbnail: "https://images.unsplash.com/photo-1471341971476-3bc3a12901c5?q=80&w=400&auto=format&fit=crop" },
  { name: "Noir", icon: "moon", thumbnail: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=400&auto=format&fit=crop" },
];

// Models Configuration
const IMAGE_MODELS = [
  // Black Forest Labs
  {
    id: "flux-schnell",
    name: "FLUX Schnell",
    description: "Black Forest Labs",
    cost: "$0.003",
    detail: "333 images / $1",
    isFree: true
  },
  {
    id: "flux-1.1-pro-ultra",
    name: "FLUX 1.1 Pro Ultra",
    description: "Black Forest Labs",
    cost: "$0.06",
    detail: "16 images / $1",
    isFree: false
  },

  // PrunaAI
  {
    id: "p-image",
    name: "PrunaAI P-Image",
    description: "High efficiency",
    cost: "0.5 Credits",
    detail: "200 images / 100 Credits",
    isFree: true
  },

  // Google
  {
    id: "imagen-4-fast",
    name: "Imagen 4 Fast",
    description: "Google DeepMind",
    cost: "2 Credits",
    detail: "50 images / 100 Credits",
    isFree: true
  },
  {
    id: "imagen-3-fast",
    name: "Imagen 3 Fast",
    description: "Google DeepMind",
    cost: "2.5 Credits",
    detail: "40 images / 100 Credits",
    isFree: true
  },
  {
    id: "imagen-4-ultra",
    name: "Imagen 4 Ultra",
    description: "Google DeepMind",
    cost: "6 Credits",
    detail: "16 images / 100 Credits",
    isFree: false
  },

  // Ideogram
  {
    id: "ideogram-v3-turbo",
    name: "Ideogram v3 Turbo",
    description: "Ideogram",
    cost: "3 Credits",
    detail: "33 images / 100 Credits",
    isFree: true
  },

  // ByteDance
  {
    id: "seedream-4",
    name: "SeaDream 4",
    description: "ByteDance",
    cost: "3 Credits",
    detail: "33 images / 100 Credits",
    isFree: true
  },
  {
    id: "seedream-4.5",
    name: "SeaDream 4.5",
    description: "ByteDance",
    cost: "4 Credits",
    detail: "25 images / 100 Credits",
    isFree: false
  },

  // Nano
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    description: "Nano",
    cost: "15 Credits",
    detail: "66 images / 1000 Credits",
    isFree: false
  }
];

const VIDEO_MODELS = [
  // ByteDance
  {
    id: "seedance-1-pro-fast",
    name: "Seedance 1 Pro Fast",
    description: "ByteDance (480p-1080p)",
    cost: "From 1.5 Credits/s",
    detail: "approx 66s / 100 Credits",
    isFree: true
  },
  {
    id: "seedance-1-lite",
    name: "Seedance 1 Lite",
    description: "ByteDance (480p-1080p)",
    cost: "From 1.8 Credits/s",
    detail: "approx 55s / 100 Credits",
    isFree: true
  },
  {
    id: "seedance-1-pro",
    name: "Seedance 1 Pro",
    description: "ByteDance (480p-1080p)",
    cost: "From 3 Credits/s",
    detail: "approx 33s / 100 Credits",
    isFree: false
  },

  // Wan (Wavespeed/Wan-Video)
  {
    id: "wan-2.5-i2v",
    name: "Wan 2.5 I2V",
    description: "Wan Video (480p-1080p)",
    cost: "From 5 Credits/s",
    detail: "20s / 100 Credits",
    isFree: false
  },
  {
    id: "wan-2.5-t2v",
    name: "Wan 2.5 T2V",
    description: "Wan Video (480p-1080p)",
    cost: "From 5 Credits/s",
    detail: "20s / 100 Credits",
    isFree: false
  },
  {
    id: "wan-2.5-t2v-fast",
    name: "Wan 2.5 T2V Fast",
    description: "Wan Video (720p-1080p)",
    cost: "From 6.8 Credits/s",
    detail: "approx 14s / 100 Credits",
    isFree: false
  },
  {
    id: "wan-2.1-t2v-720p",
    name: "Wan 2.1 T2V",
    description: "WavespeedAI (720p)",
    cost: "24 Credits/s",
    detail: "41s / 1000 Credits",
    isFree: false
  },
  {
    id: "wan-2.1-i2v-720p",
    name: "Wan 2.1 I2V",
    description: "WavespeedAI (720p)",
    cost: "25 Credits/s",
    detail: "40s / 1000 Credits",
    isFree: false
  },

  // Pixverse
  {
    id: "pixverse-v4.5",
    name: "Pixverse v4.5",
    description: "Pixverse (360p-1080p)",
    cost: "From 6 Credits/s",
    detail: "Variable by resolution",
    isFree: false
  },

  // Kling
  {
    id: "kling-v2.5-turbo-pro",
    name: "Kling v2.5 Turbo Pro",
    description: "Kuaishou",
    cost: "7 Credits/s",
    detail: "approx 14s / 100 Credits",
    isFree: false
  },

  // Minimax
  {
    id: "hailuo-2.3-fast",
    name: "Hailuo 2.3 Fast",
    description: "Minimax (6s-10s)",
    cost: "From 19 Credits/vid",
    detail: "approx 52 vids / 1000 Credits",
    isFree: false
  },
  {
    id: "hailuo-2.3",
    name: "Hailuo 2.3",
    description: "Minimax (6s-10s)",
    cost: "From 28 Credits/vid",
    detail: "approx 35 vids / 1000 Credits",
    isFree: false
  },

  // OpenAI
  {
    id: "sora-2",
    name: "Sora 2",
    description: "OpenAI",
    cost: "10 Credits/s",
    detail: "Standard quality",
    isFree: false
  },
  {
    id: "sora-2-own-key",
    name: "Sora 2 (Own Key)",
    description: "OpenAI Direct",
    cost: "Direct Bill",
    detail: "Pay OpenAI directly",
    isFree: false
  },

  // Google
  {
    id: "veo-3-fast",
    name: "Veo 3 Fast",
    description: "Google DeepMind",
    cost: "From 10 Credits/s",
    detail: "10s / 100 Credits (No Audio)",
    isFree: false
  },
  {
    id: "veo-3.1-fast",
    name: "Veo 3.1 Fast",
    description: "Google DeepMind",
    cost: "From 10 Credits/s",
    detail: "10s / 100 Credits (No Audio)",
    isFree: false
  },
  {
    id: "veo-3",
    name: "Veo 3",
    description: "Google DeepMind",
    cost: "From 20 Credits/s",
    detail: "50s / 1000 Credits (No Audio)",
    isFree: false
  },
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    description: "Google DeepMind",
    cost: "From 20 Credits/s",
    detail: "50s / 1000 Credits (No Audio)",
    isFree: false
  },
  {
    id: "veo-2",
    name: "Veo 2",
    description: "Google DeepMind",
    cost: "50 Credits/s",
    detail: "20s / 1000 Credits",
    isFree: false
  }
];

// Style backgrounds mapping - used to show style image as background when selected
const STYLE_BACKGROUNDS: Record<string, string> = {
  'Cinematic': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop&q=80',
  'Anime': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop&q=80',
  '3D Animation': 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1920&h=1080&fit=crop&q=80',
  'Cartoon': 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=1920&h=1080&fit=crop&q=80',
  'Realistic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80',
  'Noir': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop&q=80',
  'Cyberpunk': 'https://images.unsplash.com/photo-1515630771457-09367d0ae038?w=1920&h=1080&fit=crop&q=80',
  'Fantasy': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&h=1080&fit=crop&q=80',
};

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
  const { user, session, loading } = useAuth();
  const { isGuestMode } = useGuestMode();
  const { showToast } = useToast();
  const [creationMode, setCreationMode] = useState<CreationMode>("IMAGE");
  const [activeTab, setActiveTab] = useState<TabMode>(null);

  // Reset active tab when creation mode changes
  useEffect(() => {
    // Don't auto-select a tab - let user choose or just use prompt
    setActiveTab(null);
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
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Handle remix from community page (URL params)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const remixPrompt = params.get('remix');
      const remixMode = params.get('mode');

      if (remixPrompt) {
        setPrompt(decodeURIComponent(remixPrompt));
        showToast('Prompt loaded from community! Edit and generate.', 'success', 3000);

        // Clear the URL params after reading
        window.history.replaceState({}, '', '/vizual/studio');
      }

      if (remixMode === 'VIDEO') {
        setCreationMode('VIDEO');
      } else if (remixMode === 'IMAGE') {
        setCreationMode('IMAGE');
      }
    }
  }, []);

  // Attachments State
  const [attachments, setAttachments] = useState<{ id: string; url: string; file?: File; type: 'image' | 'video' }[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [showFlowTV, setShowFlowTV] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [expandBilling, setExpandBilling] = useState(false);
  const [expandNotifications, setExpandNotifications] = useState(false);
  const [expandSecurity, setExpandSecurity] = useState(false);
  const [expandAppearance, setExpandAppearance] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const [isExtending, setIsExtending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showColorPaletteModal, setShowColorPaletteModal] = useState(false);
  const [showStyleGuideModal, setShowStyleGuideModal] = useState(false);

  // Community Feed State
  const [communityFeed, setCommunityFeed] = useState<any[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  // Limit Reached Modal State
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Credits System State
  const [userCredits, setUserCredits] = useState<number>(5);
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const [accountData, setAccountData] = useState<UserCreditsAndUsage | null>(null);
  const creditsRemaining = userCredits - creditsUsed;

  // Calculate credit cost for current generation
  const calculateCreditCost = (): number => {
    const currentModelList = creationMode === 'IMAGE' ? IMAGE_MODELS : VIDEO_MODELS;
    const currentModel = currentModelList.find(m => m.name === model);
    const modelId = currentModel?.id || '';
    const costConfig = MODEL_CREDIT_COSTS[modelId];
    
    if (!costConfig) return 1; // Default cost
    
    if (typeof costConfig === 'number') {
      return costConfig;
    } else {
      // Per-second cost for videos
      const videoDuration = duration > 0 ? duration : 5; // Default 5 seconds
      return Math.ceil(costConfig.perSecond * videoDuration);
    }
  };

  const estimatedCost = calculateCreditCost();

  // Consume image generation (uses daily free first, then credits)
  const consumeImageGen = async () => {
    if (!user) {
      // Guest mode - just update local state
      setCreditsUsed(prev => prev + 1);
      return;
    }

    try {
      const result = await consumeImageGeneration(user.id);
      if (result?.success) {
        if (result.source === 'daily_free') {
          showToast('Used 1 daily free image', 'success', 2000);
          // Update the daily free counter in accountData
          setAccountData(prev => prev ? {
            ...prev,
            daily_free_images_remaining: result.daily_free_remaining ?? 0
          } : null);
        } else {
          showToast('-1 credit used', 'success', 2000);
          setCreditsUsed(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error consuming image generation:', err);
    }
  };

  // Deduct credits after successful video generation
  const deductCredits = async (amount: number) => {
    if (!user) {
      // Guest mode - just update local state
      setCreditsUsed(prev => prev + amount);
      return;
    }

    try {
      // Call the Supabase function to deduct credits
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: amount,
      });

      if (error) {
        console.error('Error deducting credits:', error);
        // Still update local state for UI feedback
        setCreditsUsed(prev => prev + amount);
      } else if (data && data.length > 0 && data[0].success) {
        // Update local state with new balance
        setCreditsUsed(prev => prev + amount);
        showToast(`-${amount} credits used`, 'success', 2000);
      }
    } catch (err) {
      console.error('Error deducting credits:', err);
      setCreditsUsed(prev => prev + amount);
    }
  };

  // Selected Mode/Style Tags (Instagram-style @mentions)
  const [selectedTags, setSelectedTags] = useState<{ id: string; label: string; type: 'mode' | 'style' }[]>([]);

  // Helper to add a tag - LIMIT: 1 style + 1 mode max
  const addTag = (label: string, type: 'mode' | 'style') => {
    const tagId = `${type}-${label.toLowerCase().replace(/\s+/g, '-')}`;

    // Replace any existing tag of the same type (only 1 style, 1 mode allowed)
    setSelectedTags(prev => {
      // Remove existing tag of the same type
      const filtered = prev.filter(t => t.type !== type);
      // Add the new tag
      return [...filtered, { id: tagId, label, type }];
    });
  };

  // Helper to remove a tag
  const removeTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId));
  };

  // Get the selected style's background image (if any style tag is selected)
  const selectedStyleTag = selectedTags.find(t => t.type === 'style');

  // State for cycling background images
  const [styleImages, setStyleImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Fetch images for the selected style from the local folder
  useEffect(() => {
    if (!selectedStyleTag) {
      setStyleImages([]);
      setCurrentImageIndex(0);
      return;
    }

    // Fetch images from the API
    fetch(`/api/style-images?style=${encodeURIComponent(selectedStyleTag.label)}`)
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          setStyleImages(data.images);
          setCurrentImageIndex(0);
          setIsImageLoaded(false);
        } else {
          // Fall back to the Unsplash image if no local images
          const fallbackImage = STYLE_BACKGROUNDS[selectedStyleTag.label];
          if (fallbackImage) {
            setStyleImages([fallbackImage]);
            setCurrentImageIndex(0);
            setIsImageLoaded(false);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching style images:', err);
        // Fall back to Unsplash
        const fallbackImage = STYLE_BACKGROUNDS[selectedStyleTag.label];
        if (fallbackImage) {
          setStyleImages([fallbackImage]);
        }
      });
  }, [selectedStyleTag?.label]);

  // Cycle through images every 6 seconds
  useEffect(() => {
    if (styleImages.length <= 1) return;

    const interval = setInterval(() => {
      setIsImageLoaded(false);
      setCurrentImageIndex(prev => (prev + 1) % styleImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [styleImages.length]);

  // Get current background image
  const currentStyleBackground = styleImages.length > 0 ? styleImages[currentImageIndex] : null;

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
    imageUrl?: string;
    videoUrl?: string;
    type: 'image' | 'video';
  } | null>(null);

  // Redirect to login if not authenticated and not in guest mode
  useEffect(() => {
    if (!loading && !user && !isGuestMode) {
      router.push('/login?redirect=/vizual/studio');
    }
  }, [user, loading, router, isGuestMode]);

  // Fetch community feed when inspiration panel opens
  useEffect(() => {
    if (inspirationOpen && communityFeed.length === 0 && !loadingCommunity) {
      const fetchCommunity = async () => {
        setLoadingCommunity(true);
        try {
          const res = await fetch('/api/community/feed?page=0&limit=10');
          if (res.ok) {
            const data = await res.json();
            setCommunityFeed(data);
          }
        } catch (err) {
          console.error('Failed to fetch community:', err);
        } finally {
          setLoadingCommunity(false);
        }
      };
      fetchCommunity();
    }
  }, [inspirationOpen, communityFeed.length, loadingCommunity]);

  // Fetch user credits from database
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) {
        // Guest mode gets 5 free credits
        setUserCredits(5);
        setCreditsUsed(0);
        setAccountData(null);
        setIsLoadingCredits(false);
        return;
      }

      try {
        setIsLoadingCredits(true);
        
        // Fetch full account data using our tracking function
        const usageData = await getUserCreditsAndUsage(user.id);
        if (usageData) {
          setAccountData(usageData);
          setUserCredits(usageData.credits || 5);
          setCreditsUsed(usageData.credits_used || 0);
        } else {
          // Fallback to direct query
          const { data, error } = await supabase
            .from('users')
            .select('credits, credits_used, subscription_tier')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching credits:', error);
            // Default to free tier credits
            setUserCredits(5);
            setCreditsUsed(0);
          } else if (data) {
            setUserCredits(data.credits || 5);
            setCreditsUsed(data.credits_used || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching credits:', err);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    fetchCredits();
  }, [user]);

  // Lock body scroll for mobile app-like behavior
  useEffect(() => {
    // Prevent body scrolling - makes it behave like a native app
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';

    // Prevent pull-to-refresh and overscroll on mobile
    document.body.style.overscrollBehavior = 'none';

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  // Generation loading states for MultiStepLoader
  const generationLoadingStates = [
    { text: "Analyzing your prompt..." },
    { text: "Selecting optimal AI model..." },
    { text: "Generating your content..." },
    { text: "Enhancing details..." },
    { text: "Finalizing output..." },
  ];

  // Build enhanced prompt with selected styles and modes
  const buildEnhancedPrompt = (basePrompt: string): string => {
    let enhancedPrompt = basePrompt.trim();

    // Collect style and mode enhancements
    const styleEnhancements: string[] = [];
    const modeEnhancements: string[] = [];

    selectedTags.forEach(tag => {
      if (tag.type === 'style') {
        // Add style-specific enhancements
        const styleEnhancement = getStyleEnhancement(tag.label);
        styleEnhancements.push(styleEnhancement);
      } else if (tag.type === 'mode') {
        // Add mode-specific enhancements
        const modeEnhancement = getModeEnhancement(tag.label);
        modeEnhancements.push(modeEnhancement);
      }
    });

    // Build the final prompt
    if (styleEnhancements.length > 0 || modeEnhancements.length > 0) {
      const allEnhancements = [...styleEnhancements, ...modeEnhancements].join(', ');
      enhancedPrompt = `${enhancedPrompt}, ${allEnhancements}`;
    }

    return enhancedPrompt;
  };

  // Get style-specific prompt enhancement
  const getStyleEnhancement = (styleName: string): string => {
    const styleMap: Record<string, string> = {
      'Cinematic': 'cinematic style, film grain, dramatic lighting, movie quality, anamorphic lens, professional cinematography',
      'Anime': 'anime style, Japanese animation, vibrant colors, cel-shaded, Studio Ghibli inspired, manga aesthetic',
      '3D Animation': '3D animation style, Pixar quality, rendered in Blender, smooth surfaces, stylized 3D, CGI quality',
      'Cartoon': 'cartoon style, bold outlines, vibrant flat colors, playful design, animated look, Disney-style',
      'Brainrot': 'meme style, surreal, absurdist humor, chaotic energy, internet culture aesthetic, viral content',
      'Realistic': 'photorealistic, hyperrealistic, 8K resolution, DSLR quality, natural lighting, lifelike details',
      'Noir': 'film noir style, high contrast black and white, dramatic shadows, moody atmosphere, 1940s detective aesthetic',
      // Additional styles
      'Cyberpunk': 'cyberpunk style, neon lights, futuristic cityscape, dystopian, blade runner aesthetic, holographic',
      'Oil Painting': 'oil painting style, impressionist brushstrokes, textured canvas, classical art, museum quality',
      'Abstract': 'abstract art style, geometric shapes, bold colors, non-representational, modern art aesthetic',
      '3D Render': '3D rendered, octane render, unreal engine 5, ray tracing, volumetric lighting, studio quality',
      'Sketch': 'pencil sketch style, hand-drawn, cross-hatching, graphite texture, artistic illustration',
      'Watercolor': 'watercolor painting style, soft washes, bleeding colors, paper texture, delicate brushwork',
      'Pop Art': 'pop art style, Andy Warhol inspired, bold colors, halftone dots, comic book aesthetic',
      'Vintage': 'vintage style, retro aesthetic, faded colors, film photography look, nostalgic',
      'Fantasy': 'fantasy art style, magical, ethereal, enchanted, Lord of the Rings inspired, mystical',
      'Minimalist': 'minimalist style, clean lines, simple composition, negative space, modern aesthetic',
    };

    return styleMap[styleName] || `${styleName} style`;
  };

  // Get mode-specific prompt enhancement
  const getModeEnhancement = (modeName: string): string => {
    const modeMap: Record<string, string> = {
      // Product modes
      'Products': 'professional product photography, studio lighting, commercial quality, advertising shot',
      'Avatar': 'character portrait, avatar design, expressive face, personality-driven, profile picture quality',
      'Environment': 'environment concept art, world building, atmospheric perspective, detailed scenery',
      'Social Media': 'social media optimized, eye-catching, scroll-stopping, viral potential, engagement-focused',
      // Video modes
      'Music Video': 'music video style, rhythmic editing, visual storytelling, concert quality, MTV aesthetic',
      'Short Film': 'short film quality, narrative driven, cinematic composition, professional filmmaking',
      'Advertisement': 'commercial advertisement, persuasive visuals, brand-focused, high production value',
      'Vlog': 'vlog style, casual and authentic, personal perspective, YouTube quality, relatable',
    };

    return modeMap[modeName] || modeName;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a prompt', 'error');
      return;
    }

    // Check if free user is out of daily free images (for image mode)
    if (creationMode === 'IMAGE' && accountData && !accountData.is_paid_user) {
      if (accountData.daily_free_images_remaining <= 0 && accountData.credits_remaining <= 0) {
        setShowLimitModal(true);
        return;
      }
    }

    // Check if Reference or Remix mode requires attachments
    const isReferenceMode = activeTab === 'REFERENCE' || activeTab === 'IMAGE REFERENCE';
    const isRemixMode = activeTab === 'REMIX';

    if ((isReferenceMode || isRemixMode) && attachments.length === 0) {
      const modeLabel = isRemixMode ? 'Remix' : 'Reference';
      showToast(`${modeLabel} mode requires you to attach media first. Click the image icon to upload.`, 'error', 4000);
      // Highlight the upload button
      fileInputRef.current?.click();
      return;
    }

    // Start the loading animation
    setIsGenerating(true);

    try {
      // Find the current model object to get its ID
      const currentModelList = creationMode === 'IMAGE' ? IMAGE_MODELS : VIDEO_MODELS;
      const currentModel = currentModelList.find(m => m.name === model);
      const modelId = currentModel?.id || (creationMode === 'IMAGE' ? 'flux-schnell' : 'seedance-1-pro-fast');

      // Build enhanced prompt with styles and modes
      const enhancedPrompt = buildEnhancedPrompt(prompt);
      console.log('📝 Original prompt:', prompt);
      console.log('✨ Enhanced prompt:', enhancedPrompt);
      console.log('🏷️ Selected tags:', selectedTags);
      console.log('🎨 Active tab:', activeTab);
      console.log('📎 Attachments:', attachments.length);

      // Determine generation mode based on active tab
      const generationMode = isRemixMode ? 'remix' : isReferenceMode ? 'reference' : 'generate';
      console.log('🔄 Generation mode:', generationMode);

      // Extract keywords from prompt for display
      const keywords = prompt.match(/\b\w{4,}\b/g)?.slice(0, 5) || [];

      // Build headers with auth token if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Prepare attachment data if present (for reference/remix modes)
      let attachmentData: string | undefined;
      if (attachments.length > 0 && (isReferenceMode || isRemixMode)) {
        // Convert first attachment to base64 for API
        const firstAttachment = attachments[0];
        if (firstAttachment.file) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(firstAttachment.file!);
          });
          attachmentData = base64;
        } else if (firstAttachment.url) {
          attachmentData = firstAttachment.url;
        }
      }

      if (creationMode === 'IMAGE') {
        // Use Decart API for remix mode, otherwise use regular generation
        if (isRemixMode && attachmentData) {
          // Call Decart remix API for image-to-image transformation
          const response = await fetch('/api/decart/remix', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              prompt: enhancedPrompt,
              image: attachmentData,
              mode: 'remix',
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to remix image');
          }

          setGeneratedContent({
            prompt: prompt,
            description: `I've remixed your image with the prompt "${prompt}" using the Decart lucy-pro-i2i model.`,
            keywords: keywords,
            imageUrl: data.imageUrl || data.url,
            type: 'image',
          });

          // Consume image generation (uses daily free first, then credits)
          await consumeImageGen();
        } else {
          // Call regular image generation API
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              prompt: enhancedPrompt,
              model: modelId,
              aspectRatio: '16:9',
              // Include reference data
              mode: generationMode,
              referenceImage: isReferenceMode ? attachmentData : undefined,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to generate image');
          }

          // Build style description for user feedback
          const styleNames = selectedTags.filter(t => t.type === 'style').map(t => t.label).join(', ');
          const modeNames = selectedTags.filter(t => t.type === 'mode').map(t => t.label).join(', ');
          const appliedStyles = [styleNames, modeNames].filter(Boolean).join(' + ');
          const modeDescription = isReferenceMode ? ' (using reference)' : '';

          setGeneratedContent({
            prompt: prompt,
            description: `I've created an image based on your prompt "${prompt}"${appliedStyles ? ` with ${appliedStyles} style` : ''}${modeDescription}, using the ${model} model.`,
            keywords: keywords,
            imageUrl: data.imageUrl,
            type: 'image',
          });

          // Consume image generation (uses daily free first, then credits)
          await consumeImageGen();
        }
      } else {
        // Call video generation API with enhanced prompt
        const response = await fetch('/api/generate-video', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prompt: enhancedPrompt,
            model: modelId,
            aspectRatio: '16:9',
            duration: 5, // 5 second video
            // Include reference/remix data
            mode: generationMode,
            referenceMedia: isReferenceMode ? attachmentData : undefined,
            remixMedia: isRemixMode ? attachmentData : undefined,
            mediaType: attachments.length > 0 ? attachments[0].type : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate video');
        }

        // Build style description for user feedback
        const styleNames = selectedTags.filter(t => t.type === 'style').map(t => t.label).join(', ');
        const modeNames = selectedTags.filter(t => t.type === 'mode').map(t => t.label).join(', ');
        const appliedStyles = [styleNames, modeNames].filter(Boolean).join(' + ');
        const modeDescription = isRemixMode ? ' (remixed)' : isReferenceMode ? ' (using reference)' : '';

        setGeneratedContent({
          prompt: prompt,
          description: `I've created a video based on your prompt "${prompt}"${appliedStyles ? ` with ${appliedStyles} style` : ''}${modeDescription}, using the ${model} model.`,
          keywords: keywords,
          videoUrl: data.videoUrl,
          type: 'video',
        });

        // Deduct credits after successful generation
        await deductCredits(estimatedCost);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      showToast(`Generation failed: ${error.message}`, 'error', 5000);
    } finally {
      setIsGenerating(false);
    }
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
    <div
      className={`h-[100dvh] bg-[#0a0a0a] text-white flex overflow-hidden ${inter.className}`}
      style={{
        // Mobile app-like fixed viewport
        position: 'fixed',
        inset: 0,
        touchAction: 'pan-y',
        overscrollBehavior: 'contain',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Shared Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        activePage={inspirationOpen ? 'INSPIRATION' : currentView}
        onAction={(page) => {
          if (page === 'STUDIO' || page === 'PROJECTS') {
            setCurrentView(page);
          }
        }}
        onProfileClick={() => setShowAccountModal(true)}
        onFeedbackClick={() => setShowFeedbackModal(true)}
        onInspirationClick={() => {
          setInspirationOpen(!inspirationOpen);
          setSidebarOpen(false);
        }}
        onCreateNew={() => {
          setCurrentView('STUDIO');
          setShowModeModal(true);
        }}
      />

      {/* Main Content Area */}
      {currentView === 'PROJECTS' ? (
        <main className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
          <ProjectsView
            onClose={() => setCurrentView('STUDIO')}
            onAction={(action, card) => {
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
                  // Set up remix mode with the image/video
                  setCreationMode(card.type === 'video' ? 'VIDEO' : 'IMAGE');
                  setActiveTab('REMIX');
                  setPrompt(card.prompt || 'Create a variation of this image');
                  // Add the media as an attachment for remix
                  if (card.url) {
                    setAttachments([{
                      id: `remix-${Date.now()}`,
                      url: card.url,
                      type: card.type === 'video' ? 'video' : 'image',
                      name: 'Original for remix',
                    }]);
                  }
                  showToast('Ready to remix! Modify the prompt and click Generate.', 'success');
                  break;

                case 'COPY_PROMPT':
                  // Just copy the prompt
                  setCreationMode(card.type === 'video' ? 'VIDEO' : 'IMAGE');
                  setPrompt(card.prompt || '');
                  showToast('Prompt copied!', 'success');
                  break;

                case 'REFRAME':
                  setCreationMode('IMAGE');
                  setActiveTab('REMIX'); // Reframe usually involves outpainting/remixing
                  break;
              }
            }} />
        </main>
      ) : (
        <div className="flex-1 flex flex-col w-full min-w-0 overflow-hidden">
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${showModelDropdown
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                    }`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase hidden sm:inline opacity-60">Model</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${spaceGrotesk.className}`}>{model}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${showModelDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showModelDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                    <div className="absolute top-full left-0 mt-3 min-w-[280px] sm:min-w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl">

                      {/* Header */}
                      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-0.5">
                          {creationMode === 'IMAGE' ? 'Image Generation' : 'Video Generation'}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-medium">Select a model engine</p>
                      </div>

                      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-2 space-y-2">

                        {/* Free Tier Group */}
                        <div className="px-2">
                          <div className="flex items-center gap-2 px-2 py-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest opacity-80">
                            <Sparkles size={10} />
                            Available Now
                          </div>

                          <div className="space-y-1">
                            {currentModels.filter(m => m.isFree).map((m) => (
                              <button
                                key={m.id}
                                onClick={() => { setModel(m.name); setShowModelDropdown(false); }}
                                className={`w-full p-3 rounded-xl text-left transition-all duration-200 border group relative overflow-hidden ${model === m.name
                                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                                  }`}
                              >
                                {model === m.name && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
                                )}
                                <div className="flex justify-between items-start gap-3">
                                  <div>
                                    <div className={`text-sm font-bold flex items-center gap-2 ${model === m.name ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                      {m.name}
                                      {model === m.name && (
                                        <div className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] leading-none">Active</div>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors">
                                      {m.description}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end flex-shrink-0">
                                    <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">
                                      FREE
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Premium Tier Group */}
                        <div className="px-2 pb-2">
                          <div className="flex items-center gap-2 px-2 py-2 mt-2 text-[10px] font-bold text-yellow-400 uppercase tracking-widest opacity-90">
                            <Zap size={10} />
                            Premium Models
                          </div>

                          <div className="space-y-1">
                            {currentModels.filter(m => !m.isFree).map((m) => (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setShowModelDropdown(false);
                                  setShowPricingModal(true);
                                }}
                                className="w-full p-3 rounded-xl text-left transition-all duration-200 border bg-gradient-to-r from-yellow-500/[0.05] to-transparent border-yellow-500/20 hover:border-yellow-400/40 hover:bg-yellow-500/[0.08] group relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/[0.05] to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <div className="flex justify-between items-start gap-3 relative z-10 w-full">
                                  <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-bold text-white/90 group-hover:text-yellow-300 transition-colors truncate">
                                        {m.name}
                                      </span>
                                      <span className="flex-shrink-0 px-1.5 py-[2px] rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[9px] font-extrabold leading-none tracking-wider shadow-[0_0_8px_rgba(250,204,21,0.15)]">
                                        PRO
                                      </span>
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] text-gray-500 group-hover:text-gray-400 transition-colors truncate">
                                      {m.description}
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end justify-start flex-shrink-0">
                                    <div className="text-[10px] font-bold text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded-md border border-yellow-400/20 shadow-sm whitespace-nowrap">
                                      {m.cost}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 text-[10px] text-center text-gray-500">
                        {creationMode === 'IMAGE' ? 'Images generate in ~3.5s' : 'Videos generate in ~2mins'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Credits Display - Glowing Vizual Theme */}
            <div className="flex items-center gap-3">
              {/* Daily Free Images Counter - Show for free/non-paid users */}
              {user && (accountData === null || accountData?.is_paid_user !== true) && (
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setShowAccountModal(true)}
                  title="Daily free image generations"
                  style={{
                    boxShadow: (accountData?.daily_free_images_remaining ?? 3) > 0 
                      ? '0 0 15px rgba(34, 197, 94, 0.3)' 
                      : '0 0 15px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <ImageIcon size={14} className={(accountData?.daily_free_images_remaining ?? 3) > 0 ? 'text-green-400' : 'text-red-400'} />
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium hidden sm:inline">Free</span>
                  <span 
                    className={`text-sm font-bold ${spaceGrotesk.className}`}
                    style={{
                      background: (accountData?.daily_free_images_remaining ?? 3) > 0 
                        ? 'linear-gradient(135deg, #22c55e, #4ade80)' 
                        : 'linear-gradient(135deg, #ef4444, #f97316)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {accountData?.daily_free_images_remaining ?? 3}/{accountData?.daily_free_images_limit ?? 3}
                  </span>
                </div>
              )}
              
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm"
                style={{
                  boxShadow: creditsRemaining > 0 
                    ? '0 0 15px rgba(139, 92, 246, 0.3), 0 0 30px rgba(236, 72, 153, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)' 
                    : '0 0 15px rgba(239, 68, 68, 0.4)',
                }}
              >
                <Coins size={14} className="text-purple-400" />
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium hidden sm:inline">Credits</span>
                <span 
                  className={`text-sm font-bold ${spaceGrotesk.className}`}
                  style={{
                    background: creditsRemaining > 0 
                      ? 'linear-gradient(135deg, #a855f7, #ec4899, #8b5cf6)' 
                      : 'linear-gradient(135deg, #ef4444, #f97316)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: creditsRemaining > 0 
                      ? '0 0 20px rgba(168, 85, 247, 0.5)' 
                      : '0 0 20px rgba(239, 68, 68, 0.5)',
                  }}
                >
                  {isLoadingCredits ? '...' : creditsRemaining.toLocaleString()}
                </span>
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
            </div>
          </header>

          {/* Main Canvas Area */}
          <main className="flex-1 relative flex flex-col bg-black overflow-hidden">
            {/* Style Background Image - Shows when a style is selected */}
            {/* Style Background Images - cycling with cross-fade */}
            {styleImages.length > 0 && (
              <div className="absolute inset-0 z-0">
                {styleImages.map((img, index) => (
                  <div
                    key={img}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{
                      opacity: index === currentImageIndex ? 1 : 0,
                      zIndex: index === currentImageIndex ? 1 : 0
                    }}
                  >
                    <img
                      src={img}
                      alt={selectedStyleTag?.label || 'Style'}
                      className="w-full h-full object-cover transition-transform duration-[20s] ease-linear"
                      style={{ transform: index === currentImageIndex ? 'scale(1.1)' : 'scale(1)' }}
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                  </div>
                ))}
              </div>
            )}

            {/* Vortex Animation - Shows when no style is selected */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${currentStyleBackground ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <Vortex
                backgroundColor="black"
                rangeY={800}
                particleCount={500}
                baseHue={0}
                saturation="0%"
                lightness="65%"
                className="flex flex-col w-full h-full"
              />
            </div>



            {/* Content Layer - Always on top */}
            <div className="relative z-10 flex flex-col w-full h-full">
              {/* Main Content Area */}
              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden flex flex-col relative" style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}>
                {generatedContent ? (
                  /* Generated Output - FULL SCREEN PROMINENT */
                  <div className="flex-1 flex flex-col p-4 md:p-6 min-h-0">
                    {/* Large Output Container - Takes most of the space */}
                    <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto min-h-0">

                      {/* The Main Output - LARGE - Flex 1 to take available space */}
                      <div
                        className="relative flex-1 min-h-0 w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 cursor-pointer group shadow-2xl flex flex-col"
                      >
                        {/* Media Container - Flex 1 */}
                        <div className="flex-1 relative min-h-0 w-full bg-neutral-900/50">
                          {generatedContent.type === 'video' && generatedContent.videoUrl ? (
                            <video
                              src={generatedContent.videoUrl}
                              controls
                              autoPlay
                              loop
                              muted
                              className="absolute inset-0 w-full h-full object-contain"
                              onClick={(e) => {
                                e.stopPropagation();
                                const modal = document.createElement('div');
                                modal.id = 'fullscreen-viewer';
                                modal.className = 'fixed inset-0 z-[200] bg-black flex items-center justify-center';
                                modal.innerHTML = `
                                <button onclick="this.parentElement.remove()" class="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                                <video src="${generatedContent.videoUrl}" controls autoplay loop class="w-full h-full object-contain" />
                              `;
                                document.body.appendChild(modal);
                              }}
                            />
                          ) : (
                            <img
                              src={generatedContent.imageUrl}
                              alt="Generated"
                              className="absolute inset-0 w-full h-full object-contain"
                              onClick={() => {
                                const modal = document.createElement('div');
                                modal.id = 'fullscreen-viewer';
                                modal.className = 'fixed inset-0 z-[200] bg-black flex items-center justify-center';
                                modal.innerHTML = `
                                <button onclick="this.parentElement.remove()" class="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                                <img src="${generatedContent.imageUrl}" class="w-full h-full object-contain" />
                              `;
                                document.body.appendChild(modal);
                              }}
                            />
                          )}
                        </div>

                        {/* Expand Button - Top Right */}
                        <div className="absolute top-4 right-4 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-2 hover:bg-black/90 transition-colors pointer-events-none z-10">
                          <Maximize2 size={16} />
                          Expand
                        </div>

                        {/* ALWAYS VISIBLE - Bottom Action Bar ON THE IMAGE - Fixed at bottom of image container */}
                        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-10">
                          <div className="flex items-center justify-between">
                            {/* Left - Heart */}
                            <button
                              onClick={(e) => { e.stopPropagation(); showToast('Saved to favorites!', 'favorite'); }}
                              className="p-2.5 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                              title="Save"
                            >
                              <Heart size={22} />
                            </button>

                            {/* Center - Main Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                                className="p-2.5 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                                title="Regenerate"
                              >
                                <RefreshCw size={20} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText('https://vizual.ai/share/...'); showToast('Link copied to clipboard!', 'copied'); }}
                                className="p-2.5 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                                title="Share"
                              >
                                <Share2 size={20} />
                              </button>
                            </div>

                            {/* Right - Download & More */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); showToast('Download started!', 'download'); }}
                                className="p-2.5 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                                title="Download"
                              >
                                <Download size={22} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="p-2.5 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                                title="More Options"
                              >
                                <MoreHorizontal size={22} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions - Below the action bar - Fixed height, won't push image off screen if container is flex-col */}
                      <div className="flex-none flex flex-wrap gap-2 mt-3 justify-center">
                        <button
                          onClick={() => handleGenerate()}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          <RefreshCw size={14} />
                          Regenerate
                        </button>
                        <button
                          onClick={() => {
                            // Use the actual generated image URL
                            if (generatedContent.imageUrl) {
                              setAttachments(prev => [...prev, { id: crypto.randomUUID(), url: generatedContent.imageUrl!, type: 'image' }]);
                            }
                            showToast('Added as reference!', 'success');
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-sm border border-white/20"
                        >
                          <MessageSquareQuote size={14} />
                          Use as Reference
                        </button>
                        <button
                          onClick={() => setInspirationOpen(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-sm border border-white/20"
                        >
                          <Sparkles size={14} />
                          Get Inspiration
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                      <h2 className={`text-2xl md:text-4xl font-bold mb-4 ${spaceGrotesk.className}`}>
                        What will you create?
                      </h2>
                      <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base mb-8">
                        Describe your vision below and let Vizual bring it to life with AI-powered {creationMode.toLowerCase()} generation.
                      </p>
                      <button
                        onClick={() => setShowModeModal(true)}
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 transition-all hover:scale-105 text-sm font-medium inline-flex items-center gap-2"
                      >
                        <Sparkles size={18} />
                        Explore Modes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Input Area - STICKY */}
              <div
                className="sticky bottom-0 w-full p-4 md:p-6 shrink-0 z-30 bg-black/90 backdrop-blur-lg border-t border-white/5"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 16px))' }}
              >
                <div className="max-w-4xl mx-auto">
                  {/* Tabs */}
                  <div className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto mb-2">
                    {(creationMode === "IMAGE"
                      ? ["STYLE", "REFERENCE", "REMIX"]
                      : ["STYLE", "REFERENCE", "MODIFY"]).map((tab) => {
                        const isActive = activeTab === tab || (tab === "REFERENCE" && activeTab === "IMAGE REFERENCE");
                        const needsMedia = (tab === "REFERENCE" || tab === "REMIX") && attachments.length === 0;

                        return (
                          <button
                            key={tab}
                            onClick={() => {
                              // Toggle off if already active, otherwise set the tab
                              if (isActive) {
                                setActiveTab(null);
                                return;
                              }
                              setActiveTab(tab as TabMode);
                              if (tab === "STYLE") {
                                setShowStyleModal(true);
                              } else if ((tab === "REFERENCE" || tab === "REMIX") && attachments.length === 0) {
                                // Prompt user to upload media when selecting Reference or Remix
                                showToast(
                                  tab === "REMIX"
                                    ? 'Remix mode: Upload media to edit what\'s inside it'
                                    : 'Reference mode: Upload an image to generate something new based on it',
                                  'success',
                                  3000
                                );
                                fileInputRef.current?.click();
                              }
                            }}
                            className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${isActive
                              ? "bg-white/15 text-white border border-white/20"
                              : "text-gray-500 hover:text-gray-300"
                              }`}
                          >
                            {tab}
                            {/* Show indicator if media is attached for reference/remix */}
                            {(tab === "REFERENCE" || tab === "REMIX") && attachments.length > 0 && isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            )}
                            {/* Show upload hint if no media for reference/remix */}
                            {(tab === "REFERENCE" || tab === "REMIX") && attachments.length === 0 && isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                  </div>

                  {/* Mode hint text */}
                  {(activeTab === 'REFERENCE' || activeTab === 'IMAGE REFERENCE' || activeTab === 'REMIX') && (
                    <div className="text-center mb-2">
                      <p className="text-[10px] text-gray-500">
                        {activeTab === 'REMIX'
                          ? attachments.length > 0
                            ? '✓ Media attached - will edit what\'s inside it'
                            : '↑ Upload media to edit what\'s inside it'
                          : attachments.length > 0
                            ? '✓ Reference attached - will create something new based on it'
                            : '↑ Upload an image to use as reference for generation'
                        }
                      </p>
                    </div>
                  )}

                  {/* Input Container - Floating transparency */}
                  <div className="relative rounded-2xl p-[1px] group">
                    {/* Aurora Animation Border/Glow */}
                    <div className={`absolute inset-0 rounded-2xl overflow-hidden transition-opacity duration-500 pointer-events-none ${isInputFocused ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="absolute inset-[-50%] transform-gpu">
                        <Aurora speed={0.8} colorStops={['#3b82f6', '#8b5cf6', '#ec4899']} />
                      </div>
                    </div>

                    <div className="bg-[#111]/80 backdrop-blur-md rounded-2xl border border-white/10 p-3 md:p-4 shadow-2xl relative z-10 transition-colors duration-300">

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

                      {/* Attachments Preview - Compact inline strip */}
                      {attachments.length > 0 && (
                        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                          {attachments.map((att) => (
                            <div key={att.id} className="relative group shrink-0">
                              {/* Compact thumbnail */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 bg-black shadow-lg">
                                {att.type === 'video' ? (
                                  <video src={att.url} className="w-full h-full object-cover" autoPlay loop muted />
                                ) : (
                                  <img src={att.url} alt="Ref" className="w-full h-full object-cover" />
                                )}
                              </div>
                              {/* Close button - always visible on mobile */}
                              <button
                                onClick={() => {
                                  setAttachments(prev => prev.filter(item => item.id !== att.id));
                                  if (attachments.length === 1 && fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className="absolute -top-1.5 -right-1.5 bg-black/80 border border-white/20 rounded-full p-0.5 text-white shadow-lg"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          {/* Add more button */}
                          <button
                            onClick={() => setUploadPopup('image')}
                            className="w-10 h-10 rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}

                      {/* Selected Mode/Style Tags - Instagram-style @mentions */}
                      {selectedTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {selectedTags.map((tag) => (
                            <div
                              key={tag.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${tag.type === 'style'
                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300'
                                : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300'
                                }`}
                            >
                              <span className="text-white/70">@</span>
                              <span>{tag.label}</span>
                              <button
                                onClick={() => removeTag(tag.id)}
                                className="ml-1 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <X size={12} className="opacity-70 hover:opacity-100" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Text Input */}
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder={selectedTags.length > 0 ? "Add your prompt..." : "What do you want to see..."}
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

                          {/* Video-only controls: Timer and Extend Clip */}
                          {creationMode === 'VIDEO' && (
                            <>
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
                                    // If no file uploaded AND no generated content to extend, show upload popup
                                    setUploadPopup('video');
                                    return;
                                  }
                                  setIsExtending(true);
                                }}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                                title="Extend Clip"
                              >
                                <ArrowRightFromLine size={18} />
                              </button>
                            </>
                          )}
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

                          {/* Credit Cost Preview - Border only indicator */}
                          <div 
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 transition-all ${
                              estimatedCost <= creditsRemaining 
                                ? 'border-purple-500' 
                                : 'border-red-500'
                            }`}
                            style={{
                              background: 'transparent',
                              boxShadow: estimatedCost <= creditsRemaining 
                                ? '0 0 12px rgba(168, 85, 247, 0.4)' 
                                : '0 0 12px rgba(239, 68, 68, 0.5)',
                            }}
                            title={estimatedCost <= creditsRemaining 
                              ? `This will cost ${estimatedCost} credits` 
                              : `Not enough credits! Need ${estimatedCost}, have ${creditsRemaining}`
                            }
                          >
                            <Zap size={12} className={estimatedCost <= creditsRemaining ? 'text-purple-400' : 'text-red-400'} />
                            <span 
                              className={`text-[10px] font-bold ${spaceGrotesk.className} ${
                                estimatedCost <= creditsRemaining ? 'text-purple-400' : 'text-red-400'
                              }`}
                            >
                              {estimatedCost} {estimatedCost === 1 ? 'credit' : 'credits'}
                            </span>
                          </div>

                          {/* Send Button */}
                          <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || estimatedCost > creditsRemaining}
                            className={`p-2 md:p-2.5 rounded-full transition-colors ${
                              prompt.trim() && estimatedCost <= creditsRemaining
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-white/10 text-gray-500 cursor-not-allowed'
                            }`}
                            title={estimatedCost > creditsRemaining ? 'Not enough credits' : 'Generate'}
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                          // Add tag instead of setting prompt (Instagram-style @mention)
                          const tagType = selectedModeId === 3 ? 'style' : 'mode';
                          addTag(option.title, tagType);

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

      {/* Style Selection Modal */}
      {
        showStyleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowStyleModal(false)}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-lg bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-[20px] sm:rounded-[28px] border border-white/10 overflow-hidden shadow-2xl">
              {/* Glow line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setShowStyleModal(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <X size={16} className="text-gray-400" />
              </button>

              {/* Header */}
              <div className="text-center pt-8 pb-4 px-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/20 mb-4">
                  <Palette size={14} className="text-purple-400" />
                  <span className="text-xs font-medium text-purple-300 tracking-wider">STYLE PRESETS</span>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-bold mb-2 text-white ${spaceGrotesk.className}`}>
                  Choose a Style
                </h2>
                <p className="text-gray-500 text-sm">
                  Select a visual style to apply to your creation
                </p>
              </div>

              {/* Style Grid */}
              <div className="px-4 sm:px-6 pb-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
                {STYLE_PRESETS.map((style, index) => (
                  <button
                    key={style.name}
                    onClick={() => {
                      addTag(style.name, 'style');
                      setShowStyleModal(false);
                    }}
                    className="group relative p-0 rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 h-32 sm:h-40"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Thumbnail */}
                    <img
                      src={style.thumbnail}
                      alt={style.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 p-3 flex flex-col justify-end">
                      {/* Icon & Name Row */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-purple-400">
                          {style.icon === 'film' && <Video size={14} />}
                          {style.icon === 'user' && <User size={14} />}
                          {style.icon === 'box' && <LayoutGrid size={14} />}
                          {style.icon === 'smile' && <Sparkles size={14} />}
                          {style.icon === 'zap' && <Zap size={14} />}
                          {style.icon === 'camera' && <ImageIcon size={14} />}
                          {style.icon === 'moon' && <Moon size={14} />}
                        </div>
                        <span className="text-xs font-bold text-white tracking-wide uppercase">
                          {style.name}
                        </span>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedTags.find(t => t.label === style.name && t.type === 'style') && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected count */}
              {selectedTags.filter(t => t.type === 'style').length > 0 && (
                <div className="px-6 pb-4">
                  <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-between">
                    <span className="text-sm text-purple-300">
                      {selectedTags.filter(t => t.type === 'style').length} style{selectedTags.filter(t => t.type === 'style').length > 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={() => setSelectedTags(prev => prev.filter(t => t.type !== 'style'))}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
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
          {/* Community Generations Section */}
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold text-white ${spaceGrotesk.className}`}>Community</h3>
              <button
                onClick={() => router.push('/vizual/community')}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none" onWheel={(e) => { if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY; }}>
              <div className="flex gap-3 w-max">
                {loadingCommunity ? (
                  // Loading skeleton
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="w-32 h-32 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
                  ))
                ) : communityFeed.length > 0 ? (
                  communityFeed.slice(0, 10).map((item, i) => (
                    <button
                      key={item.id || i}
                      onClick={() => {
                        if (item.prompt) setPrompt(item.prompt);
                      }}
                      className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all group flex-shrink-0"
                    >
                      {(item.src || item.media_url) ? (
                        (item.type === 'video' || item.media_type === 'video') ? (
                          <video
                            src={item.src || item.media_url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          />
                        ) : (
                          <img
                            src={item.src || item.media_url}
                            alt={item.prompt || 'Community generation'}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          <ImageIcon size={24} className="text-gray-500" />
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-[10px] text-white line-clamp-2">{item.prompt || 'No prompt'}</p>
                      </div>
                      {/* Media type indicator */}
                      {(item.type === 'video' || item.media_type === 'video') && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                          <Play size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 py-4">No community content yet</div>
                )}
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
                src="https://labs.google/flow/tv/channel/boomtown/PQ4XlyvmsiNpKumBhOal?random=true"
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
                {/* Vizual-styled icon - chrome/white gradient */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-400 shadow-lg">
                  <Sparkles className="text-black" size={22} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold text-white ${spaceGrotesk.className}`}>AI Enhancer</h3>
                  <p className="text-gray-400 text-xs mt-1">Transform your ideas into cinematic prompts</p>
                </div>
              </div>

              <textarea
                className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors mb-6 resize-none text-sm leading-relaxed"
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
                  <Sparkles size={16} />
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
                  {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata.avatar_url || user.user_metadata.picture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-black rounded-full" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-bold text-white ${spaceGrotesk.className}`}>
                      {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Artist'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {user?.email || 'artist@vizual.ai'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-xs font-medium ${
                    accountData?.subscription_tier === 'ultra' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300' :
                    accountData?.subscription_tier === 'pro' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' :
                    'bg-white/10 border-white/10 text-white'
                  }`}>
                    {accountData?.subscription_tier ? 
                      accountData.subscription_tier.charAt(0).toUpperCase() + accountData.subscription_tier.slice(1) + ' Plan' 
                      : 'Free Plan'}
                  </div>
                </div>

                {/* Usage Stats - Real data */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">Monthly Credits</span>
                    <span className="text-xs font-bold text-white">
                      {accountData?.credits_remaining ?? creditsRemaining} / {accountData?.credits ?? userCredits}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-300" 
                      style={{ 
                        width: `${accountData?.credits ? 
                          Math.round((accountData.credits_remaining / accountData.credits) * 100) : 
                          Math.round((creditsRemaining / userCredits) * 100)}%` 
                      }} 
                    />
                  </div>
                  {accountData?.daily_free_images_limit && accountData.daily_free_images_limit > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-400">Daily Free Images</span>
                        <span className="text-xs font-bold text-white">
                          {accountData.daily_free_images_remaining} / {accountData.daily_free_images_limit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400 transition-all duration-300" 
                          style={{ width: `${Math.round((accountData.daily_free_images_remaining / accountData.daily_free_images_limit) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  )}
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
                      <div className="pl-14 pr-4 pb-4 space-y-3">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Current Plan</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              accountData?.subscription_tier === 'ultra' ? 'bg-purple-500/20 text-purple-300' :
                              accountData?.subscription_tier === 'pro' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-white/10 text-white'
                            }`}>
                              {accountData?.subscription_tier ? 
                                accountData.subscription_tier.charAt(0).toUpperCase() + accountData.subscription_tier.slice(1) 
                                : 'Free'} Tier
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Billing Cycle</span>
                            <span className="text-xs text-white font-medium">
                              {accountData?.is_paid_user ? 'Monthly' : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Credits Reset</span>
                            <span className="text-xs text-gray-300">
                              {accountData?.credits_reset_at ? 
                                new Date(accountData.credits_reset_at).toLocaleDateString() 
                                : '-'}
                            </span>
                          </div>
                          <div className="border-t border-white/10 pt-3 mt-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-400">Credits Used</span>
                              <span className="text-xs text-white font-medium">
                                {accountData?.credits_used ?? creditsUsed} / {accountData?.credits ?? userCredits}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-white to-gray-400 transition-all duration-300" 
                                style={{ 
                                  width: `${accountData?.credits ? 
                                    Math.round((accountData.credits_used / accountData.credits) * 100) : 
                                    Math.round((creditsUsed / userCredits) * 100)}%` 
                                }} 
                              />
                            </div>
                          </div>
                          {accountData?.is_paid_user && (
                            <div className="border-t border-white/10 pt-3 mt-2">
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Payment Method</span>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-8 h-5 bg-gradient-to-r from-gray-700 to-gray-600 rounded flex items-center justify-center text-[8px] text-white font-bold">
                                  CARD
                                </div>
                                <span className="text-xs text-gray-300">Managed by Stripe</span>
                                <a 
                                  href="https://billing.stripe.com/p/login/6oE7tk8g403j5os7ss" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-auto text-[10px] text-blue-400 hover:text-blue-300"
                                >
                                  Manage
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setShowAccountModal(false);
                            setShowPricingModal(true);
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-white via-gray-200 to-white text-black text-xs font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                        >
                          <Zap size={14} />
                          Upgrade Plan
                        </button>
                        <button className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                          View Billing History
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setExpandNotifications(!expandNotifications)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                          <Bell size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Notifications</span>
                      </div>
                      <ChevronRight size={16} className={`text-gray-500 group-hover:text-white transition-transform ${expandNotifications ? 'rotate-90' : ''}`} />
                    </button>
                    {expandNotifications && (
                      <div className="p-4 bg-white/5 rounded-lg mx-3 mb-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Email Notifications</span>
                          <button className="w-10 h-5 bg-white/20 rounded-full relative">
                            <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Generation Complete</span>
                          <button className="w-10 h-5 bg-white/20 rounded-full relative">
                            <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Marketing Updates</span>
                          <button className="w-10 h-5 bg-white/10 rounded-full relative">
                            <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-gray-500 rounded-full" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security */}
                  <div className="overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setExpandSecurity(!expandSecurity)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                          <Shield size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Security</span>
                      </div>
                      <ChevronRight size={16} className={`text-gray-500 group-hover:text-white transition-transform ${expandSecurity ? 'rotate-90' : ''}`} />
                    </button>
                    {expandSecurity && (
                      <div className="p-4 bg-white/5 rounded-lg mx-3 mb-3 space-y-3">
                        <button className="w-full py-2 px-3 text-xs text-left text-gray-300 hover:bg-white/10 rounded-lg transition-colors">
                          Change Password
                        </button>
                        <button className="w-full py-2 px-3 text-xs text-left text-gray-300 hover:bg-white/10 rounded-lg transition-colors">
                          Two-Factor Authentication
                        </button>
                        <button className="w-full py-2 px-3 text-xs text-left text-gray-300 hover:bg-white/10 rounded-lg transition-colors">
                          Connected Accounts
                        </button>
                        <button className="w-full py-2 px-3 text-xs text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          Delete Account
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Appearance */}
                  <div className="overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setExpandAppearance(!expandAppearance)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                          <Moon size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Appearance</span>
                      </div>
                      <ChevronRight size={16} className={`text-gray-500 group-hover:text-white transition-transform ${expandAppearance ? 'rotate-90' : ''}`} />
                    </button>
                    {expandAppearance && (
                      <div className="p-4 bg-white/5 rounded-lg mx-3 mb-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <button className="flex-1 py-2 px-3 text-xs text-center bg-white/10 border border-white/20 text-white rounded-lg">
                            Dark
                          </button>
                          <button className="flex-1 py-2 px-3 text-xs text-center text-gray-400 hover:bg-white/5 rounded-lg transition-colors">
                            Light
                          </button>
                          <button className="flex-1 py-2 px-3 text-xs text-center text-gray-400 hover:bg-white/5 rounded-lg transition-colors">
                            System
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
        )
      }

      {/* Style Selection Modal - Premium Design with Images */}
      {
        showStyleModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowStyleModal(false)}
            />
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h3 className={`text-2xl font-bold text-white ${spaceGrotesk.className}`}>Choose a Style</h3>
                  <p className="text-gray-400 text-sm mt-1">Select a visual style for your creation</p>
                </div>
                <button
                  onClick={() => setShowStyleModal(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Styles Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Cinematic', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop', desc: 'Film-like quality' },
                    { name: 'Anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop', desc: 'Japanese animation' },
                    { name: '3D Animation', image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop', desc: 'Pixar-like render' },
                    { name: 'Cartoon', image: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=400&fit=crop', desc: 'Playful illustration' },
                    { name: 'Realistic', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', desc: 'Photorealistic' },
                    { name: 'Noir', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop', desc: 'Dark & moody' },
                    { name: 'Cyberpunk', image: 'https://images.unsplash.com/photo-1515630771457-09367d0ae038?w=400&h=400&fit=crop', desc: 'Neon futurism' },
                    { name: 'Fantasy', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop', desc: 'Magical worlds' },
                  ].map((style) => (
                    <button
                      key={style.name}
                      onClick={() => {
                        // Add tag instead of setting prompt (Instagram-style @mention)
                        addTag(style.name, 'style');
                        setShowStyleModal(false);
                      }}
                      className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 hover:border-white/40 transition-all hover:scale-[1.02] hover:shadow-xl"
                    >
                      {/* Background Image */}
                      <img
                        src={style.image}
                        alt={style.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white font-bold text-base mb-1">{style.name}</h4>
                        <p className="text-white/60 text-xs">{style.desc}</p>
                      </div>

                      {/* Selection indicator */}
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white/0 group-hover:bg-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <Sparkles size={14} className="text-black" />
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/30 rounded-2xl transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Feedback Modal */}
      {
        showFeedbackModal && (
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
                  showToast('Feedback submitted! Thank you.', 'success');
                  setShowFeedbackModal(false);
                }} className="px-5 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-200">Submit</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Limit Reached Modal - Vizual Dark Theme */}
      {
        showLimitModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setShowLimitModal(false)}
            />
            <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-white/10 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => setShowLimitModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
                  <Zap size={36} className="text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-2xl font-bold text-white text-center mb-3 ${spaceGrotesk.className}`}>
                Daily Limit Reached
              </h2>

              {/* Description */}
              <p className="text-gray-400 text-center mb-6 text-sm leading-relaxed">
                You've used all your free image generations for today. Come back in 24 hours or upgrade to continue creating.
              </p>

              {/* Stats */}
              <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Daily Free Images</span>
                  <span className="text-xs font-medium text-red-400">
                    0 / {accountData?.daily_free_images_limit || 3}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500/50 w-0" />
                </div>
                {accountData?.daily_free_images_reset_at && (
                  <p className="text-[10px] text-gray-600 mt-2 text-center">
                    Resets at {new Date(accountData.daily_free_images_reset_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    setShowPricingModal(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-white to-gray-200 text-black font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Crown size={16} />
                  Upgrade Now
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-3 rounded-xl bg-white/5 text-gray-400 font-medium text-sm hover:bg-white/10 transition-colors border border-white/5"
                >
                  Wait Until Tomorrow
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Pricing Modal - Premium Vizual Design */}
      {
        showPricingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setShowPricingModal(false)}
            />
            <div className="relative w-full max-w-5xl my-8">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8 relative z-10">
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>
                  Choose Your Plan
                </h2>
                <p className="text-gray-500 text-sm max-w-lg mx-auto">
                  Unlock the full power of Vizual
                </p>
              </div>

              <button
                onClick={() => setShowPricingModal(false)}
                className="absolute top-0 right-0 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white z-20 border border-white/10"
              >
                <X size={20} />
              </button>

              {/* Plans Container - Scrollable on mobile */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>

                {/* Free Plan */}
                <div className="relative flex-shrink-0 w-[280px] lg:w-auto snap-center p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/10 flex flex-col transition-all duration-300 hover:scale-[1.02] group">
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Sparkles size={18} className="text-gray-400" />
                    </div>
                    <h3 className={`text-sm font-bold text-white uppercase tracking-wider ${spaceGrotesk.className}`}>VIZUAL FREE</h3>
                    <p className="text-[10px] text-gray-500">Try Vizual</p>
                  </div>
                  <div className="mb-4 pb-4 border-b border-white/5">
                    <span className="text-3xl font-bold text-white">Free</span>
                    <span className="text-xs text-gray-500 ml-1">forever</span>
                  </div>
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {[
                      { Icon: Image, text: "3 image generations / day" },
                      { Icon: Radio, text: "10 seconds Live feature / day" },
                      { Icon: Film, text: "1 video generation / month" },
                      { Icon: Settings, text: "Basic models only" },
                      { Icon: Clock, text: "Standard queue" },
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 group/feature">
                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 group-hover/feature:bg-white/10 transition-all">
                          <feature.Icon size={12} className="text-gray-500 group-hover/feature:text-gray-300" />
                        </div>
                        <span className="text-xs text-gray-400 group-hover/feature:text-white transition-colors">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 rounded-xl bg-white/5 text-gray-600 font-semibold text-sm border border-white/5 cursor-default">
                    Current Plan
                  </button>
                </div>

                {/* Basic Plan */}
                <div className="relative flex-shrink-0 w-[280px] lg:w-auto snap-center p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/10 flex flex-col transition-all duration-300 hover:scale-[1.02] group">
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Rocket size={18} className="text-gray-400" />
                    </div>
                    <h3 className={`text-sm font-bold text-white uppercase tracking-wider ${spaceGrotesk.className}`}>VIZUAL BASIC</h3>
                    <p className="text-[10px] text-gray-500">For casual creators</p>
                  </div>
                  <div className="mb-4 pb-4 border-b border-white/5">
                    <span className="text-3xl font-bold text-white">$10</span>
                    <span className="text-xs text-gray-500 ml-1">/ month</span>
                  </div>
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {[
                      { Icon: Coins, text: "1,000 credits / month", highlight: true },
                      { Icon: Image, text: "~50-200 images / month" },
                      { Icon: Radio, text: "~5 mins Live feature / month" },
                      { Icon: Film, text: "~3-5 short videos / month" },
                      { Icon: Settings, text: "Access to more models" },
                      { Icon: Zap, text: "Faster queue" },
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 group/feature">
                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 group-hover/feature:bg-white/10 transition-all">
                          <feature.Icon size={12} className="text-gray-500 group-hover/feature:text-gray-300" />
                        </div>
                        <span className={`text-xs ${feature.highlight ? 'text-white font-semibold' : 'text-gray-400'} group-hover/feature:text-white transition-colors`}>
                          {feature.highlight && <span className="inline-block mr-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">{feature.text.split(' ')[0]}</span>}
                          {feature.highlight ? feature.text.split(' ').slice(1).join(' ') : feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => {
                      const email = user?.email;
                      const url = email 
                        ? `https://buy.stripe.com/eVq3cvcypdVZ5UF4Y8dfG0f?prefilled_email=${encodeURIComponent(email)}`
                        : 'https://buy.stripe.com/eVq3cvcypdVZ5UF4Y8dfG0f';
                      window.location.href = url;
                    }}
                    className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 hover:-translate-y-0.5 transition-all relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <span className="relative">Choose Basic</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] text-gray-600 uppercase tracking-wider">
                    <span>◆</span><span>Secured by Stripe</span>
                  </div>
                </div>

                {/* Pro Plan - Featured */}
                <div className="relative flex-shrink-0 w-[280px] lg:w-auto snap-center p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/10 ring-1 ring-white/20 flex flex-col transition-all duration-300 hover:scale-[1.02] group">
                  {/* Popular Badge - Animated Shimmer Gradient */}
                  <div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg overflow-hidden"
                    style={{
                      background: 'linear-gradient(90deg, #fff, #888, #fff, #888, #fff)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                      color: '#000',
                    }}
                  >
                    Most Popular
                  </div>
                  <div className="mb-4 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Zap size={18} className="text-gray-400" />
                    </div>
                    <h3 className={`text-sm font-bold text-white uppercase tracking-wider ${spaceGrotesk.className}`}>VIZUAL PRO</h3>
                    <p className="text-[10px] text-gray-500">For serious creators</p>
                  </div>
                  <div className="mb-4 pb-4 border-b border-white/5">
                    <span className="text-3xl font-bold text-white">$20</span>
                    <span className="text-xs text-gray-500 ml-1">/ month</span>
                  </div>
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {[
                      { Icon: Coins, text: "2,000 credits / month", highlight: true },
                      { Icon: Image, text: "~100-400 images / month" },
                      { Icon: Radio, text: "~10 mins Live feature / month" },
                      { Icon: Film, text: "~8-12 videos / month" },
                      { Icon: Sparkles, text: "All premium models" },
                      { Icon: Zap, text: "Priority queue" },
                      { Icon: Brain, text: "Long-term memory" },
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 group/feature">
                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 group-hover/feature:bg-white/10 transition-all">
                          <feature.Icon size={12} className="text-gray-500 group-hover/feature:text-gray-300" />
                        </div>
                        <span className={`text-xs ${feature.highlight ? 'text-white font-semibold' : 'text-gray-400'} group-hover/feature:text-white transition-colors`}>
                          {feature.highlight && <span className="inline-block mr-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">{feature.text.split(' ')[0]}</span>}
                          {feature.highlight ? feature.text.split(' ').slice(1).join(' ') : feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => {
                      const email = user?.email;
                      const url = email 
                        ? `https://buy.stripe.com/fZu14ndCtdVZfvf4Y8dfG0g?prefilled_email=${encodeURIComponent(email)}`
                        : 'https://buy.stripe.com/fZu14ndCtdVZfvf4Y8dfG0g';
                      window.location.href = url;
                    }}
                    className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 hover:-translate-y-0.5 transition-all relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <span className="relative">Choose Pro</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] text-gray-600 uppercase tracking-wider">
                    <span>◆</span><span>Secured by Stripe</span>
                  </div>
                </div>

                {/* Ultra Plan - COLORED */}
                <div className="relative flex-shrink-0 w-[280px] lg:w-auto snap-center p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-orange-950/40 border border-amber-500/30 shadow-[0_0_40px_rgba(251,191,36,0.1)] flex flex-col transition-all duration-300 hover:scale-[1.02] group">
                  {/* Premium Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-md text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                    Premium
                  </div>
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Crown size={18} className="text-amber-400" />
                    </div>
                    <h3 className={`text-sm font-bold text-amber-400 uppercase tracking-wider ${spaceGrotesk.className}`}>VIZUAL ULTRA</h3>
                    <p className="text-[10px] text-gray-500">For power users</p>
                  </div>
                  <div className="mb-4 pb-4 border-b border-white/5">
                    <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">$50</span>
                    <span className="text-xs text-gray-500 ml-1">/ month</span>
                  </div>
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {[
                      { Icon: Coins, text: "5,000 credits / month", highlight: true },
                      { Icon: Image, text: "Unlimited images (soft cap)" },
                      { Icon: Radio, text: "~30 mins Live feature / month" },
                      { Icon: Film, text: "~25-40 videos / month" },
                      { Icon: Star, text: "All models + early access" },
                      { Icon: Zap, text: "Instant priority queue" },
                      { Icon: Brain, text: "Infinite memory" },
                      { Icon: Plug, text: "API access" },
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 group/feature">
                        <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover/feature:bg-amber-500/20 transition-all">
                          <feature.Icon size={12} className="text-amber-400/80" />
                        </div>
                        <span className={`text-xs ${feature.highlight ? 'text-white font-semibold' : 'text-gray-400'} group-hover/feature:text-white transition-colors`}>
                          {feature.highlight && <span className="inline-block mr-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">{feature.text.split(' ')[0]}</span>}
                          {feature.highlight ? feature.text.split(' ').slice(1).join(' ') : feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => {
                      const email = user?.email;
                      const url = email 
                        ? `https://buy.stripe.com/eVa6oOglDdvL2GY7st?prefilled_email=${encodeURIComponent(email)}`
                        : 'https://buy.stripe.com/eVa6oOglDdvL2GY7st';
                      window.location.href = url;
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 transition-all relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <span className="relative">Choose Ultra</span>
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] text-gray-600 uppercase tracking-wider">
                    <span>◆</span><span>Secured by Stripe</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-6 relative z-10">
                <p className="text-[10px] text-gray-600">
                  All plans auto-renew monthly. Cancel anytime. Credits don&apos;t roll over.
                </p>
              </div>
            </div>
          </div>
        )
      }

      {/* Shimmer animation for Most Popular badge */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {/* MultiStep Loader for Video Extension */}
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

      {/* MultiStep Loader for Content Generation */}
      <MultiStepLoader
        loadingStates={generationLoadingStates}
        loading={isGenerating}
        duration={2000}
      />

      {
        isGenerating && (
          <button
            className="fixed top-4 right-4 text-white z-[120] bg-black/50 p-2 rounded-full hover:bg-black/70"
            onClick={() => setIsGenerating(false)}
          >
            <X className="h-10 w-10" />
          </button>
        )
      }

      {/* Color Palette Modal */}
      {
        showColorPaletteModal && (
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
        )
      }

      {/* Style Guide Modal */}
      {
        showStyleGuideModal && (
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
