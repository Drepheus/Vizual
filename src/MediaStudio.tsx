"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DomeGallery from './DomeGallery';
import LogoLoop from './LogoLoop';
import { ShinyText } from '@/components/typography/shiny-text';
import './MediaStudio.css';

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
  { name: 'Flow State', icon: '∞', section: 'AI Tools' },
  { name: 'Realtime Canvas', icon: '⚡', section: 'AI Tools' },
  { name: 'Realtime Generation', icon: '✨', section: 'AI Tools' },
  { name: 'Canvas Editor', icon: '🖼️', section: 'AI Tools' },
  { name: 'Universal Upscaler', icon: '🔍', section: 'AI Tools' },
  { name: 'Models & Training', icon: '🧠', section: 'Advanced' },
  { name: 'Texture Generation', icon: '🎭', section: 'Advanced', badge: 'Alpha' },
];

const categoryTabs = [
  { name: 'Blueprints', icon: '📋' },
  { name: 'Flow State', icon: '∞' },
  { name: 'Video', icon: '🎬' },
  { name: 'Image', icon: '🎨' },
  { name: 'Upscaler', icon: '🔍' },
  { name: 'Canvas Editor', icon: '🖼️' },
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
  { name: 'Trending', icon: '🔥' },
  { name: 'All', icon: '🌐' },
  { name: 'Video', icon: '🎬' },
  { name: 'Photography', icon: '📷' },
  { name: 'Animals', icon: '🦁' },
  { name: 'Anime', icon: '🎌' },
  { name: 'Architecture', icon: '🏛️' },
  { name: 'Character', icon: '👤' },
  { name: 'Food', icon: '🍕' },
  { name: 'Sci-Fi', icon: '🚀' },
];

export default function MediaStudio({ onClose }: MediaStudioProps) {
  /* Existing state */
  const [activeCategory, setActiveCategory] = useState('Blueprints');
  const [activeFilter, setActiveFilter] = useState('Trending');
  const [activeTool, setActiveTool] = useState('Home');
  const [showPaywall, setShowPaywall] = useState(false);
  const { user } = useAuth();

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

  /* Video Hero State */
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const heroVideos = [
    '/videos/modelsvidspol.mp4',
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

  const quickTools = [
    { name: 'Image', icon: '🖼️' },
    { name: 'Video', icon: '🎬' },
    { name: 'Blueprints', icon: '✨', badge: 'NEW' },
    { name: 'Flow State', icon: '∞' },
    { name: 'Upscaler', icon: '🔍' },
    { name: 'Canvas', icon: '🎨' },
    { name: 'Draw', icon: '✏️' },
  ];

  const holidayBlueprints = [
    { title: 'Bauble Macro Portrait', image: 'https://images.unsplash.com/photo-1606830733403-ad01843b23d9?w=400&h=400&fit=crop' },
    { title: 'Pet Christmas Portrait', image: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=400&h=400&fit=crop' },
    { title: 'Holiday Portrait Reindeer', image: 'https://images.unsplash.com/photo-1482638167565-e752496a7a0e?w=400&h=400&fit=crop' },
    { title: 'Northern Lights Portrait', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=400&fit=crop' },
    { title: "Santa's Gift Drop", image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=400&fit=crop' },
    { title: 'Festive Retail Scene', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcf8?w=400&h=400&fit=crop' },
    { title: 'Place Person In Scene', image: 'https://images.unsplash.com/photo-1515488042361-25e6b80dd0e6?w=400&h=400&fit=crop' },
    { title: 'Background Change', image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=400&fit=crop' },
  ];

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

      {/* Left Sidebar */}
      <div className="media-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-avatar">👤</span>
            <div className="logo-user">
              <span className="user-name">Omi.AI</span>
              <button className="user-dropdown">▼</button>
            </div>
          </div>
          <div className="sidebar-credits">
            <span className="credits-icon">⚡</span>
            <span className="credits-value">150</span>
            <button
              className="upgrade-btn"
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
              {tool.name === 'Library' && (
                <div style={{ padding: '0 12px 8px', display: 'flex' }}>
                  <button
                    className="sidebar-upgrade-btn-large"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                    }}
                    onClick={() => setShowPaywall(true)}
                  >
                    🚀 Upgrade Plan
                  </button>
                </div>
              )}
              <button
                className={`sidebar-item ${activeTool === tool.name ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.name)}
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
        <motion.button
          className="close-btn"
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          ✕
        </motion.button>

        {/* Conditional Rendering for Main Content */}
        {activeTool === 'Library' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: '40px', height: '100%' }}
          >
            <h2 className="section-title" style={{ marginBottom: '30px' }}>
              <span className="title-highlight">My</span> Library
            </h2>
            <div className="dome-gallery-container" style={{ height: 'calc(100vh - 120px)' }}>
              {/* Using featured blueprints as a placeholder for user library for now */}
              <DomeGallery
                images={featuredBlueprints.map(bp => ({ src: bp.image, alt: bp.title, type: bp.type as 'image' | 'video' | undefined }))}
                fit={0.5}
                minRadius={500}
                maxRadius={800}
                segments={30}
                dragDampening={5}
                overlayBlurColor="#0a0a0a"
                imageBorderRadius="30px"
                openedImageBorderRadius="30px"
                grayscale={false}
              />
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
                  {quickTools.map(t => (
                    <div className="quick-tool-item" key={t.name}>
                      <div className="quick-tool-icon-circle">
                        {t.icon}
                        {t.badge && <span className="tool-badge-floating">{t.badge}</span>}
                      </div>
                      <span className="quick-tool-label">{t.name}</span>
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
                <span className="view-more">View More →</span>
              </div>
              <div className="horizontal-cards-scroller">
                {holidayBlueprints.map((bp, i) => (
                  <div className="horizontal-card" key={i}>
                    <img src={bp.image} alt={bp.title} />
                    <span className="card-badge-new">New</span>
                    <div className="card-overlay-title">{bp.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Hero Banner */}
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
              </div>
            </motion.div>

            {/* Category Tabs */}
            <div
              className="category-tabs"
            >
              {categoryTabs.map((tab, index) => (
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

            {/* Featured Blueprints */}
            <section className="featured-section">
              <div
                className="section-header"
              >
                <h2 className="section-title">
                  <span className="title-highlight"><ShinyText text="Featured" speed={10} /></span> Blueprints
                </h2>
                <button className="view-more-btn">
                  View More <span className="arrow">→</span>
                </button>
              </div>

              <div className="dome-gallery-container">
                <DomeGallery
                  images={featuredBlueprints.map(bp => ({ src: bp.image, alt: bp.title, type: bp.type as 'image' | 'video' | undefined }))}
                  fit={0.5}
                  minRadius={500}
                  maxRadius={800}
                  segments={15}
                  dragDampening={5}
                  overlayBlurColor="#0a0a0a"
                  imageBorderRadius="30px"
                  openedImageBorderRadius="30px"
                  grayscale={false}
                />
              </div>
            </section>

            {/* Community Creations */}
            <section className="community-section">
              <h2 className="section-title">
                <span className="title-highlight">Community</span> Creations
              </h2>

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

              <div className="community-grid">
                {/* Placeholder for community content */}
                <p className="coming-soon">Community creations coming soon...</p>
              </div>
            </section>
          </>
        )}
      </motion.div>
    </motion.div >
  );
}
