"use client";

import { useRouter } from 'next/navigation';
import MagicBento from './MagicBento';

export default function CommandHub() {
  const router = useRouter();

  return (
    <div className="command-hub-container">
      {/* Header */}
      <div className="command-hub-header">
        <h1 className="command-hub-title">Vizual Command Hub</h1>
        <p className="command-hub-subtitle">Explore AI-powered tools and features</p>
      </div>

      {/* Bento Grid */}
      <MagicBento
        textAutoHide={true}
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={false}
        clickEffect={true}
        enableMagnetism={true}
        glowColor="192, 192, 192"
        particleCount={12}
        spotlightRadius={300}
      />
    </div>
  );
}
