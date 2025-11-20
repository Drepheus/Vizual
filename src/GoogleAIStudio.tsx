"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { LiquidChrome } from './LiquidChrome';

interface GoogleAIStudioProps {
  onClose?: () => void;
}

const studioTools = [
  {
    name: 'Flow',
    description: 'Create dynamic visual stories with AI-powered flow generation',
    url: 'https://labs.google/fx/tools/flow',
    icon: '🌊',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  {
    name: 'MusicFx DJ',
    description: 'Generate unique music mixes and soundscapes with AI',
    url: 'https://labs.google/fx/tools/music-fx-dj',
    icon: '🎵',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  {
    name: 'ImageFx',
    description: 'Transform and generate images with advanced AI models',
    url: 'https://labs.google/fx/tools/image-fx',
    icon: '🎨',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  {
    name: 'Whisk',
    description: 'Blend creative concepts and ideas into unique outputs',
    url: 'https://labs.google/fx/tools/whisk',
    icon: '✨',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
  {
    name: 'Project Mariner',
    description: 'Navigate and explore AI-powered research and experimentation',
    url: 'https://labs.google.com/mariner/landing?utm_source=ai.google&utm_medium=referral',
    icon: '⛵',
    gradient: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
    color: '#4285F4'
  },
  {
    name: 'Antigravity',
    description: 'Defy conventional design with AI-powered creative tools',
    url: 'https://antigravity.google/?utm_source=ai.google&utm_medium=referral',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #EA4335 0%, #FBBC04 100%)',
    color: '#EA4335'
  },
  {
    name: 'Gemma',
    description: 'Open-source lightweight language model for AI development',
    url: 'https://deepmind.google/models/gemma/?utm_source=ai.google&utm_medium=referral',
    icon: '💎',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    color: '#a8edea'
  },
  {
    name: 'Lyria',
    description: 'Advanced AI model for creative music generation',
    url: 'https://deepmind.google/models/lyria/?utm_source=ai.google&utm_medium=referral',
    icon: '🎼',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    color: '#ff9a9e'
  },
  {
    name: 'Jules',
    description: 'AI-powered code assistant for developers',
    url: 'https://jules.google.com/',
    icon: '👨‍💻',
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    color: '#a1c4fd'
  },
  {
    name: 'Pomelli',
    description: 'Experiment with AI-driven creative workflows',
    url: 'https://labs.google.com/pomelli/about/',
    icon: '🍎',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    color: '#ffecd2'
  },
  {
    name: 'Mixboard',
    description: 'Create and mix audio content with AI assistance',
    url: 'https://labs.google.com/mixboard/welcome',
    icon: '🎚️',
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    color: '#d299c2'
  },
  {
    name: 'Opal',
    description: 'AI-powered design and prototyping platform',
    url: 'https://opal.google/landing/?source=labs',
    icon: '💠',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    color: '#89f7fe'
  },
  {
    name: 'Stax',
    description: 'Build and manage AI-driven creative projects',
    url: 'https://stax.withgoogle.com/projects',
    icon: '📚',
    gradient: 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
    color: '#fdcbf1'
  },
  {
    name: 'Stitch',
    description: 'Connect and combine AI models for unique outputs',
    url: 'https://stitch.withgoogle.com/',
    icon: '🧵',
    gradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    color: '#ffeaa7'
  },
  {
    name: 'Sparkify',
    description: 'Discover and explore AI-generated creative content',
    url: 'https://sparkify.withgoogle.com/explore',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #fab2ff 0%, #1904e5 100%)',
    color: '#fab2ff'
  },
  {
    name: 'Colab',
    description: 'Cloud-based Jupyter notebook for machine learning',
    url: 'https://colab.research.google.com/',
    icon: '📓',
    gradient: 'linear-gradient(135deg, #F9A825 0%, #F57F17 100%)',
    color: '#F9A825'
  },
  {
    name: 'NotebookLM',
    description: 'AI-powered research and note-taking assistant',
    url: 'https://notebooklm.google/',
    icon: '📔',
    gradient: 'linear-gradient(135deg, #4285F4 0%, #EA4335 100%)',
    color: '#4285F4'
  },
  {
    name: 'Project Astra',
    description: 'Advanced multimodal AI agent for everyday tasks',
    url: 'https://deepmind.google/models/project-astra/',
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #34A853 0%, #FBBC04 100%)',
    color: '#34A853'
  },
  {
    name: 'TextFX',
    description: 'AI-powered text generation and manipulation tools',
    url: 'https://textfx.withgoogle.com/',
    icon: '✍️',
    gradient: 'linear-gradient(135deg, #FBBC04 0%, #EA4335 100%)',
    color: '#FBBC04'
  },
  {
    name: 'Genie 3',
    description: 'A new frontier for world models',
    url: 'https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/',
    icon: '🧞',
    gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
    color: '#8E2DE2'
  },
  {
    name: 'AlphaGo',
    description: 'The first computer program to defeat a professional human Go player',
    url: 'https://deepmind.google/research/alphago/',
    icon: '⚫',
    gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
    color: '#00b09b'
  },
  {
    name: 'SIMA 2',
    description: 'An agent that plays, reasons, and learns with you in virtual 3D worlds',
    url: 'https://deepmind.google/blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/',
    icon: '🎮',
    gradient: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)',
    color: '#ff00cc'
  },
  {
    name: 'Doppl',
    description: 'Explore and create with AI-powered digital twins',
    url: 'https://labs.google/doppl',
    icon: '👥',
    gradient: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
    color: '#FF512F'
  },
  {
    name: 'Firebase Studio',
    description: 'Build, test, and deploy AI-powered apps with Firebase',
    url: 'https://firebase.studio/',
    icon: '🔥',
    gradient: 'linear-gradient(135deg, #FFCA28 0%, #FF6F00 100%)',
    color: '#FFCA28'
  }
];

const recentSearches = [
  { query: 'Latest AI advancements 2024', mode: 'Deep Research', timestamp: '2 hours ago' },
  { query: 'Machine learning frameworks comparison', mode: 'Quick Search', timestamp: '5 hours ago' },
  { query: 'Neural network architectures', mode: 'Deep Research', timestamp: '1 day ago' },
  { query: 'Natural language processing trends', mode: 'Quick Search', timestamp: '2 days ago' },
  { query: 'Computer vision applications', mode: 'Deep Research', timestamp: '3 days ago' },
];

export default function GoogleAIStudio({ onClose }: GoogleAIStudioProps) {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
      .fromTo(".studio-tool-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: "power2.out" },
        "-=0.5"
      );

    return () => {
      tl.kill();
    };
  }, []);

  const handleToolClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/command-hub');
    }
  };

  return (
    <div className="google-studio-page" ref={containerRef}>
      <div className="studio-background">
        <div className="studio-gradient-orb studio-orb-1"></div>
        <div className="studio-gradient-orb studio-orb-2"></div>
        <div className="studio-gradient-orb studio-orb-3"></div>
        <div className="studio-gradient-orb studio-orb-4"></div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="studio-mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span className="mobile-toggle-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
      </button>

      {/* Vertex AI Sidebar */}
      <div className={`studio-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">◆</span>
            {!sidebarCollapsed && <span className="logo-text">Vertex AI</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <div className="sidebar-nav">
          <button className="sidebar-item active">
            <span className="sidebar-icon">🏠</span>
            {!sidebarCollapsed && <span className="sidebar-label">Home</span>}
          </button>
          <button className="sidebar-item" onClick={() => router.push('/google-ai')}>
            <span className="sidebar-icon">🤖</span>
            {!sidebarCollapsed && <span className="sidebar-label">Google AI</span>}
          </button>
          <button className="sidebar-item" onClick={() => router.push('/gemini')}>
            <span className="sidebar-icon">💎</span>
            {!sidebarCollapsed && <span className="sidebar-label">Gemini</span>}
          </button>
          <button className="sidebar-item">
            <span className="sidebar-icon">🧠</span>
            {!sidebarCollapsed && <span className="sidebar-label">DeepMind</span>}
          </button>
          <button className="sidebar-item" onClick={() => router.push('/veo')}>
            <span className="sidebar-icon">🎬</span>
            {!sidebarCollapsed && <span className="sidebar-label">Veo</span>}
          </button>
          <button className="sidebar-item" onClick={() => router.push('/code-assist')}>
            <span className="sidebar-icon">💻</span>
            {!sidebarCollapsed && <span className="sidebar-label">Code Assist</span>}
          </button>
        </div>
      </div>

      {/* Recent Searches Sidebar */}
      <div className="search-history-sidebar">
        <div className="search-sidebar-header">
          <div className="search-sidebar-title">
            <span className="search-sidebar-icon">🕐</span>
            <span className="search-sidebar-text">Recent Searches</span>
          </div>
        </div>

        <div className="search-history-list">
          {recentSearches.map((search, index) => (
            <button key={index} className="search-history-item">
              <div className="search-history-query">{search.query}</div>
              <div className="search-history-meta">
                <span className="search-history-mode">{search.mode}</span>
                <span className="search-history-dot">•</span>
                <span className="search-history-time">{search.timestamp}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="search-sidebar-footer">
          <button className="search-clear-history">
            <span>Clear History</span>
          </button>
        </div>
      </div>

      <button className="studio-close-btn" onClick={handleClose}>
        <span className="studio-back-arrow">←</span> Command Hub
      </button>

      <div className="studio-container">
        <div className="studio-hero" ref={heroRef}>
          <h1 className="studio-main-title">
            Get started with <span className="studio-google-text">Google</span> <span className="studio-labs-text">Labs</span>
          </h1>
          <p className="studio-hero-description">
            Google Labs empowers creators, developers, and innovators to explore the cutting edge of AI.
            Experiment with generative models and transform your creative projects from ideation to deployment.{' '}
            <a href="https://labs.google" target="_blank" rel="noopener noreferrer" className="studio-learn-more">
              Learn more about Google Labs
            </a>
          </p>

          <div className="labs-buttons-group">
            <button className="labs-btn" onClick={() => window.open('https://labs.google/', '_blank')}>
              <span className="labs-icon">🧪</span>
              Explore the Google Labs
            </button>
            <button className="labs-btn" onClick={() => window.open('https://labs.google/fx', '_blank')}>
              <span className="labs-icon">✨</span>
              Explore Labs FX
            </button>
          </div>
        </div>

        <div className="studio-section">
          <div className="studio-tools-grid" ref={gridRef}>
            {studioTools.map((tool) => (
              <div
                key={tool.name}
                className={`studio-tool-card ${hoveredTool === tool.name ? 'hovered' : ''}`}
                onClick={() => handleToolClick(tool.url)}
                onMouseEnter={() => setHoveredTool(tool.name)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className="tool-card-glow" style={{ background: tool.gradient }}></div>

                <div className="tool-card-header">
                  <div className="tool-icon-wrapper">
                    <div className="tool-icon" style={{ color: tool.color }}>
                      {tool.icon}
                    </div>
                  </div>
                </div>

                <div className="tool-card-body">
                  <h3 className="tool-name">{tool.name}</h3>
                  <p className="tool-description">{tool.description}</p>
                </div>

                <div className="tool-card-footer">
                  <button className="tool-launch-btn">
                    <span>Try now</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="tool-card-border"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="studio-tutorials-section">
          <div className="tutorials-header">
            <h2 className="tutorials-title">Tutorials</h2>
            <p className="tutorials-subtitle">Learn how to use generative AI and explore advanced features</p>
          </div>
          <button className="view-tutorials-btn">
            <span className="tutorials-icon">📚</span>
            View tutorials
          </button>
        </div>

        <div className="studio-footer">
          <p className="studio-footer-text">
            Powered by <span className="gemini-badge"> Gemini</span> | Explore responsibly with Google AI
          </p>
        </div>
      </div>
    </div>
  );
}
