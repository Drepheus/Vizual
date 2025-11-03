import { useState, useEffect } from 'react';
import './ImagePreviewTooltip.css';

interface ImagePreviewTooltipProps {
  isVisible: boolean;
}

const ImagePreviewTooltip: React.FC<ImagePreviewTooltipProps> = ({ isVisible }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample images - replace these URLs with actual sample images
  const sampleImages = [
    '/images/samples/sample1.jpg', // Futuristic AI tech
    '/images/samples/sample2.jpg', // Diverse team illustration
    '/images/samples/sample3.jpg', // Portrait
    '/images/samples/sample4.jpg', // Car scene
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
