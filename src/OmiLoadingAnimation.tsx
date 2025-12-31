"use client";

import { useEffect, useState } from 'react';
import MetallicPaint from './MetallicPaint';

export default function VizualLoadingAnimation() {
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    // Create Vizual logo programmatically
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 800;
    canvas.width = size;
    canvas.height = size;

    // Fill background with white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Draw Vizual logo - simple circle with "O" 
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    // Draw outer circle
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw inner circle (making it an O shape)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Add sparkle/star elements around the circle
    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const distance = radius * 1.4;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }

    // Get image data
    const data = ctx.getImageData(0, 0, size, size);
    setImageData(data);
  }, []);

  if (!imageData) {
    return null;
  }

  return (
    <MetallicPaint
      imageData={imageData}
      params={{
        patternScale: 1,
        refraction: 0.07,
        edge: 0,
        patternBlur: 0,
        liquid: 0.75,
        speed: 0.39
      }}
    />
  );
}
