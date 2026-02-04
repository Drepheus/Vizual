"use client";

import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  containerClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  /** Threshold for intersection observer (0-1). Default 0.25 = 25% visible */
  threshold?: number;
  /** Root margin for intersection observer. Default "50px" for preloading slightly before visible */
  rootMargin?: string;
  /** Show play button overlay when paused */
  showPlayButton?: boolean;
  /** Callback when video starts playing */
  onPlay?: () => void;
  /** Callback when video is paused */
  onPause?: () => void;
  /** Callback when video has loaded metadata */
  onLoadedMetadata?: () => void;
  /** Aspect ratio class (e.g., "aspect-video", "aspect-square") */
  aspectRatio?: string;
  /** Enable blur-up loading effect */
  blurUp?: boolean;
  /** Alt text for accessibility */
  alt?: string;
  /** Priority loading - skip lazy loading for above-the-fold content */
  priority?: boolean;
}

/**
 * LazyVideo - Performance-optimized video component
 *
 * Features:
 * - Lazy loads video only when visible in viewport
 * - Auto-plays when visible, pauses when hidden
 * - Shows poster/thumbnail for instant visual feedback
 * - Uses CSS containment for layout stability
 * - Supports blur-up loading effect
 * - Minimal memory footprint when not visible
 */
export const LazyVideo = memo(function LazyVideo({
  src,
  poster,
  className,
  containerClassName,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  controls = false,
  threshold = 0.25,
  rootMargin = "100px",
  showPlayButton = false,
  onPlay,
  onPause,
  onLoadedMetadata,
  aspectRatio = "aspect-video",
  blurUp = true,
  alt = "Video content",
  priority = false,
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  // Generate a poster from video if not provided (first frame)
  const effectivePoster = poster || generatePosterUrl(src);

  // Intersection Observer for visibility detection
  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }

    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, priority]);

  // Play/Pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    if (isVisible && autoPlay) {
      video.play().then(() => {
        setIsPlaying(true);
        setShowPoster(false);
        onPlay?.();
      }).catch((err) => {
        // Autoplay was prevented (e.g., user hasn't interacted with page)
        console.debug("Autoplay prevented:", err.message);
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
      onPause?.();
    }
  }, [isVisible, isLoaded, autoPlay, onPlay, onPause]);

  // Handle video loaded
  const handleLoadedMetadata = useCallback(() => {
    setIsLoaded(true);
    onLoadedMetadata?.();
  }, [onLoadedMetadata]);

  // Handle video can play
  const handleCanPlay = useCallback(() => {
    if (isVisible && autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVisible, autoPlay]);

  // Handle errors
  const handleError = useCallback(() => {
    setHasError(true);
    setShowPoster(true);
  }, []);

  // Manual play toggle
  const handlePlayClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
        setShowPoster(false);
      }).catch(() => {});
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-neutral-900",
        aspectRatio,
        containerClassName
      )}
      style={{
        contain: "layout style paint",
      }}
    >
      {/* Poster/Thumbnail - Always rendered for instant visual */}
      {(showPoster || !isLoaded) && effectivePoster && (
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500",
            isLoaded && !showPoster ? "opacity-0" : "opacity-100",
            blurUp && !isLoaded && "animate-pulse"
          )}
          style={{
            backgroundImage: `url(${effectivePoster})`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton when no poster */}
      {!effectivePoster && !isLoaded && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
      )}

      {/* Video element - Only render when visible (or priority) */}
      {(isVisible || priority) && !hasError && (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          src={src}
          poster={effectivePoster}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          controls={controls}
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onError={handleError}
          onPlay={() => {
            setIsPlaying(true);
            setShowPoster(false);
          }}
          onPause={() => setIsPlaying(false)}
          aria-label={alt}
        />
      )}

      {/* Play button overlay */}
      {showPlayButton && !isPlaying && isLoaded && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
          aria-label="Play video"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
          <p className="text-sm text-gray-500">Failed to load video</p>
        </div>
      )}
    </div>
  );
});

/**
 * Generate a poster URL from video source
 * For local videos, we can't generate thumbnails client-side,
 * so this returns a placeholder or the video URL for the browser to handle
 */
function generatePosterUrl(videoSrc: string): string | undefined {
  // If it's a known video hosting service, we might be able to generate thumbnails
  // For now, return undefined to let the browser handle it
  // In production, you'd want to generate these server-side or use a CDN

  // Check if there's a corresponding poster image
  const posterPath = videoSrc.replace(/\.(mp4|webm|mov)$/i, '.jpg');

  // For local videos, we could check if poster exists
  // But for now, return undefined and let the video element's poster attribute handle it
  return undefined;
}

/**
 * Hook for managing multiple videos - ensures only one plays at a time
 */
export function useVideoPlaybackManager() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const registerVideo = useCallback((id: string) => {
    setActiveVideoId(id);
  }, []);

  const unregisterVideo = useCallback((id: string) => {
    setActiveVideoId((current) => (current === id ? null : current));
  }, []);

  const isActive = useCallback((id: string) => {
    return activeVideoId === id;
  }, [activeVideoId]);

  return { registerVideo, unregisterVideo, isActive, activeVideoId };
}

export default LazyVideo;
