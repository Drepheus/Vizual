import { useState, useEffect } from 'react';
import { getUserGeneratedMedia, deleteGeneratedMedia, type GeneratedMedia } from './mediaService';
import './MediaGallery.css';

interface MediaGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function MediaGallery({ isOpen, onClose, userId }: MediaGalleryProps) {
  const [media, setMedia] = useState<GeneratedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<GeneratedMedia | null>(null);

  // Load media when modal opens or userId changes
  useEffect(() => {
    if (isOpen && userId) {
      console.log('📥 Loading media for user:', userId);
      loadMedia();
    }
  }, [isOpen, userId]);

  // Refresh media every time the modal opens (to catch new additions)
  useEffect(() => {
    if (isOpen && userId) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    if (!userId) {
      console.warn('⚠️ No userId provided to MediaGallery');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const data = await getUserGeneratedMedia(userId);
    console.log('📸 Loaded media items:', data.length);
    setMedia(data);
    setIsLoading(false);
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const success = await deleteGeneratedMedia(mediaId);
    if (success) {
      setMedia(media.filter(m => m.id !== mediaId));
      if (selectedMedia?.id === mediaId) {
        setSelectedMedia(null);
      }
    }
  };

  const filteredMedia = filter === 'all' 
    ? media 
    : media.filter(m => m.type === filter);

  if (!isOpen) return null;

  return (
    <div className="media-gallery-overlay" onClick={onClose}>
      <div className="media-gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="media-gallery-header">
          <h2>Your Generated Media</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="media-gallery-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({media.length})
          </button>
          <button
            className={`filter-btn ${filter === 'image' ? 'active' : ''}`}
            onClick={() => setFilter('image')}
          >
            Images ({media.filter(m => m.type === 'image').length})
          </button>
          <button
            className={`filter-btn ${filter === 'video' ? 'active' : ''}`}
            onClick={() => setFilter('video')}
          >
            Videos ({media.filter(m => m.type === 'video').length})
          </button>
        </div>

        <div className="media-gallery-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your media...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p>No {filter !== 'all' ? filter + 's' : 'media'} yet</p>
              <p className="empty-hint">Generate images and videos in the AI Media Studio to see them here</p>
            </div>
          ) : (
            <div className="media-grid">
              {filteredMedia.map((item) => (
                <div key={item.id} className="media-card">
                  <div className="media-preview" onClick={() => setSelectedMedia(item)}>
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt={item.prompt} 
                        loading="lazy"
                        onError={(e) => {
                          console.error('Failed to load image:', item.url);
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23111" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="16"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <video 
                        src={item.url}
                        onError={() => {
                          console.error('Failed to load video:', item.url);
                        }}
                      />
                    )}
                    <div className="media-overlay">
                      <span className="media-type-badge">
                        {item.type === 'image' ? '🖼️' : '🎬'}
                      </span>
                    </div>
                  </div>
                  <div className="media-card-footer">
                    <p className="media-prompt" title={item.prompt}>
                      {item.prompt}
                    </p>
                    <div className="media-card-actions">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="media-action-btn"
                        title="Open"
                      >
                        🔗
                      </a>
                      <button
                        className="media-action-btn delete-btn"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox for selected media */}
        {selectedMedia && (
          <div className="media-lightbox" onClick={() => setSelectedMedia(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setSelectedMedia(null)}>✕</button>
              {selectedMedia.type === 'image' ? (
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.prompt}
                  onError={(e) => {
                    console.error('Failed to load image in lightbox:', selectedMedia.url);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect fill="%23111" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="24"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <video 
                  src={selectedMedia.url} 
                  controls 
                  autoPlay
                  onError={() => {
                    console.error('Failed to load video in lightbox:', selectedMedia.url);
                  }}
                />
              )}
              <div className="lightbox-info">
                <p className="lightbox-prompt">{selectedMedia.prompt}</p>
                <p className="lightbox-date">
                  {new Date(selectedMedia.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
