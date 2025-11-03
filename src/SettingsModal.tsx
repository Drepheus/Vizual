import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [userEmail, setUserEmail] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchUserData();
    }
  }, [user, isOpen]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Check if user is admin
      console.log('Checking admin status for:', user.email);
      if (user.email === 'andregreengp@gmail.com') {
        setIsAdmin(true);
        console.log('✅ Admin status confirmed!');
      } else {
        console.log('❌ Not admin account');
      }

      // Get user data from Supabase
      const { data } = await supabase
        .from('users')
        .select('email, subscription_tier')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserEmail(data.email || user.email);
        setSubscriptionTier(data.subscription_tier || 'free');
        console.log('User subscription tier:', data.subscription_tier);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      // Reload page to reset state
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>⚙️ Account Settings</h2>
          <button className="settings-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-modal-content">
          {isLoading ? (
            <div className="settings-loading">
              <div className="settings-spinner"></div>
              <p>Loading account data...</p>
            </div>
          ) : (
            <>
              {/* User Info Section */}
              <div className="settings-section">
                <h3 className="settings-section-title">👤 Profile</h3>
                <div className="settings-info-card">
                  <div className="settings-info-row">
                    <span className="settings-label">Email:</span>
                    <span className="settings-value">{userEmail || user?.email}</span>
                  </div>
                  <div className="settings-info-row">
                    <span className="settings-label">User ID:</span>
                    <span className="settings-value settings-value-mono">{user?.id?.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              {/* Subscription Section */}
              <div className="settings-section">
                <h3 className="settings-section-title">💎 Subscription</h3>
                <div className="settings-info-card">
                  <div className="settings-subscription-badge">
                    {subscriptionTier === 'pro' ? (
                      <span className="settings-badge-pro">
                        ✨ Omi Pro
                      </span>
                    ) : (
                      <span className="settings-badge-free">
                        🆓 Free Plan
                      </span>
                    )}
                  </div>
                  {subscriptionTier === 'free' && (
                    <p className="settings-upgrade-hint">
                      Upgrade to Omi Pro for unlimited access to all features
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="settings-section">
                <h3 className="settings-section-title">⚡ Actions</h3>
                <div className="settings-actions">
                  {isAdmin && (
                    <button 
                      className="settings-action-btn settings-admin-btn" 
                      onClick={() => {
                        console.log('Admin button clicked! Navigating to /admin');
                        onClose();
                        // Use window.location for a full page navigation
                        window.location.href = '/admin';
                      }}
                    >
                      <span className="settings-action-icon">👑</span>
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <button className="settings-action-btn settings-logout-btn" onClick={handleLogout}>
                    <span className="settings-action-icon">🚪</span>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="settings-modal-footer">
          <p className="settings-footer-text">Omi AI • Created by Drepheus</p>
        </div>
      </div>
    </div>
  );
}
