'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, Heart, Link2, Download, Sparkles } from 'lucide-react';

// Toast types with their icons and colors
type ToastType = 'success' | 'error' | 'info' | 'favorite' | 'copied' | 'download';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast configuration per type
const toastConfig: Record<ToastType, {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    bgGradient: string;
    borderColor: string;
    iconColor: string;
}> = {
    success: {
        icon: CheckCircle,
        bgGradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
        borderColor: 'border-emerald-500/30',
        iconColor: 'text-emerald-400',
    },
    error: {
        icon: AlertCircle,
        bgGradient: 'from-red-500/20 via-red-600/10 to-transparent',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400',
    },
    info: {
        icon: Info,
        bgGradient: 'from-blue-500/20 via-blue-600/10 to-transparent',
        borderColor: 'border-blue-500/30',
        iconColor: 'text-blue-400',
    },
    favorite: {
        icon: Heart,
        bgGradient: 'from-red-500/20 via-red-600/10 to-transparent',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400',
    },
    copied: {
        icon: Link2,
        bgGradient: 'from-white/20 via-white/10 to-transparent',
        borderColor: 'border-white/30',
        iconColor: 'text-gray-300',
    },
    download: {
        icon: Download,
        bgGradient: 'from-cyan-500/20 via-cyan-600/10 to-transparent',
        borderColor: 'border-cyan-500/30',
        iconColor: 'text-cyan-400',
    },
};

// Individual Toast Component
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, toast.duration || 3000);
        return () => clearTimeout(timer);
    }, [toast.duration, onDismiss]);

    return (
        <div
            className={`
        relative overflow-hidden
        flex items-center gap-3 
        px-4 py-3.5
        bg-gradient-to-r ${config.bgGradient}
        backdrop-blur-xl
        border ${config.borderColor}
        rounded-2xl
        shadow-2xl shadow-black/50
        animate-slide-in-right
        min-w-[280px] max-w-[400px]
        group
      `}
            style={{
                animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl -z-10" />

            {/* Animated glow effect */}
            <div
                className={`absolute -inset-1 bg-gradient-to-r ${config.bgGradient} opacity-50 blur-xl -z-20`}
                style={{ animation: 'pulse 2s infinite' }}
            />

            {/* Icon with subtle animation */}
            <div className={`flex-shrink-0 ${config.iconColor}`}>
                <Icon size={22} className="drop-shadow-lg" />
            </div>

            {/* Message */}
            <p className="flex-1 text-sm font-medium text-white/90 leading-snug">
                {toast.message}
            </p>

            {/* Close button */}
            <button
                onClick={onDismiss}
                className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
                <X size={14} className="text-white/50 hover:text-white/80" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${config.bgGradient.replace('/20', '/60').replace('/10', '/40')}`}
                    style={{
                        animation: `shrink ${toast.duration || 3000}ms linear forwards`,
                    }}
                />
            </div>
        </div>
    );
}

// Toast Container with Provider
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast }}>
            {children}

            {/* Toast Container - Fixed position */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem
                            toast={toast}
                            onDismiss={() => dismissToast(toast.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Global styles for animations */}
            <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
        </ToastContext.Provider>
    );
}

// Export a standalone toast function for non-component contexts
let globalShowToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export function setGlobalToast(showToastFn: typeof globalShowToast) {
    globalShowToast = showToastFn;
}

export function toast(message: string, type: ToastType = 'info', duration: number = 3000) {
    if (globalShowToast) {
        globalShowToast(message, type, duration);
    } else {
        console.warn('Toast system not initialized. Falling back to console:', message);
    }
}
