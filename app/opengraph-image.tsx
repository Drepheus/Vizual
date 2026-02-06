import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vizual — AI Creative Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #020205 0%, #0a0a1a 40%, #1a0a2e 70%, #020205 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle gradient orbs */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
            top: "-200px",
            right: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
            bottom: "-100px",
            left: "-50px",
          }}
        />

        {/* Play triangle logo shape */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
          >
            <path
              d="M20 10 L70 40 L20 70 Z"
              stroke="url(#grad)"
              strokeWidth="3"
              fill="none"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            letterSpacing: "-2px",
            background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #a855f7 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "16px",
          }}
        >
          VIZUAL
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            marginBottom: "40px",
          }}
        >
          AI Creative Studio
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          {["Chat", "Images", "Video", "DeepSearch"].map((feature) => (
            <div
              key={feature}
              style={{
                padding: "10px 24px",
                borderRadius: "999px",
                border: "1px solid rgba(168,85,247,0.3)",
                background: "rgba(168,85,247,0.1)",
                color: "rgba(255,255,255,0.85)",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "18px",
            color: "rgba(168,85,247,0.6)",
            fontWeight: 500,
          }}
        >
          vizual.video
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
