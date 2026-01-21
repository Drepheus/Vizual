"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Briefcase, Clock, Heart, Coffee, Laptop, Plane, DollarSign, Sparkles, ArrowRight } from "lucide-react";
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

export default function CareersPage() {
    const router = useRouter();

    const benefits = [
        { icon: DollarSign, title: "Competitive Salary", description: "Top-tier compensation packages" },
        { icon: Heart, title: "Health & Wellness", description: "Comprehensive health, dental, and vision" },
        { icon: Laptop, title: "Remote First", description: "Work from anywhere in the world" },
        { icon: Plane, title: "Unlimited PTO", description: "Take the time you need" },
        { icon: Coffee, title: "Learning Budget", description: "$2,000 annual learning stipend" },
        { icon: Sparkles, title: "Equity", description: "Own a piece of what you build" },
    ];

    const openPositions = [
        {
            title: "Senior Machine Learning Engineer",
            department: "AI Research",
            location: "Remote / San Francisco",
            type: "Full-time",
            description: "Join our core AI team building next-generation video generation models."
        },
        {
            title: "Staff Frontend Engineer",
            department: "Engineering",
            location: "Remote / New York",
            type: "Full-time",
            description: "Lead the development of our creator-focused web application."
        },
        {
            title: "Product Designer",
            department: "Design",
            location: "Remote",
            type: "Full-time",
            description: "Shape the future of AI-powered creative tools."
        },
        {
            title: "Developer Advocate",
            department: "Developer Relations",
            location: "Remote",
            type: "Full-time",
            description: "Help developers integrate Vizual into their applications."
        },
        {
            title: "Technical Writer",
            department: "Documentation",
            location: "Remote",
            type: "Full-time / Contract",
            description: "Create world-class documentation for our API and products."
        },
        {
            title: "Growth Marketing Manager",
            department: "Marketing",
            location: "Remote / Los Angeles",
            type: "Full-time",
            description: "Drive user acquisition and brand awareness strategies."
        },
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
                        <span className="italic">Vizual</span> Careers
                    </h1>
                    <div className="w-20" />
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-2 text-sm font-medium bg-green-500/10 border border-green-500/20 rounded-full text-green-400 mb-6">
                        We're Hiring!
                    </span>
                    <h1 className={`text-5xl md:text-7xl font-bold mb-8 leading-tight ${spaceGrotesk.className}`}>
                        Build the Future of <br />
                        <ChromeText>AI Video</ChromeText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Join a world-class team of engineers, designers, and researchers
                        pushing the boundaries of what's possible with AI.
                    </p>
                </div>
            </section>

            {/* Why Join Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-[#0a0a1a]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-bold mb-4 ${spaceGrotesk.className}`}>
                            Why <ChromeText>Vizual</ChromeText>?
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            We take care of our team so they can focus on doing their best work
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <benefit.icon className="w-6 h-6 text-white/70" />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${spaceGrotesk.className}`}>{benefit.title}</h3>
                                <p className="text-gray-400 text-sm">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className={`text-4xl font-bold mb-4 ${spaceGrotesk.className}`}>
                            Open <ChromeText>Positions</ChromeText>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Find your next role and help shape the future of content creation
                        </p>
                    </div>
                    <div className="space-y-4">
                        {openPositions.map((job, i) => (
                            <div
                                key={i}
                                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                {job.department}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-400">
                                                {job.type}
                                            </span>
                                        </div>
                                        <h3 className={`text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors ${spaceGrotesk.className}`}>
                                            {job.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-2">{job.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" />
                                                {job.type}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-2 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-t from-black to-[#0a0a1a]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className={`text-3xl font-bold mb-4 ${spaceGrotesk.className}`}>
                        Don't see your role?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                        We're always looking for talented individuals. Send us your resume and let us know how you'd like to contribute.
                    </p>
                    <a
                        href="mailto:careers@vizual.ai"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all"
                    >
                        Get in Touch
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-8 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
                © 2025 Vizual AI Inc. All rights reserved.
            </footer>
        </div>
    );
}
