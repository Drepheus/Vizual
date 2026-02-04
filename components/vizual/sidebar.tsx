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
                    <NavItem
                        icon={<Compass size={20} />}
                        label="Community"
                        active={activePage === 'COMMUNITY'}
                        expanded={sidebarExpanded}
                        onClick={() => handleNav('/vizual/community', 'COMMUNITY')}
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
