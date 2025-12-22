"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LogoLoop from './LogoLoop';
import { ShinyText } from '@/components/typography/shiny-text';
import './MediaStudio.css';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

import PaywallModal from './PaywallModal';
import { useAuth } from '@/context/auth-context';
import { saveGeneratedMedia } from './mediaService';
import { incrementUsage } from './usageTracking';

interface MediaStudioProps {
  onClose?: () => void;
}

const sidebarTools = [
  { name: 'Home', icon: '🏠', section: 'main' },
  { name: 'Library', icon: '📚', section: 'main' },
  { name: 'Image', icon: '🎨', section: 'AI Tools' },
  { name: 'Video', icon: '🎬', section: 'AI Tools' },
  { name: 'Blueprints', icon: '📋', section: 'AI Tools', badge: 'Beta' },
  { name: 'Voice', icon: '🎙️', section: 'AI Tools' },
  { name: 'Music', icon: '🎵', section: 'AI Tools' },
  { name: 'Avatars', icon: '👤', section: 'AI Tools' },
  { name: 'Assistant', icon: '🤖', section: 'AI Tools' },
];

const categoryTabs = [
  { name: 'Blueprints', icon: '📋', sectionId: 'blueprints-section' },
  { name: 'Community Creations', icon: '🎨', sectionId: 'community-section' },
  { name: 'Models', icon: '🧠', sectionId: 'models-section' },
  { name: 'Events', icon: '🎉', sectionId: 'events-section' },
];

const modelTabs = [
  { name: 'Flux Schnell', icon: '⚡' },
  { name: 'Midjourney V6', icon: '🎨' },
  { name: 'Kling', icon: '🎬' },
  { name: 'Runway Gen-3', icon: '🎥' },
  { name: 'Luma Dream Machine', icon: '☁️' },
  { name: 'Stable Diffusion 3', icon: 'Stability' },
  { name: 'More', icon: '⋯' },
];

const featuredBlueprints = [
  {
    title: 'Amber Haze Portrait',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: 'Abstract UHD',
    image: '/videos/14618955-uhd_2160_3840_24fps.mp4',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    type: 'video'
  },
  {
    title: 'Dreamy Polaroid Portrait',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: 'Pulse Effect',
    image: '/videos/Standard_Mode_add_a_pulse_effect_to_the_middle.mp4',
    gradient: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
    type: 'video'
  },
  {
    title: 'Tuscan Cinematic Video Portrait',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    title: 'Dog Climb',
    image: '/videos/dogclimb.mp4',
    gradient: 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
    type: 'video'
  },
  {
    title: 'Blue Room Video Portrait',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: 'Showcase',
    image: '/videos/examples.mp4',
    gradient: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
    type: 'video'
  },
  {
    title: 'Halloween Party',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    title: 'Intro Sequence',
    image: '/videos/intro.mp4',
    gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    type: 'video'
  },
  {
    title: 'Indie Garden Polaroid',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=600&fit=crop',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    title: 'Matrix Code',
    image: '/videos/matrixcode.mp4',
    gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    type: 'video'
  },
  {
    title: 'Rock Bug',
    image: '/videos/rockbug.mp4',
    gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    type: 'video'
  },
  {
    title: 'Veo Hero',
    image: '/videos/veo-hero.mp4',
    gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    type: 'video'
  },
  {
    title: 'Veo Demo 1',
    image: '/videos/veo1.mp4',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'video'
  },
  {
    title: 'Veo Demo 2',
    image: '/videos/veo2.mp4',
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    type: 'video'
  },
  {
    title: 'Veo Demo 3',
    image: '/videos/veo3.mp4',
    gradient: 'linear-gradient(135deg, #ebc0fd 0%, #d9ded8 100%)',
    type: 'video'
  },
  {
    title: 'Video Preview',
    image: '/videos/vidpreview.mp4',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    type: 'video'
  }
];

const communityFilters = [
  { name: 'All', icon: '🌐' },
  { name: 'Trending', icon: '🔥' },
  { name: 'Video', icon: '🎬' },
  { name: 'Images', icon: '🖼️' },
  { name: 'Audio', icon: '🎵' },
  { name: 'Avatars', icon: '👤' },
];

export default function MediaStudio({ onClose }: MediaStudioProps) {
  const router = useRouter();
  /* Existing state */
  const [activeCategory, setActiveCategory] = useState('Blueprints');
  const [activeFilter, setActiveFilter] = useState('Trending');
  const [activeTool, setActiveTool] = useState('Home');
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [spotlightUrl, setSpotlightUrl] = useState<string | null>(null);
  
  // View All Modal State
  const [viewAllModal, setViewAllModal] = useState<{ isOpen: boolean, title: string, items: any[], renderItem: (item: any, index: number) => React.ReactNode } | null>(null);

  // Draggable Scroll Refs
  const modelsScrollRef = useDraggableScroll();
  const voiceScrollRef = useDraggableScroll();
  const musicScrollRef = useDraggableScroll();
  const avatarsScrollRef = useDraggableScroll();
  const assistantsScrollRef = useDraggableScroll();
  const eventsScrollRef = useDraggableScroll();
  const blueprintsScrollRef = useDraggableScroll();
  const communityScrollRef = useDraggableScroll();
  const spotlightScrollRef = useDraggableScroll();
  const videoScrollRef = useDraggableScroll();
  const imageScrollRef = useDraggableScroll();

  // Image Generation State
  const [promptInput, setPromptInput] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    if (!promptInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptInput.trim(), aspectRatio: '3:2' }),
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        setGeneratedImage(data.imageUrl);

        // Save generated image to database
        if (user) {
          try {
            await saveGeneratedMedia(user.id, 'image', data.imageUrl, promptInput.trim());
            await incrementUsage(user.id, 'image_gen');
          } catch (error) {
            console.error('Failed to save generated image:', error);
          }
        }
      } else {
        alert('Failed to generate image: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Video Generation State
  const [videoPromptInput, setVideoPromptInput] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // MusicFX State
  const [showMusicFX, setShowMusicFX] = useState(false);

  const handleGenerateVideo = async () => {
    if (!videoPromptInput.trim() || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setGeneratedVideo(null);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPromptInput.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.videoUrl) {
        setGeneratedVideo(data.videoUrl);

        if (user) {
          try {
            await saveGeneratedMedia(user.id, 'video', data.videoUrl, videoPromptInput.trim());
            await incrementUsage(user.id, 'video_gen');
          } catch (error) {
            console.error('Failed to save generated video:', error);
          }
        }
      } else {
        alert('Failed to generate video: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  /* Video Hero State */
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const heroVideos = [
    '/videos/klingnextgen.mp4',
    '/videos/examples.mp4',
    '/videos/klingmodel.mp4'
  ];

  /* Image Studio Hero State */
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageStudioHeroImages = [
    '/images/samples/avatar-standard-1760736610612-0.png',
    '/images/samples/CYBER DRE.png',
    '/images/samples/image (45).jpg',
    '/images/samples/image (52).jpg',
    '/images/samples/image (59).jpg',
    '/images/samples/image (63).jpg',
    '/images/samples/little guy.png'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTool === 'Image') {
      interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % imageStudioHeroImages.length);
      }, 8000); // Cycle every 8 seconds
    }
    return () => clearInterval(interval);
  }, [activeTool, imageStudioHeroImages.length]);

  // Handle Escape key to close spotlight modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && spotlightUrl) {
        setSpotlightUrl(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spotlightUrl]);

  /* Tool Definitions */
  const imageStudioTools = [
    {
      name: 'Model',
      icon: '🧠',
      tooltip: 'Choose your AI Model',
      options: ['Flux Schnell', 'Midjourney V6', 'Stable Diffusion 3', 'DALL-E 3', 'Ideogram', 'Flux Dev']
    },
    {
      name: 'Mode',
      icon: '⚡',
      tooltip: 'Select Generation Mode',
      options: ['Quick (Instant)', 'Pro (High Quality)']
    },
    {
      name: 'Style',
      icon: '🎨',
      tooltip: 'Apply an Artistic Style',
      options: ['Cinematic', 'Photorealistic', 'Anime', 'Cyberpunk', 'Oil Painting', 'Abstract', '3D Render', 'Sketch']
    },
    {
      name: 'Count',
      icon: '🔢',
      tooltip: 'Number of Images',
      options: ['1 Image', '2 Images', '4 Images']
    },
  ];

  /* Video Studio Tools */
  const videoStudioTools = [
    {
      name: 'Model',
      icon: '🧠',
      tooltip: 'Choose Video AI Model',
      options: ['Kling AI', 'Runway Gen-3', 'Luma Dream Machine', 'Pika Labs', 'Sora']
    },
    {
      name: 'Duration',
      icon: '⏱️',
      tooltip: 'Video Duration',
      options: ['3s', '5s', '10s']
    },
    {
      name: 'Mode',
      icon: '⚡',
      tooltip: 'Generation Mode',
      options: ['Fast', 'High Quality']
    },
    {
      name: 'Aspect',
      icon: '📐',
      tooltip: 'Aspect Ratio',
      options: ['16:9', '9:16', '1:1']
    },
    {
      name: 'Motion',
      icon: '🏃',
      tooltip: 'Motion Strength',
      options: ['Low', 'Medium', 'High']
    }
  ];

  /* Dropdown State */
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('Flux Schnell');
  const [selectedMode, setSelectedMode] = useState('Quick (Instant)');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  const [selectedCount, setSelectedCount] = useState('1 Image');

  const handleToolClick = (toolName: string) => {
    setActiveDropdown(activeDropdown === toolName ? null : toolName);
  };

  const handleOptionSelect = (toolName: string, option: string) => {
    if (toolName === 'Model') setSelectedModel(option);
    if (toolName === 'Mode') setSelectedMode(option);
    if (toolName === 'Style') setSelectedStyle(option);
    if (toolName === 'Count') setSelectedCount(option);
    setActiveDropdown(null);
  };

  const [selectedVideoDuration, setSelectedVideoDuration] = useState('3s');
  const [selectedVideoModel, setSelectedVideoModel] = useState('Kling AI');
  const [selectedVideoMode, setSelectedVideoMode] = useState('Fast');
  const [selectedVideoAspect, setSelectedVideoAspect] = useState('16:9');
  const [selectedVideoMotion, setSelectedVideoMotion] = useState('Medium');

  const handleVideoOptionSelect = (toolName: string, option: string) => {
    if (toolName === 'Model') setSelectedVideoModel(option);
    if (toolName === 'Duration') setSelectedVideoDuration(option);
    if (toolName === 'Mode') setSelectedVideoMode(option);
    if (toolName === 'Aspect') setSelectedVideoAspect(option);
    if (toolName === 'Motion') setSelectedVideoMotion(option);
    setActiveDropdown(null);
  };

  const imageBlueprints = [
    { title: 'AI Portrait', image: '/images/blueprints/ai.jpg', type: 'image' },
    { title: 'Standard Avatar', image: '/images/blueprints/avatar-standard-1760736610612-0.png', type: 'image' },
    { title: 'Lucky Dice', image: '/images/blueprints/dice.png', type: 'image' },
    { title: 'Abstract Composition', image: '/images/blueprints/image (35).jpg', type: 'image' },
    { title: 'Little Character', image: '/images/blueprints/little guy.png', type: 'image' },
    { title: 'Phone Demo', image: '/images/blueprints/caphone.mp4', type: 'video' },
    { title: 'Rocket Kid', image: '/images/blueprints/frogkidrocket.mp4', type: 'video' },
  ];

  const featuredVideos = [
    { title: 'Hair Simulation', image: '/videos/mediafeaturedvids/imagehairvid.mp4' },
    { title: 'Image to Video', image: '/videos/mediafeaturedvids/imageto vid.mp4' },
    { title: 'Motion Transfer', image: '/videos/mediafeaturedvids/imagetovid.mp4' },
    { title: 'Multi-Model Gen', image: '/videos/mediafeaturedvids/multimodelvid1.mp4' },
    { title: 'AI Prediction', image: '/videos/mediafeaturedvids/replicate-prediction-nxmrtf1fsdrma0cv4qrbq5grzg.mp4' },
    { title: 'Video Example', image: '/videos/mediafeaturedvids/videxample.mp4' },
  ];

  const featuredVoices = [
    { title: 'Natural Narrator', description: 'Warm, conversational voice', icon: '🎙️' },
    { title: 'Professional Host', description: 'Clear, authoritative tone', icon: '📢' },
    { title: 'Storyteller', description: 'Expressive, dramatic delivery', icon: '📖' },
    { title: 'Podcast Voice', description: 'Friendly, engaging style', icon: '🎧' },
    { title: 'Documentary', description: 'Deep, cinematic narrator', icon: '🎬' },
  ];

  const voiceStudioTools = [
    { name: 'Voice', icon: '🎙️', tooltip: 'Select voice type', options: ['Natural', 'Professional', 'Whisper', 'Energetic'] },
    { name: 'Language', icon: '🌐', tooltip: 'Output language', options: ['English', 'Spanish', 'French', 'German', 'Japanese'] },
    { name: 'Speed', icon: '⚡', tooltip: 'Speaking speed', options: ['0.5x', '0.75x', '1x', '1.25x', '1.5x'] },
    { name: 'Emotion', icon: '😊', tooltip: 'Voice emotion', options: ['Neutral', 'Happy', 'Serious', 'Excited'] },
  ];

  const featuredMusic = [
    { title: 'Ambient Dreams', genre: 'Ambient', duration: '3:45', icon: '🌙' },
    { title: 'Epic Orchestral', genre: 'Cinematic', duration: '4:20', icon: '🎻' },
    { title: 'Lo-Fi Beats', genre: 'Lo-Fi', duration: '2:30', icon: '🎹' },
    { title: 'Electronic Pulse', genre: 'EDM', duration: '3:15', icon: '⚡' },
    { title: 'Acoustic Sunrise', genre: 'Acoustic', duration: '3:00', icon: '🎸' },
  ];

  const musicStudioTools = [
    { name: 'Genre', icon: '🎵', tooltip: 'Music genre', options: ['Ambient', 'Cinematic', 'Lo-Fi', 'EDM', 'Rock', 'Jazz'] },
    { name: 'Mood', icon: '😌', tooltip: 'Track mood', options: ['Calm', 'Upbeat', 'Dramatic', 'Melancholic'] },
    { name: 'Duration', icon: '⏱️', tooltip: 'Track length', options: ['30s', '1min', '2min', '3min'] },
    { name: 'Tempo', icon: '🥁', tooltip: 'Beats per minute', options: ['Slow', 'Medium', 'Fast', 'Very Fast'] },
  ];

  const featuredAvatars = [
    { title: 'Professional', description: 'Business-ready avatar', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces' },
    { title: 'Creative Artist', description: 'Artistic personality', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces' },
    { title: 'Tech Expert', description: 'Modern tech persona', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces' },
    { title: 'Friendly Guide', description: 'Approachable helper', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces' },
  ];

  const avatarStudioTools = [
    { name: 'Style', icon: '🎨', tooltip: 'Avatar style', options: ['Realistic', 'Cartoon', '3D Render', 'Anime'] },
    { name: 'Expression', icon: '😊', tooltip: 'Facial expression', options: ['Neutral', 'Smiling', 'Professional', 'Friendly'] },
    { name: 'Background', icon: '🖼️', tooltip: 'Background type', options: ['Transparent', 'Gradient', 'Office', 'Studio'] },
    { name: 'Pose', icon: '👤', tooltip: 'Avatar pose', options: ['Front', 'Side', '3/4 View', 'Dynamic'] },
  ];

  const featuredAssistants = [
    { title: 'General Assistant', description: 'All-purpose AI helper', icon: '🤖', color: '#a855f7' },
    { title: 'Code Companion', description: 'Programming expert', icon: '💻', color: '#22c55e' },
    { title: 'Writing Partner', description: 'Creative writing help', icon: '✍️', color: '#f59e0b' },
    { title: 'Research Analyst', description: 'Deep research assistant', icon: '🔍', color: '#3b82f6' },
  ];

  const assistantStudioTools = [
    { name: 'Personality', icon: '🧠', tooltip: 'AI personality', options: ['Friendly', 'Professional', 'Creative', 'Technical'] },
    { name: 'Expertise', icon: '📚', tooltip: 'Knowledge area', options: ['General', 'Coding', 'Writing', 'Research'] },
    { name: 'Response', icon: '💬', tooltip: 'Response style', options: ['Concise', 'Detailed', 'Step-by-step', 'Conversational'] },
    { name: 'Creativity', icon: '✨', tooltip: 'Creative level', options: ['Conservative', 'Balanced', 'Creative', 'Wild'] },
  ];

const spotlightItems = [
  {
    name: 'Snap Research EgoEdit',
    description: 'Explore the latest in ego-centric video editing from Snap Research.',
    url: 'https://snap-research.github.io/EgoEdit/',
    icon: '👻'
  },
  {
    name: 'Black Forest Labs',
    description: 'Creators of the Flux image generation models.',
    url: 'https://bfl.ai/',
    icon: '🌲'
  },
  {
    name: 'LongCat Video Avatar',
    description: 'Generate long videos from a single portrait image.',
    url: 'https://meigen-ai.github.io/LongCat-Video-Avatar/',
    icon: '🐱'
  },
  {
    name: 'Microsoft TRELLIS',
    description: 'Structured 3D generation from a single image.',
    url: 'https://microsoft.github.io/TRELLIS.2/',
    icon: '🧊'
  },
  {
    name: 'Luma Labs',
    description: 'Building the future of visual AI with Dream Machine.',
    url: 'https://lumalabs.ai/#team',
    icon: '☁️'
  },
  {
    name: 'Kling AI',
    description: 'Next-generation video generation model.',
    url: 'https://klingai.com/global/',
    icon: '🎬'
  },
  {
    name: 'Wan Video',
    description: 'Advanced video synthesis technology.',
    url: 'https://wan.video/',
    icon: '🎥'
  },
  {
    name: 'Seedance 1.5 Pro',
    description: 'Advanced dance generation model by ByteDance.',
    url: 'https://seed.bytedance.com/en/seedance1_5_pro',
    icon: '💃'
  }
];

const aiModelsItems = [
  { name: 'Flux Schnell', description: 'Ultra-fast image generation', icon: '⚡', color: '#f59e0b', speed: 'Fast', type: 'image' },
  { name: 'Midjourney V6', description: 'Artistic and creative outputs', icon: '🎨', color: '#ec4899', speed: 'Medium', type: 'image' },
  { name: 'Kling AI', description: 'Advanced video generation', icon: '🎬', color: '#8b5cf6', speed: 'Medium', type: 'video' },
  { name: 'Runway Gen-3', description: 'Professional video synthesis', icon: '🎥', color: '#06b6d4', speed: 'Slow', type: 'video' },
  { name: 'Stable Diffusion 3', description: 'Open-source image model', icon: '🖼️', color: '#22c55e', speed: 'Fast', type: 'image' },
  { name: 'Luma Dream Machine', description: 'Dreamy visual effects', icon: '☁️', color: '#a855f7', speed: 'Medium', type: 'video' },
];

interface ViewAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

const ViewAllModal = ({ isOpen, onClose, title, items, renderItem }: ViewAllModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-6xl h-[85vh] bg-[#0f0f1a] rounded-2xl border border-purple-500/20 flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#13131f]">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item, index) => (
              <div key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

  return (
    <motion.div
      className="media-studio-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          limitType="image"
          currentUsage={0}
          usageLimit={10}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`media-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {/* User Profile Section */}
          <div className="user-profile-section">
            <div className="user-avatar-container">
              <span className="logo-avatar">👤</span>
              <div className="online-status-indicator" />
            </div>
            <div className="user-info-group">
              <div className="user-name-row">
                <span className="user-name">Omi.AI</span>
                <span className="dropdown-icon">▼</span>
              </div>
              <span className="user-plan-text">Free Plan</span>
            </div>
            
            {/* Close Sidebar Button (Mobile) */}
            <button
              className="mobile-sidebar-close"
              onClick={() => setIsSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Credits Section */}
          <div className="sidebar-credits-card">
            <div className="credits-row">
              <div className="credits-left">
                <span className="credits-icon">⚡</span>
                <span className="credits-amount">150</span>
              </div>
              <span className="credits-label">Available Credits</span>
            </div>
            <button
              className="credits-add-btn"
              onClick={() => setShowPaywall(true)}
            >
              Upgrade
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarTools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              {tool.section && index > 0 && sidebarTools[index - 1].section !== tool.section && (
                <div className="nav-section-title">{tool.section}</div>
              )}
              <button
                className={`sidebar-item ${activeTool === tool.name ? 'active' : ''}`}
                onClick={() => {
                  setActiveTool(tool.name);
                  setIsSidebarOpen(false);
                }}
              >
                <span className="sidebar-icon">{tool.icon}</span>
                <span className="sidebar-label">{tool.name}</span>
                {tool.badge && <span className="tool-badge">{tool.badge}</span>}
              </button>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item">
            <span className="sidebar-icon">🆕</span>
            <span className="sidebar-label">What's New</span>
          </button>
        </div>
      </div>

      <motion.div className="media-main-content">
        {/* Mobile Hamburger Menu */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>

        {activeTool === 'Library' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="section-title" style={{ marginBottom: '30px' }}>
              <span className="title-highlight">My</span> Library
            </h2>
            <div className="library-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '20px',
              padding: '20px 0'
            }}>
              {featuredBlueprints.map((bp, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', aspectRatio: '2/3' }}>
                  {bp.type === 'video' ? (
                    <video src={bp.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop />
                  ) : (
                    <img src={bp.image} alt={bp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{bp.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : activeTool === 'Image' ? (
          <motion.div
            className="image-studio-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="image-studio-hero">
              <div
                className="hero-background-image"
                style={{ overflow: 'hidden' }} /* Ensure container masks the overflow */
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={activeImageIndex}
                    initial={{ opacity: 0, scale: 1.2, x: 0 }}
                    animate={{ opacity: 1, scale: 1.2, x: -100 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 1.5, ease: "easeInOut" },
                      x: { duration: 10, ease: "linear" }
                    }}
                    style={{
                      position: 'absolute',
                      inset: -20, // Slightly larger than container
                      backgroundImage: `url('${imageStudioHeroImages[activeImageIndex]}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </AnimatePresence>
              </div>

              <div className="hero-content-center">
                <h1 className="hero-large-text">Create <ShinyText text="Image" speed={10} className="media-studio-shiny-text" /></h1>
                <div className="prompt-bar-wrapper">
                  <div className="prompt-icon">✨</div>
                  <input
                    type="text"
                    placeholder="Type a prompt..."
                    className="prompt-input"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
                  />
                  <button
                    className="generate-btn-small"
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                <div className="quick-tools-row">
                  {imageStudioTools.map(t => (
                    <div
                      className="quick-tool-item relative-container"
                      key={t.name}
                      onClick={() => handleToolClick(t.name)}
                    >
                      <div className={`quick-tool-icon-circle ${activeDropdown === t.name ? 'active-tool' : ''}`}>
                        {t.icon}
                      </div>
                      <span className="quick-tool-label">
                        {t.name === 'Model' ? selectedModel.split(' ')[0] :
                          t.name === 'Mode' ? selectedMode.split(' ')[0] :
                            t.name === 'Style' ? selectedStyle :
                              t.name === 'Count' ? selectedCount : t.name}
                      </span>

                      {/* Custom Tooltip */}
                      <div className="custom-tooltip">
                        {t.tooltip}
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeDropdown === t.name && (
                          <motion.div
                            className="tool-dropdown-menu"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            {t.options.map(option => (
                              <div
                                key={option}
                                className="dropdown-option"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOptionSelect(t.name, option);
                                }}
                              >
                                {option}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>




            {generatedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="generated-image-section"
                style={{ padding: '0 40px 40px' }}
              >
                <h2 className="section-title"><span className="title-highlight">Generated</span> Result</h2>
                <div className="generated-image-container" style={{
                  marginTop: '20px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  boxShadow: '0 0 40px rgba(168, 85, 247, 0.2)',
                  maxWidth: '800px',
                  margin: '20px auto 0'
                }}>
                  <img src={generatedImage} alt="Generated Art" style={{ width: '100%', display: 'block' }} />
                </div>
              </motion.div>
            )}

            <div className="horizontal-scroll-section">
              <div className="section-header-row">
                <h2 className="section-title"><span className="title-highlight">Featured</span> Blueprints</h2>
                <span className="view-more" onClick={() => setViewAllModal({
                  isOpen: true,
                  title: 'Featured Blueprints',
                  items: imageBlueprints,
                  renderItem: (bp, i) => (
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden group cursor-pointer border border-white/10">
                      {bp.type === 'video' ? (
                        <video src={bp.image} muted loop playsInline className="w-full h-full object-cover" onMouseOver={e => e.currentTarget.play()} onMouseOut={e => {e.currentTarget.pause(); e.currentTarget.currentTime = 0;}} />
                      ) : (
                        <img src={bp.image} alt={bp.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 flex items-end p-4">
                        <span className="text-white font-medium">{bp.title}</span>
                      </div>
                    </div>
                  )
                })}>View More →</span>
              </div>
              <div className="horizontal-cards-scroller-container" ref={imageScrollRef}>
                <div className="horizontal-cards-scroller-track">
                  {/* Original Items */}
                  {imageBlueprints.map((bp, i) => (
                    <div className="horizontal-card" key={`orig-${i}`}>
                      {bp.type === 'video' ? (
                        <video 
                          src={bp.image} 
                          muted 
                          loop 
                          playsInline 
                          onMouseOver={e => {
                            e.currentTarget.muted = false;
                            e.currentTarget.play().catch(err => console.error("Video play failed:", err));
                          }} 
                          onMouseOut={e => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                            e.currentTarget.muted = true;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <img src={bp.image} alt={bp.title} />
                      )}
                      <span className="card-badge-new">New</span>
                      <div className="card-overlay-title">{bp.title}</div>
                    </div>
                  ))}
                  {/* Duplicated Items for Loop */}
                  {imageBlueprints.map((bp, i) => (
                    <div className="horizontal-card" key={`dup-${i}`}>
                      {bp.type === 'video' ? (
                        <video 
                          src={bp.image} 
                          muted 
                          loop 
                          playsInline 
                          onMouseOver={e => {
                            e.currentTarget.muted = false;
                            e.currentTarget.play().catch(err => console.error("Video play failed:", err));
                          }} 
                          onMouseOut={e => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                            e.currentTarget.muted = true;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <img src={bp.image} alt={bp.title} />
                      )}
                      <span className="card-badge-new">New</span>
                      <div className="card-overlay-title">{bp.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTool === 'Video' ? (
          <motion.div
            className="video-studio-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="image-studio-hero">
              <div
                className="hero-background-image"
                style={{ overflow: 'hidden' }}
              >
                <AnimatePresence mode="wait">
                  <motion.video
                    key={heroVideos[currentVideoIndex]}
                    className="hero-video-background"
                    autoPlay
                    muted
                    playsInline
                    src={heroVideos[currentVideoIndex]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }}
                    onEnded={() => {
                      setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
                    }}
                  />
                </AnimatePresence>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(10,5,15,0.9) 100%)' }} />
              </div>

              <div className="hero-content-center">
                <h1 className="hero-large-text">Create <ShinyText text="Video" speed={10} className="media-studio-shiny-text" /></h1>
                <div className="prompt-bar-wrapper">
                  <div className="prompt-icon">🎬</div>
                  <input
                    type="text"
                    placeholder="Describe a video..."
                    className="prompt-input"
                    value={videoPromptInput}
                    onChange={(e) => setVideoPromptInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateVideo()}
                  />
                  <button
                    className="generate-btn-small"
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                  >
                    {isGeneratingVideo ? 'Generating...' : 'Generate'}
                  </button>
                </div>

                <div className="quick-tools-row">
                  {videoStudioTools.map(t => (
                    <div
                      className="quick-tool-item relative-container"
                      key={t.name}
                      onClick={() => handleToolClick(t.name)}
                    >
                      <div className={`quick-tool-icon-circle ${activeDropdown === t.name ? 'active-tool' : ''}`}>
                        {t.icon}
                      </div>
                      <span className="quick-tool-label">
                        {t.name === 'Model' ? selectedVideoModel :
                          t.name === 'Duration' ? selectedVideoDuration :
                            t.name === 'Mode' ? selectedVideoMode :
                              t.name === 'Aspect' ? selectedVideoAspect :
                                t.name === 'Motion' ? selectedVideoMotion : t.name}
                      </span>

                      {/* Custom Tooltip */}
                      <div className="custom-tooltip">
                        {t.tooltip}
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeDropdown === t.name && (
                          <motion.div
                            className="tool-dropdown-menu"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            {t.options.map(option => (
                              <div
                                key={option}
                                className="dropdown-option"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVideoOptionSelect(t.name, option);
                                }}
                              >
                                {option}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {generatedVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="generated-image-section"
                style={{ padding: '0 40px 40px' }}
              >
                <h2 className="section-title"><span className="title-highlight">Generated</span> Result</h2>
                <div className="generated-image-container" style={{
                  marginTop: '20px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  boxShadow: '0 0 40px rgba(168, 85, 247, 0.2)',
                  maxWidth: '800px',
                  margin: '20px auto 0'
                }}>
                  <video src={generatedVideo} controls autoPlay loop style={{ width: '100%', display: 'block' }} />
                </div>
              </motion.div>
            )}

            <div className="horizontal-scroll-section">
              <div className="section-header-row">
                <h2 className="section-title"><span className="title-highlight">Featured</span> Videos</h2>
                <span className="view-more" onClick={() => setViewAllModal({
                  isOpen: true,
                  title: 'Featured Videos',
                  items: featuredVideos,
                  renderItem: (vid, i) => (
                    <div className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer border border-white/10">
                      <video src={vid.image} loop playsInline className="w-full h-full object-cover" onMouseOver={e => e.currentTarget.play()} onMouseOut={e => {e.currentTarget.pause(); e.currentTarget.currentTime = 0;}} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl">▶</div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-4">
                        <span className="text-white font-medium">{vid.title}</span>
                      </div>
                    </div>
                  )
                })}>View More →</span>
              </div>
              <div className="horizontal-cards-scroller-container" ref={videoScrollRef}>
                <div className="horizontal-cards-scroller-track">
                  {/* Original Items */}
                  {featuredVideos.map((vid, i) => (
                    <div className="horizontal-card" key={`orig-${i}`}>
                      <video 
                        src={vid.image} 
                        loop 
                        playsInline 
                        onMouseOver={e => {
                          e.currentTarget.muted = false;
                          e.currentTarget.play().catch(err => console.error("Video play failed:", err));
                        }} 
                        onMouseOut={e => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                          e.currentTarget.muted = true; // Reset to muted
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span className="card-badge-new">New</span>
                      <div className="card-overlay-title">{vid.title}</div>
                      <div className="card-overlay-icon" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '2rem', pointerEvents: 'none' }}>▶</div>
                    </div>
                  ))}
                  {/* Duplicated Items for Loop */}
                  {featuredVideos.map((vid, i) => (
                    <div className="horizontal-card" key={`dup-${i}`}>
                      <video 
                        src={vid.image} 
                        loop 
                        playsInline 
                        onMouseOver={e => {
                          e.currentTarget.muted = false;
                          e.currentTarget.play().catch(err => console.error("Video play failed:", err));
                        }} 
                        onMouseOut={e => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                          e.currentTarget.muted = true;
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span className="card-badge-new">New</span>
                      <div className="card-overlay-title">{vid.title}</div>
                      <div className="card-overlay-icon" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '2rem', pointerEvents: 'none' }}>▶</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTool === 'Blueprints' ? (
          <motion.div
            className="blueprints-page-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Blueprints Hero */}
            <motion.div
              className="hero-banner"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                <motion.video
                  key="kling-hero"
                  className="hero-video-background"
                  autoPlay
                  muted
                  playsInline
                  loop
                  src="/videos/klingdemovid.mp4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
              <div className="banner-content">
                <h1 className="banner-title">
                  Create with Omi <ShinyText text="Studio" speed={8} className="media-studio-shiny-text" />
                </h1>
              </div>
            </motion.div>

            {/* Model Tabs */}
            <div className="category-tabs">
              {modelTabs.map((tab, index) => (
                <motion.button
                  key={tab.name}
                  className={`category-tab ${activeCategory === tab.name ? 'active' : ''}`}
                  onClick={() => setActiveCategory(tab.name)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.05), duration: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Blueprints Grid */}
            <div className="category-content" style={{ padding: '0 40px 60px' }}>
              <div className="blueprints-grid">
                {featuredBlueprints.map((bp, i) => (
                  <motion.div
                    key={i}
                    className="blueprint-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="card-image-wrapper">
                      {bp.type === 'video' ? (
                        <div style={{ position: 'absolute', inset: 0, background: bp.gradient }}>
                          <video
                            src={bp.image}
                            muted
                            loop
                            playsInline
                            className="card-image"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onMouseOver={e => e.currentTarget.play()}
                            onMouseOut={e => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                          <div className="card-gradient" />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.2rem', zIndex: 10 }}>▶</div>
                        </div>
                      ) : (
                        <>
                          <img src={bp.image} alt={bp.title} className="card-image" />
                          <div className="card-gradient" />
                        </>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{bp.title}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                        <span>By Omi Team</span>
                        <span>❤️ {Math.floor(Math.random() * 1000) + 100}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        ) : activeTool === 'Voice' ? (
          <motion.div
            className="voice-studio-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="image-studio-hero" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
              <div className="hero-background-image" style={{ overflow: 'hidden' }}>
                {/* Soundwave Animation Background */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      style={{
                        width: '4px',
                        background: 'linear-gradient(180deg, #a855f7, #ec4899)',
                        borderRadius: '2px',
                      }}
                      animate={{
                        height: [20, Math.random() * 80 + 20, 20],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(10,5,15,0.95) 100%)' }} />
              </div>

              <div className="hero-content-center">
                <h1 className="hero-large-text">Create <ShinyText text="Voice" speed={10} className="media-studio-shiny-text" /></h1>
                <div className="prompt-bar-wrapper">
                  <div className="prompt-icon">🎙️</div>
                  <input
                    type="text"
                    placeholder="Enter text to convert to speech..."
                    className="prompt-input"
                  />
                  <button className="generate-btn-small">
                    Generate
                  </button>
                </div>

                <div className="quick-tools-row">
                  {voiceStudioTools.map(t => (
                    <div className="quick-tool-item relative-container" key={t.name}>
                      <div className="quick-tool-icon-circle">{t.icon}</div>
                      <span className="quick-tool-label">{t.name}</span>
                      <div className="custom-tooltip">{t.tooltip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Voices */}
            <div className="horizontal-scroll-section">
              <div className="section-header-row">
                <h2 className="section-title"><span className="title-highlight">Featured</span> Voice Presets</h2>
                <span className="view-more" onClick={() => setViewAllModal({
                  isOpen: true,
                  title: 'Featured Voice Presets',
                  items: featuredVoices,
                  renderItem: (voice, i) => (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 hover:bg-purple-500/20 transition-colors cursor-pointer">
                      <div className="text-4xl mb-4">{voice.icon}</div>
                      <h3 className="text-white text-lg font-semibold mb-2">{voice.title}</h3>
                      <p className="text-white/60 text-sm mb-4">{voice.description}</p>
                      <button className="w-full py-2 bg-purple-500/30 border border-purple-500/50 rounded-lg text-white text-sm hover:bg-purple-500/50 transition-colors">
                        Use Voice
                      </button>
                    </div>
                  )
                })}>View More →</span>
              </div>
              <div className="voice-presets-grid" ref={voiceScrollRef}>
                {featuredVoices.map((voice, i) => (
                  <motion.div
                    key={i}
                    style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '16px',
                      padding: '24px',
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.6)' }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{voice.icon}</div>
                    <h3 style={{ color: 'white', marginBottom: '8px' }}>{voice.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{voice.description}</p>
                    <button style={{ marginTop: '16px', padding: '8px 16px', background: 'rgba(168, 85, 247, 0.3)', border: '1px solid rgba(168, 85, 247, 0.5)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                      Use Voice
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTool === 'Music' ? (
          <motion.div
            className="music-studio-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="image-studio-hero" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a0a2e 100%)' }}>
              <div className="hero-background-image" style={{ overflow: 'hidden' }}>
                {/* Waveform Animation Background */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }} viewBox="0 0 1000 200" preserveAspectRatio="none">
                  <motion.path
                    d="M0,100 Q250,20 500,100 T1000,100"
                    fill="none"
                    stroke="url(#musicGradient)"
                    strokeWidth="3"
                    animate={{
                      d: [
                        "M0,100 Q250,20 500,100 T1000,100",
                        "M0,100 Q250,180 500,100 T1000,100",
                        "M0,100 Q250,20 500,100 T1000,100",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <defs>
                    <linearGradient id="musicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(10,5,15,0.95) 100%)' }} />
              </div>

              <div className="hero-content-center">
                <h1 className="hero-large-text">Create <ShinyText text="Music" speed={10} className="media-studio-shiny-text" /></h1>
                <div className="prompt-bar-wrapper">
                  <div className="prompt-icon">🎵</div>
                  <input
                    type="text"
                    placeholder="Describe the music you want to create..."
                    className="prompt-input"
                  />
                  <button className="generate-btn-small">
                    Generate
                  </button>
                </div>

                <div className="quick-tools-row">
                  {musicStudioTools.map(t => (
                    <div className="quick-tool-item relative-container" key={t.name}>
                      <div className="quick-tool-icon-circle">{t.icon}</div>
                      <span className="quick-tool-label">{t.name}</span>
                      <div className="custom-tooltip">{t.tooltip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Music */}
            <div className="horizontal-scroll-section">
              <div className="section-header-row">
                <h2 className="section-title"><span className="title-highlight">Featured</span> Tracks</h2>
                <span className="view-more" onClick={() => setViewAllModal({
                  isOpen: true,
                  title: 'Featured Tracks',
                  items: featuredMusic,
                  renderItem: (track, i) => (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
                        {track.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{track.title}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-500/30">{track.genre}</span>
                          <span className="text-white/40">• {track.duration}</span>
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        ▶
                      </button>
                    </div>
                  )
                })}>View More →</span>
              </div>
              <div className="music-tracks-grid" ref={musicScrollRef}>
                {featuredMusic.map((track, i) => (
                  <motion.div
                    key={i}
                    className="music-track-card"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '24px',
                      padding: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      borderColor: 'rgba(168, 85, 247, 0.4)'
                    }}
                  >
                    {/* Animated Soundwave Background */}
                    <div className="soundwave-bg" style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0.1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      pointerEvents: 'none'
                    }}>
                      {[...Array(20)].map((_, j) => (
                        <motion.div
                          key={j}
                          style={{
                            width: '4px',
                            background: 'linear-gradient(180deg, #a855f7, #ec4899)',
                            borderRadius: '2px',
                          }}
                          animate={{
                            height: [10, Math.random() * 40 + 10, 10],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: j * 0.05,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>

                    {/* Hover Gradient Overlay */}
                    <div className="card-hover-gradient" style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }} />

                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)',
                      zIndex: 1,
                      position: 'relative'
                    }}>
                      {track.icon}
                      {/* Pulse Effect */}
                      <div style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                      }} />
                    </div>
                    
                    <div style={{ flex: 1, zIndex: 1 }}>
                      <h3 style={{ 
                        color: 'white', 
                        marginBottom: '6px', 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        letterSpacing: '-0.01em'
                      }}>
                        {track.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#e9d5ff', 
                          background: 'rgba(168, 85, 247, 0.15)', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          border: '1px solid rgba(168, 85, 247, 0.2)'
                        }}>
                          {track.genre}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>• {track.duration}</span>
                      </div>
                    </div>

                    <button style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '50%', 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      color: 'white', 
                      fontSize: '1rem', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      zIndex: 1
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #a855f7, #ec4899)';
                      e.currentTarget.style.border = 'none';
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(168, 85, 247, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      ▶
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* MusicFX DJ Section */}
            <div className="musicfx-section" style={{ padding: '0 40px 60px' }}>
               <div className="section-header-row" style={{ marginBottom: '20px' }}>
                <h2 className="section-title">
                  <span className="title-highlight" style={{ 
                    background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>MusicFX DJ</span> powered by Google
                </h2>
              </div>
              
              {!showMusicFX ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>
                    Experience the future of music creation
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '600px', marginBottom: '30px' }}>
                    Create your own DJ sets in real-time using Google's advanced MusicFX AI. 
                    Mix genres, instruments, and styles seamlessly.
                  </p>
                  
                  <button
                    onClick={() => setShowMusicFX(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '16px 40px',
                      borderRadius: '50px',
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <span style={{ 
                      background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '800'
                    }}>G</span> Try Now
                  </button>
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '800px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  background: '#000'
                }}>
                  <button 
                    onClick={() => setShowMusicFX(false)}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      zIndex: 10,
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    ✕
                  </button>
                  <iframe 
                    src="https://labs.google/fx/tools/music-fx-dj"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="MusicFX DJ"
                    allow="microphone; midi; encrypted-media"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTool === 'Avatars' ? (
          <motion.div
            className="avatars-studio-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="image-studio-hero" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
              <div className="hero-background-image" style={{ overflow: 'hidden' }}>
                {/* Floating circles background */}
                <div style={{ position: 'absolute', inset: 0 }}>
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      style={{
                        position: 'absolute',
                        width: `${Math.random() * 100 + 50}px`,
                        height: `${Math.random() * 100 + 50}px`,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent)`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 4 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(10,5,15,0.95) 100%)' }} />
              </div>

              <div className="hero-content-center">
                <h1 className="hero-large-text">Create <ShinyText text="Avatar" speed={10} className="media-studio-shiny-text" /></h1>
                <div className="prompt-bar-wrapper">
                  <div className="prompt-icon">👤</div>
                  <input
                    type="text"
                    placeholder="Describe your avatar..."
                    className="prompt-input"
                  />
                  <button className="generate-btn-small">
                    Generate
                  </button>
                </div>

                <div className="quick-tools-row">
                  {avatarStudioTools.map(t => (
                    <div className="quick-tool-item relative-container" key={t.name}>
                      <div className="quick-tool-icon-circle">{t.icon}</div>
                      <span className="quick-tool-label">{t.name}</span>
                      <div className="custom-tooltip">{t.tooltip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Avatars */}
            <div className="horizontal-scroll-section">
              <div className="section-header-row">
                <h2 className="section-title"><span className="title-highlight">Featured</span> Avatars</h2>
                <span className="view-more" onClick={() => setViewAllModal({
                  isOpen: true,
                  title: 'Featured Avatars',
                  items: featuredAvatars,
                  renderItem: (avatar, i) => (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-indigo-500/20 transition-colors cursor-pointer">
                      <img src={avatar.image} alt={avatar.title} className="w-24 h-24 rounded-full border-4 border-indigo-500/30 mb-4 object-cover" />
                      <h3 className="text-white font-semibold mb-2">{avatar.title}</h3>
                      <p className="text-white/60 text-sm mb-4">{avatar.description}</p>
                      <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                        Customize
                      </button>
                    </div>
                  )
                })}>View More →</span>
              </div>
              <div className="avatars-grid" ref={avatarsScrollRef}>
                {featuredAvatars.map((avatar, i) => (
                  <motion.div
                    key={i}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '20px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.03, borderColor: 'rgba(99, 102, 241, 0.6)' }}
                  >
                    <img src={avatar.image} alt={avatar.title} style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '16px', border: '3px solid rgba(99, 102, 241, 0.5)' }} />
                    <h3 style={{ color: 'white', marginBottom: '8px' }}>{avatar.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>{avatar.description}</p>
                    <button style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                      Customize
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTool === 'Assistant' ? (
          <motion.div
            className="assistant-studio-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="image-studio-hero" style={{ background: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 100%)' }}>
              <div className="hero-background-image" style={{ overflow: 'hidden' }}>
                {/* Neural network background */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }}>
                  {[...Array(20)].map((_, i) => (
                    <motion.circle
                      key={i}
                      cx={`${Math.random() * 100}%`}
                      cy={`${Math.random() * 100}%`}
                      r="4"
                      fill="#a855f7"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 2 + Math.random(),
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </svg>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(10,5,15,0.95) 100%)' }} />
              </div>

              <div className="hero-content-center">
                <h1 className="hero-large-text">Create <ShinyText text="Assistant" speed={10} className="media-studio-shiny-text" /></h1>
                <div className="prompt-bar-wrapper">
                  <div className="prompt-icon">🤖</div>
                  <input
                    type="text"
                    placeholder="Describe your AI assistant's personality..."
                    className="prompt-input"
                  />
                  <button className="generate-btn-small">
                    Create
                  </button>
                </div>

                <div className="quick-tools-row">
                  {assistantStudioTools.map(t => (
                    <div className="quick-tool-item relative-container" key={t.name}>
                      <div className="quick-tool-icon-circle">{t.icon}</div>
                      <span className="quick-tool-label">{t.name}</span>
                      <div className="custom-tooltip">{t.tooltip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Assistants */}
            <div className="horizontal-scroll-section">
              <div className="section-header-row">
                <h2 className="section-title"><span className="title-highlight">Featured</span> Assistant Templates</h2>
                <span className="view-more" onClick={() => setViewAllModal({
                  isOpen: true,
                  title: 'Featured Assistant Templates',
                  items: featuredAssistants,
                  renderItem: (assistant, i) => (
                    <div 
                      className="rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer border border-white/10"
                      style={{ background: `linear-gradient(135deg, ${assistant.color}15, ${assistant.color}25)`, borderColor: `${assistant.color}50` }}
                    >
                      <div className="text-4xl mb-4">{assistant.icon}</div>
                      <h3 className="text-white text-lg font-semibold mb-2">{assistant.title}</h3>
                      <p className="text-white/60 text-sm mb-6">{assistant.description}</p>
                      <button 
                        className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors"
                        style={{ background: assistant.color }}
                      >
                        Use Template
                      </button>
                    </div>
                  )
                })}>View More →</span>
              </div>
              <div className="assistants-grid" ref={assistantsScrollRef}>
                {featuredAssistants.map((assistant, i) => (
                  <motion.div
                    key={i}
                    style={{
                      background: `linear-gradient(135deg, ${assistant.color}15, ${assistant.color}25)`,
                      border: `1px solid ${assistant.color}50`,
                      borderRadius: '20px',
                      padding: '28px',
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${assistant.color}30` }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{assistant.icon}</div>
                    <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.2rem' }}>{assistant.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '20px' }}>{assistant.description}</p>
                    <button style={{
                      width: '100%',
                      padding: '12px',
                      background: assistant.color,
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      Use Template
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Hero Banner (Home Default) */}
            <motion.div
              className="hero-banner"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                <motion.video
                  key={heroVideos[currentVideoIndex]}
                  className="hero-video-background"
                  autoPlay
                  muted
                  playsInline
                  src={heroVideos[currentVideoIndex]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  onEnded={() => {
                    setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
                  }}
                />
              </AnimatePresence>
              <div className="banner-content">
                <h1 className="banner-title">
                  Create with Omi <ShinyText text="Studio" speed={8} className="media-studio-shiny-text" />
                </h1>
                <p className="banner-subtitle">
                  Discover 50+ ready-made workflows for effortless AI creation. All Blueprints 75% off for a limited time!
                </p>
                
                <div className="hero-actions" style={{ display: 'flex', gap: '20px', marginTop: '30px', justifyContent: 'center' }}>
                  <button 
                    className="hero-glass-btn"
                    onClick={() => setActiveTool('Image')}
                  >
                    Create <ShinyText text="Image" speed={10} className="media-studio-shiny-text" />
                  </button>
                  <button 
                    className="hero-glass-btn"
                    onClick={() => setActiveTool('Video')}
                  >
                    Create <ShinyText text="Video" speed={10} className="media-studio-shiny-text" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Category Tabs (Home Default) */}
            <div
              className="category-tabs"
            >
              {categoryTabs.map((tab, index) => (
                <motion.button
                  key={tab.name}
                  className={`category-tab ${activeCategory === tab.name ? 'active' : ''}`}
                  onClick={() => {
                    if (tab.name === 'Events') {
                      router.push('/calendar');
                      return;
                    }
                    setActiveCategory(tab.name);
                    const section = document.getElementById(tab.sectionId);
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.05), duration: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Community Creations */}
            <section id="community-section" className="community-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span style={{ color: 'white' }}>Community</span> <ShinyText text="Creations" speed={6} className="premium-gradient-text" />
                </h2>
                <button 
                  className="view-more-btn"
                  onClick={() => setViewAllModal({
                    isOpen: true,
                    title: 'Community Creations',
                    items: communityItems,
                    renderItem: (item, i) => (
                      <div className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-white/10">
                        {item.type === 'video' ? (
                          <video src={item.src} muted loop playsInline className="w-full h-full object-cover" onMouseOver={e => e.currentTarget.play()} onMouseOut={e => {e.currentTarget.pause(); e.currentTarget.currentTime = 0;}} />
                        ) : item.type === 'audio' ? (
                          <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex flex-col items-center justify-center gap-3">
                            <span className="text-4xl">🎵</span>
                            <div className="flex gap-1 items-center h-8">
                              {[...Array(5)].map((_, j) => (
                                <div key={j} className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${j * 0.1}s` }} />
                              ))}
                            </div>
                          </div>
                        ) : item.type === 'avatar' ? (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <img src={item.src} alt={item.title} className="w-20 h-20 rounded-full border-2 border-purple-500/50" />
                          </div>
                        ) : (
                          <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <span className="text-white font-medium">{item.title}</span>
                          <span className="text-white/60 text-xs">by {item.creator}</span>
                        </div>
                      </div>
                    )
                  })}
                >
                  View All <span className="arrow">→</span>
                </button>
              </div>

              <div className="community-filters">
                {communityFilters.map((filter) => (
                  <button
                    key={filter.name}
                    className={`filter-btn ${activeFilter === filter.name ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter.name)}
                  >
                    {filter.icon} {filter.name}
                  </button>
                ))}
              </div>

              {/* Scrolling Carousel */}
              <div className="infinite-scroller-container" style={{ marginTop: '24px' }}>
                <div className="infinite-scroller-track">
                  {/* Community Creations - Mix of videos and images */}
                  {(() => {
                    const allItems = [
                      { type: 'video', src: '/videos/veo1.mp4', title: 'Veo Creation', creator: 'AI Studio' },
                      { type: 'image', src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop', title: 'Cosmic Dreams', creator: 'StarGazer' },
                      { type: 'video', src: '/videos/rockbug.mp4', title: 'Nature Macro', creator: 'NatureLens' },
                      { type: 'image', src: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=400&fit=crop', title: 'Abstract Art', creator: 'PixelArtist' },
                      { type: 'video', src: '/videos/dogclimb.mp4', title: 'Adventure Dog', creator: 'PetLovers' },
                      { type: 'image', src: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&h=400&fit=crop', title: 'Neon City', creator: 'CyberPunk' },
                      { type: 'video', src: '/videos/matrixcode.mp4', title: 'Matrix Effect', creator: 'CodeArt' },
                      { type: 'image', src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop', title: 'Ocean Depths', creator: 'DeepDive' },
                      { type: 'video', src: '/videos/klingmodel.mp4', title: 'Model Showcase', creator: 'Omi Team' },
                      { type: 'image', src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=400&fit=crop', title: 'Urban Lights', creator: 'CityScape' },
                      { type: 'video', src: '/videos/veo2.mp4', title: 'Veo Magic', creator: 'AI Studio' },
                      { type: 'image', src: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=400&fit=crop', title: 'Aurora Night', creator: 'NightSky' },
                      { type: 'audio', src: '', title: 'Ambient Waves', creator: 'SoundScape' },
                      { type: 'audio', src: '', title: 'Lo-Fi Dreams', creator: 'ChillBeats' },
                      { type: 'avatar', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', title: 'Pro Avatar', creator: 'AvatarPro' },
                      { type: 'avatar', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces', title: 'Creative Avatar', creator: 'ArtStyle' },
                    ];

                    // Filter based on activeFilter
                    let filteredItems = allItems;
                    if (activeFilter === 'Video') {
                      filteredItems = allItems.filter(item => item.type === 'video');
                    } else if (activeFilter === 'Images') {
                      filteredItems = allItems.filter(item => item.type === 'image');
                    } else if (activeFilter === 'Audio') {
                      filteredItems = allItems.filter(item => item.type === 'audio');
                    } else if (activeFilter === 'Avatars') {
                      filteredItems = allItems.filter(item => item.type === 'avatar');
                    } else if (activeFilter === 'Trending') {
                      filteredItems = allItems.slice(0, 6);
                    }

                    // Duplicate for infinite scroll
                    const displayItems = [...filteredItems, ...filteredItems];

                    return displayItems.map((item, i) => (
                      <div className="horizontal-card community-card" key={`item-${i}`}>
                        {item.type === 'video' ? (
                          <video
                            src={item.src}
                            muted
                            loop
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onMouseOver={e => e.currentTarget.play()}
                            onMouseOut={e => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                        ) : item.type === 'audio' ? (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #22c55e20, #3b82f620)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                          }}>
                            <span style={{ fontSize: '3rem' }}>🎵</span>
                            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                              {[...Array(12)].map((_, j) => (
                                <div key={j} style={{
                                  width: '3px',
                                  height: `${Math.random() * 30 + 10}px`,
                                  background: 'linear-gradient(180deg, #22c55e, #3b82f6)',
                                  borderRadius: '2px'
                                }} />
                              ))}
                            </div>
                          </div>
                        ) : item.type === 'avatar' ? (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #8b5cf620, #ec489920)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img
                              src={item.src}
                              alt={item.title}
                              style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                border: '3px solid rgba(139, 92, 246, 0.5)'
                              }}
                            />
                          </div>
                        ) : (
                          <img src={item.src} alt={item.title} />
                        )}
                        <div className="card-overlay-title">{item.title}</div>
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '10px',
                          fontSize: '0.7rem',
                          color: 'rgba(255,255,255,0.6)',
                          background: 'rgba(0,0,0,0.5)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          by {item.creator}
                        </div>
                        {item.type === 'video' && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            fontSize: '1rem',
                            background: 'rgba(168, 85, 247, 0.8)',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}>
                            ▶
                          </div>
                        )}
                        {item.type === 'audio' && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            fontSize: '0.8rem',
                            background: 'rgba(34, 197, 94, 0.8)',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}>
                            🎵
                          </div>
                        )}
                        {item.type === 'avatar' && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            fontSize: '0.8rem',
                            background: 'rgba(139, 92, 246, 0.8)',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}>
                            👤
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </section>

            {/* Spotlight Section */}
            <section id="spotlight-section" className="spotlight-section" style={{ padding: '40px' }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span style={{ color: 'white' }}>Spotlighted</span> <ShinyText text="Models & Partners" speed={6} className="premium-gradient-text" />
                </h2>
                <button 
                  className="view-more-btn"
                  onClick={() => setViewAllModal({
                    isOpen: true,
                    title: 'Spotlighted Models & Partners',
                    items: spotlightItems,
                    renderItem: (item, i) => (
                      <div 
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer flex flex-col gap-4"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <div className="h-32 bg-black rounded-xl overflow-hidden flex items-center justify-center text-5xl">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-white text-lg font-semibold mb-2">{item.name}</h3>
                          <p className="text-white/60 text-sm">{item.description}</p>
                        </div>
                      </div>
                    )
                  })}
                >
                  View All <span className="arrow">→</span>
                </button>
              </div>

              <div className="spotlight-grid" ref={spotlightScrollRef}>
                {spotlightItems.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSpotlightUrl(item.url)}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                  >
                    <div style={{ height: '160px', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem' }}>{item.icon}</span>
                    </div>
                    <div>
                      <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '8px' }}>{item.name}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>



            {/* Models Section */}
            <section id="models-section" className="models-section" style={{ padding: '60px 40px' }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span style={{ color: 'white' }}>AI</span> <ShinyText text="Models" speed={6} className="premium-gradient-text" />
                </h2>
                <button 
                  className="view-more-btn"
                  onClick={() => setViewAllModal({
                    isOpen: true,
                    title: 'AI Models',
                    items: aiModelsItems,
                    renderItem: (model, i) => (
                      <div 
                        className="bg-transparent border rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-transform"
                        style={{ borderColor: model.color }}
                        onClick={() => {
                          if (model.type === 'video') {
                            setActiveTool('Video');
                          } else {
                            setActiveTool('Image');
                            setSelectedModel(model.name);
                          }
                          setViewAllModal(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl p-3 rounded-xl border" style={{ borderColor: `${model.color}40` }}>
                            {model.icon}
                          </div>
                          <div>
                            <h3 className="text-white text-lg font-semibold">{model.name}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 rounded border" style={{ borderColor: `${model.color}60`, color: model.color }}>
                                {model.speed}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded border" style={{ 
                                borderColor: model.type === 'video' ? 'rgba(168, 85, 247, 0.6)' : 'rgba(59, 130, 246, 0.6)',
                                color: model.type === 'video' ? '#a855f7' : '#3b82f6'
                              }}>
                                {model.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/60 text-sm mb-4">{model.description}</p>
                        <button className="w-full py-2 rounded-lg text-white text-sm font-medium" style={{ background: `${model.color}25`, border: `1px solid ${model.color}50` }}>
                          Try Model
                        </button>
                      </div>
                    )
                  })}
                >
                  View All <span className="arrow">→</span>
                </button>
              </div>

              <div className="models-grid" ref={modelsScrollRef}>
                {aiModelsItems.map((model, i) => (
                  <motion.div
                    key={i}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${model.color}`,
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${model.color}40` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        fontSize: '2.5rem',
                        background: 'transparent',
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${model.color}40`
                      }}>
                        {model.icon}
                      </div>
                      <div>
                        <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '4px' }}>{model.name}</h3>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            background: 'transparent',
                            border: `1px solid ${model.color}60`,
                            color: model.color,
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {model.speed}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            background: 'transparent',
                            border: model.type === 'video' ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(59, 130, 246, 0.6)',
                            color: model.type === 'video' ? '#a855f7' : '#3b82f6',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {model.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '16px' }}>
                      {model.description}
                    </p>
                    <button
                      onClick={() => {
                        if (model.type === 'video') {
                          setActiveTool('Video');
                          // Pre-select the model if applicable
                        } else {
                          setActiveTool('Image');
                          setSelectedModel(model.name);
                        }
                        // Scroll to top
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: `${model.color}25`,
                        border: `1px solid ${model.color}50`,
                        borderRadius: '10px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Try Model
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Events Section */}
            <section id="events-section" className="events-section" style={{ padding: '60px 40px', marginBottom: '40px' }}>
              <div className="section-header">
                <h2 className="section-title">
                  <span style={{ color: 'white' }}>Upcoming</span> <ShinyText text="Events" speed={6} className="premium-gradient-text" />
                </h2>
                <button 
                  className="view-more-btn"
                  onClick={() => router.push('/calendar')}
                >
                  View Calendar <span className="arrow">→</span>
                </button>
              </div>

              <div className="events-grid">
                {[
                  {
                    title: 'AI Art Challenge',
                    date: 'Dec 20, 2024',
                    time: '2:00 PM PST',
                    description: 'Weekly community art challenge with prizes',
                    type: 'Challenge',
                    color: '#f59e0b',
                    live: true
                  },
                  {
                    title: 'Prompt Engineering Workshop',
                    date: 'Dec 22, 2024',
                    time: '10:00 AM PST',
                    description: 'Learn advanced prompting techniques',
                    type: 'Workshop',
                    color: '#3b82f6',
                    live: false
                  },
                  {
                    title: 'New Model Launch: Flux Pro',
                    date: 'Dec 28, 2024',
                    time: '5:00 PM PST',
                    description: 'Be the first to try our latest model',
                    type: 'Launch',
                    color: '#8b5cf6',
                    live: false
                  },
                  {
                    title: 'Community Showcase',
                    date: 'Jan 5, 2025',
                    time: '3:00 PM PST',
                    description: 'Top creators share their workflows',
                    type: 'Showcase',
                    color: '#22c55e',
                    live: false
                  },
                ].map((event, i) => (
                  <motion.div
                    key={i}
                    onClick={() => router.push('/calendar')}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    whileHover={{ scale: 1.02, borderColor: event.color }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {event.live && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <span className="live-dot" />
                        LIVE
                      </div>
                    )}
                    <div style={{
                      display: 'inline-block',
                      background: `${event.color}20`,
                      color: event.color,
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}>
                      {event.type}
                    </div>
                    <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '8px' }}>{event.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '16px' }}>
                      {event.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.85rem'
                    }}>
                      <span>📅 {event.date}</span>
                      <span>⏰ {event.time}</span>
                    </div>
                    <button style={{
                      width: '100%',
                      marginTop: '20px',
                      padding: '12px',
                      background: event.live ? 'transparent' : 'rgba(255,255,255,0.1)',
                      border: event.live ? '1px solid #a855f7' : 'none',
                      borderRadius: '10px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      {event.live ? 'Join Now' : 'Set Reminder'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>


          </>
        )}
      </motion.div>

      {/* Spotlight Iframe Modal */}
      <AnimatePresence>
        {spotlightUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px' // Mobile optimized padding
            }}
            onClick={() => setSpotlightUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '1400px',
                background: '#000',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Modal Header / Toolbar */}
              <div style={{
                height: '50px',
                background: '#111',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
                  External Content
                </span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => window.open(spotlightUrl, '_blank')}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    Open in New Tab ↗
                  </button>
                  <button
                    onClick={() => setSpotlightUrl(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                      marginLeft: '10px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, position: 'relative', background: '#000' }}>
                <iframe
                  src={spotlightUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Spotlight Content"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View All Modal */}
      {viewAllModal && (
        <ViewAllModal
          isOpen={viewAllModal.isOpen}
          onClose={() => setViewAllModal(null)}
          title={viewAllModal.title}
          items={viewAllModal.items}
          renderItem={viewAllModal.renderItem}
        />
      )}
    </motion.div>
  );
}
