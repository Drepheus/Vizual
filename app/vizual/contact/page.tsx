"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, MessageCircle, Send, Clock, Globe } from "lucide-react";
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

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

export default function ContactPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Us",
            description: "For general inquiries",
            value: "hello@vizual.ai",
            action: "mailto:hello@vizual.ai"
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Available 24/7",
            value: "Start a conversation",
            action: "#"
        },
        {
            icon: Phone,
            title: "Call Us",
            description: "Mon-Fri, 9am-6pm PST",
            value: "+1 (888) 555-0123",
            action: "tel:+18885550123"
        },
    ];

    const offices = [
        {
            city: "San Francisco",
            address: "100 AI Boulevard, Suite 500",
            country: "California, USA",
            timezone: "PST (UTC-8)"
        },
        {
            city: "London",
            address: "25 Innovation Square",
            country: "United Kingdom",
            timezone: "GMT (UTC+0)"
        },
        {
            city: "Singapore",
            address: "1 Creativity Tower",
            country: "Singapore",
            timezone: "SGT (UTC+8)"
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        showToast("Thank you for your message! We'll get back to you soon.", 'success');
    };

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
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${spaceGrotesk.className}`}>
                        Get in <ChromeText>Touch</ChromeText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Have a question, feedback, or partnership inquiry? We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactMethods.map((method, i) => (
                            <a
                                key={i}
                                href={method.action}
                                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-center"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <method.icon className="w-7 h-7 text-white/70" />
                                </div>
                                <h3 className={`text-xl font-bold mb-1 ${spaceGrotesk.className}`}>{method.title}</h3>
                                <p className="text-gray-500 text-sm mb-2">{method.description}</p>
                                <p className="text-blue-400 font-medium group-hover:underline">{method.value}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <div className="order-2 lg:order-1">
                            <h2 className={`text-3xl font-bold mb-6 ${spaceGrotesk.className}`}>
                                Send us a <ChromeText>Message</ChromeText>
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            value={formState.name}
                                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={formState.email}
                                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={formState.subject}
                                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                        placeholder="How can we help?"
                                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Message</label>
                                    <textarea
                                        value={formState.message}
                                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                        placeholder="Tell us more about your inquiry..."
                                        rows={5}
                                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Offices */}
                        <div className="order-1 lg:order-2">
                            <h2 className={`text-3xl font-bold mb-6 ${spaceGrotesk.className}`}>
                                Our <ChromeText>Offices</ChromeText>
                            </h2>
                            <div className="space-y-6">
                                {offices.map((office, i) => (
                                    <div
                                        key={i}
                                        className="p-6 rounded-2xl bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-6 h-6 text-white/70" />
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-bold mb-1 ${spaceGrotesk.className}`}>{office.city}</h3>
                                                <p className="text-gray-400 text-sm">{office.address}</p>
                                                <p className="text-gray-500 text-sm">{office.country}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {office.timezone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Social Links */}
                            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
                                <h3 className={`text-lg font-bold mb-4 ${spaceGrotesk.className}`}>Follow Us</h3>
                                <div className="flex gap-4">
                                    {["Twitter", "LinkedIn", "Discord", "YouTube"].map((social, i) => (
                                        <a
                                            key={i}
                                            href="#"
                                            className="px-4 py-2 rounded-full bg-white/10 text-sm text-gray-300 hover:bg-white/20 hover:text-white transition-all"
                                        >
                                            {social}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Teaser */}
            <section className="py-16 px-6 bg-gradient-to-b from-black to-[#0a0a1a]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className={`text-3xl font-bold mb-4 ${spaceGrotesk.className}`}>
                        Have Questions?
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Check out our comprehensive FAQ or reach out to our support team.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-6 py-3 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/10">
                            View FAQ
                        </button>
                        <button className="px-6 py-3 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/10">
                            Help Center
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
