import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  Move,
  RefreshCw,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { ComparisonMode, ImageMetadata } from '../../engine/types';

interface ImageCanvasProps {
  originalImageData: ImageData | null;
  processedImageData: ImageData | null;
  isProcessing: boolean;
  comparisonMode: ComparisonMode;
  metadata: ImageMetadata;
  onFileUpload: (file: File) => void;
  backendError?: string | null;
  onRetry?: () => void;
  isOfflineSample?: boolean;
  activeFilterName?: string;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  originalImageData,
  processedImageData,
  isProcessing,
  comparisonMode,
  metadata,
  onFileUpload,
  backendError,
  onRetry,
  isOfflineSample,
  activeFilterName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Canvases
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const sideOriginalCanvasRef = useRef<HTMLCanvasElement>(null);
  const sideProcessedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Split slider state (0 - 100 percentage)
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Hold original comparison
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);

  // Drag-and-drop file highlight
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Render original ImageData onto canvases
  useEffect(() => {
    if (!originalImageData) return;
    const w = originalImageData.width;
    const h = originalImageData.height;

    if (originalCanvasRef.current) {
      originalCanvasRef.current.width = w;
      originalCanvasRef.current.height = h;
      originalCanvasRef.current.getContext('2d')?.putImageData(originalImageData, 0, 0);
    }

    if (sideOriginalCanvasRef.current) {
      sideOriginalCanvasRef.current.width = w;
      sideOriginalCanvasRef.current.height = h;
      sideOriginalCanvasRef.current.getContext('2d')?.putImageData(originalImageData, 0, 0);
    }

    // Ensure base canvas has matching dimensions so card container never collapses
    if (processedCanvasRef.current && (!processedImageData || processedCanvasRef.current.width === 0)) {
      processedCanvasRef.current.width = w;
      processedCanvasRef.current.height = h;
    }
    if (sideProcessedCanvasRef.current && (!processedImageData || sideProcessedCanvasRef.current.width === 0)) {
      sideProcessedCanvasRef.current.width = w;
      sideProcessedCanvasRef.current.height = h;
    }
  }, [originalImageData, processedImageData]);

  // Render processed ImageData onto canvases
  useEffect(() => {
    if (!processedImageData) return;
    const w = processedImageData.width;
    const h = processedImageData.height;

    if (processedCanvasRef.current) {
      processedCanvasRef.current.width = w;
      processedCanvasRef.current.height = h;
      processedCanvasRef.current.getContext('2d')?.putImageData(processedImageData, 0, 0);
    }

    if (sideProcessedCanvasRef.current) {
      sideProcessedCanvasRef.current.width = w;
      sideProcessedCanvasRef.current.height = h;
      sideProcessedCanvasRef.current.getContext('2d')?.putImageData(processedImageData, 0, 0);
    }
  }, [processedImageData]);

  // Calculate split slider position relative to the ACTUAL card element
  const handleSliderMove = useCallback((clientX: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      }
    };
    const onMouseUp = () => setIsDraggingSlider(false);

    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
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
  }, [isDraggingSlider, handleSliderMove]);

  // Spacebar pan listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer panning handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDraggingSlider) return;
    // Allow panning if middle-click, space pressed, or zoomed in
    if (e.button === 1 || isSpacePressed || zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  // Zoom handlers
  const zoomIn = () => {
    setZoom((prev) => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(0.4, Math.round((prev - 0.25) * 100) / 100));
  };

  const resetToFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const zoomActual = () => {
    setZoom(1.5);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom with Ctrl or trackpad pinch
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom((prev) => Math.max(0.4, Math.min(3.5, Math.round((prev + delta) * 100) / 100)));
    }
  };

  // Drag and drop image files
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onWheel={handleWheel}
      className={`relative flex-1 bg-[#08070D] overflow-hidden flex flex-col select-none ${
        isDragOver ? 'ring-2 ring-inset ring-[#5EEAD4] bg-[#14101F]' : ''
      }`}
    >
      {/* Precision Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1730_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Floating Top Controls HUD */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-[#14101F]/90 backdrop-blur-md border border-purple-500/25 shadow-2xl">
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-lg text-[#A8A1BA] hover:text-white hover:bg-white/5 active:scale-95 transition-all"
          title="Zoom Out (Ctrl -)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetToFit}
          className="text-xs font-mono px-2 py-1 rounded hover:bg-white/5 text-[#5EEAD4] min-w-[54px] text-center transition-colors"
          title="Click to reset to Fit"
        >
          {zoom === 1 ? 'Fit' : `${Math.round(zoom * 100)}%`}
        </button>

        <button
          onClick={zoomIn}
          className="p-1.5 rounded-lg text-[#A8A1BA] hover:text-white hover:bg-white/5 active:scale-95 transition-all"
          title="Zoom In (Ctrl +)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-purple-500/25 mx-1" />

        <button
          onClick={resetToFit}
          className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
            zoom === 1
              ? 'bg-[#5EEAD4]/15 text-[#5EEAD4] font-semibold border border-[#5EEAD4]/30'
              : 'text-[#A8A1BA] hover:text-white hover:bg-white/5'
          }`}
          title="Fit Image to Viewport"
        >
          Fit
        </button>

        <button
          onClick={zoomActual}
          className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
            zoom === 1.5
              ? 'bg-[#5EEAD4]/15 text-[#5EEAD4] font-semibold border border-[#5EEAD4]/30'
              : 'text-[#A8A1BA] hover:text-white hover:bg-white/5'
          }`}
          title="Zoom 150%"
        >
          150%
        </button>

        <div className="w-px h-4 bg-purple-500/25 mx-1" />

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-[#A8A1BA] hover:text-white hover:bg-white/5 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Top-Right Compare Action & Engine Status */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {isOfflineSample && (
          <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Sample Preview Mode</span>
          </div>
        )}

        <button
          onMouseDown={() => setIsHoldingOriginal(true)}
          onMouseUp={() => setIsHoldingOriginal(false)}
          onTouchStart={() => setIsHoldingOriginal(true)}
          onTouchEnd={() => setIsHoldingOriginal(false)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 shadow-xl backdrop-blur-md transition-all select-none ${
            isHoldingOriginal
              ? 'bg-[#5EEAD4] text-[#08070D] border-[#5EEAD4] font-bold shadow-cyan-500/30'
              : 'bg-[#14101F]/90 border-purple-500/30 text-slate-300 hover:text-white hover:border-purple-500/50'
          }`}
          title="Hold down to preview the original photographic input"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isHoldingOriginal ? 'Viewing Original' : 'Hold Original'}</span>
        </button>
      </div>

      {/* Main Spacious Canvas Viewport */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden ${
          isPanning || isSpacePressed ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-default'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.12s ease-out'
          }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          {comparisonMode === 'split' ? (
            /* MODE 1: Interactive Draggable Split Comparison */
            <div
              ref={cardRef}
              className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-[#08070D] shadow-2xl shadow-black/80 flex items-center justify-center"
              style={{
                maxWidth: '92vw',
                maxHeight: 'calc(100vh - 128px)'
              }}
            >
              {/* Processed Output Canvas (Full Width Bottom Base) */}
              <canvas
                ref={processedCanvasRef}
                className="block object-contain"
                style={{
                  maxHeight: 'calc(100vh - 140px)',
                  maxWidth: 'calc(100vw - 420px)',
                  width: 'auto',
                  height: 'auto'
                }}
              />

              {/* Original Source Canvas (Top Layer Clipped by Slider) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  clipPath: isHoldingOriginal
                    ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                    : `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
                }}
              >
                <canvas
                  ref={originalCanvasRef}
                  className="block object-contain"
                  style={{
                    maxHeight: 'calc(100vh - 140px)',
                    maxWidth: 'calc(100vw - 420px)',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
              </div>

              {/* Glowing Draggable Split Laser Divider */}
              {!isHoldingOriginal && (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingSlider(true);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setIsDraggingSlider(true);
                  }}
                  className="absolute top-0 bottom-0 w-10 -ml-5 flex items-center justify-center cursor-ew-resize z-20 group pointer-events-auto"
                  style={{ left: `${sliderPos}%` }}
                >
                  {/* Glowing Laser Beam */}
                  <div
                    className="w-[2px] h-full pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, #5EEAD4, #EC38BC, #A855F7)',
                      boxShadow: '0 0 16px #5EEAD4, 0 0 28px #EC38BC'
                    }}
                  />

                  {/* Circular Control Knob */}
                  <div className="absolute w-8 h-8 rounded-full bg-[#08070D] border-2 border-[#5EEAD4] shadow-xl shadow-cyan-500/50 flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform">
                    <div className="flex gap-1 items-center">
                      <div className="w-0.5 h-3 bg-[#5EEAD4] rounded-full" />
                      <div className="w-0.5 h-3 bg-[#EC38BC] rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Corner Overlay Badges */}
              <div className="absolute bottom-3 left-3 pointer-events-none z-10">
                <span className="px-2.5 py-1 rounded-md bg-[#08070D]/85 backdrop-blur-md border border-purple-500/25 text-[11px] font-mono text-slate-200 shadow-md">
                  ORIGINAL PHOTOGRAPH
                </span>
              </div>
              <div className="absolute bottom-3 right-3 pointer-events-none z-10">
                <span className="px-2.5 py-1 rounded-md bg-[#08070D]/85 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono text-[#5EEAD4] shadow-md">
                  {activeFilterName ? activeFilterName.toUpperCase() : 'GRAPHITE SKETCH'}
                </span>
              </div>
            </div>
          ) : comparisonMode === 'side-by-side' ? (
            /* MODE 2: Dual Panes Side-by-Side */
            <div
              ref={cardRef}
              className="flex flex-col lg:flex-row items-center gap-4 max-h-[calc(100vh-140px)] max-w-full overflow-auto p-2"
            >
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-[#08070D] shadow-xl">
                <canvas
                  ref={sideOriginalCanvasRef}
                  className="block object-contain"
                  style={{
                    maxHeight: 'calc(80vh - 140px)',
                    maxWidth: 'calc(50vw - 220px)',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#08070D]/85 border border-purple-500/20 text-[10px] font-mono text-slate-300">
                  ORIGINAL
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-[#08070D] shadow-xl shadow-cyan-950/40">
                <canvas
                  ref={sideProcessedCanvasRef}
                  className="block object-contain"
                  style={{
                    maxHeight: 'calc(80vh - 140px)',
                    maxWidth: 'calc(50vw - 220px)',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#08070D]/85 border border-cyan-500/30 text-[10px] font-mono text-[#5EEAD4]">
                  PROCESSED
                </div>
              </div>
            </div>
          ) : (
            /* MODE 3: Single Canvas with Hold Toggle */
            <div
              ref={cardRef}
              className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-[#08070D] shadow-2xl flex items-center justify-center"
              style={{
                maxWidth: '92vw',
                maxHeight: 'calc(100vh - 128px)'
              }}
            >
              <canvas
                ref={processedCanvasRef}
                className={`block object-contain ${isHoldingOriginal ? 'hidden' : 'block'}`}
                style={{
                  maxHeight: 'calc(100vh - 140px)',
                  maxWidth: 'calc(100vw - 420px)',
                  width: 'auto',
                  height: 'auto'
                }}
              />
              <canvas
                ref={originalCanvasRef}
                className={`block object-contain ${isHoldingOriginal ? 'block' : 'hidden'}`}
                style={{
                  maxHeight: 'calc(100vh - 140px)',
                  maxWidth: 'calc(100vw - 420px)',
                  width: 'auto',
                  height: 'auto'
                }}
              />
              <div className="absolute bottom-3 left-3 pointer-events-none z-10">
                <span className="px-2.5 py-1 rounded-md bg-[#08070D]/85 backdrop-blur-md border border-purple-500/25 text-[11px] font-mono text-slate-200">
                  {isHoldingOriginal ? 'ORIGINAL SOURCE' : 'PROCESSED ARTWORK'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Processing Status Indicator */}
      {isProcessing && (
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#14101F]/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl font-mono text-xs text-[#5EEAD4]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#5EEAD4]" />
          <span>Executing Vision Kernel Passes...</span>
        </div>
      )}

      {/* Backend Error Notification & Retry Overlay */}
      {backendError && (
        <div className="absolute bottom-6 left-6 z-30 max-w-md p-3.5 rounded-xl bg-[#1c121e]/95 backdrop-blur-md border border-pink-500/40 shadow-2xl font-sans text-xs flex flex-col gap-2">
          <div className="flex items-start gap-2 text-pink-300">
            <AlertTriangle className="w-4 h-4 text-[#FFAEDE] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-white block">Python Vision Backend Notice</span>
              <span className="text-[#A8A1BA] text-[11px] leading-tight block mt-0.5">
                {backendError}
              </span>
            </div>
          </div>
          {onRetry && (
            <div className="flex items-center gap-2 pt-1 border-t border-purple-500/20">
              <button
                onClick={onRetry}
                className="px-3 py-1 rounded bg-gradient-to-r from-[#EC38BC] to-[#A855F7] text-white font-medium hover:brightness-110 active:scale-95 transition-all text-xs"
              >
                Retry Python Backend
              </button>
            </div>
          )}
        </div>
      )}

      {/* Drag & Drop Prompt Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-[#08070D]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#5EEAD4] text-center">
          <Upload className="w-12 h-12 text-[#5EEAD4] animate-bounce mb-3" />
          <h3 className="text-xl font-bold font-display text-white mb-1">Drop Image to Transform</h3>
          <p className="text-sm font-mono text-[#A8A1BA]">
            Replaces current canvas with your custom high-resolution image
          </p>
        </div>
      )}
    </div>
  );
};
