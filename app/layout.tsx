import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const SITE_URL = "https://vizual.video";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#020205',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vizual — AI Creative Studio | Chat, Create Images & Videos",
    template: "%s | Vizual",
  },
  description:
    "The all-in-one AI creative studio. Chat with advanced AI, generate stunning images with Flux Pro & Ideogram, create videos with Seedance & Wan 2.1 — all in one beautiful workspace. Try free.",
  keywords: [
    "AI creative studio",
    "AI image generator",
    "AI video generator",
    "text to image",
    "text to video",
    "AI chat",
    "Gemini AI",
    "Flux Pro",
    "Ideogram",
    "Seedance",
    "AI workspace",
    "AI tools",
    "creative AI",
    "Vizual AI",
  ],
  authors: [{ name: "Vizual" }],
  creator: "Vizual",
  publisher: "Vizual",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Vizual",
    title: "Vizual — AI Creative Studio | Chat, Create Images & Videos",
    description:
      "The all-in-one AI creative studio. Chat with advanced AI, generate images, create videos — all in one beautiful workspace. Modern AI, without the complexity.",
    images: [
      {
        url: `/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Vizual — AI Creative Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vizual — AI Creative Studio",
    description:
      "Chat, create images & generate videos — all in one AI workspace. Modern AI, without the complexity.",
    images: [`/opengraph-image`],
    creator: "@vizualvideo",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Resource Hints for Performance Optimization */}
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for analytics (non-critical) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Preconnect to Supabase for faster auth/data */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />

        {/* Preconnect to media CDN if using external hosting */}
        <link rel="dns-prefetch" href="https://replicate.delivery" />
      </head>
      <body className="min-h-screen bg-[#020205] text-white antialiased">
        {/* JSON-LD Structured Data for SEO */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Vizual",
              url: "https://vizual.video",
              description:
                "The all-in-one AI creative studio. Chat with advanced AI, generate images, create videos — all in one beautiful workspace.",
              applicationCategory: "CreativeApplication",
              operatingSystem: "Web",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  name: "Free",
                  description: "Daily free image generations and 5 credits",
                },
                {
                  "@type": "Offer",
                  price: "5",
                  priceCurrency: "USD",
                  name: "Pro",
                  description: "Unlimited images, videos, and chat",
                },
              ],
            }),
          }}
        />

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5Q8CBLD6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5Q8CBLD6');
          `}
        </Script>
        {/* End Google Tag Manager */}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-METV2JRB51"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-METV2JRB51');
          `}
        </Script>

        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
