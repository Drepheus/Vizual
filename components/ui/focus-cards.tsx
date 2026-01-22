"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart, Download, Share2, MoreHorizontal, Play, RefreshCw } from "lucide-react";

export type Card = {
  title: string;
  src: string;
  prompt: string;
  type?: 'image' | 'video';
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    onClick,
    onAction,
  }: {
    card: Card;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onClick?: (card: Card) => void;
    onAction?: (action: string, card: Card) => void;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-xl relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out cursor-pointer group",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        onClick={() => onClick && onClick(card)}
        className="object-cover absolute inset-0 w-full h-full"
      />

      {/* ALWAYS VISIBLE - Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8">
        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          {/* Left - Heart */}
          <button
            onClick={() => onAction && onAction('FAVORITE', card)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
            title="Save"
          >
            <Heart size={20} />
          </button>

          {/* Center - Main Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAction && onAction('REGENERATE', card)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="Regenerate"
            >
              <RefreshCw size={18} />
            </button>
            {card.type === 'video' && (
              <button
                onClick={() => onAction && onAction('PLAY', card)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                title="Play"
              >
                <Play size={18} />
              </button>
            )}
            <button
              onClick={() => onAction && onAction('SHARE', card)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="Share"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Right - Download & More */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAction && onAction('DOWNLOAD', card)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => onAction && onAction('MORE', card)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="More Options"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

export function FocusCards({ cards, onCardClick, onAction }: { cards: Card[], onCardClick?: (card: Card) => void, onAction?: (action: string, card: Card) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          onClick={onCardClick}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
