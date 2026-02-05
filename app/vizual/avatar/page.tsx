"use client";

import { useState } from "react";
import { Sidebar } from "@/components/vizual/sidebar";
import { useRouter } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { ExternalLink, ArrowRight, Menu } from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export default function AvatarPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const router = useRouter();


    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
                activePage="AVATAR"
                onProfileClick={() => router.push('/vizual/studio')}
                onFeedbackClick={() => router.push('/vizual/studio')}
                onInspirationClick={() => router.push('/vizual/studio?view=inspiration')}
            />

            <main className="flex-1 relative flex flex-col bg-black overflow-hidden relative">

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black/80 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                    onClick={() => setSidebarOpen(true)}
                >
                    <Menu size={24} className="text-white" />
                </button>

                {/* Background ambient glow */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center min-h-[800px]">

                    <div className="max-w-4xl w-full flex flex-col items-center text-center z-10">
                        {/* Logo */}
                        <div className="mb-8 w-24 h-24 md:w-32 md:h-32 bg-black rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-50" />
                            <img
                                src="/images/percify-logo.png"
                                alt="Percify"
                                className="w-full h-full object-contain p-2 relative z-10 transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        {/* Heading */}
                        <div className="mb-8 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Partner Platform</span>
                            </div>

                            <h1 className={`text-4xl md:text-6xl font-bold text-white tracking-tight ${spaceGrotesk.className}`}>
                                Avatar features have <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">moved.</span>
                            </h1>

                            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                We've partnered with <span className="text-white font-semibold">Percify</span> to bring you specialized, next-generation AI avatar tools. All your favorite avatar features are now available on their dedicated platform.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
                            <a
                                href="https://percify.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(234,179,8,0.3)] flex items-center gap-2 group"
                            >
                                Visit Percify.io
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            <button
                                onClick={() => router.push('/vizual/studio')}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium text-lg rounded-xl border border-white/10 transition-colors"
                            >
                                Back to Studio
                            </button>
                        </div>

                        {/* Video Section */}
                        <div className="w-full max-w-3xl backdrop-blur-xl bg-black/40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                            <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors pointer-events-none z-0" />

                            <div className="relative z-10 p-1 bg-white/5">
                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src="https://www.youtube.com/embed/HhUaDpRvym8?rel=0"
                                        title="Percify Demo"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full border-0"
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="mt-6 text-sm text-gray-500 uppercase tracking-widest font-medium">
                            Watch the announcement video
                        </p>

                    </div>
                </div>
            </main>
        </div>
    );
}
