"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Eye, EyeOff, LogOut, CreditCard, Key, User, Shield, ChevronRight } from 'lucide-react';
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
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
    replicate: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      fetchUserData();
    }
  }, [user, isOpen]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('users')
        .select('email, subscription_tier')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserEmail(data.email || user.email);
        setSubscriptionTier(data.subscription_tier || 'free');
      }
      
      // Mock loading API keys from local storage or DB
      const storedKeys = localStorage.getItem('vizual_api_keys');
      if (storedKeys) {
        setApiKeys(JSON.parse(storedKeys));
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
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    const newKeys = { ...apiKeys, [provider]: value };
    setApiKeys(newKeys);
    localStorage.setItem('vizual_api_keys', JSON.stringify(newKeys));
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <User size={16} />
            </div>
            Account & API Settings
          </div>
          <button className="settings-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {/* Profile Section */}
              <div className="settings-section">
                <div className="section-label">Profile</div>
                <div className="settings-card">
                  <div className="settings-row">
                    <span className="row-label">Email</span>
                    <span className="row-value">{userEmail || user?.email}</span>
                  </div>
                  <div className="settings-row">
                    <span className="row-label">User ID</span>
                    <span className="row-value">{user?.id?.slice(0, 8)}...</span>
                  </div>
                  <div className="settings-row">
                    <span className="row-label">Plan</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        subscriptionTier === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400'
                      }`}>
                        {subscriptionTier.toUpperCase()}
                      </span>
                      {subscriptionTier === 'free' && (
                        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Section */}
              {(userEmail === 'andregreengp@gmail.com' || user?.email === 'andregreengp@gmail.com') && (
                <div className="settings-section">
                  <div className="section-label">Admin</div>
                  <div className="settings-card">
                    <button 
                      className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors rounded-lg text-left"
                      onClick={() => {
                        onClose();
                        window.location.href = '/admin';
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                          <Shield size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-white">Admin Dashboard</div>
                          <div className="text-xs text-gray-400">Manage users and view analytics</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* API Keys Section */}
              <div className="settings-section">
                <div className="section-label">API Configuration</div>
                <div className="settings-card">
                  {['openai', 'anthropic', 'google', 'replicate'].map((provider) => (
                    <div key={provider} className="api-input-group border-b border-white/5 last:border-0">
                      <label className="api-input-label mb-2 capitalize">
                        {provider} API Key
                      </label>
                      <div className="api-input-wrapper">
                        <input
                          type={showApiKey[provider] ? "text" : "password"}
                          value={(apiKeys as any)[provider]}
                          onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                          placeholder={`sk-...`}
                          className="api-input"
                        />
                        <button
                          className="api-visibility-toggle"
                          onClick={() => toggleApiKeyVisibility(provider)}
                        >
                          {showApiKey[provider] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="settings-section mt-4">
                <button className="settings-btn btn-danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
