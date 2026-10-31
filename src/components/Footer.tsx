import React from 'react';
import { Cpu, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'studio', filterId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-purple-500/15 bg-[#08070D] py-12 text-sm text-[#A8A1BA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-purple-500/15">
          
          {/* Brand & Privacy Statement */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#EC38BC] to-[#A855F7] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#08070D] rounded-[6px] flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-[#5EEAD4]" />
                </div>
              </div>
              <span className="text-lg font-bold font-display text-white">
                Kernel<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#EC38BC]">Lab</span>
              </span>
            </div>

            <p className="text-xs text-[#A8A1BA] leading-relaxed max-w-sm">
              Algorithmic Precision Studio for mathematical image transformation. Powered by Python OpenCV Difference-of-Gaussians and browser-native Canvas convolution kernels.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-[#5EEAD4]">
              <ShieldCheck className="w-4 h-4 text-[#5EEAD4]" />
              <span>Strict File Cleanup on Python Sketch · Browser-Native Local Filters</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('studio')}
                  className="hover:text-white transition-colors"
                >
                  Image Editing Studio
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#why-kernellab" className="hover:text-white transition-colors">
                  Why KernelLab
                </a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-white transition-colors">
                  Roadmap & Horizons
                </a>
              </li>
            </ul>
          </div>

          {/* Filter Suite */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Filter Gallery
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('studio', 'sketch')}
                className="text-left hover:text-white transition-colors"
              >
                Pencil Sketch
              </button>
              <button
                onClick={() => onNavigate('studio', 'oil')}
                className="text-left hover:text-white transition-colors"
              >
                Oil Painting
              </button>
              <button
                onClick={() => onNavigate('studio', 'neon')}
                className="text-left hover:text-white transition-colors"
              >
                Neon Edge Glow
              </button>
              <button
                onClick={() => onNavigate('studio', 'film')}
                className="text-left hover:text-white transition-colors"
              >
                Vintage Film
              </button>
              <button
                onClick={() => onNavigate('studio', 'halftone')}
                className="text-left hover:text-white transition-colors"
              >
                Cyberpunk Halftone
              </button>
              <button
                onClick={() => onNavigate('studio', 'kernel')}
                className="text-left hover:text-white transition-colors text-[#5EEAD4]"
              >
                Kernel Playground
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} KernelLab. Browser-native computational optics engine. Free & open architecture.
          </div>
          <div className="flex items-center gap-1">
            <span>Engineered with pure mathematical rigor</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
