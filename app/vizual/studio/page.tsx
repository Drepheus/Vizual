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
  ArrowRightFromLine,
  Maximize2,
  Download,
  Radio
} from "lucide-react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Inter, Space_Grotesk } from "next/font/google";
import { Vortex } from "@/components/ui/vortex";
import Aurora from "@/components/vizual/Aurora";
import { ProjectsView } from "@/components/vizual/projects-view";
import { Sidebar } from "@/components/vizual/sidebar";
import { useToast } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

type CreationMode = "IMAGE" | "VIDEO";
type TabMode = "STYLE" | "REFERENCE" | "MODIFY" | "IMAGE REFERENCE" | "REMIX";

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
    cost: "$0.005",
    detail: "200 images / $1",
    isFree: true
  },

  // Google
  {
    id: "imagen-4-fast",
    name: "Imagen 4 Fast",
    description: "Google DeepMind",
    cost: "$0.02",
    detail: "50 images / $1",
    isFree: true
  },
  {
    id: "imagen-3-fast",
    name: "Imagen 3 Fast",
    description: "Google DeepMind",
    cost: "$0.025",
    detail: "40 images / $1",
    isFree: true
  },
  {
    id: "imagen-4-ultra",
    name: "Imagen 4 Ultra",
    description: "Google DeepMind",
    cost: "$0.06",
    detail: "16 images / $1",
    isFree: false
  },

  // Ideogram
  {
    id: "ideogram-v3-turbo",
    name: "Ideogram v3 Turbo",
    description: "Ideogram",
    cost: "$0.03",
    detail: "33 images / $1",
    isFree: true
  },

  // ByteDance
  {
    id: "seedream-4",
    name: "SeaDream 4",
    description: "ByteDance",
    cost: "$0.03",
    detail: "33 images / $1",
    isFree: true
  },
  {
    id: "seedream-4.5",
    name: "SeaDream 4.5",
    description: "ByteDance",
    cost: "$0.04",
    detail: "25 images / $1",
    isFree: false
  },

  // Nano
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    description: "Nano",
    cost: "$0.15",
    detail: "66 images / $10",
    isFree: false
  }
];

const VIDEO_MODELS = [
  // ByteDance
  {
    id: "seedance-1-pro-fast",
    name: "Seedance 1 Pro Fast",
    description: "ByteDance (480p-1080p)",
    cost: "From $0.015/s",
    detail: "approx 66s / $1",
    isFree: true
  },
  {
    id: "seedance-1-lite",
    name: "Seedance 1 Lite",
    description: "ByteDance (480p-1080p)",
    cost: "From $0.018/s",
    detail: "approx 55s / $1",
    isFree: true
  },
  {
    id: "seedance-1-pro",
    name: "Seedance 1 Pro",
    description: "ByteDance (480p-1080p)",
    cost: "From $0.03/s",
    detail: "approx 33s / $1",
    isFree: false
  },

  // Wan (Wavespeed/Wan-Video)
  {
    id: "wan-2.5-i2v",
    name: "Wan 2.5 I2V",
    description: "Wan Video (480p-1080p)",
    cost: "From $0.05/s",
    detail: "20s / $1",
    isFree: false
  },
  {
    id: "wan-2.5-t2v",
    name: "Wan 2.5 T2V",
    description: "Wan Video (480p-1080p)",
    cost: "From $0.05/s",
    detail: "20s / $1",
    isFree: false
  },
  {
    id: "wan-2.5-t2v-fast",
    name: "Wan 2.5 T2V Fast",
    description: "Wan Video (720p-1080p)",
    cost: "From $0.068/s",
    detail: "approx 14s / $1",
    isFree: false
  },
  {
    id: "wan-2.1-t2v-720p",
    name: "Wan 2.1 T2V",
    description: "WavespeedAI (720p)",
    cost: "$0.24/s",
    detail: "41s / $10",
    isFree: false
  },
  {
    id: "wan-2.1-i2v-720p",
    name: "Wan 2.1 I2V",
    description: "WavespeedAI (720p)",
    cost: "$0.25/s",
    detail: "40s / $10",
    isFree: false
  },

  // Pixverse
  {
    id: "pixverse-v4.5",
    name: "Pixverse v4.5",
    description: "Pixverse (360p-1080p)",
    cost: "From $0.06/s",
    detail: "Variable by resolution",
    isFree: false
  },

  // Kling
  {
    id: "kling-v2.5-turbo-pro",
    name: "Kling v2.5 Turbo Pro",
    description: "Kuaishou",
    cost: "$0.07/s",
    detail: "approx 14s / $1",
    isFree: false
  },

  // Minimax
  {
    id: "hailuo-2.3-fast",
    name: "Hailuo 2.3 Fast",
    description: "Minimax (6s-10s)",
    cost: "From $0.19/vid",
    detail: "approx 52 vids / $10",
    isFree: false
  },
  {
    id: "hailuo-2.3",
    name: "Hailuo 2.3",
    description: "Minimax (6s-10s)",
    cost: "From $0.28/vid",
    detail: "approx 35 vids / $10",
    isFree: false
  },

  // OpenAI
  {
    id: "sora-2",
    name: "Sora 2",
    description: "OpenAI",
    cost: "$0.10/s",
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
    cost: "From $0.10/s",
    detail: "10s / $1 (No Audio)",
    isFree: false
  },
  {
    id: "veo-3.1-fast",
    name: "Veo 3.1 Fast",
    description: "Google DeepMind",
    cost: "From $0.10/s",
    detail: "10s / $1 (No Audio)",
    isFree: false
  },
  {
    id: "veo-3",
    name: "Veo 3",
    description: "Google DeepMind",
    cost: "From $0.20/s",
    detail: "50s / $10 (No Audio)",
    isFree: false
  },
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    description: "Google DeepMind",
    cost: "From $0.20/s",
    detail: "50s / $10 (No Audio)",
    isFree: false
  },
  {
    id: "veo-2",
    name: "Veo 2",
    description: "Google DeepMind",
    cost: "$0.50/s",
    detail: "20s / $10",
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
  const [showPricingModal, setShowPricingModal] = useState(false);

  const [isExtending, setIsExtending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showColorPaletteModal, setShowColorPaletteModal] = useState(false);
  const [showStyleGuideModal, setShowStyleGuideModal] = useState(false);

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
        // Call image generation API with enhanced prompt
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prompt: enhancedPrompt,
            model: modelId,
            aspectRatio: '16:9',
            // Include reference/remix data
            mode: generationMode,
            referenceImage: isReferenceMode ? attachmentData : undefined,
            remixImage: isRemixMode ? attachmentData : undefined,
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
        const modeDescription = isRemixMode ? ' (remixed)' : isReferenceMode ? ' (using reference)' : '';

        setGeneratedContent({
          prompt: prompt,
          description: `I've created an image based on your prompt "${prompt}"${appliedStyles ? ` with ${appliedStyles} style` : ''}${modeDescription}, using the ${model} model.`,
          keywords: keywords,
          imageUrl: data.imageUrl,
          type: 'image',
        });
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
                    <div className="absolute top-full right-0 mt-3 min-w-[320px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

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
                          <div className="flex items-center gap-2 px-2 py-2 mt-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest opacity-80">
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
                                className="w-full p-3 rounded-xl text-left transition-all duration-200 border bg-gradient-to-r from-amber-500/[0.02] to-transparent border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/[0.05] group relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/[0.05] to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <div className="flex justify-between items-start gap-3 relative z-10">
                                  <div>
                                    <div className="text-sm font-bold text-white/50 group-hover:text-amber-200 transition-colors flex items-center gap-2">
                                      {m.name}
                                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] leading-none">PRO</span>
                                    </div>
                                    <div className="text-[11px] text-gray-600 mt-0.5 group-hover:text-gray-500 transition-colors">
                                      {m.description}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end flex-shrink-0">
                                    <div className="text-[10px] font-bold text-amber-500/80 group-hover:text-amber-400 bg-amber-900/10 group-hover:bg-amber-500/10 px-2 py-1 rounded-md transition-colors">
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
                      <div className="pl-14 pr-4 pb-4 space-y-3">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Current Plan</span>
                            <span className="text-xs text-white font-bold px-2 py-0.5 bg-white/10 rounded-full">Free Tier</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Billing Cycle</span>
                            <span className="text-xs text-white font-medium">Monthly</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Next Bill Date</span>
                            <span className="text-xs text-gray-300">-</span>
                          </div>
                          <div className="border-t border-white/10 pt-3 mt-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-400">Credits Used</span>
                              <span className="text-xs text-white font-medium">12 / 50</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-white to-gray-400 w-[24%]" />
                            </div>
                          </div>
                          <div className="border-t border-white/10 pt-3 mt-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Payment Method</span>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-8 h-5 bg-gradient-to-r from-gray-700 to-gray-600 rounded flex items-center justify-center text-[8px] text-white font-bold">
                                VISA
                              </div>
                              <span className="text-xs text-gray-300">•••• 4242</span>
                              <button className="ml-auto text-[10px] text-blue-400 hover:text-blue-300">Edit</button>
                            </div>
                          </div>
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

      {/* Pricing Modal - Premium Vizual Design */}
      {
        showPricingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setShowPricingModal(false)}
            />
            <div className="relative w-full max-w-5xl">
              {/* Header */}
              <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-4">
                  <Sparkles size={14} className="text-white" />
                  <span className="text-xs font-medium text-white uppercase tracking-wider">Vizual Plans</span>
                </div>
                <h2 className={`text-3xl md:text-4xl font-bold text-white mb-2 ${spaceGrotesk.className}`}>
                  Unlock Your Creative Potential
                </h2>
                <p className="text-gray-400 text-sm max-w-lg mx-auto">
                  Choose the plan that fits your workflow. Cancel anytime.
                </p>
              </div>

              <button
                onClick={() => setShowPricingModal(false)}
                className="absolute top-0 right-0 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white z-20 border border-white/10"
              >
                <X size={20} />
              </button>

              {/* Plans Container */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

                {/* Free Plan */}
                <div className="relative p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 flex flex-col">
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <User size={22} className="text-gray-400" />
                    </div>
                    <h3 className={`text-xl font-bold text-white mb-1 ${spaceGrotesk.className}`}>Free</h3>
                    <p className="text-sm text-gray-500">Perfect for exploring</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$0</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {["50 credits per month", "Basic AI models", "720p exports", "Community support"].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3.5 rounded-xl bg-white/5 text-white font-semibold text-sm border border-white/10 hover:bg-white/10 transition-all">
                    Current Plan
                  </button>
                </div>

                {/* Pro Plan - Featured with Video */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 flex flex-col transform md:scale-105 shadow-2xl shadow-white/5">
                  {/* Video Background */}
                  <div className="absolute inset-0 z-0">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-30"
                    >
                      <source src="/videos/veo1.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
                  </div>

                  {/* Popular Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>

                  <div className="relative z-10 p-6 flex flex-col h-full">
                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4">
                        <Sparkles size={22} className="text-black" />
                      </div>
                      <h3 className={`text-xl font-bold text-white mb-1 ${spaceGrotesk.className}`}>Pro</h3>
                      <p className="text-sm text-gray-400">For serious creators</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">$29</span>
                      <span className="text-gray-400 text-sm">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {["1,000 credits per month", "Premium AI models", "4K exports", "Priority processing", "Remove watermarks", "Commercial license"].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white">
                          <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg shadow-white/20">
                      Upgrade to Pro
                    </button>
                  </div>
                </div>

                {/* Ultra Plan - with Video */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 flex flex-col">
                  {/* Video Background */}
                  <div className="absolute inset-0 z-0">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-20"
                    >
                      <source src="/videos/film2.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/90 via-[#0d0d0d]/70 to-[#0d0d0d]/95" />
                  </div>

                  <div className="relative z-10 p-6 flex flex-col h-full">
                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-700 via-white to-gray-700 p-[1px]">
                        <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                          <Zap size={22} className="text-white" />
                        </div>
                      </div>
                      <h3 className={`text-xl font-bold text-white mb-1 mt-4 ${spaceGrotesk.className}`}>Ultra</h3>
                      <p className="text-sm text-gray-400">Maximum power</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">$99</span>
                      <span className="text-gray-400 text-sm">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {["Unlimited credits", "All AI models (incl. Sora)", "8K exports", "Fastest processing", "API access", "Dedicated support", "Early feature access"].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-gray-500 to-white mt-1.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white font-bold text-sm hover:brightness-125 transition-all border border-white/10 shadow-lg">
                      Get Ultra
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 relative z-10">
                <p className="text-xs text-gray-500">
                  All plans include a 7-day free trial. No credit card required to start.
                </p>
              </div>
            </div>
          </div>
        )
      }

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
