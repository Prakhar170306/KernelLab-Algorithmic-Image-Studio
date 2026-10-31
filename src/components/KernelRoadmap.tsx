import React from 'react';
import { CheckCircle2, Clock, Sparkles, Cpu, Layers } from 'lucide-react';

export const KernelRoadmap: React.FC = () => {
  return (
    <section id="roadmap" className="py-20 lg:py-28 border-t border-purple-500/15 bg-radial-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-mono tracking-wider uppercase text-[#5EEAD4]">
            Evolutionary Blueprint
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight">
            Every New Filter Begins With a Formula.
          </h2>
          <p className="text-base sm:text-lg text-[#A8A1BA]">
            Explore our deployed mathematical capabilities alongside the upcoming milestones in browser-native computational optics.
          </p>
        </div>

        {/* 2-Column Architecture: Operational Now vs Planned Horizons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Column 1: Live & Functional (v1.0) */}
          <div className="rounded-2xl lg:rounded-3xl border border-cyan-500/30 bg-[#14101F] p-8 shadow-xl">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#5EEAD4]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">v1.0 Production Release</h3>
                  <p className="text-xs font-mono text-[#5EEAD4]">Operational & Ready</p>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded bg-[#5EEAD4]/15 text-[#5EEAD4] border border-[#5EEAD4]/30">
                ACTIVE IN BROWSER
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Fine-Art Pencil Sketch</span>
                  <span className="text-[11px] font-mono text-slate-400">Color Dodge Engine</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Gaussian inverted blur + color dodge blending + edge laplacian with modular adapter integration.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Oil Painting (Kuwahara)</span>
                  <span className="text-[11px] font-mono text-slate-400">Quadrant Variance</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Edge-preserving quadrant variance minimization with brush radius, impasto stroke depth, and vibrance.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Neon Edge Glow</span>
                  <span className="text-[11px] font-mono text-slate-400">Sobel + Bloom</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Sobel first derivatives Gx/Gy, edge thresholding, spectral neon mapping, and Gaussian bloom.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Vintage Film & Halftone</span>
                  <span className="text-[11px] font-mono text-slate-400">S-Curve & Halftone</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Photochemical tone curves, deterministic Mulberry32 grain, optical vignette, and angled dot rasterization.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">3×3 Convolution Playground</span>
                  <span className="text-[11px] font-mono text-slate-400">Custom Matrix Math</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Interactive 9-cell spatial editor with dynamic kernel sum, divisor normalization, and spatial presets.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Planned Improvements (v1.5 & v2.0) */}
          <div className="rounded-2xl lg:rounded-3xl border border-purple-500/30 bg-[#14101F] p-8 shadow-xl">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#FFAEDE]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">Upcoming Horizons</h3>
                  <p className="text-xs font-mono text-[#FFAEDE]">Engineering Roadmap</p>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded bg-purple-500/15 text-[#FFAEDE] border border-purple-500/30">
                IN ARCHITECTURE
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Advanced Physical Brush Simulation</span>
                  <span className="text-[11px] font-mono text-[#FFAEDE]">Q2 2026</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Physical bristle friction dynamics, paint load dissipation, and directional impasto canvas height maps.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">5×5 and 7×7 Arbitrary Kernels</span>
                  <span className="text-[11px] font-mono text-[#FFAEDE]">Q2 2026</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Expanded spatial convolution matrices with custom user presets import/export (JSON schema).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Local Batch Transformation Engine</span>
                  <span className="text-[11px] font-mono text-[#FFAEDE]">Q3 2026</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Multi-image background queue processing using multiple dedicated Web Workers with zip bundle export.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Additional Edge Detection Operators</span>
                  <span className="text-[11px] font-mono text-[#FFAEDE]">Q3 2026</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Full Canny multi-stage edge detection with hysteresis thresholding, Frei-Chen, and Kirsch compass matrices.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 space-y-1 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">WebGPU Compute Shader Acceleration</span>
                  <span className="text-[11px] font-mono text-[#FFAEDE]">v2.0 Architecture</span>
                </div>
                <p className="text-xs text-[#A8A1BA]">
                  Optional WGSL pipeline offload for 8K ultra-resolution processing with graceful CPU TypedArray fallback.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
