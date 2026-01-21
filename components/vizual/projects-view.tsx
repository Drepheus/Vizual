"use client";

import React, { useState } from "react";
import { FocusCards, Card } from "@/components/ui/focus-cards"; // Assuming Card type is exported
import {
    ArrowLeft,
    Heart,
    Share2,
    Download,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    Play,
    Copy,
    Pencil,
    Video,
    Image as ImageIcon,
    Sparkles,
    RefreshCw,
    Layers,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

type ViewState = 'CATEGORIES' | 'DRAFTS' | 'IMAGES' | 'VIDEOS';

// Mock Data
const MOCK_CARDS = [
    {
        title: "Forest Adventure",
        src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        prompt: "A cinematic shot of a forest adventure with deep green hues and sunlight filtering through the trees, highly detailed, photorealistic.",
        type: 'image'
    },
    {
        title: "Valley of life",
        src: "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        prompt: "The valley of life, lush green landscapes, mountains in the distance, blue sky, 8k resolution.",
        type: 'image'
    },
    {
        title: "Sala behta hi jayega",
        src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=3070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        prompt: "A flowing river with crystal clear water, skipping stones, nature photography.",
        type: 'image'
    },
    {
        title: "Camping is for pros",
        src: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        prompt: "Camping site at night under the stars, bonfire, cozy atmosphere, wide angle shot.",
        type: 'image'
    },
    {
        title: "The road not taken",
        src: "https://images.unsplash.com/photo-1507041957456-9c397ce39c97?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        prompt: "A long empty road stretching into the horizon, autumn leaves, melancholic mood.",
        type: 'image'
    },
    {
        title: "The First Rule",
        src: "https://assets.aceternity.com/the-first-rule.png",
        prompt: "A mysterious figure standing in the shadows, neo-noir style, cinematic lighting.",
        type: 'image'
    }
] as any[]; // Type assertion for now

// Category Card Component
const CategoryCard = ({
    title,
    subtitle,
    count,
    likes,
    colors,
    images,
    onClick
}: {
    title: string,
    subtitle: string,
    count: number,
    likes: number,
    colors: string,
    images: string[],
    onClick: () => void
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative w-full h-80 rounded-[30px] overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.02]",
                colors // bg-gradient-to-...
            )}
        >
            {/* Content */}
            <div className="absolute top-0 left-0 p-8 z-20">
                <h3 className="text-xs font-semibold text-white/60 tracking-wider mb-1">{subtitle}</h3>
                <h2 className={`text-4xl font-black text-white ${spaceGrotesk.className}`}>{title}</h2>
                <div className="mt-2 text-sm text-white/40 font-medium">
                    {count} Ideas · {likes} ♥
                </div>
            </div>

            {/* Fan of Images */}
            <div className="absolute bottom-[-40px] right-[-20px] w-3/4 h-3/4 flex items-end justify-end pointer-events-none">
                {/* Card 3 (Back) */}
                <div className="absolute bottom-4 right-20 w-48 h-64 rounded-xl overflow-hidden transform rotate-[-12deg] shadow-2xl transition-transform duration-500 group-hover:rotate-[-16deg] group-hover:translate-y-[-10px] z-0">
                    <img src={images[2]} alt="" className="w-full h-full object-cover opacity-80" />
                </div>
                {/* Card 2 (Middle) */}
                <div className="absolute bottom-2 right-10 w-48 h-64 rounded-xl overflow-hidden transform rotate-[-6deg] shadow-2xl transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:translate-y-[-5px] z-10">
                    <img src={images[1]} alt="" className="w-full h-full object-cover opacity-90" />
                </div>
                {/* Card 1 (Front) */}
                <div className="absolute bottom-0 right-0 w-48 h-64 rounded-xl overflow-hidden transform rotate-0 shadow-2xl transition-transform duration-500 group-hover:rotate-[-2deg] z-20">
                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
    );
};

// Generation Modal Component
const GenerationModal = ({ card, onClose, onAction }: { card: any, onClose: () => void, onAction?: (action: string, card: any) => void }) => {
    if (!card) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1a1512]/95 backdrop-blur-md">
            <button
                onClick={onClose}
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            >
                <ArrowLeft size={24} />
            </button>

            {/* Top Bar Actions */}
            <div className="absolute top-6 right-6 flex items-center gap-3">
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                    <Heart size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                    <Share2 size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                    <Download size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Center Image */}
            <div className="w-full h-full flex flex-col items-center justify-center p-12">
                {/* Thumbnails Row (Mock) */}
                <div className="flex gap-2 mb-6">
                    <div className="w-10 h-10 rounded border border-white/50 overflow-hidden">
                        <img src={card.src} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-10 h-10 rounded border border-white/10 overflow-hidden opacity-50">
                        <img src="https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-10 h-10 rounded border border-white/10 overflow-hidden opacity-50">
                        <img src="https://images.unsplash.com/photo-1507041957456-9c397ce39c97" className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="relative max-w-5xl max-h-[70vh] w-full rounded-2xl overflow-hidden shadow-2xl">
                    <img src={card.src} alt={card.title} className="w-full h-full object-contain bg-[#2a2420]" />
                </div>

                {/* Bottom Actions */}
                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        onClick={() => onAction && onAction('MODIFY', card)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white/90"
                    >
                        <Sparkles size={16} />
                        Modify...
                    </button>
                    <button
                        onClick={() => onAction && onAction('MAKE_VIDEO', card)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white/90"
                    >
                        <Video size={16} />
                        Make Video...
                    </button>
                    <button
                        onClick={() => onAction && onAction('REFERENCE', card)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white/90"
                    >
                        <Layers size={16} />
                        Reference...
                    </button>
                    <button
                        onClick={() => onAction && onAction('MORE_LIKE_THIS', card)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white/90"
                    >
                        <RefreshCw size={16} />
                        More Like This
                    </button>
                    <button
                        onClick={() => onAction && onAction('REFRAME', card)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white/90"
                    >
                        <Maximize2 size={16} />
                        Reframe
                    </button>
                </div>
            </div>
        </div>
    );
};

export function ProjectsView({ onAction, onClose }: { onAction?: (action: string, card: any) => void, onClose?: () => void }) {
    const [viewState, setViewState] = useState<ViewState>('CATEGORIES');
    const [selectedCard, setSelectedCard] = useState<any>(null);

    const handleBack = () => {
        setViewState('CATEGORIES');
    };

    const handleCardClick = (card: any) => {
        setSelectedCard(card);
    };

    if (viewState === 'CATEGORIES') {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                    <h1 className={`text-2xl md:text-4xl font-bold text-white ${spaceGrotesk.className}`}>Projects</h1>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors md:hidden"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-8">
                    <CategoryCard
                        subtitle="CREATE AND MODIFY"
                        title="IMAGE"
                        count={27}
                        likes={3}
                        colors="bg-gradient-to-br from-slate-700 to-slate-900"
                        images={[
                            "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=3072&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=3070&auto=format&fit=crop"
                        ]}
                        onClick={() => setViewState('IMAGES')}
                    />
                    <CategoryCard
                        subtitle="MODIFY"
                        title="VIDEO"
                        count={36}
                        likes={8}
                        colors="bg-gradient-to-br from-zinc-800 to-zinc-950"
                        images={[
                            "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=3387&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=3072&auto=format&fit=crop"
                        ]}
                        onClick={() => setViewState('VIDEOS')}
                    />
                    <CategoryCard
                        subtitle="CONTINUE"
                        title="DRAFTS"
                        count={24}
                        likes={4}
                        colors="bg-gradient-to-br from-stone-800 to-stone-950"
                        images={[
                            "https://images.unsplash.com/photo-1507041957456-9c397ce39c97?q=80&w=3456&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=3387&auto=format&fit=crop",
                            "https://assets.aceternity.com/the-first-rule.png"
                        ]}
                        onClick={() => setViewState('DRAFTS')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Header for View */}
            <div className="flex items-center gap-4 p-6 border-b border-white/5">
                <button
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white">{viewState}</h2>
                    <p className="text-sm text-gray-500">{MOCK_CARDS.length} items</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <FocusCards cards={MOCK_CARDS} onCardClick={handleCardClick} onAction={onAction} />
            </div>

            {/* Modal */}
            {selectedCard && (
                <GenerationModal card={selectedCard} onClose={() => setSelectedCard(null)} onAction={onAction} />
            )}
        </div>
    );
}
