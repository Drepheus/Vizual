"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Code, Zap, Shield, Globe, Terminal, ChevronRight } from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

// Chrome/Silver gradient text component
const ChromeText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span 
    className={`bg-clip-text text-transparent animate-chrome-shimmer ${className}`}
    style={{
      backgroundImage: 'linear-gradient(90deg, #666666 0%, #888888 15%, #ffffff 30%, #e8e8e8 45%, #b8b8b8 60%, #888888 75%, #666666 100%)',
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </span>
);

export default function APIPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("python");

  const codeExamples = {
    python: `import vizual

client = vizual.Client(api_key="your_key")

# Generate a video
response = client.videos.generate(
    prompt="A cinematic drone shot over mountains",
    model="veo-2",
    duration=10,
    resolution="1080p"
)

print(response.video_url)`,
    javascript: `import Vizual from 'vizual';

const client = new Vizual({ apiKey: 'your_key' });

// Generate a video
const response = await client.videos.generate({
  prompt: 'A cinematic drone shot over mountains',
  model: 'veo-2',
  duration: 10,
  resolution: '1080p'
});

console.log(response.videoUrl);`,
    curl: `curl -X POST https://api.vizual.ai/v1/videos/generate \\
  -H "Authorization: Bearer your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A cinematic drone shot over mountains",
    "model": "veo-2",
    "duration": 10,
    "resolution": "1080p"
  }'`
  };

  return (
    <div className={`relative w-full min-h-screen bg-black text-white ${inter.className}`}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-xl border-b border-white/5 py-3 md:py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              onClick={() => router.push('/vizual')}
              className="cursor-pointer flex items-center gap-2 group"
            >
              <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transition-transform group-hover:scale-110 md:w-6 md:h-6">
                <path d="M25 20 L85 50 L25 80 V20 Z" fill="currentColor" />
              </svg>
              <div className="font-bold text-lg md:text-xl tracking-tight flex items-center">
                <ChromeText>VIZUAL</ChromeText>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
              <a href="/vizual/studio" className="hover:text-white transition-colors">STUDIO</a>
              <a href="/vizual/api" className="text-white transition-colors">API</a>
              <a href="/vizual/enterprise" className="hover:text-white transition-colors">ENTERPRISE</a>
              <a href="/vizual/community" className="hover:text-white transition-colors">COMMUNITY</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/vizual/studio')}
              className="px-5 py-2 md:px-6 md:py-2 rounded-full bg-white text-black text-xs md:text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              GET API KEY
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px]" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Code className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-300">Developer API</span>
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${spaceGrotesk.className}`}>
            Build with <ChromeText>Vizual</ChromeText>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Integrate world-class video and image generation into your applications with our powerful, developer-friendly API.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
              Start Building
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 font-medium transition-all flex items-center gap-2">
              View Documentation
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${spaceGrotesk.className}`}>
              Simple Integration
            </h2>
            <p className="text-gray-400 text-lg">Generate videos with just a few lines of code</p>
          </div>
          
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {["python", "javascript", "curl"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab 
                      ? "text-white bg-white/5 border-b-2 border-white" 
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Code */}
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
                <code>{codeExamples[activeTab as keyof typeof codeExamples]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-gray-900/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${spaceGrotesk.className}`}>
              Built for Developers
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to integrate AI-powered media generation into your products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Generate HD videos in seconds with our optimized infrastructure and global CDN."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Security",
                description: "SOC 2 compliant with end-to-end encryption and data isolation."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Global Scale",
                description: "Distributed across 50+ regions for low-latency access worldwide."
              },
              {
                icon: <Terminal className="w-8 h-8" />,
                title: "RESTful API",
                description: "Clean, intuitive endpoints with comprehensive SDKs for every language."
              },
              {
                icon: <Code className="w-8 h-8" />,
                title: "Webhooks",
                description: "Real-time notifications for generation progress and completion events."
              },
              {
                icon: <ArrowRight className="w-8 h-8" />,
                title: "Streaming",
                description: "Stream partial results as they generate for real-time experiences."
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all group"
              >
                <div className="w-16 h-16 rounded-xl bg-white/[0.06] flex items-center justify-center mb-6 text-gray-300 group-hover:bg-white/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${spaceGrotesk.className}`}>{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${spaceGrotesk.className}`}>
              Simple Pricing
            </h2>
            <p className="text-gray-400 text-lg">Pay only for what you use, scale as you grow</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$0",
                period: "/ month",
                description: "Perfect for experimenting",
                features: ["100 API calls / month", "720p video generation", "Community support", "Basic analytics"],
                cta: "Get Started Free",
                highlighted: false
              },
              {
                name: "Pro",
                price: "$99",
                period: "/ month",
                description: "For growing teams",
                features: ["10,000 API calls / month", "4K video generation", "Priority support", "Advanced analytics", "Custom webhooks"],
                cta: "Start Pro Trial",
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large organizations",
                features: ["Unlimited API calls", "8K video generation", "Dedicated support", "Custom SLA", "On-premise option"],
                cta: "Contact Sales",
                highlighted: false
              }
            ].map((plan, i) => (
              <div 
                key={i}
                className={`p-8 rounded-2xl border transition-all ${
                  plan.highlighted 
                    ? "bg-gradient-to-b from-gray-900/20 to-transparent border-white/30 scale-105" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${spaceGrotesk.className}`}>{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-gray-300" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-full font-medium transition-all ${
                  plan.highlighted 
                    ? "bg-white text-black hover:bg-gray-200" 
                    : "bg-white/10 hover:bg-white/20 border border-white/10"
                }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${spaceGrotesk.className}`}>
            Ready to Build?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands of developers building the future of visual content
          </p>
          <button 
            onClick={() => router.push('/vizual/studio')}
            className="px-12 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors"
          >
            Get Your API Key
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M25 20 L85 50 L25 80 V20 Z" fill="currentColor" />
            </svg>
            <span className={`font-bold ${spaceGrotesk.className}`}>VIZUAL</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 Vizual. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
