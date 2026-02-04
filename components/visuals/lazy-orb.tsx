"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyOrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
  className?: string;
  /** Only load the Orb when it's visible in viewport */
  loadOnVisible?: boolean;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Show placeholder while loading */
  showPlaceholder?: boolean;
}

// Dynamically import the heavy Orb component (OGL/WebGL)
const Orb = dynamic(
  () => import("./orb").then((mod) => ({ default: mod.Orb })),
  {
    ssr: false,
    loading: () => <OrbPlaceholder />,
  }
);

/**
 * Placeholder component shown while Orb is loading
 * Uses CSS gradient animation to simulate the orb effect
 */
function OrbPlaceholder() {
  return (
    <div className="orb-container relative w-full h-full flex items-center justify-center">
      <div
        className="w-3/4 h-3/4 rounded-full animate-pulse"
        style={{
          background: `
            radial-gradient(circle at 30% 30%,
              rgba(255, 255, 255, 0.1) 0%,
              rgba(128, 128, 128, 0.05) 50%,
              transparent 70%
            )
          `,
          boxShadow: "inset 0 0 60px rgba(255, 255, 255, 0.05)",
        }}
      />
    </div>
  );
}

/**
 * LazyOrb - Performance-optimized wrapper for the Orb component
 *
 * Features:
 * - Lazy loads WebGL/OGL only when visible
 * - Shows lightweight placeholder during load
 * - Reduces initial bundle size by ~50KB
 * - Prevents WebGL context creation until needed
 */
export function LazyOrb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  className,
  loadOnVisible = true,
  rootMargin = "200px",
  showPlaceholder = true,
}: LazyOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!loadOnVisible);
  const [isLoaded, setIsLoaded] = useState(false);

  // Intersection Observer for visibility-based loading
  useEffect(() => {
    if (!loadOnVisible) {
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
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [loadOnVisible, rootMargin]);

  // Track when Orb has loaded
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure the dynamic import has completed
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full", className)}>
      {/* Show placeholder until Orb is visible and loaded */}
      {showPlaceholder && !isLoaded && <OrbPlaceholder />}

      {/* Render Orb only when visible */}
      {isVisible && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        >
          <Orb
            hue={hue}
            hoverIntensity={hoverIntensity}
            rotateOnHover={rotateOnHover}
            forceHoverState={forceHoverState}
          />
        </div>
      )}
    </div>
  );
}

export default LazyOrb;
