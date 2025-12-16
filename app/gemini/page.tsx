"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedSelect } from '@/components/ui/AnimatedSelect';
import './gemini.css';
import { GlowingEffectDemoSecond } from '../../src/components/google-ai/GlowingEffectGrid';
import { VertexSidebar } from '../../src/components/VertexSidebar';

export default function GeminiPage() {
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState('Gemini 3 Pro Preview');

    return (
        <div className="gemini-page">
            {/* Sidebar */}
            <VertexSidebar />

            {/* Main Content */}
            <main className="studio-main" style={{ marginLeft: 0 }}>
                {/* Close Button */}
                <button className="studio-close-btn" onClick={() => router.push('/google-ai-studio')}>
                    ✕
                </button>

                {/* Hero Section */}
                <section className="studio-hero">
                    <h1 className="studio-hero-title">
                        Build your ideas with <span className="gemini-gradient-text">Gemini</span>
                    </h1>
                </section>

                {/* Features Section */}
                <section className="studio-features">
                    <h2 className="features-title">Supercharge your apps with AI</h2>

                    <div className="w-full max-w-7xl mx-auto">
                        <GlowingEffectDemoSecond />
                    </div>
                </section>
            </main>
        </div>
    );
}
