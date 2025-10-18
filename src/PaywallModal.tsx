import React from 'react';
import { createClient } from '@supabase/supabase-js';
import './PaywallModal.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'chat' | 'image' | 'video';
  currentUsage: number;
  usageLimit: number;
  resetAt?: string | null;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  limitType,
  currentUsage,
  usageLimit,
  resetAt
}) => {
  if (!isOpen) return null;

  const getLimitInfo = () => {
    switch (limitType) {
      case 'chat':
        return {
          title: 'Chat Limit Reached',
          icon: '💬',
          description: `You've used ${currentUsage} of ${usageLimit} prompts`,
          resetInfo: resetAt ? `Resets in ${getTimeUntilReset(resetAt)}` : null
        };
      case 'image':
        return {
          title: 'Image Generation Limit Reached',
          icon: '⚡',
          description: `You've used all ${usageLimit} image generations`,
          resetInfo: null
        };
      case 'video':
        return {
          title: 'Video Generation Limit Reached',
          icon: '🎬',
          description: `You've used all ${usageLimit} video generations`,
          resetInfo: null
        };
    }
  };

  const getTimeUntilReset = (resetDate: string) => {
    const now = new Date();
    const reset = new Date(resetDate);
    const diff = reset.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleUpgrade = async () => {
    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in to upgrade');
        return;
      }
      
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          email: user.email 
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const info = getLimitInfo();

  return (
    <div className="paywall-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={(e) => e.stopPropagation()}>
        <button className="paywall-close" onClick={onClose}>×</button>
        
        <div className="paywall-content">
          <div className="paywall-icon">{info.icon}</div>
          
          <h2 className="paywall-title">{info.title}</h2>
          <p className="paywall-description">{info.description}</p>
          
          {info.resetInfo && (
            <div className="paywall-reset-info">
              <span className="reset-clock">⏱️</span>
              <span>{info.resetInfo}</span>
            </div>
          )}

          <div className="paywall-divider">
            <span>Upgrade to continue</span>
          </div>

          {/* Pro Plan Card */}
          <div className="pro-plan-card">
            <div className="plan-header">
              <div className="plan-badge">
                <span className="badge-icon">👑</span>
                <span className="badge-text">PRO</span>
              </div>
              <div className="plan-price">
                <span className="price-currency">$</span>
                <span className="price-amount">5</span>
                <span className="price-period">/month</span>
              </div>
            </div>

            <div className="plan-features">
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">Unlimited chat prompts</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">Unlimited image generation</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">Unlimited video generation</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">Priority support</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">Early access to new features</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <span className="feature-text">Commercial license</span>
              </div>
            </div>

            <button className="upgrade-button" onClick={handleUpgrade}>
              <span className="button-text">Upgrade to Omi Pro</span>
              <span className="button-icon">→</span>
            </button>
          </div>

          <div className="paywall-footer">
            <p className="footer-text">Cancel anytime • No hidden fees</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
