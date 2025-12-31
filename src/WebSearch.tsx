"use client";

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import WebTaskModal from './WebTaskModal';
import SearchHistorySidebar from './SearchHistorySidebar';

// Updated with search modes - v2
interface WebSearchProps {
  onClose?: () => void;
}

interface SearchResult {
  query: string;
  summary: string;
  sources: Array<{
    number: number;
    title: string;
    url: string;
    snippet: string;
    published_date?: string;
  }>;
  images?: string[];
  answer?: string;
}

const WebSearch: React.FC<WebSearchProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWebTaskModal, setShowWebTaskModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Recent searches data
  const recentSearches = [
    { query: 'Latest AI advancements 2024', mode: 'Search + Summarize', timestamp: '2 hours ago' },
    { query: 'Neural network architectures', mode: 'Search + Summarize', timestamp: '1 day ago' },
    { query: 'Computer vision applications', mode: 'Search + Summarize', timestamp: '3 days ago' },
  ];

  // Search modes
  const searchModes = [
    {
      name: 'Search + Summarize',
      icon: '◈',
      description: 'AI-powered contextual summaries'
    },
    {
      name: 'AI Web Task',
      icon: '🧭',
      description: 'Smart context navigation',
      isPro: true
    },
    {
      name: 'Research Chains',
      icon: '⚡',
      description: 'Pro: Sequential research flow'
    },
    {
      name: 'Developer Mode',
      icon: '◐',
      description: 'Cvizualng: API & automation access'
    }
  ];

  // Featured tools to explore
  const searchCategories = [
    {
      icon: '🗺️',
      title: 'ChatGPT Atlas',
      description: 'Browse the web with AI-powered context and understanding',
      gradient: 'linear-gradient(135deg, rgba(16, 163, 127, 0.15), rgba(25, 195, 125, 0.1))',
      url: 'https://chatgpt.com/atlas',
      favicon: 'https://cdn.oaistatic.com/_next/static/media/apple-touch-icon.59f2e898.png'
    },
    {
      icon: '🔮',
      title: 'Perplexity Comet',
      description: 'AI search engine that delivers accurate answers with sources',
      gradient: 'linear-gradient(135deg, rgba(32, 201, 151, 0.15), rgba(0, 180, 216, 0.1))',
      url: 'https://www.perplexity.ai/',
      favicon: 'https://www.perplexity.ai/favicon.ico'
    },
    {
      icon: '⚡',
      title: 'Sigma OS',
      description: 'The browser that thinks like you do - workspace-first browsing',
      gradient: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(147, 51, 234, 0.1))',
      url: 'https://sigmaos.com/',
      favicon: 'https://sigmaos.com/favicon.ico'
    },
    {
      icon: '🎯',
      title: 'Manus',
      description: 'Next-generation browser built for productivity and focus',
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
      url: 'https://manus.im/',
      favicon: 'https://manus.im/favicon.ico'
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    // Only Search + Summarize mode is implemented
    if (selectedMode !== 'Search + Summarize') {
      alert(`${selectedMode || 'This'} mode is cvizualng soon! Please select "Search + Summarize" mode.`);
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults(null);
    
    try {
      const response = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          mode: 'basic' // Always use basic mode for now
        }),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid response. Please check the console for details.');
      }

      // Check if response was not OK after parsing
      if (!response.ok) {
        const errorMessage = data?.details || data?.error || `Search failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      setSearchResults(data as SearchResult);

      // Scroll to results
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSelectSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all search history?')) {
      // TODO: Implement actual history clearing
      console.log('Clear history');
    }
  };

  return (
    <>
      <SearchHistorySidebar
        searches={recentSearches}
        onSelectSearch={handleSelectSearch}
        onClearHistory={handleClearHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="websearch-container" ref={containerRef}>
        {/* Sidebar Toggle Button */}
        <button 
          className="websearch-sidebar-toggle"
          onClick={() => setIsSidebarOpen(true)}
          title="Recent Searches"
        >
          🕐
        </button>

        {/* Close button */}
        <button 
          className="websearch-close"
          onClick={onClose}
          title="Close"
        >
          ✕
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
        {/* Search modes */}
        <div className="search-modes">
          {searchModes.map((mode, index) => {
            const isPro = mode.isPro || mode.name === 'Research Chains';
            const isCvizualngSoon = mode.name === 'Developer Mode';
            return (
              <button
                key={index}
                className={`search-mode-button ${selectedMode === mode.name ? 'active' : ''} ${isPro ? 'pro' : ''} ${isCvizualngSoon ? 'cvizualng-soon' : ''}`}
                onClick={() => {
                  if (isCvizualngSoon) return;
                  
                  // If clicking AI Web Task, open modal immediately
                  if (mode.name === 'AI Web Task') {
                    setShowWebTaskModal(true);
                    setSelectedMode(mode.name);
                    return;
                  }
                  
                  setSelectedMode(selectedMode === mode.name ? null : mode.name);
                }}
                disabled={isCvizualngSoon}
                title={mode.description}
                data-tooltip={mode.description}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-name">{mode.name}</span>
                {isPro && <span className="pro-badge">PRO</span>}
                {isCvizualngSoon && <span className="cvizualng-soon-badge">Soon</span>}
              </button>
            );
          })}
        </div>

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

        {selectedMode && (
          <div className="selected-mode-info">
            <span className="info-icon">→</span>
            <span className="info-text">
              {searchModes.find(m => m.name === selectedMode)?.description}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="search-error">
          <span className="error-icon">⚠</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="search-results" ref={resultsRef}>
          <div className="results-header">
            <h2 className="results-title">Search Results</h2>
            <span className="results-query">"{searchResults.query}"</span>
          </div>

          {/* AI Summary */}
          <div className="results-summary">
            <div className="summary-header">
              <span className="summary-icon">✨</span>
              <h3 className="summary-title">AI Summary</h3>
            </div>
            <div className="summary-content">
              {searchResults.summary.split('\n').map((paragraph, index) => (
                <p key={index} className="summary-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="results-sources">
            <div className="sources-header">
              <span className="sources-icon">📚</span>
              <h3 className="sources-title">Sources</h3>
            </div>
            <div className="sources-list">
              {searchResults.sources.map((source) => (
                <a
                  key={source.number}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-card"
                >
                  <div className="source-number">[{source.number}]</div>
                  <div className="source-content">
                    <h4 className="source-title">{source.title}</h4>
                    <p className="source-snippet">{source.snippet}</p>
                    <div className="source-url">{new URL(source.url).hostname}</div>
                  </div>
                  <div className="source-arrow">→</div>
                </a>
              ))}
            </div>
          </div>

          {/* Images (if available) */}
          {searchResults.images && searchResults.images.length > 0 && (
            <div className="results-images">
              <div className="images-header">
                <span className="images-icon">🖼️</span>
                <h3 className="images-title">Related Images</h3>
              </div>
              <div className="images-grid">
                {searchResults.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Result ${index + 1}`}
                    className="result-image"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explore Tools */}
      {!searchResults && (
        <div className="search-categories">
          <h2 className="categories-title">Explore</h2>
          <div className="categories-grid">
            {searchCategories.map((category, index) => (
              <div
                key={index}
                className="search-category-card"
                onClick={() => handleCategoryClick(category.url)}
                style={{ background: category.gradient }}
              >
                <div className="category-favicon">
                  <img 
                    src={category.favicon} 
                    alt={`${category.title} icon`}
                    className="favicon-img"
                    onError={(e) => {
                      // Fallback to emoji icon if favicon fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = category.icon;
                        parent.style.fontSize = '2rem';
                      }
                    }}
                  />
                </div>
                <h3 className="category-title">{category.title}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-arrow">→</div>
                <div className="category-border"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating particles effect - removed to fix hydration error */}
    </div>

    {/* AI Web Task Modal */}
    <WebTaskModal 
      isOpen={showWebTaskModal} 
      onClose={() => setShowWebTaskModal(false)} 
    />
    </>
  );
};

export default WebSearch;
