import React, { useState } from 'react';
import { Download, Columns, SplitSquareVertical, Eye, Sliders, Layers, Check } from 'lucide-react';
import { ComparisonMode, ExportFormat, ImageMetadata } from '../../engine/types';

interface BottomToolbarProps {
  comparisonMode: ComparisonMode;
  onChangeComparisonMode: (mode: ComparisonMode) => void;
  metadata: ImageMetadata;
  activeFilterName: string;
  processedImageData: ImageData | null;
  pythonBlob?: Blob | null;
  onToggleFilterDrawer: () => void;
  onToggleAdjustmentDrawer: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  comparisonMode,
  onChangeComparisonMode,
  metadata,
  activeFilterName,
  processedImageData,
  pythonBlob,
  onToggleFilterDrawer,
  onToggleAdjustmentDrawer
}) => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('image/png');
  const [quality, setQuality] = useState(0.92);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!processedImageData) return;
    setIsExporting(true);

    const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    const baseName = metadata.name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_').toLowerCase();
    const filterSlug = activeFilterName.toLowerCase().replace(/\s+/g, '-');
    const filename = `${baseName}_${filterSlug}.${ext}`;

    // Direct byte-level export of Python backend output when PNG is selected
    if (pythonBlob && activeFilterName.toLowerCase().includes('pencil') && exportFormat === 'image/png') {
      const url = URL.createObjectURL(pythonBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setExportModalOpen(false);
      return;
    }

    // Create offscreen canvas with full processed resolution
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = processedImageData.width;
    exportCanvas.height = processedImageData.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(processedImageData, 0, 0);

    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportModalOpen(false);
      },
      exportFormat,
      exportFormat === 'image/png' ? undefined : quality
    );
  };

  return (
    <>
      <footer className="h-14 border-t border-purple-500/15 bg-[#14101F]/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-40 shrink-0">
        
        {/* Left: Mobile Drawer Toggles */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onToggleFilterDrawer}
            className="px-2.5 py-1.5 rounded-lg bg-[#1E1730] border border-purple-500/30 text-xs font-mono text-white flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span>Filters</span>
          </button>

          <button
            onClick={onToggleAdjustmentDrawer}
            className="px-2.5 py-1.5 rounded-lg bg-[#1E1730] border border-purple-500/30 text-xs font-mono text-white flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-[#EC38BC]" />
            <span>Params</span>
          </button>
        </div>

        {/* Center: Comparison Mode Segmented Buttons */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-[#08070D] rounded-xl border border-purple-500/20 text-xs font-mono">
          <button
            onClick={() => onChangeComparisonMode('split')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              comparisonMode === 'split'
                ? 'bg-purple-900/50 text-[#5EEAD4] font-semibold border border-cyan-500/30'
                : 'text-[#A8A1BA] hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            onClick={() => onChangeComparisonMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              comparisonMode === 'side-by-side'
                ? 'bg-purple-900/50 text-[#5EEAD4] font-semibold border border-cyan-500/30'
                : 'text-[#A8A1BA] hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => onChangeComparisonMode('original-hold')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              comparisonMode === 'original-hold'
                ? 'bg-purple-900/50 text-[#5EEAD4] font-semibold border border-cyan-500/30'
                : 'text-[#A8A1BA] hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hold Toggle</span>
          </button>
        </div>

        {/* Right: Export Button */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#EC38BC] to-[#A855F7] rounded-full hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Image</span>
          </button>
        </div>
      </footer>

      {/* Export Configuration Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#14101F] border border-purple-500/30 p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-white">Export Processed Image</h3>
                <p className="text-xs font-mono text-[#5EEAD4]">Full {metadata.width} × {metadata.height} px Resolution</p>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">File Format</label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {(['image/png', 'image/jpeg', 'image/webp'] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`py-2 px-3 rounded-lg border text-center transition-all ${
                      exportFormat === fmt
                        ? 'bg-purple-900/50 border-[#5EEAD4] text-[#5EEAD4] font-bold'
                        : 'bg-[#08070D] border-purple-500/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt.replace('image/', '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider for JPEG / WebP */}
            {exportFormat !== 'image/png' && (
              <div className="space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Compression Quality</span>
                  <span className="text-[#5EEAD4]">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#08070D] rounded-lg appearance-none cursor-pointer accent-[#EC38BC]"
                />
              </div>
            )}

            {/* File info preview */}
            <div className="p-3 rounded-xl bg-[#08070D] border border-purple-500/20 text-xs font-mono text-slate-400 space-y-1">
              <div>Output filename: <span className="text-white">myphoto_{activeFilterName.toLowerCase().replace(/\s+/g, '-')}.{exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png'}</span></div>
              <div>Processing location: <span className="text-[#5EEAD4]">Client RAM (Zero Server Leakage)</span></div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#EC38BC] to-[#A855F7] rounded-full hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Encoding...' : 'Download File'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
