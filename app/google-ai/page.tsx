"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './google-ai.css';

export default function GoogleAIPage() {
  const router = useRouter();

  const geminiCards = [
    {
      title: 'Summarize info from two PDFs',
      description: '',
      prompt: '',
      image: '',
      gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FFA07A 100%)'
    },
    {
      title: 'Explain asynchronous programming in JavaScript',
      description: '',
      prompt: '',
      image: '',
      gradient: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)'
    },
    {
      title: 'Give me ideas for a LinkedIn post',
      description: '',
      prompt: '',
      image: '',
      gradient: 'linear-gradient(135deg, #9370DB 0%, #8A2BE2 100%)'
    },
    {
      title: 'Summarize a news clip with images and ask questions',
      description: '',
      prompt: '',
      image: '',
      gradient: 'linear-gradient(135deg, #20B2AA 0%, #3CB371 100%)'
    },
    {
      title: 'Create a custom recipe from ingredients',
      description: '',
      prompt: '',
      image: '',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
    },
    {
      title: 'Devise a chess strategy',
      description: '',
      prompt: '',
      image: '',
      gradient: 'linear-gradient(135deg, #4682B4 0%, #1E90FF 100%)'
    },
    {
      title: 'Plan out a content plan',
      description: '',
      prompt: '',
      image: '',
      gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)'
    },
    {
      title: 'Craft a creative shop business plan',
      description: '',
      prompt: '',
      image: '',
      gradient: 'linear-gradient(135deg, #DDA0DD 0%, #DA70D6 100%)'
    }
  ];

  const aiCards = [
    {
      title: 'Ask anything, any language — even voice and images',
      description: 'Chat with Gemini, your personal AI assistant',
      image: '',
      buttonText: 'Try Gemini',
      url: 'https://gemini.google.com',
      gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    },
    {
      title: 'Chat with Gemini, your personal AI assistant',
      description: '',
      image: '',
      buttonText: 'Try Gemini',
      url: 'https://gemini.google.com',
      gradient: 'linear-gradient(135deg, #0F52BA 0%, #1E90FF 100%)'
    },
    {
      title: 'Seamlessly create cinematic clips, scenes and stories',
      description: '',
      image: '',
      buttonText: 'Create with Veo',
      url: 'https://deepmind.google/veo',
      gradient: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)'
    },
    {
      title: 'Create and edit images with Imagen',
      description: '',
      image: '',
      buttonText: 'Try Imagen',
      url: 'https://deepmind.google/imagen',
      gradient: 'linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)'
    },
    {
      title: 'Understand anything with your research and thinking partner',
      description: '',
      image: '',
      buttonText: 'Try NotebookLM',
      url: 'https://notebooklm.google',
      gradient: 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)'
    },
    {
      title: 'Turn your photos into videos using Veo 2',
      description: '',
      image: '',
      buttonText: 'Try in Gemini',
      url: 'https://gemini.google.com',
      gradient: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)'
    }
  ];

  return (
    <div className="google-ai-page">
      {/* Futuristic Neon Banner */}
      <div className="google-ai-banner">
        <div className="banner-gradient-orb orb-1"></div>
        <div className="banner-gradient-orb orb-2"></div>
        <div className="banner-gradient-orb orb-3"></div>
        <div className="banner-content">
          <a 
            href="https://ai.google/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="banner-link"
          >
            <div className="banner-logo">
              <span className="banner-google">Google</span>
              <span className="banner-ai">AI</span>
            </div>
            <div className="banner-tagline">Explore the future of AI</div>
          </a>
        </div>
      </div>

      {/* Close Button */}
      <button className="google-ai-close-btn" onClick={() => router.push('/google-ai-studio')}>
        ✕
      </button>

      <div className="google-ai-container">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            Try <span className="gemini-sparkle">✨</span> Gemini
          </h1>
          <div className="hero-search">
            <input 
              type="text" 
              placeholder="Search..." 
              className="hero-search-input"
            />
            <button className="hero-search-btn">→</button>
          </div>
        </section>

        {/* Gemini Prompt Cards */}
        <section className="gemini-cards-section">
          <div className="cards-grid">
            {geminiCards.map((card, index) => (
              <div 
                key={index} 
                className="gemini-card"
                style={{ background: card.gradient }}
              >
                <div className="card-content">
                  <p className="card-title">{card.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Get Started with Google AI */}
        <section className="get-started-section">
          <h2 className="section-title">Get started with Google AI</h2>
          
          <div className="ai-cards-grid">
            {aiCards.map((card, index) => (
              <div 
                key={index} 
                className="ai-card"
                style={{ background: card.gradient }}
              >
                <div className="ai-card-content">
                  <h3 className="ai-card-title">{card.title}</h3>
                  {card.description && (
                    <p className="ai-card-description">{card.description}</p>
                  )}
                  <button 
                    className="ai-card-btn"
                    onClick={() => window.open(card.url, '_blank')}
                  >
                    {card.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
