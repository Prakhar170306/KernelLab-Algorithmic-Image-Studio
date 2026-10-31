import React, { useRef } from 'react';
import { ArrowLeft, Cpu, Upload, RotateCcw, Clock, ImageIcon, Maximize2 } from 'lucide-react';
import { ImageMetadata } from '../../engine/types';
import { SAMPLE_IMAGES } from '../../engine/sampleImages';

interface TopToolbarProps {
  onBackToHome: () => void;
  metadata: ImageMetadata;
  durationMs: number;
  isProcessing: boolean;
  activeEngineName?: string;
  onSelectSample: (sampleId: string) => void;
  onFileUpload: (file: File) => void;
  onResetProject: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  onBackToHome,
  metadata,
  durationMs,
  isProcessing,
  activeEngineName,
  onSelectSample,
  onFileUpload,
  onResetProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = ''; // Reset input for re-uploading same file
    }
  };

  return (
    <header className="h-14 border-b border-purple-500/15 bg-[#14101F]/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-40 shrink-0">
      {/* Left: Back & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToHome}
          className="p-1.5 rounded-lg text-[#A8A1BA] hover:text-white hover:bg-purple-950/40 transition-colors flex items-center gap-1.5 text-xs font-mono"
          title="Return to Home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="h-4 w-px bg-purple-500/20 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#EC38BC] to-[#A855F7] p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#08070D] rounded-[4px] flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-[#5EEAD4]" />
            </div>
          </div>
          <span className="text-sm font-bold font-display text-white hidden md:inline">
            Kernel<span className="text-[#A855F7]">Studio</span>
          </span>
        </div>
      </div>

      {/* Center: Image Info Badge & Sample Picker */}
      <div className="flex items-center gap-3 overflow-hidden text-xs font-mono">
        {/* Filename & Resolution */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-[#08070D]/80 border border-purple-500/20 text-[#A8A1BA]">
          <ImageIcon className="w-3.5 h-3.5 text-[#5EEAD4]" />
          <span className="text-white font-medium truncate max-w-[140px]">{metadata.name}</span>
          <span className="text-slate-500">·</span>
          <span>{metadata.width} × {metadata.height} px</span>
        </div>

        {/* Real-time processing duration indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#08070D]/80 border border-purple-500/20 text-[11px]">
          <Clock className="w-3 h-3 text-[#5EEAD4]" />
          {isProcessing ? (
            <span className="text-[#FFAEDE] animate-pulse">Processing...</span>
          ) : (
            <span className="text-[#5EEAD4]">{durationMs} ms</span>
          )}
        </div>

        {/* Engine Badge */}
        {activeEngineName && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#08070D]/80 border border-cyan-500/30 text-[11px] text-[#5EEAD4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5EEAD4]" />
            <span className="truncate max-w-[200px]">{activeEngineName}</span>
          </div>
        )}

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="sample-select" className="text-slate-400 hidden sm:inline text-[11px]">Artwork:</label>
          <select
            id="sample-select"
            value={
              SAMPLE_IMAGES.find(
                (s) => metadata.name.includes(s.id) || (s.id === 'greenhouse-conservatory' && metadata.name.includes('conservatory'))
              )?.id || ''
            }
            onChange={(e) => onSelectSample(e.target.value)}
            className="bg-[#08070D] border border-purple-500/30 text-white rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#5EEAD4] cursor-pointer max-w-[180px] truncate"
          >
            <option value="" disabled>Custom User Upload</option>
            {SAMPLE_IMAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions: Upload New & Reset */}
      <div className="flex items-center gap-2 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg bg-[#1E1730] hover:bg-purple-900/40 border border-purple-500/30 text-xs font-medium text-white transition-all flex items-center gap-1.5"
          title="Upload image from device (PNG, JPG, WebP)"
        >
          <Upload className="w-3.5 h-3.5 text-[#5EEAD4]" />
          <span>Upload Image</span>
        </button>

        <button
          onClick={onResetProject}
          className="p-1.5 rounded-lg text-[#A8A1BA] hover:text-white hover:bg-purple-950/40 transition-colors"
          title="Reset Project to Default State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
