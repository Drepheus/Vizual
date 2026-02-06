"use client";

import React, { useEffect, useState } from "react";
import { Zap, Image, Sparkles, Crown, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getUserCreditsAndUsage, UserCreditsAndUsage } from "@/lib/usage-tracking";

interface CreditDisplayProps {
  variant?: 'compact' | 'full' | 'minimal';
  showUpgrade?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

export function CreditDisplay({ 
  variant = 'compact', 
  showUpgrade = true,
  onUpgradeClick,
  className = ''
}: CreditDisplayProps) {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UserCreditsAndUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      if (user?.id) {
        const data = await getUserCreditsAndUsage(user.id);
        setUsage(data);
      }
      setLoading(false);
    }
    fetchUsage();
  }, [user?.id]);

  const refreshUsage = async () => {
    if (user?.id) {
      setLoading(true);
      const data = await getUserCreditsAndUsage(user.id);
      setUsage(data);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-white/5 rounded-lg w-32" />
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const tierColors: Record<string, string> = {
    free: 'text-gray-400',
    basic: 'text-blue-400',
    pro: 'text-gray-300',
    ultra: 'text-amber-400'
  };

  const tierBadgeColors: Record<string, string> = {
    free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pro: 'bg-white/10 text-gray-300 border-white/20',
    ultra: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };

  // Calculate percentage for progress bars
  const creditsPercentage = usage.credits > 0 
    ? Math.round((usage.credits_remaining / usage.credits) * 100)
    : 0;
  const dailyImagesPercentage = usage.daily_free_images_limit > 0 
    ? Math.round((usage.daily_free_images_remaining / usage.daily_free_images_limit) * 100)
    : 0;

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-1.5 text-sm">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-white font-medium">{usage.credits_remaining}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Image size={14} className="text-green-400" />
          <span className="text-white font-medium">{usage.daily_free_images_remaining}/day</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white/5 rounded-xl p-3 border border-white/10 ${className}`}>
        {/* Tier Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${tierBadgeColors[usage.subscription_tier]}`}>
            {usage.subscription_tier === 'ultra' && <Crown size={12} />}
            {usage.subscription_tier.charAt(0).toUpperCase() + usage.subscription_tier.slice(1)}
          </div>
          <button 
            onClick={refreshUsage}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Refresh usage"
          >
            <RefreshCw size={12} className="text-gray-400" />
          </button>
        </div>

        {/* Credits */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-xs text-gray-400">Credits</span>
            </div>
            <span className="text-sm font-medium text-white">
              {usage.credits_remaining} <span className="text-gray-500">/ {usage.credits}</span>
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${creditsPercentage}%` }}
            />
          </div>
        </div>

        {/* Daily Free Images */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Image size={14} className="text-green-400" />
              <span className="text-xs text-gray-400">Free Images Today</span>
            </div>
            <span className="text-sm font-medium text-white">
              {usage.daily_free_images_remaining} <span className="text-gray-500">/ {usage.daily_free_images_limit}</span>
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${dailyImagesPercentage}%` }}
            />
          </div>
        </div>

        {/* Upgrade Button */}
        {showUpgrade && !usage.is_paid_user && (
          <button
            onClick={onUpgradeClick}
            className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-gray-200 rounded-lg text-black text-sm font-medium transition-all"
          >
            <Sparkles size={14} />
            Upgrade for More
          </button>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-white/5 rounded-2xl p-5 border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your Usage</h3>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${tierBadgeColors[usage.subscription_tier]}`}>
          {usage.subscription_tier === 'ultra' && <Crown size={14} />}
          {usage.subscription_tier.charAt(0).toUpperCase() + usage.subscription_tier.slice(1)} Plan
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Credits Card */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Zap size={18} className="text-yellow-400" />
            </div>
            <span className="text-sm text-gray-400">Credits</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {usage.credits_remaining}
          </div>
          <div className="text-xs text-gray-500">
            of {usage.credits} total
          </div>
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${creditsPercentage}%` }}
            />
          </div>
        </div>

        {/* Daily Free Images Card */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Image size={18} className="text-green-400" />
            </div>
            <span className="text-sm text-gray-400">Free Today</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {usage.daily_free_images_remaining}
          </div>
          <div className="text-xs text-gray-500">
            of {usage.daily_free_images_limit} daily
          </div>
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${dailyImagesPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div className="text-xs text-gray-500 mb-4">
        {usage.is_paid_user ? (
          <span>Credits reset on {new Date(usage.credits_reset_at).toLocaleDateString()}</span>
        ) : (
          <span>Free images reset daily • Credits expire in {Math.ceil((new Date(usage.credits_reset_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
        )}
      </div>

      {/* Usage Breakdown */}
      <div className="text-xs text-gray-400 mb-4 space-y-1">
        <p>• Daily free images are used first</p>
        <p>• Credits are used after daily free images run out</p>
        <p>• Video generation uses 5 credits</p>
      </div>

      {/* Upgrade Button */}
      {showUpgrade && !usage.is_paid_user && (
        <button
          onClick={onUpgradeClick}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-200 rounded-xl text-black font-medium transition-all"
        >
          <Sparkles size={16} />
          Upgrade for Unlimited Creativity
        </button>
      )}
    </div>
  );
}

// Hook for components that need real-time usage data
export function useCreditsAndUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UserCreditsAndUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!user?.id) {
      setUsage(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserCreditsAndUsage(user.id);
      setUsage(data);
      setError(null);
    } catch (e) {
      setError('Failed to load usage data');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  return { usage, loading, error, refresh };
}
