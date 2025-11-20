"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import './veo.css';
import { VertexSidebar } from '../../src/components/VertexSidebar';

export default function VeoPage() {
    const router = useRouter();
    const heroRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline();

        tl.fromTo(heroRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 1.5, ease: "power2.out" }
        )
            .fromTo(titleRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
                "-=1"
            )
            .fromTo(".veo-hero-subtitle",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
                "-=0.8"
            )
            .fromTo(".veo-cta-btn",
                { y: 20, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
                "-=0.6"
            );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        gsap.fromTo(entry.target.children,
                            { y: 50, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
                        );
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (featuresRef.current) {
            observer.observe(featuresRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="veo-page">
            {/* Navigation */}
            <VertexSidebar />
            <button className="veo-close-btn" onClick={() => router.push('/google-ai-studio')}>
                ✕
            </button>

            {/* Hero Section */}
            <section className="veo-hero" ref={heroRef}>
                <div className="veo-hero-bg">
                    <video
                        className="veo-hero-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="/videos/veo-hero.mp4" type="video/mp4" />
                    </video>
                    <div className="veo-hero-overlay"></div>

                    <div className="veo-hero-content">
                        <h1 className="veo-title" ref={titleRef}>
                            Veo
                        </h1>
                        <p className="veo-hero-subtitle">
                            Our state-of-the-art video generation model
                        </p>
                        <div className="veo-cta-group">
                            <button
                                className="veo-cta-btn primary"
                                onClick={() => document.querySelector('.use-veo-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Try Veo
                            </button>
                            <button
                                className="veo-cta-btn secondary"
                                onClick={() => window.open('https://deepmind.google/models/veo/', '_blank')}
                            >
                                Build with Veo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="veo-features" ref={featuresRef}>
                <div className="veo-feature-card">
                    <div className="feature-icon-box">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 6H3C1.89543 6 1 6.89543 1 8V16C1 17.1046 1.89543 18 3 18H21C22.1046 18 23 17.1046 23 16V8C23 6.89543 22.1046 6 21 6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 12L10 8V16L16 12Z" fill="white" />
                        </svg>
                    </div>
                    <h3>Re-designed for greater realism</h3>
                    <p>Greater realism and fidelity, made possible by Veo 3's real world physics and audio.</p>
                </div>
                <div className="veo-feature-card">
                    <div className="feature-icon-box">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="6" width="20" height="4" rx="2" stroke="white" strokeWidth="2" />
                            <rect x="2" y="14" width="20" height="4" rx="2" stroke="white" strokeWidth="2" />
                            <circle cx="8" cy="8" r="1" fill="white" />
                            <circle cx="16" cy="16" r="1" fill="white" />
                        </svg>
                    </div>
                    <h3>Follows prompts like never before</h3>
                    <p>Improved prompt adherence, meaning more accurate responses to your instructions.</p>
                </div>
                <div className="veo-feature-card">
                    <div className="feature-icon-box">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.5 2.5C16.5 2.5 14.5 4.5 14.5 4.5L4.5 14.5C4.5 14.5 2.5 16.5 2.5 18.5C2.5 20.5 4.5 22.5 4.5 22.5C4.5 22.5 6.5 20.5 8.5 20.5C10.5 20.5 12.5 18.5 12.5 18.5L22.5 8.5C22.5 8.5 24.5 6.5 24.5 4.5C24.5 2.5 22.5 2.5 22.5 2.5H18.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14.5 4.5L18.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8.5 20.5C8.5 20.5 9.5 19.5 11.5 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h3>Improved creative control</h3>
                    <p>Offers new levels of control, consistency, and creativity – now across audio.</p>
                </div>
            </section>

            {/* Showcase Section */}
            <section className="veo-showcase">
                <h2 className="showcase-title">Made with Veo</h2>
                <div className="showcase-grid">
                    <div className="showcase-item">
                        <video
                            className="showcase-video"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/videos/veo1.mp4" type="video/mp4" />
                        </video>
                        <div className="showcase-caption">Bathroom orchestra</div>
                    </div>
                    <div className="showcase-item">
                        <video
                            className="showcase-video"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/videos/veo2.mp4" type="video/mp4" />
                        </video>
                        <div className="showcase-caption">Helicopter DJ</div>
                    </div>
                    <div className="showcase-item">
                        <video
                            className="showcase-video"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/videos/veo3.mp4" type="video/mp4" />
                        </video>
                        <div className="showcase-caption">Mini walking Mushrooms</div>
                    </div>
                </div>
            </section>

            {/* Use Veo Section */}
            <section className="use-veo-section">
                <div className="use-veo-container">
                    <h2 className="use-veo-title">Create With <span className="highlight">Veo</span></h2>
                    <p className="use-veo-subtitle">Describe your vision and watch Veo bring it to life in stunning detail</p>

                    <div className="veo-input-container">
                        <textarea
                            className="veo-prompt-input"
                            placeholder="Design an artistic cinematic shot with dramatic lighting..."
                            rows={3}
                        ></textarea>

                        <div className="veo-input-controls">
                            <div className="veo-control-group">
                                <button className="veo-icon-btn" title="Add media">＋</button>
                                <button className="veo-pill-btn">
                                    <span>⏱️</span> Auto <span>▼</span>
                                </button>
                                <button className="veo-icon-btn" title="Aspect Ratio">📱</button>
                                <button className="veo-icon-btn" title="Settings">⚙️</button>
                            </div>

                            <button className="veo-generate-btn">
                                ✨ Generate
                            </button>
                        </div>
                    </div>

                    <div className="veo-suggestion-chips">
                        <button className="veo-chip">Cinematic drone shot</button>
                        <button className="veo-chip">Cyberpunk street scene</button>
                        <button className="veo-chip">Nature documentary</button>
                        <button className="veo-chip">Abstract animation</button>
                    </div>
                </div>
            </section>

            <footer className="veo-footer">
                <div className="footer-links">
                    <a href="#">About Google DeepMind</a>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                </div>
                <div className="footer-copy">© 2024 Google DeepMind</div>
            </footer>
        </div>
    );
}
