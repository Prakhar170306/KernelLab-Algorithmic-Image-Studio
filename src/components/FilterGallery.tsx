import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FilterType } from '../engine/types';

interface FilterCardData {
  id: FilterType;
  title: string;
  badge: {
    label: string;
    isLive?: boolean;
    color: 'emerald' | 'purple' | 'magenta' | 'amber' | 'cyan';
  };
  kernel: string;
  description: string;
  imageSrc: string;
  buttonLabel: string;
}

const CARDS: FilterCardData[] = [
  {
    id: 'sketch',
    title: 'Fine-Art Pencil Sketch',
    badge: {
      label: 'LIVE IN STUDIO',
      isLive: true,
      color: 'emerald'
    },
    kernel: 'KERNEL: SOBEL + DODGE',
    description: 'Converts realistic images into multi-directional graphite strokes with simulated paper pulp texture and adaptive CLAHE contrast.',
    imageSrc: '/assets/artworks/card_pencil.png',
    buttonLabel: 'Launch Filter'
  },
  {
    id: 'oil',
    title: 'Impasto Oil Painting',
    badge: {
      label: 'NEXT RELEASE v2.5',
      color: 'purple'
    },
    kernel: 'KERNEL: KUWAHARA 5×5',
    description: 'Quadrant-variance minimization filter simulating heavy impasto paint strokes while preserving sharp edge boundaries.',
    imageSrc: '/assets/artworks/card_oil.png',
    buttonLabel: 'Launch Filter'
  },
  {
    id: 'neon',
    title: 'Neon Edge Glow',
    badge: {
      label: 'PLANNED v2.6',
      color: 'magenta'
    },
    kernel: 'KERNEL: DUAL-KAWASE BLOOM',
    description: 'Multi-pass Gaussian edge extraction with chromatic aberration and spectral luminescence gradients.',
    imageSrc: '/assets/artworks/card_neon.png',
    buttonLabel: 'Launch Filter'
  },
  {
    id: 'film',
    title: 'Vintage Film & Halation',
    badge: {
      label: 'PLANNED',
      color: 'amber'
    },
    kernel: 'KERNEL: RGB SCATTER + GRAIN',
    description: 'Photochemical S-curves, warm highlights, deterministic grain, and light scattering to emulate classic film stock.',
    imageSrc: '/assets/artworks/card_film.png',
    buttonLabel: 'Launch Filter'
  },
  {
    id: 'halftone',
    title: 'Halftone Dot-Matrix',
    badge: {
      label: 'PLANNED',
      color: 'cyan'
    },
    kernel: 'KERNEL: CMYK ROSETTE',
    description: 'Geometric luminance sampling mapped to rotated grid dots in CMYK or RGB space for stylized print and cyberpunk effects.',
    imageSrc: '/assets/artworks/card_halftone.png',
    buttonLabel: 'Launch Filter'
  },
  {
    id: 'kernel',
    title: 'Custom Matrix Sandbox',
    badge: {
      label: 'DEVELOPER MODE',
      color: 'cyan'
    },
    kernel: 'KERNEL: 3×3 TO 9×9 ARBITRARY',
    description: 'Interactive WebGL GLSL editor with real-time convolution, live compilation, and visual debugging.',
    imageSrc: '/assets/artworks/card_matrix.png',
    buttonLabel: 'Launch Filter'
  }
];

interface FilterGalleryProps {
  onOpenStudio: (filterId: FilterType) => void;
}

export const FilterGallery: React.FC<FilterGalleryProps> = ({ onOpenStudio }) => {
  return (
    <section id="filters" className="py-20 lg:py-28 border-t border-purple-500/15 bg-[#08070D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-xs font-mono tracking-wider uppercase text-[#5EEAD4]">
            <Sparkles className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span>Mathematical Optics Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight">
            One Engine. Six Algorithmic Dimensions.
          </h2>
          <p className="text-base sm:text-lg text-[#A8A1BA]">
            Explore real-time spatial convolutions and color-space transformations running 100% in your local GPU memory.
          </p>
        </div>

        {/* 6 Filter Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl lg:rounded-3xl border border-purple-500/25 bg-[#14101F] overflow-hidden flex flex-col justify-between hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/50 transition-all duration-300 group"
            >
              <div>
                {/* Visual Art Preview Area */}
                <div className="relative aspect-[16/10] w-full bg-[#0a0714] overflow-hidden border-b border-purple-500/20">
                  <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14101F]/50 via-transparent to-black/25 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {card.badge.isLive ? (
                      <div className="px-2.5 py-1 rounded-md bg-[#08070D]/85 backdrop-blur-md border border-emerald-500/40 text-[10px] sm:text-[11px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{card.badge.label}</span>
                      </div>
                    ) : (
                      <div className={`px-2.5 py-1 rounded-md bg-[#08070D]/85 backdrop-blur-md border text-[10px] sm:text-[11px] font-mono font-semibold shadow-sm ${
                        card.badge.color === 'purple'
                          ? 'border-purple-500/40 text-[#C084FC]'
                          : card.badge.color === 'magenta'
                          ? 'border-pink-500/40 text-[#EC38BC]'
                          : card.badge.color === 'amber'
                          ? 'border-amber-500/40 text-amber-300'
                          : 'border-cyan-500/40 text-[#5EEAD4]'
                      }`}>
                        <span>{card.badge.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Kernel Pill (Top Right) */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-[#08070D]/90 backdrop-blur-md border border-purple-500/30 text-[10px] font-mono text-[#5EEAD4] shadow-sm">
                    {card.kernel}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold font-display text-white group-hover:text-[#FFAEDE] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#A8A1BA] leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => onOpenStudio(card.id)}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#EC38BC] to-[#A855F7] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 group/btn"
                >
                  <span>{card.buttonLabel}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
