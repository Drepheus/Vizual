import { useEffect } from 'react'
import './SearchHistorySidebar.css'

interface SearchHistory {
  query: string
  mode: string
  timestamp: string
}

interface SearchHistorySidebarProps {
  searches: SearchHistory[]
  onSelectSearch: (query: string) => void
  onClearHistory: () => void
  isOpen: boolean
  onClose: () => void
}

export default function SearchHistorySidebar({
  searches,
  onSelectSearch,
  onClearHistory,
  isOpen,
  onClose
}: SearchHistorySidebarProps) {

  // Close sidebar with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="search-sidebar-backdrop" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`search-history-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="search-sidebar-header">
          <h2 className="search-sidebar-title">Recent Searches</h2>
          <button 
            className="search-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="search-history-list">
          {searches.length === 0 ? (
            <div className="search-empty-state">
              <p>No search history yet</p>
              <p className="search-empty-hint">Start searching to build your history!</p>
            </div>
          ) : (
            searches.map((search, index) => (
              <div
                key={index}
                className="search-history-item"
                onClick={() => {
                  onSelectSearch(search.query)
                  onClose()
                }}
              >
                <div className="search-history-info">
                  <div className="search-history-query">
                    {search.query}
                  </div>
                  <div className="search-history-meta">
                    <span className="search-history-mode">{search.mode}</span>
                    <span className="search-history-time">
                      {search.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {searches.length > 0 && (
          <div className="search-sidebar-footer">
            <button 
              className="search-clear-history-btn"
              onClick={onClearHistory}
            >
              Clear History
            </button>
          </div>
        )}
      </div>
    </>
  )
}
