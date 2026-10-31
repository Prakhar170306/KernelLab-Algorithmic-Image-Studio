import React from 'react';
import { ShieldCheck, Cpu, Zap, DollarSign, Eye, Sparkles } from 'lucide-react';

export const WhyKernelLab: React.FC = () => {
  return (
    <section id="why-kernellab" className="py-20 lg:py-28 border-t border-purple-500/15 bg-radial-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-mono tracking-wider uppercase text-[#5EEAD4]">
            Engineering Philosophy
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight">
            Creative Freedom. Without the Cloud.
          </h2>
          <p className="text-base sm:text-lg text-[#A8A1BA]">
            Most modern creative tools hold your images hostage behind subscription tiers and slow cloud queues.
            KernelLab returns computational autonomy to your local machine.
          </p>
        </div>

        {/* Bento Grid Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Card 1: 100% Free Forever (Col 7) */}
          <div className="md:col-span-7 rounded-2xl lg:rounded-3xl border border-purple-500/25 bg-[#14101F] p-8 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#EC38BC]/10 to-[#A855F7]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-[#FFAEDE]">
                <DollarSign className="w-5 h-5 text-[#5EEAD4]" />
              </div>
              <span className="text-xs font-mono tracking-wider uppercase text-[#5EEAD4]">
                Zero Paywalls · Zero Subscriptions
              </span>
            </div>

            <h3 className="text-2xl font-bold font-display text-white mb-3">
              100% Free Forever
            </h3>

            <p className="text-[#A8A1BA] text-sm sm:text-base leading-relaxed mb-6">
              No subscription tiers, credit countdowns, login prompts, or artificial watermarks.
              Because math costs us $0 to execute on your machine, KernelLab is genuinely and permanently free.
            </p>

            {/* Visual HUD Graphic */}
            <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/20 grid grid-cols-3 gap-3 text-center font-mono">
              <div>
                <div className="text-[11px] text-slate-400">Cloud API Fee</div>
                <div className="text-lg font-bold text-white mt-1">$0.00</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Account Requirement</div>
                <div className="text-lg font-bold text-[#5EEAD4] mt-1">None</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Usage Quota</div>
                <div className="text-lg font-bold text-[#FFAEDE] mt-1">Unlimited</div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Privacy First (Col 5) */}
          <div className="md:col-span-5 rounded-2xl lg:rounded-3xl border border-purple-500/25 bg-[#14101F] p-8 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-[#5EEAD4]">
                <ShieldCheck className="w-5 h-5 text-[#5EEAD4]" />
              </div>
              <span className="text-xs font-mono tracking-wider uppercase text-[#5EEAD4]">
                Air-Gapped Privacy
              </span>
            </div>

            <h3 className="text-2xl font-bold font-display text-white mb-3">
              Honest Data Privacy
            </h3>

            <p className="text-[#A8A1BA] text-sm leading-relaxed mb-6">
              The Pencil Sketch filter sends the selected image to our dedicated Python OpenCV backend and purges all temporary files immediately upon delivery. Other artistic filters process 100% in-browser with zero uploads. No third-party AI models are ever used.
            </p>

            <div className="p-3.5 rounded-xl bg-[#08070D] border border-purple-500/20 font-mono text-xs text-[#5EEAD4] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5EEAD4]" />
              <span>Immediate Disk Cleanup · Zero Model Training</span>
            </div>
          </div>

          {/* Bento Card 3: Browser-Native Processing (Col 4) */}
          <div className="md:col-span-4 rounded-2xl lg:rounded-3xl border border-purple-500/25 bg-[#14101F] p-8 group hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-[#A855F7] mb-4">
              <Cpu className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold font-display text-white mb-2">
              Browser-Native Canvas
            </h3>

            <p className="text-[#A8A1BA] text-sm leading-relaxed">
              Harnesses direct HTML5 Canvas ImageData and typed memory buffers for deterministic mathematical pixel manipulation.
            </p>
          </div>

          {/* Bento Card 4: Lightweight Algorithms (Col 4) */}
          <div className="md:col-span-4 rounded-2xl lg:rounded-3xl border border-purple-500/25 bg-[#14101F] p-8 group hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-pink-900/40 border border-pink-500/30 flex items-center justify-center text-[#EC38BC] mb-4">
              <Zap className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold font-display text-white mb-2">
              Lightweight Formulas
            </h3>

            <p className="text-[#A8A1BA] text-sm leading-relaxed">
              Compact matrix convolution and Kuwahara algorithms fit in under 50KB. No gigabyte model weights or cold-start waits.
            </p>
          </div>

          {/* Bento Card 5: Interactive Previews (Col 4) */}
          <div className="md:col-span-4 rounded-2xl lg:rounded-3xl border border-purple-500/25 bg-[#14101F] p-8 group hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-[#5EEAD4] mb-4">
              <Eye className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold font-display text-white mb-2">
              Interactive Previews
            </h3>

            <p className="text-[#A8A1BA] text-sm leading-relaxed">
              Draggable split viewports, parametric sliders, and side-by-side comparisons give immediate visual feedback.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
