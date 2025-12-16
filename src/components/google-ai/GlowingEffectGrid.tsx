"use client";

import React from "react";
import { Box, Lock, Search, Settings, Sparkles, Rocket, AppWindow, Key, LayoutGrid, Flame } from "lucide-react";
import { GlowingEffect } from "../ui/glowing-effect";

export function GlowingEffectDemoSecond() {
    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
                area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                icon={<Rocket className="h-4 w-4 text-white" />}
                title="Antigravity"
                description="Explore the Antigravity project by Google DeepMind."
                href="https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content="
                imageSrc="https://images.unsplash.com/photo-1614728853913-1e22ba0e982b?q=80&w=1000&auto=format&fit=crop"
            />

            <GridItem
                area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                icon={<AppWindow className="h-4 w-4 text-white" />}
                title="AI Studio Apps"
                description="Discover and manage your applications in Google AI Studio."
                href="https://aistudio.google.com/apps"
                imageSrc="https://images.unsplash.com/photo-1642132652075-2d43371d533d?q=80&w=1000&auto=format&fit=crop"
            />

            <GridItem
                area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                icon={<Key className="h-4 w-4 text-white" />}
                title="Google API Keys"
                description="Securely manage your API keys for Google AI services."
                href="https://aistudio.google.com/api-keys"
                imageSrc="https://images.unsplash.com/photo-1562813733-b31f71025d54?q=80&w=1000&auto=format&fit=crop"
            />

            <GridItem
                area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                icon={<LayoutGrid className="h-4 w-4 text-white" />}
                title="Google Apps"
                description="Explore featured Google Apps and showcases."
                href="https://aistudio.google.com/apps?source=showcase&showcaseTag=featured"
                imageSrc="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"
            />

            <GridItem
                area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                icon={<Flame className="h-4 w-4 text-white" />}
                title="Jules x Firebase"
                description="Build intelligent apps with Jules and Firebase integration."
                href="https://jules.google/"
                imageSrc="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop"
            />
        </ul>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    href: string;
    imageSrc: string;
}

const GridItem = ({ area, icon, title, description, href, imageSrc }: GridItemProps) => {
    return (
        <li className={`min-h-[14rem] list-none ${area}`}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3 cursor-pointer transition-transform hover:scale-[1.02] group overflow-hidden">
                    <GlowingEffect
                        blur={0}
                        borderWidth={3}
                        spread={80}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                    />
                    <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
                        {/* Background Image & Overlay */}
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={imageSrc} 
                                alt={title} 
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30" />
                        </div>

                        <div className="relative z-10 flex flex-1 flex-col justify-between gap-3">
                            <div className="w-fit rounded-lg border border-white/10 bg-black/20 backdrop-blur-md p-2">
                                {icon}
                            </div>
                            <div className="space-y-3">
                                <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-white md:text-2xl/[1.875rem]">
                                    {title}
                                </h3>
                                <h2 className="font-sans text-sm/[1.125rem] text-neutral-300 md:text-base/[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                                    {description}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </li>
    );
};
