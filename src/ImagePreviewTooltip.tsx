"use client";

import { useState, useEffect } from 'react';

const CDN_BASE = "https://storage.googleapis.com/vizual-cdn-assets";

interface ImagePreviewTooltipProps {
  isVisible: boolean;
}

const ImagePreviewTooltip: React.FC<ImagePreviewTooltipProps> = ({ isVisible }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample images - replace these URLs with actual sample images
  const sampleImages = [
    `${CDN_BASE}/images/samples/ai.jpg`,
    `${CDN_BASE}/images/samples/sample2.jpg`,
    `${CDN_BASE}/images/samples/little guy.png`,
    `${CDN_BASE}/images/samples/overl.png`,
  ];

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sampleImages.length);
    }, 1500); // Change image every 1.5 seconds

    return () => clearInterval(interval);
  }, [isVisible, sampleImages.length]);

  if (!isVisible) return null;

  return (
    <div className="image-preview-tooltip">
      <div className="preview-content">
        <div className="preview-text">Real-time AI image generation</div>
        <div className="preview-carousel">
          {sampleImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Sample ${index + 1}`}
              className={`preview-image ${index === currentImageIndex ? 'active' : ''}`}
            />
          ))}
        </div>
        <div className="preview-caption">
          Type a prompt to generate stunning images
        </div>
      </div>
      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default ImagePreviewTooltip;
