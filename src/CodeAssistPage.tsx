"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compare } from "./components/ui/compare";
import { TypewriterEffect } from "./components/ui/typewriter-effect";
import { MacbookScroll } from "./components/ui/macbook-scroll";
import "./GoogleAIStudio.css"; // Reusing the same CSS for layout

export default function CodeAssistPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const router = useRouter();

    const handleClose = () => {
        router.push('/command-hub');
    };

    return (
        <div className="google-studio-page">
            <div className="studio-background">
                <div className="studio-gradient-orb studio-orb-1"></div>
                <div className="studio-gradient-orb studio-orb-2"></div>
                <div className="studio-gradient-orb studio-orb-3"></div>
            </div>

            {/* Vertex AI Sidebar */}
            <div className={`studio-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">◆</span>
                        {!sidebarCollapsed && <span className="logo-text">Vertex AI</span>}
                    </div>
                    <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <div className="sidebar-nav">
                    <button className="sidebar-item" onClick={() => router.push('/google-ai-studio')}>
                        <span className="sidebar-icon">🏠</span>
                        {!sidebarCollapsed && <span className="sidebar-label">Home</span>}
                    </button>
                    <button className="sidebar-item" onClick={() => router.push('/google-ai')}>
                        <span className="sidebar-icon">🤖</span>
                        {!sidebarCollapsed && <span className="sidebar-label">Google AI</span>}
                    </button>
                    <button className="sidebar-item">
                        <span className="sidebar-icon">💎</span>
                        {!sidebarCollapsed && <span className="sidebar-label">Gemini</span>}
                    </button>
                    <button className="sidebar-item">
                        <span className="sidebar-icon">🧠</span>
                        {!sidebarCollapsed && <span className="sidebar-label">DeepMind</span>}
                    </button>
                    <button className="sidebar-item" onClick={() => router.push('/veo')}>
                        <span className="sidebar-icon">🎬</span>
                        {!sidebarCollapsed && <span className="sidebar-label">Veo</span>}
                    </button>
                    <button className="sidebar-item active">
                        <span className="sidebar-icon">💻</span>
                        {!sidebarCollapsed && <span className="sidebar-label">Code Assist</span>}
                    </button>
                </div>
            </div>

            <button className="studio-close-btn" onClick={handleClose}>
                <span className="studio-back-arrow">←</span> Command Hub
            </button>

            <div className="studio-container">
                {/* Hero Section - Gemini Terminal Style */}
                <div className="mb-10 relative rounded-3xl overflow-hidden border border-neutral-800 bg-[#0a0a0a] p-10 min-h-[400px] flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-8 bg-[#1a1a1a] flex items-center px-4 gap-2 border-b border-neutral-800">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="ml-4 text-xs text-neutral-500 font-mono">gemini-code-assist — -zsh — 80x24</div>
                    </div>

                    <div className="mt-8 text-center z-10">
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 font-mono text-transparent bg-clip-text bg-gradient-to-b from-neutral-100 to-neutral-600">
                            GEMINI
                        </h1>
                        <div className="font-mono text-blue-400 text-lg md:text-xl mb-8">
                            &gt; Initializing advanced coding protocols...<span className="animate-pulse">_</span>
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                </div>

                {/* Typewriter Effect Demo */}
                <div className="mb-10">
                    <TypewriterEffectDemo />
                </div>

                {/* Macbook Scroll Demo */}
                <div className="mb-10">
                    <MacbookScrollDemo />
                </div>

                {/* Features Grid */}
                <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm hover:bg-neutral-900/80 transition-colors">
                        <div className="text-3xl mb-3">⚡</div>
                        <h3 className="text-lg font-bold mb-2 text-white">Real-time Suggestions</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">Get intelligent code completions as you type, powered by Google's most advanced models.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm hover:bg-neutral-900/80 transition-colors">
                        <div className="text-3xl mb-3">🛡️</div>
                        <h3 className="text-lg font-bold mb-2 text-white">Enterprise Security</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">Your code stays yours. Enterprise-grade security and compliance built-in.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm hover:bg-neutral-900/80 transition-colors">
                        <div className="text-3xl mb-3">🔄</div>
                        <h3 className="text-lg font-bold mb-2 text-white">Multi-language Support</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">Support for Python, Java, Go, C++, and many more popular languages.</p>
                    </div>
                </div>

                {/* Firebase Studio Section */}
                <div className="mb-16 relative rounded-3xl overflow-hidden bg-[#1A1A1A] border border-neutral-800">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFCA28]/10 to-[#FF6F00]/10 opacity-30 pointer-events-none" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 items-center">
                        <div className="space-y-6 z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">🔥</span>
                                <h2 className="text-3xl font-bold text-white">Firebase Studio</h2>
                            </div>
                            <p className="text-neutral-300 text-lg leading-relaxed">
                                Build, test, and deploy AI-powered apps with Firebase.
                                Streamline your development workflow with a unified studio experience
                                designed for modern application development.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => window.open('https://firebase.studio/', '_blank')}
                                    className="px-6 py-3 bg-[#FFCA28] text-black font-bold rounded-full hover:bg-[#FFD54F] transition-colors flex items-center gap-2"
                                >
                                    Launch Studio <span>→</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative h-[300px] rounded-xl overflow-hidden border border-neutral-700 bg-[#0f0f0f] shadow-2xl">
                            {/* Mock UI for Firebase Studio */}
                            <div className="absolute top-0 left-0 w-full h-8 bg-[#1e1e1e] border-b border-neutral-700 flex items-center px-4 gap-2">
                                <div className="w-2 h-2 rounded-full bg-neutral-500"></div>
                                <div className="w-2 h-2 rounded-full bg-neutral-500"></div>
                                <div className="text-xs text-neutral-400 ml-2">Project Overview</div>
                            </div>
                            <div className="p-6 grid grid-cols-3 gap-4">
                                <div className="col-span-1 bg-[#252525] h-32 rounded-lg animate-pulse"></div>
                                <div className="col-span-2 bg-[#252525] h-32 rounded-lg animate-pulse delay-75"></div>
                                <div className="col-span-3 bg-[#252525] h-24 rounded-lg animate-pulse delay-150"></div>
                            </div>
                            <div className="absolute bottom-4 right-4 bg-[#FFCA28] text-black text-xs font-bold px-2 py-1 rounded">
                                PREVIEW
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jules Section */}
                <div className="mb-16 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#a1c4fd]/20 to-[#c2e9fb]/20 border border-blue-200/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 items-center">
                        <div className="order-2 md:order-1 relative h-[300px] flex items-center justify-center">
                            <div className="relative w-64 h-64 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-48 h-48 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <div className="text-6xl">👨‍💻</div>
                                </div>
                                <div className="absolute -top-4 -right-4 bg-white text-blue-600 px-4 py-2 rounded-full font-bold shadow-lg">
                                    AI Assistant
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 space-y-6 z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-white">Meet Jules</h2>
                            </div>
                            <p className="text-neutral-300 text-lg leading-relaxed">
                                Your AI-powered code assistant. Jules helps you write better code faster,
                                offering intelligent suggestions, refactoring tips, and automated documentation.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => window.open('https://jules.google.com/', '_blank')}
                                    className="px-6 py-3 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-400 transition-colors flex items-center gap-2"
                                >
                                    Chat with Jules <span>→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compare Demo */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-6 text-center">Visual Code Comparison</h2>
                    <CompareDemo />
                </div>
            </div>
        </div>
    );
}

function MacbookScrollDemo() {
    return (
        <div className="w-full overflow-hidden bg-[#0B0B0F] rounded-3xl border border-neutral-800 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50 pointer-events-none" />
            <MacbookScroll
                title={
                    <span className="text-4xl md:text-5xl font-bold tracking-tight">
                        Code smarter, not harder. <br />
                        <span className="text-blue-400">Gemini Code Assist.</span>
                    </span>
                }
                badge={
                    <div className="h-10 w-10 transform -rotate-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <span className="text-white font-bold text-xs">AI</span>
                    </div>
                }
                src={`https://assets.aceternity.com/linear.webp`}
                showGradient={true}
            />
        </div>
    );
}

function CompareDemo() {
    return (
        <div className="w-full h-[60vh] px-1 md:px-8 flex items-center justify-center [perspective:800px] [transform-style:preserve-3d]">
            <div
                style={{
                    transform: "rotateX(15deg) translateZ(80px)",
                }}
                className="p-1 md:p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100  border-neutral-200 dark:border-neutral-800 mx-auto w-3/4 h-1/2 md:h-3/4"
            >
                <Compare
                    firstImage="https://assets.aceternity.com/notes-dark.png"
                    secondImage="https://assets.aceternity.com/linear-dark.png"
                    firstImageClassName="object-cover object-left-top w-full"
                    secondImageClassname="object-cover object-left-top w-full"
                    className="w-full h-full rounded-[22px] md:rounded-lg"
                    slideMode="hover"
                    autoplay={true}
                />
            </div>
        </div>
    );
}

function TypewriterEffectDemo() {
    const words = [
        {
            text: "Build",
        },
        {
            text: "awesome",
        },
        {
            text: "apps",
        },
        {
            text: "with",
        },
        {
            text: "Gemini Code Assist.",
            className: "text-blue-500 dark:text-blue-500",
        },
    ];
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <p className="text-neutral-600 dark:text-neutral-200 text-base mb-8">
                The future of coding is here
            </p>
            <TypewriterEffect words={words} />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-8">
                <button className="w-40 h-10 rounded-xl bg-white text-black border border-black text-sm font-bold hover:bg-neutral-200 transition-colors">
                    Get Started
                </button>
                <button className="w-40 h-10 rounded-xl bg-transparent text-white border border-white/20 text-sm hover:bg-white/10 transition-colors">
                    Documentation
                </button>
            </div>
        </div>
    );
}
