import { useState } from 'react';
import MagicBento from './MagicBento';
import './CommandHub.css';

interface CommandHubProps {
  onWebSearchClick?: () => void;
}

export default function CommandHub({ onWebSearchClick }: CommandHubProps) {
  const [showHub, setShowHub] = useState(true);

  return (
    <div className="command-hub-container">
      {showHub && (
        <>
          {/* Back button */}
          <button 
            className="command-hub-back"
            onClick={() => window.history.back()}
            title="Back to chat"
          >
            ← Back
          </button>

          {/* Header */}
          <div className="command-hub-header">
            <h1 className="command-hub-title">Omi Command Hub</h1>
            <p className="command-hub-subtitle">Explore AI-powered tools and features</p>
          </div>

          {/* Bento Grid */}
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            onWebSearchClick={onWebSearchClick}
            enableBorderGlow={true}
            enableTilt={false}
            clickEffect={true}
            enableMagnetism={true}
            glowColor="192, 192, 192"
            particleCount={12}
            spotlightRadius={300}
          />
        </>
      )}
    </div>
  );
}
