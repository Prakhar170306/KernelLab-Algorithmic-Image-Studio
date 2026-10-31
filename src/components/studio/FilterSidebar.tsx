import React from 'react';
import { Pencil, Palette, Zap, Film, Grid, Grid3X3, Sparkles } from 'lucide-react';
import { FilterType } from '../../engine/types';

interface FilterSidebarProps {
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface FilterCardDef {
  id: FilterType;
  name: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
  accentColor: string;
}

const FILTER_ITEMS: FilterCardDef[] = [
  {
    id: 'sketch',
    name: 'Pencil Sketch',
    tag: 'Fine-Art Graphite',
    desc: 'Color dodge blend on inverted Gaussian blur with laplacian acutance.',
    icon: <Pencil className="w-4 h-4" />,
    accentColor: '#5EEAD4'
  },
  {
    id: 'oil',
    name: 'Oil Painting',
    tag: 'Kuwahara Filter',
    desc: 'Quadrant variance minimization producing edge-preserving impasto brushwork.',
    icon: <Palette className="w-4 h-4" />,
    accentColor: '#EC38BC'
  },
  {
    id: 'neon',
    name: 'Neon Edge Glow',
    tag: 'Sobel + Bloom',
    desc: 'First derivative gradient vectors with spectral neon glow bloom.',
    icon: <Zap className="w-4 h-4" />,
    accentColor: '#A855F7'
  },
  {
    id: 'film',
    name: 'Vintage Film',
    tag: 'Emulsion & Tone',
    desc: 'Photochemical S-curves, warm highlights, deterministic grain, and vignette.',
    icon: <Film className="w-4 h-4" />,
    accentColor: '#FFAEDE'
  },
  {
    id: 'halftone',
    name: 'Cyberpunk Halftone',
    tag: 'Rotated Dot Matrix',
    desc: 'Geometric luminance sampling mapped to rotated grid dots in cyberpunk duotone.',
    icon: <Grid className="w-4 h-4" />,
    accentColor: '#5EEAD4'
  },
  {
    id: 'kernel',
    name: 'Custom 3×3 Matrix',
    tag: 'Spatial Playground',
    desc: 'Direct nine-cell tensor convolution editor with normalization and presets.',
    icon: <Grid3X3 className="w-4 h-4" />,
    accentColor: '#5EEAD4'
  }
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  activeFilter,
  onSelectFilter,
  isOpenMobile,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-14 bottom-14 left-0 w-72 bg-[#14101F] border-r border-purple-500/15 flex flex-col z-30 transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-purple-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A855F7]" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              Filter Algorithms
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-[#FFAEDE] border border-purple-500/20">
            {FILTER_ITEMS.length} AVAILABLE
          </span>
        </div>

        {/* Filters Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {FILTER_ITEMS.map((item) => {
            const isSelected = activeFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectFilter(item.id);
                  onCloseMobile();
                }}
                className={`w-full text-left p-3.5 rounded-xl transition-all border relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#1E1730] border-[#5EEAD4] shadow-lg shadow-purple-950/50'
                    : 'bg-[#14101F]/80 border-purple-500/20 hover:border-purple-500/40 hover:bg-[#1A1528]'
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#5EEAD4] to-[#EC38BC]"
                  />
                )}

                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        isSelected
                          ? 'bg-purple-900/40 border-[#5EEAD4]/40 text-[#5EEAD4]'
                          : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-white'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className={`text-sm font-semibold font-display ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {item.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 my-1 text-[11px] font-mono">
                  <span style={{ color: item.accentColor }}>{item.tag}</span>
                </div>

                <p className="text-xs text-[#A8A1BA] line-clamp-2 leading-relaxed mt-1">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
