import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GoogleAIStudio.css';

interface GoogleAIStudioProps {
  onClose?: () => void;
}

const promptCards = [
  {
    icon: '🪴',
    title: 'Outline a backyard garden plan',
    color: '#4a5c3a'
  },
  {
    icon: '🍦',
    title: 'Create surreal photorealistic ice cream',
    color: '#5a3a5c'
  },
  {
    icon: '📚',
    title: 'Build a multiple-choice study guide',
    color: '#2a2a2a'
  },
  {
    icon: '🥾',
    title: 'Map out hike-friendly national park options',
    color: '#3a5c4a'
  },
  {
    icon: '🖼️',
    title: 'Restore an old picture',
    color: '#4a5c6c'
  },
  {
    icon: '✈️',
    title: 'Plan a family trip',
    color: '#2a2a2a'
  },
  {
    icon: '📝',
    title: 'Summarize long documents',
    color: '#5c4a3a'
  },
  {
    icon: '🎨',
    title: 'Generate creative content',
    color: '#3a4a5c'
  },
  {
    icon: '💡',
    title: 'Brainstorm new ideas',
    color: '#5c3a4a'
  },
  {
    icon: '🔍',
    title: 'Research complex topics',
    color: '#3a5c5c'
  }
];

export default function GoogleAIStudio({ onClose }: GoogleAIStudioProps) {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start the scroll animation
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      if (container) {
        scrollPosition += scrollSpeed;
        if (scrollPosition >= container.scrollWidth / 2) {
          scrollPosition = 0;
        }
        container.scrollLeft = scrollPosition;
      }
    };

    const intervalId = setInterval(animate, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, []);

  const handlePromptCardClick = (title: string) => {
    setPrompt(title);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/command-hub');
    }
  };

  return (
    <div className="google-ai-studio-page">
      <button className="google-ai-close-btn" onClick={handleClose}>
        ✕
      </button>

      <div className="google-ai-header">
        <h1 className="google-ai-title">
          Try <span className="gemini-star">✦</span> Gemini
        </h1>
      </div>

      <div className="google-ai-search-container">
        <div className="google-ai-search-wrapper">
          <input
            type="text"
            className="google-ai-search-input"
            placeholder="Ask Gemini"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button className="google-ai-send-btn" disabled={!prompt.trim()}>
            ▶
          </button>
        </div>
      </div>

      <div className="google-ai-prompts-section">
        <div className="google-ai-prompts-scroll" ref={scrollContainerRef}>
          {/* Duplicate cards for seamless loop */}
          {[...promptCards, ...promptCards].map((card, index) => (
            <div
              key={index}
              className="google-ai-prompt-card"
              style={{ backgroundColor: card.color }}
              onClick={() => handlePromptCardClick(card.title)}
            >
              <div className="prompt-card-icon">{card.icon}</div>
              <p className="prompt-card-title">{card.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}