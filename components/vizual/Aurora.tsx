"use client";

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="aurora-container bg-black" />;
  }

  return (
    <div className="aurora-container" style={{ contain: 'layout style paint' }}>
      {/* Animated gradient layers - GPU accelerated */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 120%, ${colorStops[0]} 0%, transparent 50%)`,
          animation: `aurora-drift ${20 / speed}s ease-in-out infinite`,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 30% 110%, ${colorStops[1]} 0%, transparent 45%)`,
          animation: `aurora-drift ${25 / speed}s ease-in-out infinite reverse`,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 70% 45% at 70% 115%, ${colorStops[2]} 0%, transparent 50%)`,
          animation: `aurora-drift ${30 / speed}s ease-in-out infinite`,
          animationDelay: '-5s',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}
