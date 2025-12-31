"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Orb } from "@/components/visuals/orb";
import { ShinyText } from "@/components/typography/shiny-text";
import { useAuth } from "@/context/auth-context";
import { useGuestMode } from "@/context/guest-mode-context";

export function LandingPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { isGuestMode } = useGuestMode();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace("/command-hub");
    }
  }, [session, router]);

  const handleStartClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      // Always go to Command Hub first, auth check happens there on interaction
      router.push("/command-hub");
    }, 800);
  };

  return (
    <div className={`landing-container ${isTransitioning ? "fade-out" : ""}`}>
      <div className="orb-background">
        <Orb hue={220} hoverIntensity={0.3} rotateOnHover forceHoverState={false} />
      </div>
      <div className="content">
        <h1>Vizual AI</h1>
        <p>Modern AI, without the complexity. Chat, create, and generate — simply.</p>
        <div className="button-container">
          <button
            className="start-button"
            onClick={handleStartClick}
            disabled={isTransitioning}
          >
            <ShinyText text="Start" speed={3} className="start-button-text" />
          </button>
        </div>
      </div>
    </div>
  );
}
