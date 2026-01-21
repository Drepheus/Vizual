"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Sparkles, Target, Heart, Rocket, Globe } from "lucide-react";
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

// Chrome/Silver gradient text component
const ChromeText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span
        className={`bg-clip-text text-transparent animate-chrome-shimmer ${className}`}
        style={{
            backgroundImage: 'linear-gradient(90deg, #a8a8a8 0%, #ffffff 25%, #d4d4d4 50%, #ffffff 75%, #a8a8a8 100%)',
            backgroundSize: '400% 100%',
        }}
    >
        {children}
    </span>
);

export default function AboutPage() {
    const router = useRouter();

    const teamMembers = [
        { name: "Alex Chen", role: "CEO & Co-Founder", avatar: "AC", description: "Former AI researcher at Google DeepMind" },
        { name: "Sarah Mitchell", role: "CTO & Co-Founder", avatar: "SM", description: "Ex-Netflix engineering lead" },
        { name: "Marcus Rodriguez", role: "Head of Product", avatar: "MR", description: "Previously led product at Figma" },
        { name: "Emily Zhang", role: "Head of AI Research", avatar: "EZ", description: "PhD from Stanford AI Lab" },
    ];

    const values = [
        { icon: Sparkles, title: "Innovation First", description: "We push the boundaries of what's possible with AI-generated content." },
        { icon: Users, title: "Creator-Centric", description: "Every feature we build starts with the creator's needs in mind." },
        { icon: Target, title: "Quality Obsessed", description: "We believe in delivering nothing but the highest quality output." },
        { icon: Heart, title: "Community Driven", description: "Our community shapes our roadmap and inspires our direction." },
        { icon: Rocket, title: "Move Fast", description: "We iterate quickly while maintaining our high standards." },
        { icon: Globe, title: "Global Impact", description: "Democratizing video creation for creators worldwide." },
    ];

    return (
        <div className={`min-h-screen bg-black text-white ${inter.className}`}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/vizual')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Home</span>
                    </button>
                    <h1 className={`text-xl font-bold ${playfair.className}`}>
                        <span className="italic">Vizual</span>
                    </h1>
                    <div className="w-20" />
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-2 text-sm font-medium bg-white/5 border border-white/10 rounded-full text-gray-300 mb-6">
                        Our Story
                    </span>
                    <h1 className={`text-5xl md:text-7xl font-bold mb-8 leading-tight ${spaceGrotesk.className}`}>
                        Empowering Creators <br />
                        <ChromeText>with AI</ChromeText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        We're on a mission to democratize professional video creation.
                        Our AI-powered platform enables anyone to create stunning videos
                        that were once only possible with expensive studios and teams.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className={`text-4xl font-bold mb-6 ${spaceGrotesk.className}`}>
                                Our <ChromeText>Mission</ChromeText>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-6">
                                At Vizual, we believe that everyone should have access to professional-quality video creation tools.
                                Our mission is to break down the barriers between imagination and reality.
                            </p>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Founded in 2024, we've grown from a small team of AI researchers and designers to a
                                global platform serving millions of creators worldwide.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                                <div className="text-9xl">🎬</div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-[#0a0a1a]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-bold mb-4 ${spaceGrotesk.className}`}>
                            Our <ChromeText>Values</ChromeText>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map((value, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                            >
                                <value.icon className="w-10 h-10 text-white/70 mb-4 group-hover:text-white transition-colors" />
                                <h3 className={`text-xl font-bold mb-2 ${spaceGrotesk.className}`}>{value.title}</h3>
                                <p className="text-gray-400 text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-bold mb-4 ${spaceGrotesk.className}`}>
                            Meet the <ChromeText>Team</ChromeText>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            Passionate individuals building the future of content creation
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center mx-auto mb-4 text-2xl font-bold group-hover:scale-110 transition-transform">
                                    {member.avatar}
                                </div>
                                <h3 className={`text-lg font-bold mb-1 ${spaceGrotesk.className}`}>{member.name}</h3>
                                <p className="text-blue-400 text-sm mb-2">{member.role}</p>
                                <p className="text-gray-500 text-xs">{member.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className={`text-3xl font-bold mb-6 ${spaceGrotesk.className}`}>
                        Ready to create with <ChromeText>Vizual</ChromeText>?
                    </h2>
                    <button
                        onClick={() => router.push('/vizual')}
                        className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all"
                    >
                        Get Started Free
                    </button>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-8 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
                © 2025 Vizual AI Inc. All rights reserved.
            </footer>
        </div>
    );
}
