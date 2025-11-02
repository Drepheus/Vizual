import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './WebSearch.css';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search modes
  const searchModes = [
    {
      name: 'Search + Summarize',
      icon: '◈',
      description: 'AI-powered contextual summaries'
    },
    {
      name: 'Auto Deep Dive',
      icon: '🧭',
      description: 'Smart context navigation'
    },
    {
      name: 'Continuous Research',
      icon: '◇',
      description: '60-second deep research mode'
    },
    {
      name: 'Cited Sources',
      icon: '◆',
      description: 'PDF export with citations'
    },
    {
      name: 'Research Chains',
      icon: '⚡',
      description: 'Pro: Sequential research flow'
    },
    {
      name: 'Developer Mode',
      icon: '◐',
      description: 'Coming: API & automation access'
    }
  ];

  // Featured search capabilities
  const searchCategories = [
    {
      icon: '✨',
      title: 'AI-Powered Search',
      description: 'Omi summarizes live info with citations (Perplexity style)',
      gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(138, 43, 226, 0.1))'
    },
    {
      icon: '🧭',
      title: 'Smart Context Navigation',
      description: 'Click any result to let Omi explore that site in depth using a headless browser',
      gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.12), rgba(0, 191, 255, 0.08))'
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
      alert(`${selectedMode || 'This'} mode is coming soon! Please select "Search + Summarize" mode.`);
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
          mode: selectedMode === 'search' ? 'basic' : 'deep'
        }),
      });

      // Clone the response so we can read it multiple times if needed
      const responseClone = response.clone();
      
      let data: SearchResult;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Use the cloned response to get text
        const text = await responseClone.text();
        console.error('Failed to parse JSON response:', text);
        throw new Error('Server returned invalid response. Please check the console for details.');
      }

      if (!response.ok) {
        throw new Error(data.details || data.error || `Search failed with status ${response.status}`);
      }

      setSearchResults(data);

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
        {/* Search modes */}
        <div className="search-modes">
          {searchModes.map((mode, index) => {
            const isPro = mode.name === 'Research Chains';
            const isComingSoon = mode.name === 'Developer Mode';
            return (
              <button
                key={index}
                className={`search-mode-button ${selectedMode === mode.name ? 'active' : ''} ${isPro ? 'pro' : ''} ${isComingSoon ? 'coming-soon' : ''}`}
                onClick={() => !isComingSoon && setSelectedMode(selectedMode === mode.name ? null : mode.name)}
                disabled={isComingSoon}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-name">{mode.name}</span>
                {isPro && <span className="pro-badge">PRO</span>}
                {isComingSoon && <span className="coming-soon-badge">Soon</span>}
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

      {/* Search Categories */}
      {!searchResults && (
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
      )}

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
