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
              <div className="plan-icon-badge">⚡</div>
              <div className="plan-title-group">
                <h3 className="plan-name">OMI PRO</h3>
                <p className="plan-subtitle">Unlimited AI power at your fingertips</p>
              </div>
            </div>

            <div className="plan-pricing">
              <div className="price-display">
                <span className="price-currency">$</span>
                <span className="price-amount">5</span>
                <span className="price-period">/mo</span>
              </div>
              <p className="billing-info">
                <span className="billing-total">$60</span> billed today <span className="billing-option">or pay monthly</span>
              </p>
            </div>

            <div className="plan-features">
              <div className="feature-highlight">
                <span className="feature-icon">✓</span>
                <span className="feature-text">Unlimited chat prompts</span>
              </div>
              <div className="feature-highlight">
                <span className="feature-icon">✓</span>
                <span className="feature-text">Unlimited image generation</span>
              </div>
            </div>

            <p className="plan-description">
              Generate unlimited AI content, including images, videos, chat responses. 
              Perfect for power users and creators.
            </p>

            <button className="upgrade-button" onClick={handleUpgrade}>
              <span className="button-icon">✨</span>
              <span className="button-text">Select Omi Pro Plan</span>
            </button>

            <p className="secure-checkout">Secure checkout with PayPal and Card</p>

            <div className="everything-free">
              <h4 className="everything-title">Everything in Free, plus:</h4>
              <div className="free-features">
                <div className="free-feature-item">
                  <span className="free-icon">✓</span>
                  <span className="free-text">Unlimited video generation</span>
                </div>
                <div className="free-feature-item">
                  <span className="free-icon">✓</span>
                  <span className="free-text">Priority support</span>
                </div>
              </div>
            </div>
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
