import { useState, useEffect, useRef } from 'react';
import './VideoPreviewTooltip.css';

interface VideoPreviewTooltipProps {
  isVisible: boolean;
}

const VideoPreviewTooltip: React.FC<VideoPreviewTooltipProps> = ({ isVisible }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sample videos from the static/videos folder
  const sampleVideos = [
    '/static/videos/vidpreview.mp4',
    '/static/videos/intro.mp4',
    '/static/videos/Standard_Mode_add_a_pulse_effect_to_the_middle.mp4',
    '/static/videos/14618955-uhd_2160_3840_24fps.mp4',
  ];

  useEffect(() => {
    if (!isVisible) return;

    // Play the current video when visible
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }

    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % sampleVideos.length);
    }, 4000); // Change video every 4 seconds

    return () => clearInterval(interval);
  }, [isVisible, sampleVideos.length]);

  // When video index changes, restart the video
  useEffect(() => {
    if (videoRef.current && isVisible) {
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }
  }, [currentVideoIndex, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="video-preview-tooltip">
      <div className="preview-content">
        <div className="preview-text">Generate AI videos from text prompts</div>
        <div className="preview-video-container">
          <video
            ref={videoRef}
            className="preview-video"
            muted
            loop
            playsInline
            key={currentVideoIndex}
          >
            <source src={sampleVideos[currentVideoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay-gradient"></div>
        </div>
        <div className="preview-caption">
          Create stunning video content with AI
        </div>
      </div>
      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default VideoPreviewTooltip;
