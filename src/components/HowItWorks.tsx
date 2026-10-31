import React, { useState } from 'react';
import { Upload, Eye, Binary, Grid3X3, Layers, Download, CheckCircle2, ChevronRight } from 'lucide-react';

interface Stage {
  number: string;
  name: string;
  shortDesc: string;
  mathFormula: string;
  codeSnippet: string;
  explanation: string;
  matrixData?: number[][];
}

const STAGES: Stage[] = [
  {
    number: '01',
    name: 'Image Ingestion',
    shortDesc: 'Client-side file decode via FileReader & HTMLImageElement',
    mathFormula: 'Dim = W \\times H \\times 4 \\text{ (RGBA Channels)}',
    codeSnippet: `const img = new Image();
img.onload = () => ctx.drawImage(img, 0, 0);
img.src = URL.createObjectURL(file);`,
    explanation: 'Images are either decoded locally in browser RAM or sent ephemerally to our Python OpenCV pipeline with automatic disk cleanup immediately upon rendering.'
  },
  {
    number: '02',
    name: 'Pixel Extraction',
    shortDesc: 'Zero-copy memory mapping to Uint8ClampedArray',
    mathFormula: 'I(x,y) \\to [R, G, B, A] \\quad \\text{Index} = (y \\cdot W + x) \\cdot 4',
    codeSnippet: `const imgData = ctx.getImageData(0, 0, width, height);
const pixels = imgData.data; // Uint8ClampedArray`,
    explanation: 'Direct contiguous memory access enables millisecond-level iteration over millions of color channels using linear pointer arithmetic.'
  },
  {
    number: '03',
    name: 'Grayscale & Tonal Curve',
    shortDesc: 'Photometric luminance weighting (ITU-R BT.709)',
    mathFormula: 'Y = 0.2126R + 0.7152G + 0.0722B',
    codeSnippet: `const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
const inverted = 255 - lum; // For Color Dodge sketch`,
    explanation: 'Matches human retinal rod sensitivity to green and blue photons, creating balanced contrast foundation for pencil outlines and edge extraction.'
  },
  {
    number: '04',
    name: '2D Spatial Convolution',
    shortDesc: 'Neighborhood pixel evaluation with kernel matrices',
    mathFormula: 'S(x,y) = \\sum_{i=-1}^{1} \\sum_{j=-1}^{1} K(i,j) \\cdot I(x+i, y+j)',
    codeSnippet: `// 3x3 Spatial Convolution Pass
for (let c = 0; c < 3; c++) {
  const sum = p00*k00 + p01*k01 + p02*k02 + ...;
  dst[idx + c] = clamp(sum / divisor + offset, 0, 255);
}`,
    matrixData: [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ],
    explanation: 'Mathematical sliding matrix calculates spatial gradients, directional ridges, high frequencies, or Gaussian dispersion across neighboring pixels.'
  },
  {
    number: '05',
    name: 'Effect Composition',
    shortDesc: 'Non-linear blending, Kuwahara variance & color mapping',
    mathFormula: '\\text{ColorDodge}(A, B) = \\min\\left(255, \\frac{A \\cdot 255}{255 - B}\\right)',
    codeSnippet: `// Kuwahara minimum variance quadrant selection:
const bestQuad = quadrants.reduce((min, q) => 
  q.variance < min.variance ? q : min
);
return bestQuad.meanColor;`,
    explanation: 'Each filter employs its own mathematical synthesis: Kuwahara quadrant variance sorting for oil paint, Sobel bloom for neon, or rotated grid rasterization for halftone.'
  },
  {
    number: '06',
    name: 'Client-Side Export',
    shortDesc: 'Lossless raster serialization with full resolution',
    mathFormula: '\\text{Canvas.toBlob}(\\dots, \\text{"image/png"}, 1.0)',
    codeSnippet: `canvas.toBlob((blob) => {
  const link = document.createElement('a');
  link.download = 'render_sketch.png';
  link.href = URL.createObjectURL(blob);
  link.click();
}, 'image/png');`,
    explanation: 'Direct pixel export writes genuine transformed pixel data without watermarks, compression artifacts, or screenshot approximations.'
  }
];

export const HowItWorks: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(3); // 04 Convolution default

  const current = STAGES[selectedStage];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 border-t border-purple-500/15 bg-[#08070D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-mono tracking-wider uppercase text-[#EC38BC]">
            Algorithmic Pipeline Specification
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight">
            Real Mathematics. Remarkable Results.
          </h2>
          <p className="text-base sm:text-lg text-[#A8A1BA]">
            Explore how KernelLab executes complex computational vision routines directly inside your browser’s JavaScript V8 runtime without server dependencies.
          </p>
        </div>

        {/* 6 Stage Timeline Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {STAGES.map((stage, idx) => {
            const isSelected = selectedStage === idx;
            return (
              <button
                key={stage.number}
                onClick={() => setSelectedStage(idx)}
                className={`p-4 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-[#1E1730] border-[#5EEAD4] shadow-lg shadow-purple-900/30'
                    : 'bg-[#14101F]/70 border-purple-500/20 hover:border-purple-500/40 hover:bg-[#14101F]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-[#5EEAD4]' : 'text-[#A8A1BA]'}`}>
                    {stage.number}
                  </span>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#5EEAD4]" />}
                </div>
                <div className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {stage.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Deep Dive Technical Inspector Card */}
        <div className="rounded-2xl lg:rounded-3xl border border-purple-500/30 bg-[#14101F] p-6 lg:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Detail & Math Formula */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono px-2.5 py-0.5 rounded bg-purple-500/20 text-[#FFAEDE] border border-purple-500/30">
                    STAGE {current.number}
                  </span>
                  <h3 className="text-2xl font-bold font-display text-white">
                    {current.name}
                  </h3>
                </div>
                <p className="text-sm text-[#5EEAD4] font-mono">
                  {current.shortDesc}
                </p>
              </div>

              <p className="text-sm text-[#A8A1BA] leading-relaxed">
                {current.explanation}
              </p>

              {/* Mathematical Equation Display */}
              <div className="p-4 rounded-xl bg-[#08070D] border border-purple-500/25 space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Mathematical Formulation
                </div>
                <div className="font-mono text-sm text-[#F7F5FF] overflow-x-auto py-1">
                  <code>{current.mathFormula}</code>
                </div>
              </div>

              {/* Matrix Display if available */}
              {current.matrixData && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Active 3×3 Convolution Tensor Kernel
                  </div>
                  <div className="inline-grid grid-cols-3 gap-1.5 p-3 rounded-xl bg-[#08070D] border border-cyan-500/30 font-mono text-sm">
                    {current.matrixData.flat().map((v, i) => (
                      <div
                        key={i}
                        className={`w-12 h-10 rounded flex items-center justify-center font-bold ${
                          v > 0
                            ? 'bg-purple-900/40 text-[#5EEAD4] border border-cyan-500/40'
                            : 'bg-white/5 text-[#A8A1BA] border border-white/5'
                        }`}
                      >
                        {v > 0 ? `+${v}` : v}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Code Snippet Execution Window */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>V8 JIT Runtime Implementation</span>
                <span className="text-[#5EEAD4]">TypeScript / TypedArray</span>
              </div>
              <div className="rounded-xl bg-[#08070D] border border-purple-500/30 p-4 font-mono text-xs text-[#E6E0EA] overflow-x-auto shadow-inner leading-relaxed">
                <pre>
                  <code>{current.codeSnippet}</code>
                </pre>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs text-[#A8A1BA]">
                <CheckCircle2 className="w-4 h-4 text-[#5EEAD4]" />
                <span>Zero allocations inside inner pixel traversal loop</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
