"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './google-ai.css';
import { GlowingEffectDemoSecond } from '../../src/components/google-ai/GlowingEffectGrid';
import { VertexSidebar } from '../../src/components/VertexSidebar';

export default function GoogleAIPage() {
  const router = useRouter();

  return (
    <div className="google-ai-studio-page">
      {/* Sidebar */}
      <VertexSidebar showApiKeyButton={true} />

      {/* Main Content */}
      <main className="studio-main" style={{ marginLeft: 0 }}>
        {/* Close Button */}
        <button className="studio-close-btn" onClick={() => router.push('/google-ai-studio')}>
          ✕
        </button>

        {/* Hero Section - Matches New User Image */}
        <section className="dev-hero">
          <div className="dev-hero-content">
            <h1 className="dev-hero-title">
              Integrate Google AI<br />models with an API key
            </h1>
            <p className="dev-hero-subtitle">
              Build with cutting-edge AI models, like Gemini, Imagen,<br />
              and Veo, from Google DeepMind
            </p>
            <div className="dev-hero-buttons">
              <button className="dev-primary-btn">
                View Gemini API docs
              </button>
            </div>
          </div>

          <div className="dev-hero-visual">
            {/* 3D Layer Stack Visual */}
            <div className="layer-stack">
              <div className="layer layer-1">
                <div className="layer-content">Python</div>
              </div>
              <div className="layer layer-2">
                <div className="layer-content">Node.js</div>
              </div>
              <div className="layer layer-3">
                <div className="layer-content">REST</div>
              </div>
              <div className="layer layer-4">
                <div className="layer-content">Go</div>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Cards Section */}
        <section className="dev-section">
          <div className="integration-grid">
            {/* Card 1 */}
            <div className="integration-card">
              <div className="card-visual">
                <div className="visual-box database-visual">
                  <span className="visual-icon">🗄️</span>
                  <div className="connection-line"></div>
                  <span className="visual-icon-small">☁️</span>
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">Integrate models into apps</h3>
                <p className="card-desc">
                  Unlock AI capabilities for your apps with a simple call to the Gemini API.
                </p>
                <button className="card-btn">
                  <span className="btn-sparkle">✦</span> Gemini API docs
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="integration-card">
              <div className="card-visual">
                <div className="visual-box code-visual">
                  <div className="code-line"></div>
                  <div className="code-line short"></div>
                  <button className="run-badge">✦ Run</button>
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">Explore AI models</h3>
                <p className="card-desc">
                  Quickly evaluate AI models, develop prompts, and transform ideas into code.
                </p>
                <button className="card-btn">
                  <span className="btn-sparkle">✦</span> Google AI Studio
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cloud Run Deployment Section */}
        <section className="dev-section">
          <div className="deploy-card">
            <div className="deploy-content">
              <h2 className="deploy-title">Deploy on Google Cloud Run</h2>
              <p className="deploy-desc">
                Ship your AI applications instantly. Serverless, scalable, and secure deployment for free.
              </p>
              <a
                href="https://console.cloud.google.com/run/create?enableapi=false&deploymentType=repository&project=omi-ai-474603"
                target="_blank"
                rel="noopener noreferrer"
                className="deploy-btn"
              >
                <span className="rocket-icon">🚀</span> Deploy Now
              </a>
            </div>
            <div className="deploy-visual">
              <div className="cloud-icon">
                <div className="cloud-puff"></div>
                <div className="cloud-puff"></div>
                <div className="cloud-puff"></div>
              </div>
              <div className="server-lines">
                <div className="server-line"></div>
                <div className="server-line"></div>
                <div className="server-line"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
