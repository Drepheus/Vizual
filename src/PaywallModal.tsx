"use client";

import React from 'react';
import ElectricBorder from './ElectricBorder';
import { getBrowserSupabaseClient } from '@/lib/supabase-browser';

const supabase = getBrowserSupabaseClient();

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

  const handleUpgrade = async (plan: 'pro' | 'ultra') => {
    try {
      // For Ultra plan, use direct Stripe payment link
      if (plan === 'ultra') {
        window.location.href = 'https://buy.stripe.com/fZu14ndCtdVZfvf4Y8dfG0g';
        return;
      }

      // For Pro plan, use the API checkout session
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please log in to upgrade');
        return;
      }

      // Create checkout session with plan type
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          plan: plan
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

  return (
    <div className="paywall-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={(e) => e.stopPropagation()}>
        <button className="paywall-close" onClick={onClose}>×</button>

        <div className="paywall-content">
          <h2 className="plans-title">Choose Your Plan</h2>

          <div className="plans-container">
            {/* FREE PLAN */}
            <div className="free-plan-card">
              <div className="card-border"></div>
              
              <div className="plan-header">
                <div className="plan-icon-badge">
                  <div className="icon-inner">🆓</div>
                </div>
                <div className="plan-title-group">
                  <h3 className="plan-name">OMI FREE</h3>
                  <p className="plan-subtitle">For trying Omi</p>
                </div>
              </div>

              <div className="plan-pricing">
                <div className="price-wrapper">
                  <span className="amount">Free</span>
                </div>
              </div>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">🪙</span>
                  </div>
                  <span className="feature-text"><span className="credit-amount">500</span> credits / month</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">💬</span>
                  </div>
                  <span className="feature-text">Basic models only</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">🖼️</span>
                  </div>
                  <span className="feature-text">~20–30 images/month</span>
                </div>
                <div className="feature-item disabled">
                  <div className="feature-icon-box">
                    <span className="icon">❌</span>
                  </div>
                  <span className="feature-text">No Video Generation</span>
                </div>
                <div className="feature-item disabled">
                  <div className="feature-icon-box">
                    <span className="icon">❌</span>
                  </div>
                  <span className="feature-text">No Long-term Memory</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">⚡</span>
                  </div>
                  <span className="feature-text">Standard Processing</span>
                </div>
              </div>

              <button
                className="cta-button free-button"
                onClick={onClose}
              >
                <span className="button-text">Current Plan</span>
              </button>
            </div>

            {/* PRO PLAN */}
            <div className="pro-plan-card">
              <div className="card-glow"></div>
              <div className="card-border"></div>

              <div className="plan-header">
                <div className="plan-icon-badge">
                  <div className="icon-inner">⚡</div>
                </div>
                <div className="plan-title-group">
                  <h3 className="plan-name">OMI PRO</h3>
                  <p className="plan-subtitle">Your main conversion plan</p>
                </div>
              </div>

              <div className="plan-pricing">
                <div className="price-wrapper">
                  <span className="currency">$</span>
                  <span className="amount">4.99</span>
                  <span className="billing-text">/ month</span>
                </div>
              </div>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">🪙</span>
                  </div>
                  <span className="feature-text"><span className="credit-amount highlight">5,000</span> credits / month</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">🧠</span>
                  </div>
                  <span className="feature-text">Long-term Memory ✅</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">🖼️</span>
                  </div>
                  <span className="feature-text">~100–150 images/month</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">🎬</span>
                  </div>
                  <span className="feature-text">~10 short videos/month</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">☺</span>
                  </div>
                  <span className="feature-text">2 Custom Omi's</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-box">
                    <span className="icon">⚡</span>
                  </div>
                  <span className="feature-text">Faster Queue</span>
                </div>
              </div>

              <button
                className="cta-button"
                onClick={() => handleUpgrade('pro')}
              >
                <div className="button-glow"></div>
                <span className="button-text">Choose Pro</span>
              </button>

              <div className="secure-badge">
                <span className="lock">◆</span>
                <span className="text">Secured by Stripe</span>
              </div>
            </div>

            {/* ULTRA PLAN */}
            <ElectricBorder
              color="#C0C0C0"
              speed={1}
              chaos={0.3}
              thickness={2}
              style={{ borderRadius: 16, width: '100%', display: 'flex' }}
            >
              <div className="ultra-plan-card" style={{ width: '100%', flex: 1 }}>
                <div className="ultra-badge">ULTRA</div>

                <div className="plan-header">
                  <div className="plan-icon-badge ultra-icon">
                    <div className="icon-inner">✦</div>
                  </div>
                  <div className="plan-title-group">
                    <h3 className="plan-name ultra-name">OMI ULTRA</h3>
                    <p className="plan-subtitle">For power users & creators</p>
                  </div>
                </div>

                <div className="plan-pricing">
                  <div className="price-wrapper">
                    <span className="currency">$</span>
                    <span className="amount">19.99</span>
                    <span className="billing-text">/ month</span>
                  </div>
                </div>

                <div className="features-list">
                  <div className="feature-item">
                    <div className="feature-icon-box ultra-feature">
                      <span className="icon">🪙</span>
                    </div>
                    <span className="feature-text"><span className="credit-amount ultra">25,000</span> credits / month</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon-box ultra-feature">
                      <span className="icon">🧠</span>
                    </div>
                    <span className="feature-text">Infinite Memory ✅</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon-box ultra-feature">
                      <span className="icon">🖼️</span>
                    </div>
                    <span className="feature-text">Unlimited Image Gen (soft cap)</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon-box ultra-feature">
                      <span className="icon">🎬</span>
                    </div>
                    <span className="feature-text">~50 videos/month</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon-box ultra-feature">
                      <span className="icon">★</span>
                    </div>
                    <span className="feature-text">Unlimited Custom Omi's</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon-box ultra-feature">
                      <span className="icon">⚡</span>
                    </div>
                    <span className="feature-text">Priority Processing</span>
                  </div>
                </div>

                <button
                  className="cta-button ultra-button"
                  onClick={() => handleUpgrade('ultra')}
                >
                  <span className="button-text">Choose Ultra</span>
                </button>

                <div className="secure-badge">
                  <span className="lock">◆</span>
                  <span className="text">Secured by Stripe</span>
                </div>
              </div>
            </ElectricBorder>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
