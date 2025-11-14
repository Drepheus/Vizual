import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GoogleAIStudio.css';

interface GoogleAIStudioProps {
  onClose?: () => void;
}

const studioTools = [
  {
    name: 'Flow',
    description: 'Create dynamic visual stories with AI-powered flow generation',
    url: 'https://labs.google/fx/tools/flow',
    icon: '',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  {
    name: 'MusicFx DJ',
    description: 'Generate unique music mixes and soundscapes with AI',
    url: 'https://labs.google/fx/tools/music-fx-dj',
    icon: '',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  {
    name: 'ImageFx',
    description: 'Transform and generate images with advanced AI models',
    url: 'https://labs.google/fx/tools/image-fx',
    icon: '',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  {
    name: 'Whisk',
    description: 'Blend creative concepts and ideas into unique outputs',
    url: 'https://labs.google/fx/tools/whisk',
    icon: '',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
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
  const navigate = useNavigate();

  const handleToolClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/command-hub');
    }
  };

  return (
    <div className="google-studio-page">
      <div className="studio-background">
        <div className="studio-gradient-orb studio-orb-1"></div>
        <div className="studio-gradient-orb studio-orb-2"></div>
        <div className="studio-gradient-orb studio-orb-3"></div>
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
        ✕
      </button>

      <div className="studio-container">
        <div className="studio-hero">
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
          
          <button className="studio-enable-btn">
            <span className="enable-btn-icon"></span>
            Enable all recommended tools
          </button>
        </div>

        <div className="studio-section">
          <div className="studio-tools-grid">
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
                      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            <span className="tutorials-icon"></span>
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
