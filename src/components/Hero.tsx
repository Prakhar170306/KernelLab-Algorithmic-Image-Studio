import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, Sliders, CheckCircle2, Lock, Zap, Cpu, Sparkles } from 'lucide-react';

interface HeroProps {
  onLaunchStudio: (filterId?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onLaunchStudio }) => {
  const [sliderPos, setSliderPos] = useState(48); // Percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [activeKernelCell, setActiveKernelCell] = useState<number | null>(4); // Center cell
  const [matrixWeights, setMatrixWeights] = useState<number[][]>([
    [-1, -1, -1],
    [-1,  8, -1],
    [-1, -1, -1]
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handlePointerMove(e.clientX);
    };
    const onMouseUp = () => setIsDragging(false);
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handlePointerMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handlePointerMove]);

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-[#08070D]">
      {/* Background ambient radial glow and technical grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[400px] bg-gradient-to-tr from-[#A855F7]/15 via-[#EC38BC]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-gradient-to-bl from-[#5EEAD4]/10 via-[#A855F7]/10 to-transparent blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Hero Headline, Subtitle, CTAs, and 3-KPI Trust Strip */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-[1.12]">
              Turn Pixels Into Art.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFAEDE] via-[#EC38BC] to-[#5EEAD4]">
                Not Processing Bills.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A8A1BA] max-w-xl leading-relaxed font-sans">
              Transform ordinary images into extraordinary fine artwork using lightweight mathematical kernels. No uploads. No expensive GPU cloud queues. Just real convolution math calculated instantly on your local Canvas API.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onLaunchStudio()}
                className="px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-[#EC38BC] to-[#A855F7] rounded-full hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-purple-600/35 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Launch the Studio</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <a
                href="#how-it-works"
                className="px-7 py-3.5 text-base font-medium text-[#F7F5FF] bg-[#14101F]/80 hover:bg-[#1E1730] border border-purple-500/30 rounded-full transition-all text-center flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4 text-[#5EEAD4]" />
                <span>Explore the Technology</span>
              </a>
            </div>

            {/* 3-KPI Trust Strip Matching Reference Screenshot */}
            <div className="pt-6 border-t border-purple-500/15 grid grid-cols-3 gap-3 font-sans">
              
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#5EEAD4] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white tracking-tight">100% Free</div>
                  <div className="text-[11px] text-[#A8A1BA]">Zero billing or tokens</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#FFAEDE] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white tracking-tight">Private by Design</div>
                  <div className="text-[11px] text-[#A8A1BA]">0KB leaves your browser</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-[#EC38BC] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white tracking-tight">Native Engine</div>
                  <div className="text-[11px] text-[#A8A1BA]">WebGL2 / SIMD Canvas</div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Premium Futuristic Studio Viewport (Matching Reference Image 2) */}
          <div className="lg:col-span-6 relative">
            
            {/* Outer Studio Frame Container */}
            <div className="relative rounded-2xl lg:rounded-3xl border border-purple-500/30 bg-[#14101F] p-3 sm:p-4 shadow-2xl shadow-purple-950/70 overflow-hidden">
              
              {/* Studio Window Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-purple-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-[#EC38BC] to-[#A855F7] p-0.5 flex items-center justify-center">
                    <div className="w-full h-full bg-[#08070D] rounded flex items-center justify-center">
                      <Cpu className="w-3 h-3 text-[#5EEAD4]" />
                    </div>
                  </div>
                  <div>
                    <span className="font-bold font-display text-white text-xs">KernelLab</span>
                    <span className="text-[10px] text-[#A8A1BA] ml-2 hidden sm:inline">The Art of Computational Imaging</span>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-[#08070D]/80 border border-purple-500/30 text-[10px] font-mono text-slate-300">
                  GPU_PASS: INVERTED_DODGE
                </div>
              </div>

              {/* Central Interactive Before/After Transformation Viewport */}
              <div
                ref={containerRef}
                className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-purple-500/25 bg-[#08070D] select-none cursor-ew-resize group"
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
              >
                {/* Layer 1: Right Graphite Pencil Sketch Architecture (on textured Hahnemühle paper) */}
                <img
                  src="/assets/artworks/conservatory_sketch.png"
                  alt="Victorian Glasshouse Conservatory Graphite Pencil Sketch"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />

                {/* Layer 2: Left Cinematic Color Architecture (clipped by slider position) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                >
                  <img
                    src="/assets/artworks/conservatory_color.png"
                    alt="Victorian Glasshouse Conservatory Architectural Photograph"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                {/* Draggable Glowing Laser Split Divider Beam */}
                <div
                  className="absolute top-0 bottom-0 w-1 pointer-events-none"
                  style={{
                    left: `${sliderPos}%`,
                    background: 'linear-gradient(to bottom, #5EEAD4 0%, #EC38BC 50%, #A855F7 100%)',
                    boxShadow: '0 0 14px #5EEAD4, 0 0 24px #EC38BC'
                  }}
                >
                  {/* Circular Grip Knob with '<>' Icons */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#08070D] border-2 border-[#5EEAD4] flex items-center justify-center shadow-lg shadow-cyan-500/50 pointer-events-auto">
                    <span className="text-[10px] font-bold font-mono text-[#5EEAD4]">〈〉</span>
                  </div>
                </div>

                {/* Floating Top-Left LAPLACIAN 3x3 Matrix Card */}
                <div className="absolute top-3 left-3 z-20 bg-[#08070D]/90 backdrop-blur-md border border-purple-500/30 rounded-xl p-2.5 shadow-xl pointer-events-auto max-w-[135px]">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-purple-500/20 text-[9px] font-mono text-[#A8A1BA]">
                    <span className="uppercase tracking-wider text-[#5EEAD4]">LAPLACIAN 3×3</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-center">
                    {matrixWeights.flat().map((val, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveKernelCell(idx);
                          const next = [...matrixWeights.map(row => [...row])];
                          const r = Math.floor(idx / 3);
                          const c = idx % 3;
                          next[r][c] = next[r][c] === 8 ? 5 : next[r][c] === 5 ? -2 : 8;
                          setMatrixWeights(next);
                        }}
                        className={`w-7 h-6 rounded flex items-center justify-center transition-colors ${
                          idx === 4
                            ? 'bg-[#EC38BC] text-white font-bold shadow-md shadow-pink-500/40 rounded-full'
                            : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floating Bottom-Right Cloud Overhead Status Badge */}
                <div className="absolute bottom-3 right-3 z-20 bg-[#08070D]/90 backdrop-blur-md border border-[#5EEAD4]/30 rounded-xl px-3 py-1.5 shadow-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#5EEAD4] animate-pulse" />
                  <div>
                    <div className="text-[9px] font-mono uppercase text-[#A8A1BA] tracking-wider">Cloud Overhead</div>
                    <div className="text-xs font-mono font-bold text-[#5EEAD4]">0.00 ms (0B Upload)</div>
                  </div>
                </div>

                {/* Bottom Technical Caption Overlay */}
                <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:block max-w-[260px]">
                  <div className="text-[9px] font-mono text-slate-300 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10 truncate">
                    VICTORIAN BOTANICAL CONSERVATORY // Graphite & Paper
                  </div>
                </div>

              </div>

              {/* Studio Bottom Status Tray */}
              <div className="pt-3 flex items-center justify-between text-[11px] font-mono text-[#A8A1BA]">
                <div className="flex items-center gap-3">
                  <span>Drawing: 100%</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[#5EEAD4]">Channel: Graphite | Sepia</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Drag divider to compare photographic source vs graphite render
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
