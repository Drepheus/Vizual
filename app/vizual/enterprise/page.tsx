"use client";

import { useRouter } from "next/navigation";
import { Building2, Shield, Users, Headphones, Gauge, Lock, Globe, Cpu, ArrowRight, Check } from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";
import { LazyVideo } from "@/components/ui/lazy-video";

// CDN base URL for video assets
const CDN_BASE = "https://storage.googleapis.com/vizual-cdn-assets";

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

export default function EnterprisePage() {
  const router = useRouter();

  const logos = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Spotify", "Adobe"
  ];

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
              <a href="/vizual/api" className="hover:text-white transition-colors">API</a>
              <a href="/vizual/enterprise" className="text-white transition-colors">ENTERPRISE</a>
              <a href="/vizual/community" className="hover:text-white transition-colors">COMMUNITY</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/vizual/studio')}
              className="px-5 py-2 md:px-6 md:py-2 rounded-full bg-white text-black text-xs md:text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              CONTACT SALES
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <LazyVideo
            src={`${CDN_BASE}/videos/ray3darkspace.mp4`}
            className="opacity-30"
            containerClassName="w-full h-full"
            aspectRatio=""
            priority={true}
            showPlayButton={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Enterprise Solutions</span>
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${spaceGrotesk.className}`}>
            <ChromeText>Vizual</ChromeText> for Enterprise
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Unlock the full power of AI-generated media at scale. Custom solutions, dedicated support, and enterprise-grade security.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
              Schedule a Demo
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 font-medium transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 text-sm uppercase tracking-wider mb-12">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {logos.map((logo, i) => (
              <div key={i} className="text-2xl font-bold text-gray-400">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${spaceGrotesk.className}`}>
              Enterprise-Grade Features
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for teams that demand performance, security, and reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "SOC 2 Compliant",
                description: "Enterprise security with full audit trails and compliance reporting"
              },
              {
                icon: <Gauge className="w-8 h-8" />,
                title: "99.99% Uptime",
                description: "Industry-leading SLA with guaranteed availability"
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: "Data Isolation",
                description: "Your data never trains our models. Complete privacy guaranteed"
              },
              {
                icon: <Headphones className="w-8 h-8" />,
                title: "24/7 Support",
                description: "Dedicated account manager and priority technical support"
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-blue-500/50 transition-all group text-center"
              >
                <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:bg-blue-500/20 transition-colors mx-auto">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${spaceGrotesk.className}`}>{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${spaceGrotesk.className}`}>
              Powering Every Industry
            </h2>
            <p className="text-gray-400 text-lg">See how enterprises are transforming with Vizual</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Media & Entertainment",
                video: "/videos/film.mp4`},
                description: "Create stunning visual effects, trailers, and promotional content at scale."
              },
              {
                title: "E-Commerce",
                video: "/videos/product.mp4`},
                description: "Generate product videos and lifestyle imagery that converts."
              },
              {
                title: "Marketing Agencies",
                video: "/videos/design.mp4`},
                description: "Produce campaign assets 10x faster without sacrificing quality."
              }
            ].map((useCase, i) => (
              <div key={i} className="group">
                <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-gray-900">
                  <LazyVideo
                    src={useCase.video}
                    className="opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    aspectRatio=""
                    threshold={0.1}
                    rootMargin="100px"
                    showPlayButton={false}
                  />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${spaceGrotesk.className}`}>{useCase.title}</h3>
                <p className="text-gray-400">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${spaceGrotesk.className}`}>
                Flexible Deployment
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Choose the deployment model that fits your infrastructure and compliance requirements.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <Globe className="w-6 h-6" />,
                    title: "Cloud (Multi-Region)",
                    description: "Fully managed service with global edge deployment"
                  },
                  {
                    icon: <Cpu className="w-6 h-6" />,
                    title: "Dedicated Infrastructure",
                    description: "Isolated compute resources for your organization"
                  },
                  {
                    icon: <Lock className="w-6 h-6" />,
                    title: "On-Premise / VPC",
                    description: "Deploy within your own infrastructure for maximum control"
                  }
                ].map((option, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                      {option.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold mb-1 ${spaceGrotesk.className}`}>{option.title}</h4>
                      <p className="text-gray-400 text-sm">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10">
                <LazyVideo
                  src={`${CDN_BASE}/videos/matrixcode.mp4`}
                  className="opacity-60"
                  containerClassName="w-full h-full"
                  aspectRatio=""
                  threshold={0.2}
                  rootMargin="150px"
                  showPlayButton={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${spaceGrotesk.className}`}>
              Enterprise vs Standard
            </h2>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/10 p-6">
              <div className="font-bold">Features</div>
              <div className="text-center text-gray-400">Standard</div>
              <div className="text-center font-bold text-blue-400">Enterprise</div>
            </div>
            {[
              { feature: "Video Generation", standard: "Up to 4K", enterprise: "Up to 8K" },
              { feature: "API Rate Limits", standard: "10K/month", enterprise: "Unlimited" },
              { feature: "Model Fine-tuning", standard: false, enterprise: true },
              { feature: "Custom Models", standard: false, enterprise: true },
              { feature: "Dedicated Support", standard: false, enterprise: true },
              { feature: "SLA Guarantee", standard: "99.9%", enterprise: "99.99%" },
              { feature: "On-Premise Option", standard: false, enterprise: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 border-b border-white/5 p-6 last:border-0">
                <div className="text-gray-300">{row.feature}</div>
                <div className="text-center">
                  {typeof row.standard === 'boolean' ? (
                    row.standard ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-gray-600">—</span>
                  ) : (
                    <span className="text-gray-400">{row.standard}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof row.enterprise === 'boolean' ? (
                    row.enterprise ? <Check className="w-5 h-5 text-blue-400 mx-auto" /> : <span className="text-gray-600">—</span>
                  ) : (
                    <span className="text-blue-400 font-medium">{row.enterprise}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${spaceGrotesk.className}`}>
            Ready to Scale?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Let's discuss how Vizual can transform your organization's content creation
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-12 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors">
              Schedule Demo
            </button>
            <button className="px-12 py-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 font-medium text-lg transition-all">
              Contact Sales
            </button>
          </div>
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
