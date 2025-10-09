import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Orb from './Orb';
import ShinyText from './ShinyText';
import LoginPage from './LoginPage';
import SplashPage from './SplashPage';
import { useAuth } from './Auth';
import './landing.css';

// Simple landing page with orb background
const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { session } = useAuth();

  const handleStartClick = () => {
    setIsTransitioning(true);
    // Wait for fade out animation to complete before showing login page
    setTimeout(() => {
      if (session) {
        // Already logged in, go straight to chat
        setShowSplash(true);
      } else {
        // Not logged in, show login page
        setShowLogin(true);
      }
    }, 800); // Match the CSS transition duration
  };

  const handleLoginSuccess = () => {
    // User successfully logged in, show the chat interface
    setShowSplash(true);
  };

  const handleGuestMode = () => {
    // User chose guest mode, go straight to chat
    setShowSplash(true);
  };

  if (showSplash) {
    return (
      <div className="page-transition fade-in">
        <SplashPage />
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="page-transition fade-in">
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onGuestMode={handleGuestMode}
        />
      </div>
    );
  }

  return (
    <div className={`landing-container ${isTransitioning ? 'fade-out' : ''}`}>
      <div className="orb-background">
        <Orb 
          hue={220}
          hoverIntensity={0.3}
          rotateOnHover={true}
          forceHoverState={false}
        />
      </div>
      <div className="content">
        <h1>Omi AI</h1>
        <p>Innovating the conversational AI experience</p>
        <div className="button-container">
          <button 
            className="start-button" 
            onClick={handleStartClick}
            disabled={isTransitioning}
          >
            <ShinyText text="Start" speed={3} className="start-button-text" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('root')!);
  root.render(<LandingPage />);
});