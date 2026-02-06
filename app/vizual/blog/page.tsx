"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, User, ArrowRight, TrendingUp, Sparkles, Video, Cpu } from "lucide-react";
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

export default function BlogPage() {
    const router = useRouter();

    const featuredPost = {
        title: "Introducing Veo 2: The Next Generation of AI Video",
        excerpt: "We're excited to announce our integration with Google's Veo 2, bringing unprecedented video quality and creative control to Vizual.",
        author: "Alex Chen",
        date: "Jan 15, 2025",
        readTime: "5 min read",
        category: "Product",
        image: "🎬"
    };

    const blogPosts = [
        {
            title: "How AI is Revolutionizing Video Production",
            excerpt: "Explore how artificial intelligence is transforming the way creators produce professional content.",
            author: "Sarah Mitchell",
            date: "Jan 12, 2025",
            readTime: "4 min read",
            category: "Technology",
            icon: Cpu
        },
        {
            title: "5 Tips for Creating Viral AI Videos",
            excerpt: "Learn the secrets behind creating engaging AI-generated content that captures audience attention.",
            author: "Marcus Rodriguez",
            date: "Jan 10, 2025",
            readTime: "6 min read",
            category: "Tutorial",
            icon: TrendingUp
        },
        {
            title: "The Future of Digital Avatars",
            excerpt: "Discover how lifelike digital humans are changing storytelling and content creation.",
            author: "Emily Zhang",
            date: "Jan 8, 2025",
            readTime: "5 min read",
            category: "AI Research",
            icon: Sparkles
        },
        {
            title: "Behind the Scenes: Training Our AI Models",
            excerpt: "A deep dive into the technology and techniques that power Vizual's video generation.",
            author: "Emily Zhang",
            date: "Jan 5, 2025",
            readTime: "8 min read",
            category: "Engineering",
            icon: Cpu
        },
        {
            title: "Creator Spotlight: How Studios Use Vizual",
            excerpt: "See how professional studios are incorporating AI video generation into their workflows.",
            author: "Marcus Rodriguez",
            date: "Jan 3, 2025",
            readTime: "4 min read",
            category: "Case Study",
            icon: Video
        },
        {
            title: "2024 Year in Review: Milestones & Achievements",
            excerpt: "Reflecting on an incredible year of growth, innovation, and community building.",
            author: "Alex Chen",
            date: "Dec 28, 2024",
            readTime: "7 min read",
            category: "Company",
            icon: TrendingUp
        },
    ];

    const categories = ["All", "Product", "Technology", "Tutorial", "AI Research", "Engineering", "Case Study"];

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
                        <span className="italic">Vizual</span> Blog
                    </h1>
                    <div className="w-20" />
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className={`text-5xl md:text-6xl font-bold mb-6 leading-tight ${spaceGrotesk.className}`}>
                        Insights & <ChromeText>Updates</ChromeText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Stay updated with the latest in AI video generation, product updates, and creator stories.
                    </p>
                </div>
            </section>

            {/* Category Filter */}
            <section className="pb-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${i === 0
                                        ? "bg-white text-black"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Post */}
            <section className="py-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500/20 via-white/5 to-transparent border border-white/10 p-8 md:p-12 group cursor-pointer hover:border-white/20 transition-all">
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30">
                                Featured
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <span className="text-sm text-gray-400 mb-2 block">{featuredPost.category}</span>
                                <h2 className={`text-3xl md:text-4xl font-bold mb-4 group-hover:text-blue-400 transition-colors ${spaceGrotesk.className}`}>
                                    {featuredPost.title}
                                </h2>
                                <p className="text-gray-400 text-lg mb-6">{featuredPost.excerpt}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {featuredPost.author}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {featuredPost.readTime}
                                    </span>
                                    <span>{featuredPost.date}</span>
                                </div>
                            </div>
                            <div className="text-9xl opacity-50 group-hover:opacity-70 transition-opacity">
                                {featuredPost.image}
                            </div>
                        </div>
                        <ArrowRight className="absolute bottom-8 right-8 w-6 h-6 text-gray-500 group-hover:text-white group-hover:translate-x-2 transition-all" />
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogPosts.map((post, i) => (
                            <article
                                key={i}
                                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <post.icon className="w-5 h-5 text-white/70" />
                                    </div>
                                    <span className="text-xs text-gray-500 px-2 py-1 rounded-full bg-white/5">{post.category}</span>
                                </div>
                                <h3 className={`text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors ${spaceGrotesk.className}`}>
                                    {post.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {post.author}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 px-6 bg-gradient-to-b from-black to-[#0a0a1a]">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className={`text-3xl font-bold mb-4 ${spaceGrotesk.className}`}>
                        Stay in the <ChromeText>Loop</ChromeText>
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Get the latest updates, tutorials, and AI insights delivered to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                        />
                        <button className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-8 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
                © 2025 Vizual AI Inc. All rights reserved.
            </footer>
        </div>
    );
}
