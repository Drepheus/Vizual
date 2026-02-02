"use client";

import React, { useState, useEffect } from "react";
import { FocusCards, Card } from "@/components/ui/focus-cards";
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
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Space_Grotesk } from "next/font/google";
import { useAuth } from "@/context/auth-context";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

type ViewState = 'CATEGORIES' | 'DRAFTS' | 'IMAGES' | 'VIDEOS';

interface MediaItem {
    id: string;
    user_id: string;
    type: 'image' | 'video';
    url: string;
    prompt: string;
    model?: string;
    aspect_ratio?: string;
    title?: string;
    is_favorite?: boolean;
    created_at: string;
}

interface DraftItem {
    id: string;
    user_id: string;
    type: 'image' | 'video';
    prompt: string;
    model?: string;
    aspect_ratio?: string;
    status: 'pending' | 'processing' | 'failed' | 'cancelled';
    error_message?: string;
    created_at: string;
}

// Category Card Component
const CategoryCard = ({
    title,
    subtitle,
    count,
    likes,
    colors,
    images,
    onClick,
    isLoading
}: {
    title: string,
    subtitle: string,
    count: number,
    likes: number,
    colors: string,
    images: string[],
    onClick: () => void,
    isLoading?: boolean
}) => {
    // Default placeholder images
    const displayImages = images.length >= 3 ? images : [
        "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=400&auto=format&fit=crop"
    ];

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative w-full h-80 rounded-[30px] overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.02]",
                colors
            )}
        >
            {/* Content */}
            <div className="absolute top-0 left-0 p-8 z-20">
                <h3 className="text-xs font-semibold text-white/60 tracking-wider mb-1">{subtitle}</h3>
                <h2 className={`text-4xl font-black text-white ${spaceGrotesk.className}`}>{title}</h2>
                <div className="mt-2 text-sm text-white/40 font-medium">
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />
                            Loading...
                        </span>
                    ) : (
                        <>{count} Items · {likes} ♥</>
                    )}
                </div>
            </div>

            {/* Fan of Images */}
            <div className="absolute bottom-[-40px] right-[-20px] w-3/4 h-3/4 flex items-end justify-end pointer-events-none">
                {/* Card 3 (Back) */}
                <div className="absolute bottom-4 right-20 w-48 h-64 rounded-xl overflow-hidden transform rotate-[-12deg] shadow-2xl transition-transform duration-500 group-hover:rotate-[-16deg] group-hover:translate-y-[-10px] z-0">
                    <img src={displayImages[2]} alt="" className="w-full h-full object-cover opacity-80" />
                </div>
                {/* Card 2 (Middle) */}
                <div className="absolute bottom-2 right-10 w-48 h-64 rounded-xl overflow-hidden transform rotate-[-6deg] shadow-2xl transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:translate-y-[-5px] z-10">
                    <img src={displayImages[1]} alt="" className="w-full h-full object-cover opacity-90" />
                </div>
                {/* Card 1 (Front) */}
                <div className="absolute bottom-0 right-0 w-48 h-64 rounded-xl overflow-hidden transform rotate-0 shadow-2xl transition-transform duration-500 group-hover:rotate-[-2deg] z-20">
                    <img src={displayImages[0]} alt="" className="w-full h-full object-cover" />
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

    const isVideo = card.type === 'video';

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
                <button
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = card.url || card.src;
                        link.download = `vizual-${card.type}-${card.id || Date.now()}.${isVideo ? 'mp4' : 'png'}`;
                        link.click();
                    }}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                    <Download size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Center Content */}
            <div className="w-full h-full flex flex-col items-center justify-center p-12">
                <div className="relative max-w-5xl max-h-[70vh] w-full rounded-2xl overflow-hidden shadow-2xl">
                    {isVideo ? (
                        <video
                            src={card.url || card.src}
                            controls
                            autoPlay
                            className="w-full h-full object-contain bg-[#2a2420]"
                        />
                    ) : (
                        <img
                            src={card.url || card.src}
                            alt={card.title || card.prompt}
                            className="w-full h-full object-contain bg-[#2a2420]"
                        />
                    )}
                </div>

                {/* Prompt Display */}
                {card.prompt && (
                    <div className="mt-4 max-w-3xl text-center">
                        <p className="text-sm text-gray-400 line-clamp-2">{card.prompt}</p>
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        onClick={() => onAction && onAction('MODIFY', card)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white/90"
                    >
                        <Sparkles size={16} />
                        Modify...
                    </button>
                    {!isVideo && (
                        <button
                            onClick={() => onAction && onAction('MAKE_VIDEO', card)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white/90"
                        >
                            <Video size={16} />
                            Make Video...
                        </button>
                    )}
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
                </div>
            </div>
        </div>
    );
};

export function ProjectsView({ onAction, onClose }: { onAction?: (action: string, card: any) => void, onClose?: () => void }) {
    const { user } = useAuth();
    const [viewState, setViewState] = useState<ViewState>('CATEGORIES');
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [counts, setCounts] = useState({ images: 0, videos: 0, drafts: 0, favorites: 0 });

    // Fetch user's media and drafts
    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            const supabase = getBrowserSupabaseClient();

            try {
                // Fetch generated media
                const { data: media, error: mediaError } = await supabase
                    .from('generated_media')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (mediaError) {
                    console.error('Error fetching media:', mediaError);
                } else {
                    setMediaItems(media || []);
                }

                // Fetch drafts
                const { data: draftData, error: draftError } = await supabase
                    .from('drafts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (draftError) {
                    console.error('Error fetching drafts:', draftError);
                } else {
                    setDrafts(draftData || []);
                }

                // Calculate counts
                const images = (media || []).filter(m => m.type === 'image');
                const videos = (media || []).filter(m => m.type === 'video');
                const favorites = (media || []).filter(m => m.is_favorite);

                setCounts({
                    images: images.length,
                    videos: videos.length,
                    drafts: (draftData || []).length,
                    favorites: favorites.length
                });

            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleBack = () => {
        setViewState('CATEGORIES');
    };

    const handleCardClick = (card: any) => {
        setSelectedCard(card);
    };

    // Get cards for the current view
    const getCardsForView = () => {
        switch (viewState) {
            case 'IMAGES':
                return mediaItems
                    .filter(m => m.type === 'image')
                    .map(m => ({
                        ...m,
                        title: m.title || m.prompt?.slice(0, 30) + '...',
                        src: m.url
                    }));
            case 'VIDEOS':
                return mediaItems
                    .filter(m => m.type === 'video')
                    .map(m => ({
                        ...m,
                        title: m.title || m.prompt?.slice(0, 30) + '...',
                        src: m.url
                    }));
            case 'DRAFTS':
                return drafts.map(d => ({
                    ...d,
                    title: d.prompt?.slice(0, 30) + '...',
                    src: 'https://images.unsplash.com/photo-1507041957456-9c397ce39c97?q=80&w=400', // Placeholder
                    isDraft: true
                }));
            default:
                return [];
        }
    };

    // Get preview images for category cards
    const getPreviewImages = (type: 'image' | 'video' | 'draft') => {
        const items = type === 'draft'
            ? drafts
            : mediaItems.filter(m => m.type === type);

        const urls = items.slice(0, 3).map(item =>
            'url' in item ? item.url : 'https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=400'
        );

        // Pad with placeholders if needed
        while (urls.length < 3) {
            urls.push('https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=400');
        }

        return urls;
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

                {!user && (
                    <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <p className="text-gray-400 text-sm">Sign in to save and view your generated content</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-8">
                    <CategoryCard
                        subtitle="CREATE AND MODIFY"
                        title="IMAGE"
                        count={counts.images}
                        likes={counts.favorites}
                        colors="bg-gradient-to-br from-slate-700 to-slate-900"
                        images={getPreviewImages('image')}
                        onClick={() => setViewState('IMAGES')}
                        isLoading={isLoading}
                    />
                    <CategoryCard
                        subtitle="MODIFY"
                        title="VIDEO"
                        count={counts.videos}
                        likes={0}
                        colors="bg-gradient-to-br from-zinc-800 to-zinc-950"
                        images={getPreviewImages('video')}
                        onClick={() => setViewState('VIDEOS')}
                        isLoading={isLoading}
                    />
                    <CategoryCard
                        subtitle="CONTINUE"
                        title="DRAFTS"
                        count={counts.drafts}
                        likes={0}
                        colors="bg-gradient-to-br from-stone-800 to-stone-950"
                        images={getPreviewImages('draft')}
                        onClick={() => setViewState('DRAFTS')}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        );
    }

    const cards = getCardsForView();

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
                    <p className="text-sm text-gray-500">
                        {isLoading ? 'Loading...' : `${cards.length} items`}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                    </div>
                ) : cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            {viewState === 'IMAGES' && <ImageIcon size={32} className="text-gray-500" />}
                            {viewState === 'VIDEOS' && <Video size={32} className="text-gray-500" />}
                            {viewState === 'DRAFTS' && <Pencil size={32} className="text-gray-500" />}
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No {viewState.toLowerCase()} yet</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            {viewState === 'DRAFTS'
                                ? 'Drafts are saved when a generation fails or is interrupted'
                                : `Start creating to see your ${viewState.toLowerCase()} here`
                            }
                        </p>
                    </div>
                ) : (
                    <FocusCards cards={cards} onCardClick={handleCardClick} onAction={onAction} />
                )}
            </div>

            {/* Modal */}
            {selectedCard && (
                <GenerationModal card={selectedCard} onClose={() => setSelectedCard(null)} onAction={onAction} />
            )}
        </div>
    );
}
