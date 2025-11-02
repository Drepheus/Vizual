import { useEffect, useRef } from 'react';
import './VideoPreviewTooltip.css';

interface VideoPreviewTooltipProps {
  isVisible: boolean;
}

const VideoPreviewTooltip: React.FC<VideoPreviewTooltipProps> = ({ isVisible }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVisible) {
      // Pause video when not visible
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    // Play the video when visible
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }
  }, [isVisible]);

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
            autoPlay
          >
            <source src="/static/videos/vidpreview.mp4" type="video/mp4" />
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
