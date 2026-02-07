"use client";

import { useEffect, useRef, useState } from 'react';

const CDN_BASE = "https://storage.googleapis.com/vizual-cdn-assets";

interface VideoPreviewTooltipProps {
  isVisible: boolean;
}

const VideoPreviewTooltip: React.FC<VideoPreviewTooltipProps> = ({ isVisible }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sample videos from the static/videos folder
  const sampleVideos = [
    `${CDN_BASE}/videos/vidpreview.mp4`,
    `${CDN_BASE}/videos/dogclimb.mp4`,
    `${CDN_BASE}/videos/matrixcode.mp4`,
    `${CDN_BASE}/videos/rockbug.mp4`
  ];

  useEffect(() => {
    if (!isVisible) {
      // Pause video when not visible
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    // Play the current video when visible
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }

    // Change video every 4 seconds
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % sampleVideos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, sampleVideos.length]);

  // When video index changes, load and play the new video
  useEffect(() => {
    if (videoRef.current && isVisible) {
      const video = videoRef.current;
      
      console.log('Loading video:', sampleVideos[currentVideoIndex]);
      
      // Add event listener to play once loaded
      const handleCanPlay = () => {
        console.log('Video can play:', sampleVideos[currentVideoIndex]);
        video.play().catch(err => {
          console.log('Video autoplay failed:', err);
        });
      };
      
      const handleError = () => {
        console.error('Video load error:', sampleVideos[currentVideoIndex], video.error);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.load();
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [currentVideoIndex, isVisible, sampleVideos]);

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
            loop={false}
            playsInline
            autoPlay
            preload="auto"
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
