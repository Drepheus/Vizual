"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, MessageSquare, Image as ImageIcon, Video, BookOpen } from 'lucide-react';
import { VertexSidebar } from '../../src/components/VertexSidebar';
import './google-ai.css';

export default function GoogleAIPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const geminiCards = [
    {
      title: 'Summarize info',
      icon: <BookOpen className="w-6 h-6" />,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Code explanation',
      icon: <MessageSquare className="w-6 h-6" />,
      gradient: 'from-blue-400 to-cyan-400'
    },
    {
      title: 'Creative writing',
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Visual analysis',
      icon: <ImageIcon className="w-6 h-6" />,
      gradient: 'from-emerald-400 to-teal-500'
    }
  ];

  const products = [
    {
      title: 'Gemini',
      description: 'The most capable AI model, built for multimodal reasoning.',
      link: 'https://gemini.google.com',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      title: 'Veo',
      description: 'Generative video model for creating high-quality 1080p clips.',
      link: 'https://deepmind.google/veo',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      title: 'Imagen 3',
      description: 'Our highest quality text-to-image model.',
      link: 'https://deepmind.google/imagen',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      title: 'NotebookLM',
      description: 'Your personalized AI research assistant.',
      link: 'https://notebooklm.google',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 font-sans pl-[80px]">
      <VertexSidebar />
      {/* Navigation */}
      <nav className="fixed top-0 left-[80px] right-0 z-50 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium tracking-tight">Google</span>
            <span className="text-xl font-medium text-gray-400">AI</span>
          </div>
          <button 
            onClick={() => router.push('/google-ai-studio')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Studio
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(66,133,244,0.15),transparent_50%)]" />
        
        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-medium tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          >
            Making AI helpful for everyone
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-light"
          >
            We're advancing the state of the art in AI to solve some of the world's biggest challenges.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button 
              onClick={() => document.getElementById('latest-models')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-medium text-lg overflow-hidden transition-transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore our work <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Products Grid */}
      <section id="latest-models" className="py-32 px-6 relative z-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medium mb-6">Our latest models</h2>
            <div className="h-1 w-20 bg-blue-500 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product, index) => (
              <motion.a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative p-8 rounded-3xl border ${product.border} ${product.bg} hover:bg-opacity-20 transition-all duration-500 overflow-hidden`}
              >
                <div className="relative z-10">
                  <h3 className={`text-3xl font-medium mb-4 ${product.color}`}>{product.title}</h3>
                  <p className="text-xl text-gray-300 mb-8 max-w-md">{product.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
                
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-32 px-6 bg-[#0f0f0f] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-medium mb-6">Experience Gemini</h2>
            <p className="text-xl text-gray-400">See what's possible with our most capable model.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {geminiCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative aspect-square p-6 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-colors cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="p-3 bg-white/10 w-fit rounded-xl backdrop-blur-sm">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-400 group-hover:text-white/90 transition-colors">
                      Try this prompt
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-medium text-gray-500">Google</span>
            <span className="text-2xl font-medium text-gray-700">AI</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">About Google AI</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
