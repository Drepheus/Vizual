"use client";

import { useEffect, useState, useRef } from 'react';
import './Aurora.css';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
}

export default function Aurora(props: AuroraProps) {
  const { colorStops = ['#0a2a1a', '#1a0a2e', '#0a1a2a'], speed = 0.3 } = props;
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Detect mobile device
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
  }, []);

  // Only animate when visible to save resources
  useEffect(() => {
    if (!containerRef.current || isMobile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  if (!mounted) {
    return <div className="aurora-container bg-black" />;
  }

  // On mobile, return a simple static gradient to prevent overheating
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className="aurora-container"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${colorStops[0]}40 100%)`,
          contain: 'layout style paint'
        }}
      />
    );
  }

  return (
    <div ref={containerRef} className="aurora-container" style={{ contain: 'layout style paint' }}>
      {/* Animated gradient layers - GPU accelerated, only when visible */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 120%, ${colorStops[0]} 0%, transparent 50%)`,
          animation: isVisible ? `aurora-drift ${20 / speed}s ease-in-out infinite` : 'none',
          willChange: isVisible ? 'transform' : 'auto',
          transform: 'translateZ(0)',
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 30% 110%, ${colorStops[1]} 0%, transparent 45%)`,
          animation: isVisible ? `aurora-drift ${25 / speed}s ease-in-out infinite reverse` : 'none',
          willChange: isVisible ? 'transform' : 'auto',
          transform: 'translateZ(0)',
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 70% 45% at 70% 115%, ${colorStops[2]} 0%, transparent 50%)`,
          animation: isVisible ? `aurora-drift ${30 / speed}s ease-in-out infinite` : 'none',
          animationDelay: '-5s',
          willChange: isVisible ? 'transform' : 'auto',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}

