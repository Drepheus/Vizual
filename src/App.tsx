import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Orb from './Orb';
import ShinyText from './ShinyText';
import LoginPage from './LoginPage';
import SplashPage from './SplashPage';
import CommandHub from './CommandHub';
import WebSearch from './WebSearch';
import MediaStudio from './MediaStudio';
import CustomOmis from './CustomOmis';
import AdminDashboard from './AdminDashboard';
import { useAuth } from './Auth';
import { GuestModeProvider, useGuestMode } from './GuestMode';
import { supabase } from './supabaseClient';
import './landing.css';

// Landing page component
const LandingPage: React.FC = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleStartClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (session) {
        navigate('/chat');
      } else {
        navigate('/login');
      }
    }, 800);
  };

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

// Auth checker component
const AuthChecker: React.FC = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { session } = useAuth();
  const { isGuestMode } = useGuestMode();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthCallback = async () => {
      console.log('Checking auth state on mount...');
      console.log('Guest mode:', isGuestMode);
      
      // Check if we're returning from OAuth
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasAuthParams = hashParams.has('access_token') || hashParams.has('error');
      
      if (hasAuthParams) {
        console.log('OAuth callback detected, processing...');
        
        // Clear the hash from the URL
        window.history.replaceState(null, '', window.location.pathname);
        
        // Wait for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error);
          alert(`Authentication error: ${error.message}`);
          navigate('/login');
        } else if (data.session) {
          console.log('OAuth successful! User:', data.session.user.email);
          navigate('/chat');
        } else {
          console.log('No session found after OAuth, showing login...');
          navigate('/login');
        }
      } else {
        // Check for guest mode or existing session
        if (isGuestMode) {
          console.log('Guest mode active');
          // Allow access to protected routes in guest mode
          if (location.pathname === '/' || location.pathname === '/login') {
            navigate('/chat');
          }
        } else {
          // No guest mode, check for existing session
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('Existing session found');
            // Only redirect if we're on the root path
            if (location.pathname === '/') {
              navigate('/chat');
            }
          } else if (location.pathname !== '/' && location.pathname !== '/login') {
            // Not logged in and not in guest mode, trying to access protected route
            navigate('/login');
          }
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthCallback();
  }, [isGuestMode]);

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

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          <div className="page-transition fade-in">
            <LoginPage 
              onLoginSuccess={() => navigate('/chat')}
              onGuestMode={() => navigate('/chat')}
            />
          </div>
        } 
      />
      <Route 
        path="/chat" 
        element={
          (session || isGuestMode) ? (
            <div className="page-transition fade-in">
              <SplashPage />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/command-hub" 
        element={
          (session || isGuestMode) ? (
            <div className="page-transition fade-in">
              <CommandHub onWebSearchClick={() => navigate('/web-search')} />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/web-search" 
        element={
          (session || isGuestMode) ? (
            <div className="page-transition fade-in">
              <WebSearch onClose={() => navigate(-1)} />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/media-studio" 
        element={
          (session || isGuestMode) ? (
            <div className="page-transition fade-in">
              <MediaStudio onClose={() => navigate(-1)} />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/custom-omis" 
        element={
          (session || isGuestMode) ? (
            <div className="page-transition fade-in">
              <CustomOmis onClose={() => navigate(-1)} />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin" 
        element={
          session ? (
            <div className="page-transition fade-in">
              <AdminDashboard />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <GuestModeProvider>
      <BrowserRouter>
        <AuthChecker />
      </BrowserRouter>
    </GuestModeProvider>
  );
};

export default App;
