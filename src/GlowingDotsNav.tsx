"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './GlowingDotsNav.css';

interface DotItem {
    id: string;
    label: string;
    path: string;
    color: string;
}

const dots: DotItem[] = [
    { id: 'chat', label: 'Omi Chat', path: '/chat', color: '#00C8FF' },
    { id: 'search', label: 'Web Search', path: '/web-search', color: '#00FF9D' },
    { id: 'media', label: 'Media Studio', path: '/media-studio', color: '#FF00D4' },
    { id: 'workflows', label: 'AI Workflows', path: '/ai-workflows', color: '#FFE600' },
    { id: 'custom', label: 'Custom Omis', path: '/custom-omis', color: '#9D00FF' },
    { id: 'google', label: 'Google AI', path: '/google-ai-studio', color: '#4285F4' },
    { id: 'replicate', label: 'Replicate', path: '/replicate-studio', color: '#C0C0C0' },
];

const GlowingDotsNav: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show on landing page ('/') or login page ('/login')
    if (pathname === '/' || pathname === '/login') {
        return null;
    }

    return (
        <div className="glowing-dots-nav-container">
            {dots.map((dot) => (
                <div
                    key={dot.id}
                    className="glowing-dot"
                    style={{ '--dot-color': dot.color } as React.CSSProperties}
                    onClick={() => router.push(dot.path)}
                >
                    <div className="glowing-dot-tooltip">{dot.label}</div>
                </div>
            ))}
        </div>
    );
};

export default GlowingDotsNav;
