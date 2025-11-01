import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './WebSearch.css';

interface WebSearchProps {
  onClose?: () => void;
}

const WebSearch: React.FC<WebSearchProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Featured search categories
  const searchCategories = [
    {
      icon: '◈',
      title: 'Quick Search',
      description: 'Get instant AI-powered results',
      gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(128, 128, 128, 0.1))'
    },
    {
      icon: '◇',
      title: 'Deep Research',
      description: 'Comprehensive analysis and insights',
      gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.12), rgba(128, 128, 128, 0.08))'
    },
    {
      icon: '◆',
      title: 'News & Trends',
      description: 'Latest updates and breaking stories',
      gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(128, 128, 128, 0.06))'
    },
    {
      icon: '⚡',
      title: 'Tech & Science',
      description: 'Discoveries and innovations',
      gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.08), rgba(128, 128, 128, 0.04))'
    }
  ];

  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }

    if (searchBoxRef.current) {
      gsap.fromTo(
        searchBoxRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.4)' }
      );
    }

    // Animate category cards
    const cards = document.querySelectorAll('.search-category-card');
    gsap.fromTo(
      cards,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
    );
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // TODO: Implement actual web search API call
    console.log('Searching for:', searchQuery);
    
    // Simulate search
    setTimeout(() => {
      setIsSearching(false);
      alert(`Search feature coming soon! Query: ${searchQuery}`);
    }, 1500);
  };

  const handleCategoryClick = (category: string) => {
    console.log('Category clicked:', category);
    // TODO: Implement category-specific search
  };

  return (
    <div className="websearch-container" ref={containerRef}>
      {/* Close button */}
      <button 
        className="websearch-close"
        onClick={onClose}
        title="Back"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="websearch-header">
        <div className="websearch-icon-wrapper">
          <div className="websearch-icon">🌐</div>
          <div className="icon-glow"></div>
        </div>
        <h1 className="websearch-title">Web Search</h1>
        <p className="websearch-subtitle">Search that thinks. Navigate the web like intelligence, not keywords.</p>
      </div>

      {/* Main Search Box */}
      <div className="websearch-main" ref={searchBoxRef}>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <div className="search-icon">◈</div>
            <input
              type="text"
              className="search-input"
              placeholder="Ask anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              className="search-submit-btn"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <div className="search-loader"></div>
              ) : (
                <span className="search-arrow">→</span>
              )}
            </button>
          </div>
          <div className="search-border-glow"></div>
        </form>
      </div>

      {/* Search Categories */}
      <div className="search-categories">
        <h2 className="categories-title">Explore</h2>
        <div className="categories-grid">
          {searchCategories.map((category, index) => (
            <div
              key={index}
              className="search-category-card"
              onClick={() => handleCategoryClick(category.title)}
              style={{ background: category.gradient }}
            >
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-title">{category.title}</h3>
              <p className="category-description">{category.description}</p>
              <div className="category-arrow">→</div>
              <div className="category-border"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="websearch-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WebSearch;
