"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const CDN_BASE = "https://storage.googleapis.com/vizual-cdn-assets";

export interface ChromaGridItem {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
}

export interface ChromaGridProps {
  items?: ChromaGridItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  onClose?: () => void;
  onPersonaSelect?: (persona: ChromaGridItem) => void;
  selectedPersona?: string | null;
}

export const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = '',
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  onClose,
  onPersonaSelect,
  selectedPersona
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<any>(null);
  const setY = useRef<any>(null);
  const pos = useRef({ x: 0, y: 0 });

  // AI Personas demo data
  const demo: ChromaGridItem[] = [
    {
      image: 'https://i.pravatar.cc/300?img=8',
      title: 'The Teacher',
      subtitle: 'Patient & Explanatory',
      handle: '@educator',
      borderColor: '#4F46E5',
      gradient: 'linear-gradient(145deg, #4F46E5, #000)',
      url: '#'
    },
    {
      image: 'https://i.pravatar.cc/300?img=11',
      title: 'The Critic',
      subtitle: 'Analytical & Direct',
      handle: '@analyst',
      borderColor: '#EF4444',
      gradient: 'linear-gradient(210deg, #EF4444, #000)',
      url: '#'
    },
    {
      image: 'https://i.pravatar.cc/300?img=3',
      title: 'The Explorer',
      subtitle: 'Curious & Adventurous',
      handle: '@wanderer',
      borderColor: '#F59E0B',
      gradient: 'linear-gradient(165deg, #F59E0B, #000)',
      url: '#'
    },
    {
      image: 'https://i.pravatar.cc/300?img=16',
      title: 'The Poet',
      subtitle: 'Creative & Eloquent',
      handle: '@wordsmith',
      borderColor: '#8B5CF6',
      gradient: 'linear-gradient(195deg, #8B5CF6, #000)',
      url: '#'
    },
    {
      image: `${CDN_BASE}/images/personas/scientist.jpg`,
      title: 'The Scientist',
      subtitle: 'Logical & Precise',
      handle: '@researcher',
      borderColor: '#10B981',
      gradient: 'linear-gradient(225deg, #10B981, #000)',
      url: '#'
    },
    {
      image: 'https://i.pravatar.cc/300?img=60',
      title: 'The Friend',
      subtitle: 'Supportive & Empathetic',
      handle: '@companion',
      borderColor: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4, #000)',
      url: '#'
    }
  ];
  
  const data = items?.length ? items : demo;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    if (setX.current) setX.current(pos.current.x);
    if (setY.current) setY.current(pos.current.y);
  }, []);

  // Esc key listener to close ChromaGrid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true
    });
  };

  const handleCardClick = (persona: ChromaGridItem) => {
    // If there's a URL and it's not a placeholder, open it
    if (persona.url && persona.url !== '#') {
      window.open(persona.url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Otherwise, handle persona selection
    if (onPersonaSelect) {
      onPersonaSelect(persona);
      console.log('Selected persona:', persona.title);
      
      // Don't close the ChromaGrid - keep it open so users can see the selection
      // They can close it manually with Esc or the close button
    }
  };

  const handleCardMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className={`chroma-grid-container active ${className}`}>
      <div
        ref={rootRef}
        className="chroma-grid"
        style={{
          '--r': `${radius}px`,
          '--cols': columns,
          '--rows': rows
        } as React.CSSProperties}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <div ref={fadeRef} className="chroma-grid-fade" />
        
        {/* Close Button */}
        {onClose && (
          <button 
            className="chroma-grid-close"
            onClick={onClose}
            aria-label="Close personas"
          >
            ×
          </button>
        )}
        
        {/* Grid Content */}
        <div className="chroma-grid-content">
          {data.map((c, i) => {
            const isSelected = selectedPersona === c.title;
            return (
              <article
                key={i}
                className={`chroma-grid-card ${isSelected ? 'selected' : ''}`}
                onMouseMove={handleCardMove}
                onClick={() => handleCardClick(c)}
                style={{
                  '--border-color': c.borderColor || '#e5e5e5',
                  '--card-gradient': c.gradient || 'linear-gradient(135deg, #e5e5e5, #000)',
                  cursor: c.url && c.url !== '#' ? 'pointer' : 'default'
                } as React.CSSProperties}
              >
                {isSelected && (
                  <div className="chroma-grid-selected-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="11" fill={c.borderColor || '#e5e5e5'} />
                      <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <img 
                  src={c.image} 
                  alt={c.title} 
                  className="chroma-grid-avatar"
                  loading="lazy" 
                />
                <h3 className="chroma-grid-title">{c.title}</h3>
                <p className="chroma-grid-subtitle">{c.subtitle}</p>
                {c.handle && <span className="chroma-grid-handle">{c.handle}</span>}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChromaGrid;