"use client";

import { useState, useEffect, useRef } from 'react';

interface SearchResult {
  type: 'conversation' | 'message' | 'feature';
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Search features and content
  const features: SearchResult[] = [
    {
      type: 'feature',
      title: 'Vizual Chat',
      description: 'Conversational AI with advanced reasoning',
      icon: '💬',
      onClick: () => {
        console.log('Navigate to Vizual Chat');
        onClose();
      }
    },
    {
      type: 'feature',
      title: 'Web Search',
      description: 'Search the web with AI-powered insights',
      icon: '🌐',
      onClick: () => {
        console.log('Navigate to Web Search');
        onClose();
      }
    },
    {
      type: 'feature',
      title: 'Image Generation',
      description: 'Create stunning visuals with AI',
      icon: '🎨',
      onClick: () => {
        console.log('Navigate to Image Generation');
        onClose();
      }
    },
    {
      type: 'feature',
      title: 'Video Generation',
      description: 'Transform ideas into motion',
      icon: '🎬',
      onClick: () => {
        console.log('Navigate to Video Generation');
        onClose();
      }
    },
    {
      type: 'feature',
      title: 'Media Gallery',
      description: 'View all your generated images and videos',
      icon: '⊞',
      onClick: () => {
        console.log('Navigate to Media Gallery');
        onClose();
      }
    },
    {
      type: 'feature',
      title: 'Settings',
      description: 'Configure your preferences',
      icon: '⚙',
      onClick: () => {
        console.log('Navigate to Settings');
        onClose();
      }
    },
    {
      type: 'feature',
      title: 'Command Hub',
      description: 'Access all tools and features',
      icon: '◆',
      onClick: () => {
        console.log('Navigate to Command Hub');
        onClose();
      }
    }
  ];

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simple search filter
    const query = searchQuery.toLowerCase();
    const filtered = features.filter(
      item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );

    // Simulate search delay for better UX
    const timeout = setTimeout(() => {
      setSearchResults(filtered);
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="search-backdrop" onClick={onClose} />

      {/* Search Modal */}
      <div className="search-modal">
        <div className="search-header">
          <div className="search-icon">🔍</div>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search features, conversations, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <button className="search-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="search-content">
          {!searchQuery && (
            <div className="search-empty">
              <div className="search-empty-icon">🔎</div>
              <p className="search-empty-text">Search across the entire app</p>
              <p className="search-empty-hint">Try searching for features, conversations, or actions</p>
            </div>
          )}

          {isSearching && (
            <div className="search-loading">
              <div className="search-spinner"></div>
              <p>Searching...</p>
            </div>
          )}

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="search-no-results">
              <div className="search-no-results-icon">🔍</div>
              <p className="search-no-results-text">No results found</p>
              <p className="search-no-results-hint">Try a different search term</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              <p className="search-results-label">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="search-result-item"
                  onClick={result.onClick}
                >
                  <div className="search-result-icon">{result.icon}</div>
                  <div className="search-result-content">
                    <div className="search-result-title">{result.title}</div>
                    <div className="search-result-description">{result.description}</div>
                  </div>
                  <div className="search-result-arrow">→</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="search-footer">
          <div className="search-shortcut">
            <kbd>ESC</kbd> to close
          </div>
        </div>
      </div>
    </>
  );
}
