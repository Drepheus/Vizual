import { useNavigate } from 'react-router-dom';
import MagicBento from './MagicBento';
import './CommandHub.css';

export default function CommandHub() {
  const navigate = useNavigate();

  return (
    <div className="command-hub-container">
      {/* Back button */}
      <button 
        className="command-hub-back"
        onClick={() => navigate('/chat')}
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
        enableBorderGlow={true}
        enableTilt={false}
        clickEffect={true}
        enableMagnetism={true}
        glowColor="192, 192, 192"
        particleCount={12}
        spotlightRadius={300}
      />
    </div>
  );
}
