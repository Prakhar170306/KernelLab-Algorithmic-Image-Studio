import React, { useState } from 'react';
import { Sparkles, Sliders, Layers, Cpu, ShieldCheck, ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'studio';
  onNavigate: (view: 'home' | 'studio', filterId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/15 bg-[#08070D]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark as per Top Bar contract) */}
        <button
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left text-white group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EC38BC] to-[#A855F7] p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
            <div className="w-full h-full bg-[#08070D] rounded-[6px] flex items-center justify-center">
              <Cpu className="w-4 h-4 text-[#5EEAD4]" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight font-display text-white whitespace-nowrap shrink-0">
            Kernel<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#EC38BC]">Lab</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (single line, concise) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#A8A1BA]">
          {currentView === 'home' ? (
            <>
              <a
                href="#how-it-works"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                How It Works
              </a>
              <a
                href="#why-kernellab"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Why KernelLab
              </a>
              <a
                href="#filters"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Filter Gallery
              </a>
              <a
                href="#roadmap"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Roadmap
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Home Overview
              </button>
              <button
                onClick={() => onNavigate('studio', 'sketch')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Studio Canvas
              </button>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('home');
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Algorithm Specs
              </a>
            </>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {currentView === 'home' ? (
            <button
              onClick={() => onNavigate('studio')}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#EC38BC] to-[#A855F7] rounded-full hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 text-sm font-medium text-[#F7F5FF] bg-[#14101F] border border-purple-500/30 rounded-full hover:bg-purple-950/40 hover:border-purple-500/50 transition-all whitespace-nowrap shrink-0"
            >
              Back to Overview
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-950/40"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-purple-500/20 bg-[#14101F] px-4 pt-3 pb-5 space-y-3">
          {currentView === 'home' ? (
            <>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#A8A1BA] hover:text-white"
              >
                How It Works
              </a>
              <a
                href="#why-kernellab"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#A8A1BA] hover:text-white"
              >
                Why KernelLab
              </a>
              <a
                href="#filters"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#A8A1BA] hover:text-white"
              >
                Filter Gallery
              </a>
              <a
                href="#roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-[#A8A1BA] hover:text-white"
              >
                Roadmap
              </a>
            </>
          ) : (
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-[#A8A1BA] hover:text-white"
            >
              Back to Overview
            </button>
          )}
          <div className="pt-2 border-t border-purple-500/20">
            <button
              onClick={() => {
                onNavigate(currentView === 'home' ? 'studio' : 'home');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-gradient-to-r from-[#EC38BC] to-[#A855F7] rounded-full shadow-lg shadow-purple-600/30"
            >
              {currentView === 'home' ? 'Launch Studio' : 'Back to Home'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
