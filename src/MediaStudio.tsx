import { useState } from 'react';
import './MediaStudio.css';
import DomeGallery from './DomeGallery';
import ShinyText from './ShinyText';

interface MediaStudioProps {
  onClose?: () => void;
}

const sidebarTools = [
  { name: 'Home', icon: '🏠', section: 'main' },
  { name: 'Library', icon: '📚', section: 'main' },
  { name: 'Image', icon: '🖼️', section: 'AI Tools' },
  { name: 'Video', icon: '🎬', section: 'AI Tools' },
  { name: 'Blueprints', icon: '⚡', section: 'AI Tools', badge: 'Beta' },
  { name: 'Flow State', icon: '∞', section: 'AI Tools' },
  { name: 'Realtime Canvas', icon: '🎨', section: 'AI Tools' },
  { name: 'Realtime Generation', icon: '✨', section: 'AI Tools' },
  { name: 'Canvas Editor', icon: '🖌️', section: 'AI Tools' },
  { name: 'Universal Upscaler', icon: '📐', section: 'AI Tools' },
  { name: 'Models & Training', icon: '🧠', section: 'Advanced' },
  { name: 'Texture Generation', icon: '🌟', section: 'Advanced', badge: 'Alpha' },
];

const categoryTabs = [
  { name: 'Blueprints', icon: '⚡' },
  { name: 'Flow State', icon: '∞' },
  { name: 'Video', icon: '🎬' },
  { name: 'Image', icon: '🖼️' },
  { name: 'Upscaler', icon: '📐' },
  { name: 'Canvas Editor', icon: '🖌️' },
  { name: 'More', icon: '✨' },
];

const featuredBlueprints = [
  { 
    title: 'Amber Haze Portrait', 
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop', 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
  },
  { 
    title: 'Dreamy Polaroid Portrait', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', 
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
  },
  { 
    title: 'Tuscan Cinematic Video Portrait', 
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop', 
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' 
  },
  { 
    title: 'Blue Room Video Portrait', 
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop', 
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
  },
  { 
    title: 'Halloween Party', 
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop', 
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' 
  },
  { 
    title: 'Indie Garden Polaroid', 
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=600&fit=crop', 
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
  },
  { 
    title: 'Bold Fisheye Portrait', 
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop', 
    gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' 
  },
];

const communityFilters = [
  { name: 'Trending', icon: '🔥' },
  { name: 'All', icon: '🎯' },
  { name: 'Video', icon: '🎬' },
  { name: 'Photography', icon: '📷' },
  { name: 'Animals', icon: '🐾' },
  { name: 'Anime', icon: '⭐' },
  { name: 'Architecture', icon: '🏛️' },
  { name: 'Character', icon: '👤' },
  { name: 'Food', icon: '🍔' },
  { name: 'Sci-Fi', icon: '🚀' },
];

export default function MediaStudio({ onClose }: MediaStudioProps) {
  const [activeCategory, setActiveCategory] = useState('Blueprints');
  const [activeFilter, setActiveFilter] = useState('Trending');
  const [activeTool, setActiveTool] = useState('Blueprints');

  return (
    <div className="media-studio-page">
      {/* Left Sidebar */}
      <div className="media-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-avatar">✨</span>
            <div className="logo-user">
              <span className="user-name">Omi.AI</span>
              <button className="user-dropdown">▼</button>
            </div>
          </div>
          <div className="sidebar-credits">
            <span className="credits-icon">⚡</span>
            <span className="credits-value">150</span>
            <button className="upgrade-btn">Upgrade</button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarTools.map((tool, index) => (
            <div key={index}>
              {tool.section && index > 0 && sidebarTools[index - 1].section !== tool.section && (
                <div className="nav-section-title">{tool.section}</div>
              )}
              <button 
                className={`sidebar-item ${activeTool === tool.name ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.name)}
              >
                <span className="sidebar-icon">{tool.icon}</span>
                <span className="sidebar-label">{tool.name}</span>
                {tool.badge && <span className="tool-badge">{tool.badge}</span>}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item">
            <span className="sidebar-icon">🆕</span>
            <span className="sidebar-label">What's New</span>
          </button>
        </div>
      </div>

      <div className="media-main-content">
        <button className="close-btn" onClick={onClose}>✕</button>

        {/* Hero Banner */}
        <div className="hero-banner">
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h1 className="banner-title">
              Create with Omi <span className="highlight-text"><ShinyText text="Blueprints" speed={3} /></span>
            </h1>
            <p className="banner-subtitle">
              Discover 50+ ready-made workflows for effortless AI creation. All Blueprints 75% off for a limited time!
            </p>
            <button className="banner-cta">Explore Blueprints</button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categoryTabs.map((tab) => (
            <button
              key={tab.name}
              className={`category-tab ${activeCategory === tab.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(tab.name)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Featured Blueprints */}
        <section className="featured-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-highlight"><ShinyText text="Featured" speed={4} /></span> Blueprints
            </h2>
            <button className="view-more-btn">
              View More <span className="arrow">→</span>
            </button>
          </div>

          <div className="dome-gallery-container">
            <DomeGallery
              images={featuredBlueprints.map(bp => ({ src: bp.image, alt: bp.title }))}
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
      </div>
    </div>
  );
}
