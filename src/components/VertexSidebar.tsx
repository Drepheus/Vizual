"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './VertexSidebar.css';

interface VertexSidebarProps {
    showApiKeyButton?: boolean;
}

export function VertexSidebar({ showApiKeyButton = false }: VertexSidebarProps) {
    const [collapsed, setCollapsed] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', icon: '🏠', path: '/google-ai-studio' },
        { label: 'Google AI', icon: '🤖', path: '/google-ai' },
        { label: 'Gemini', icon: '💎', path: '/gemini' },
        { label: 'DeepMind', icon: '🧠', path: '#' },
        { label: 'Veo', icon: '🎬', path: '/veo' },
    ];

    return (
        <div className={`vertex-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">◆</span>
                    {!collapsed && <span className="logo-text">Google AI Studio</span>}
                </div>
                <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            <div className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        className={`sidebar-item ${pathname === item.path ? 'active' : ''}`}
                        onClick={() => item.path !== '#' && router.push(item.path)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        {!collapsed && <span className="sidebar-label">{item.label}</span>}
                    </button>
                ))}
            </div>

            {showApiKeyButton && !collapsed && (
                <div style={{ padding: '20px' }}>
                    <button
                        className="nav-api-btn"
                        onClick={() => window.open('https://aistudio.google.com/api-keys', '_blank')}
                        style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #0f0f23 0%, #050510 100%)',
                            border: '1px solid rgba(66, 133, 244, 0.3)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'center'
                        }}
                    >
                        🔑 Get API key
                    </button>
                </div>
            )}
        </div>
    );
}
