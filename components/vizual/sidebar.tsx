"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    FolderKanban,
    Home,
    Radio,
    Lightbulb,
    Compass,
    MessageSquareQuote,
    Plus,
    ChevronDown,
    PanelLeftClose,
    PanelLeft,
    X,
    User,
    Zap,
    Image
} from "lucide-react";
import { Space_Grotesk } from "next/font/google";
import { useAuth } from "@/context/auth-context";
import { CreditDisplay } from "./CreditDisplay";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    expanded: boolean;
    onClick?: () => void;
}

const NavItem = ({ icon, label, active, expanded, onClick }: NavItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 ${expanded ? 'px-3' : 'justify-center'} py-2.5 rounded-lg transition-colors ${active
            ? 'bg-white/10 text-white font-semibold'
            : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
            }`}
        title={!expanded ? label : undefined}
    >
        <span className={`${active ? 'text-white' : 'text-gray-400'} flex-shrink-0`}>{icon}</span>
        {expanded && <span className="text-sm">{label}</span>}
    </button>
);

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    sidebarExpanded: boolean;
    setSidebarExpanded: (expanded: boolean) => void;
    activePage?: 'STUDIO' | 'PROJECTS' | 'LIVE' | 'COMMUNITY' | 'INSPIRATION' | 'AVATAR';
    onAction?: (page: 'STUDIO' | 'PROJECTS' | 'LIVE' | 'COMMUNITY' | 'INSPIRATION' | 'AVATAR') => void;
    onProfileClick?: () => void;
    onFeedbackClick?: () => void;
    onInspirationClick?: () => void;
    onCreateNew?: () => void;
    onUpgradeClick?: () => void;
}

export function Sidebar({
    sidebarOpen,
    setSidebarOpen,
    sidebarExpanded,
    setSidebarExpanded,
    activePage,
    onAction,
    onProfileClick,
    onFeedbackClick,
    onInspirationClick,
    onCreateNew,
    onUpgradeClick
}: SidebarProps) {
    const router = useRouter();
    const { user } = useAuth();

    const handleNav = (path: string, pageKey: 'STUDIO' | 'PROJECTS' | 'LIVE' | 'COMMUNITY' | 'INSPIRATION' | 'AVATAR') => {
        setSidebarOpen(false);

        // If we're already on the page or have an action handler, use it
        if (onAction) {
            onAction(pageKey);
        }

        // Always navigate to the correct path
        router.push(path);
    };

    return (
        <>
            {/* Mobile Menu Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed md:relative z-50 flex-shrink-0
        ${sidebarExpanded ? 'w-56' : 'w-16'} 
        bg-black border-r border-white/5 
        flex flex-col py-4
        h-full
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                {/* Close button - mobile only */}
                {sidebarOpen && (
                    <button
                        className="absolute top-4 right-[-40px] md:hidden p-2 bg-black/50 rounded-r-lg text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Logo & Toggle Row */}
                <div className={`flex items-center ${sidebarExpanded ? 'justify-between px-4' : 'justify-center'} mb-4 flex-shrink-0`}>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('/vizual/studio', 'STUDIO')}>
                        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white flex-shrink-0">
                            <path d="M25 20 L85 50 L25 80 V20 Z" fill="currentColor" />
                        </svg>
                        {sidebarExpanded && <span className={`font-bold text-sm uppercase tracking-wide ${spaceGrotesk.className}`}>VIZUAL</span>}
                    </div>
                    <button
                        className="hidden md:flex p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}
                        title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {sidebarExpanded ? <PanelLeftClose size={18} className="text-gray-400" /> : <PanelLeft size={18} className="text-gray-400" />}
                    </button>
                </div>

                {/* Create New Button */}
                <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} mb-4 flex-shrink-0`}>
                    <button
                        onClick={onCreateNew || (() => handleNav('/vizual/studio', 'STUDIO'))}
                        className={`w-full flex items-center gap-2 ${sidebarExpanded ? 'px-3 justify-start' : 'justify-center'} py-2.5 rounded-lg bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-white font-medium text-sm`}
                    >
                        <Plus size={18} />
                        {sidebarExpanded && <span>Create New</span>}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className={`flex-1 flex flex-col gap-1 ${sidebarExpanded ? 'px-3' : 'px-2'} overflow-y-auto`}>
                    <NavItem
                        icon={<FolderKanban size={20} />}
                        label="Projects"
                        active={activePage === 'PROJECTS'}
                        expanded={sidebarExpanded}
                        onClick={() => handleNav('/vizual/studio', 'PROJECTS')}
                    />
                    <NavItem
                        icon={<Home size={20} />}
                        label="Studio"
                        active={activePage === 'STUDIO'}
                        expanded={sidebarExpanded}
                        onClick={() => handleNav('/vizual/studio', 'STUDIO')}
                    />
                    <NavItem
                        icon={<Radio size={20} />}
                        label="Live"
                        active={activePage === 'LIVE'}
                        expanded={sidebarExpanded}
                        onClick={() => handleNav('/vizual/live', 'LIVE')}
                    />
                    <NavItem
                        icon={<User size={20} />}
                        label="Avatar"
                        active={activePage === 'AVATAR'}
                        expanded={sidebarExpanded}
                        onClick={() => handleNav('/vizual/avatar', 'AVATAR')}
                    />
                    <NavItem
                        icon={<Lightbulb size={20} />}
                        label="Inspiration"
                        active={activePage === 'INSPIRATION'}
                        expanded={sidebarExpanded}
                        onClick={() => {
                            setSidebarOpen(false);
                            if (onInspirationClick) {
                                onInspirationClick();
                            } else {
                                // Navigate to studio with inspiration view
                                router.push('/vizual/studio?view=inspiration');
                            }
                        }}
                    />
                </nav>

                {/* Bottom Section */}
                <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} pt-4 border-t border-white/5 mt-4 flex-shrink-0 space-y-2`}>
                    {/* Credit Display - Only show when expanded */}
                    {sidebarExpanded && (
                        <CreditDisplay 
                            variant="compact" 
                            showUpgrade={true}
                            onUpgradeClick={onUpgradeClick}
                            className="mb-3"
                        />
                    )}
                    
                    <button
                        onClick={() => window.open('https://discord.gg/CKXWA8Ctc2', '_blank')}
                        className={`w-full flex items-center gap-3 ${sidebarExpanded ? 'px-3' : 'justify-center'} py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors`}
                        title={!sidebarExpanded ? 'Discord' : undefined}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        {sidebarExpanded && <span className="text-sm">Discord</span>}
                    </button>
                    <NavItem
                        icon={<MessageSquareQuote size={20} />}
                        label="Feedback"
                        expanded={sidebarExpanded}
                        onClick={onFeedbackClick}
                    />
                    <button
                        onClick={onProfileClick}
                        className={`w-full flex items-center gap-3 ${sidebarExpanded ? 'px-2' : 'justify-center'} py-2 rounded-lg hover:bg-white/5 transition-colors`}
                    >
                        {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                            <img
                                src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'G')[0].toUpperCase()}
                            </div>
                        )}
                        {sidebarExpanded && (
                            <div className="flex-1 text-left min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                    {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Artist'}
                                </div>
                            </div>
                        )}
                        {sidebarExpanded && <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                    </button>
                </div>
            </aside>
        </>
    );
}
