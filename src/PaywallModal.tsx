"use client";

import React, { useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase-browser';
import { 
  Sparkles, 
  Image, 
  Video, 
  Film, 
  Settings, 
  Clock, 
  Coins, 
  Zap, 
  Crown, 
  Rocket, 
  Brain, 
  Radio,
  Plug,
  Check,
  Star
} from 'lucide-react';

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
}) => {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  // Stripe Payment Links
  const STRIPE_LINKS = {
    basic: 'https://buy.stripe.com/eVq3cvcypdVZ5UF4Y8dfG0f',
    pro: 'https://buy.stripe.com/fZu14ndCtdVZfvf4Y8dfG0g',
    ultra: 'https://buy.stripe.com/eVa6oOglDdvL2GY7st',
  };

  const handleUpgrade = async (plan: 'basic' | 'pro' | 'ultra') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please log in to upgrade');
        return;
      }

      // Open Stripe payment link directly
      const stripeUrl = STRIPE_LINKS[plan];
      if (stripeUrl) {
        // Append customer email as prefill if available
        const urlWithEmail = user.email 
          ? `${stripeUrl}?prefilled_email=${encodeURIComponent(user.email)}`
          : stripeUrl;
        window.location.href = urlWithEmail;
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  // Icon component mapping
  const IconMap: Record<string, React.ReactNode> = {
    image: <Image size={12} />,
    video: <Radio size={12} />,
    film: <Film size={12} />,
    settings: <Settings size={12} />,
    clock: <Clock size={12} />,
    coins: <Coins size={12} />,
    zap: <Zap size={12} />,
    brain: <Brain size={12} />,
    sparkles: <Sparkles size={12} />,
    plug: <Plug size={12} />,
    check: <Check size={12} />,
    star: <Star size={12} />,
  };

  const plans = [
    {
      id: 'free',
      name: 'FREE',
      subtitle: 'Try Vizual',
      price: 'Free',
      priceDetail: 'forever',
      HeaderIcon: Sparkles,
      features: [
        { text: '3 image generations / day', iconKey: 'image' },
        { text: '10 seconds Live feature / day', iconKey: 'video' },
        { text: '1 video generation / month', iconKey: 'film' },
        { text: 'Basic models only', iconKey: 'settings' },
        { text: 'Standard queue', iconKey: 'clock' },
      ],
      buttonText: 'Current Plan',
      isCurrent: true,
    },
    {
      id: 'basic',
      name: 'BASIC',
      subtitle: 'For casual creators',
      price: '$10',
      priceDetail: '/ month',
      HeaderIcon: Rocket,
      features: [
        { text: '1,000 credits / month', iconKey: 'coins', highlight: true },
        { text: '~50-200 images / month', iconKey: 'image' },
        { text: '~5 mins Live feature / month', iconKey: 'video' },
        { text: '~3-5 short videos / month', iconKey: 'film' },
        { text: 'Access to more models', iconKey: 'settings' },
        { text: 'Faster queue', iconKey: 'zap' },
      ],
      buttonText: 'Choose Basic',
    },
    {
      id: 'pro',
      name: 'PRO',
      subtitle: 'For serious creators',
      price: '$20',
      priceDetail: '/ month',
      HeaderIcon: Zap,
      isPopular: true,
      features: [
        { text: '2,000 credits / month', iconKey: 'coins', highlight: true },
        { text: '~100-400 images / month', iconKey: 'image' },
        { text: '~10 mins Live feature / month', iconKey: 'video' },
        { text: '~8-12 videos / month', iconKey: 'film' },
        { text: 'All premium models', iconKey: 'sparkles' },
        { text: 'Priority queue', iconKey: 'zap' },
        { text: 'Long-term memory', iconKey: 'brain' },
      ],
      buttonText: 'Choose Pro',
    },
    {
      id: 'ultra',
      name: 'ULTRA',
      subtitle: 'For power users',
      price: '$50',
      priceDetail: '/ month',
      HeaderIcon: Crown,
      isPremium: true,
      features: [
        { text: '5,000 credits / month', iconKey: 'coins', highlight: true },
        { text: 'Unlimited images (soft cap)', iconKey: 'image' },
        { text: '~30 mins Live feature / month', iconKey: 'video' },
        { text: '~25-40 videos / month', iconKey: 'film' },
        { text: 'All models + early access', iconKey: 'star' },
        { text: 'Instant priority queue', iconKey: 'zap' },
        { text: 'Infinite memory', iconKey: 'brain' },
        { text: 'API access', iconKey: 'plug' },
      ],
      buttonText: 'Choose Ultra',
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[10002] p-4"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div 
        className="relative bg-[#0a0a0a] rounded-2xl w-full max-w-[1200px] max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.4s cubic-bezier(0.3, 1.4, 0.6, 1)' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all z-10 hover:scale-110"
        >
          ×
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Choose Your Plan
            </h2>
            <p className="text-sm text-gray-500">Unlock the full power of Vizual</p>
          </div>

          {/* Plans Grid */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex-shrink-0 w-[280px] sm:w-[260px] lg:w-auto snap-center rounded-2xl p-5 flex flex-col transition-all duration-300 group
                  ${hoveredPlan === plan.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                  ${plan.isPremium 
                    ? 'bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-orange-950/40 border border-amber-500/30 shadow-[0_0_40px_rgba(251,191,36,0.1)]' 
                    : 'bg-[#111111] border border-white/5 hover:border-white/10'
                  }
                  ${plan.isPopular ? 'ring-1 ring-white/20' : ''}
                `}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Popular Badge - Animated Gradient */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg overflow-hidden"
                    style={{
                      background: 'linear-gradient(90deg, #fff, #888, #fff, #888, #fff)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                      color: '#000',
                    }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Premium Badge */}
                {plan.isPremium && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-md text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                    Premium
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110
                    ${plan.isPremium 
                      ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30' 
                      : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <plan.HeaderIcon size={18} className={plan.isPremium ? 'text-amber-400' : 'text-gray-400'} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold tracking-wider ${plan.isPremium ? 'text-amber-400' : 'text-white'}`}>
                      VIZUAL {plan.name}
                    </h3>
                    <p className="text-[10px] text-gray-500">{plan.subtitle}</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-4 pb-4 border-b border-white/5">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${plan.isPremium ? 'bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent' : 'text-white'}`}>
                      {plan.price}
                    </span>
                    {plan.priceDetail && (
                      <span className="text-xs text-gray-500">{plan.priceDetail}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2.5 mb-5">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 group/feature">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover/feature:scale-110
                        ${plan.isPremium 
                          ? 'bg-amber-500/10 text-amber-400/80 group-hover/feature:bg-amber-500/20' 
                          : 'bg-white/5 text-gray-500 group-hover/feature:bg-white/10 group-hover/feature:text-gray-300'
                        }`}
                      >
                        {IconMap[feature.iconKey]}
                      </div>
                      <span className={`text-xs transition-colors group-hover/feature:text-white
                        ${feature.highlight 
                          ? 'text-white font-semibold' 
                          : 'text-gray-400'
                        }`}
                      >
                        {feature.highlight && (
                          <span className={`inline-block mr-1 px-1.5 py-0.5 rounded text-[10px] font-bold
                            ${plan.isPremium 
                              ? 'bg-amber-500/20 text-amber-400' 
                              : 'bg-white/10 text-white'
                            }`}
                          >
                            {feature.text.split(' ')[0]}
                          </span>
                        )}
                        {feature.highlight ? feature.text.split(' ').slice(1).join(' ') : feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => plan.isCurrent ? onClose() : handleUpgrade(plan.id as 'basic' | 'pro' | 'ultra')}
                  disabled={plan.isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group/btn
                    ${plan.isCurrent 
                      ? 'bg-white/5 text-gray-600 border border-white/5 cursor-default' 
                      : plan.isPremium
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:-translate-y-0.5'
                        : 'bg-white text-black hover:bg-gray-100 hover:-translate-y-0.5'
                    }
                  `}
                >
                  {!plan.isCurrent && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  )}
                  <span className="relative">{plan.buttonText}</span>
                </button>

                {/* Secure Badge */}
                {!plan.isCurrent && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] text-gray-600 uppercase tracking-wider">
                    <span>◆</span>
                    <span>Secured by Stripe</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="text-center mt-6 text-[10px] text-gray-600">
            All plans auto-renew monthly. Cancel anytime. Credits don&apos;t roll over.
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
};

export default PaywallModal;
