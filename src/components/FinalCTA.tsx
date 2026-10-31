import React from 'react';
import { ArrowRight, Sparkles, Cpu } from 'lucide-react';

interface FinalCTAProps {
  onOpenStudio: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenStudio }) => {
  return (
    <section className="py-20 lg:py-28 border-t border-purple-500/15 relative overflow-hidden bg-[#08070D]">
      {/* Dynamic ambient halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#EC38BC]/20 via-[#A855F7]/25 to-[#5EEAD4]/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14101F] border border-purple-500/30 text-xs font-mono text-[#5EEAD4]">
          <Cpu className="w-3.5 h-3.5" />
          <span>Zero Installation · Runs In Your Browser</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Your Next Masterpiece Starts With a Pixel.
        </h2>

        <p className="text-base sm:text-lg text-[#A8A1BA] max-w-2xl mx-auto leading-relaxed">
          Experience algorithmic precision without subscriptions, credit meters, or cloud delays.
          Upload your imagery and begin shaping pixel matrices right now.
        </p>

        <div className="pt-2 flex justify-center">
          <button
            onClick={onOpenStudio}
            className="px-10 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#EC38BC] to-[#A855F7] rounded-full hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-purple-600/40 flex items-center gap-3"
          >
            <span>Open KernelLab Studio</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};
