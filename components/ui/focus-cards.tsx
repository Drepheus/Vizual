"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Video, Copy, MoreHorizontal, Play } from "lucide-react";

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
      onClick={() => onClick && onClick(card)}
      className={cn(
        "rounded-xl relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out cursor-pointer group",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        className="object-cover absolute inset-0 w-full h-full"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/60 flex flex-col justify-end p-6 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200 mb-2">
          {card.title}
        </div>
        <p className="text-sm text-gray-300 line-clamp-3 mb-4 font-light leading-relaxed">
          {card.prompt}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onAction && onAction('MODIFY', card)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Edit"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onAction && onAction('MAKE_VIDEO', card)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            title={card.type === 'video' ? 'Extend Video' : 'Make Video'}
          >
            {card.type === 'video' ? <Play size={18} /> : <Video size={18} />}
          </button>
          <button
            onClick={() => onAction && onAction('COPY_PROMPT', card)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Make More"
          >
            <Copy size={18} />
          </button>
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
