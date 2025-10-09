import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Orb from './Orb';
import ShinyText from './ShinyText';
import LoginPage from './LoginPage';
import SplashPage from './SplashPage';
import { useAuth } from './Auth';
import { supabase } from './supabaseClient';
import './landing.css';

// Simple landing page with orb background
const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { session } = useAuth();

  // Check for OAuth callback on mount
  useEffect(() => {
    const checkAuthCallback = async () => {
      // Check if we're returning from OAuth
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasAuthParams = hashParams.has('access_token') || hashParams.has('error');
      
      if (hasAuthParams) {
        console.log('OAuth callback detected, processing...');
        console.log('Current URL:', window.location.href);
        console.log('Hash params:', Object.fromEntries(hashParams.entries()));
        
        // Clear the hash from the URL
        window.history.replaceState(null, '', window.location.pathname);
        
        // Let Supabase handle the callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error);
          alert(`Authentication error: ${error.message}\n\nIf you see a "try again" page, please check:\n1. Your Vercel URL is added to Google Cloud Console\n2. Your Vercel URL is added to Supabase redirect URLs`);
          setShowLogin(true);
          setIsCheckingAuth(false);
        } else if (data.session) {
          console.log('OAuth successful! User:', data.session.user.email);
          setShowSplash(true);
          setIsCheckingAuth(false);
        } else {
          console.log('No session found after OAuth, showing login...');
          setShowLogin(true);
          setIsCheckingAuth(false);
        }
      } else {
        // No OAuth callback, check for existing session
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('Existing session found, redirecting to chat...');
          setShowSplash(true);
        }
        setIsCheckingAuth(false);
      }
    };

    checkAuthCallback();
  }, []); // Run only once on mount

  // Separate effect to handle session changes from useAuth
  useEffect(() => {
    if (!isCheckingAuth && session && !showSplash && !showLogin) {
      console.log('Session detected, showing splash...');
      setShowSplash(true);
    }
  }, [session, isCheckingAuth, showSplash, showLogin]);

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

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="landing-container">
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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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