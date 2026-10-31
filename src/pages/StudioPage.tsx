import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopToolbar } from '../components/studio/TopToolbar';
import { FilterSidebar } from '../components/studio/FilterSidebar';
import { ImageCanvas } from '../components/studio/ImageCanvas';
import { AdjustmentPanel } from '../components/studio/AdjustmentPanel';
import { BottomToolbar } from '../components/studio/BottomToolbar';
import {
  FilterType,
  AllFilterParameters,
  ImageMetadata,
  ComparisonMode,
  ProcessedResult
} from '../engine/types';
import { DEFAULT_PARAMETERS, processImage } from '../engine/processor';
import { generateSampleImageData, SAMPLE_IMAGES } from '../engine/sampleImages';

interface StudioPageProps {
  initialFilter?: FilterType;
  onBackToHome: () => void;
}

const FILTER_NAMES: Record<FilterType, string> = {
  sketch: 'Fine-Art Pencil Sketch',
  oil: 'Oil Painting',
  neon: 'Neon Edge Glow',
  film: 'Vintage Film',
  halftone: 'Cyberpunk Halftone',
  kernel: 'Custom 3x3 Matrix'
};

export const StudioPage: React.FC<StudioPageProps> = ({
  initialFilter = 'sketch',
  onBackToHome
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [parameters, setParameters] = useState<AllFilterParameters>(() =>
    JSON.parse(JSON.stringify(DEFAULT_PARAMETERS))
  );

  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [processedImageData, setProcessedImageData] = useState<ImageData | null>(null);

  const [metadata, setMetadata] = useState<ImageMetadata>({
    name: 'victorian_glass_conservatory.png',
    width: 1600,
    height: 1200,
    aspectRatio: 4 / 3
  });

  const [durationMs, setDurationMs] = useState<number>(24.0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('split');

  // Backend / Error / Fallback tracking
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isOfflineSample, setIsOfflineSample] = useState<boolean>(false);
  const [isUserUploaded, setIsUserUploaded] = useState<boolean>(false);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  // Mobile Drawers
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileAdjustmentOpen, setIsMobileAdjustmentOpen] = useState(false);

  const [pythonBlob, setPythonBlob] = useState<Blob | null>(null);
  const [activeEngineName, setActiveEngineName] = useState<string>('Python Vision Engine (DoG + CLAHE)');

  // Debounce processing ref & AbortController ref
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial sample image on mount: Victorian Glass Conservatory (Task 1)
  useEffect(() => {
    loadSampleArtwork('greenhouse-conservatory', 'victorian_glass_conservatory.png');
  }, []);

  // When initialFilter prop changes (e.g. from gallery deep links)
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  const loadSampleArtwork = (sampleId: string, filename = 'sample_artwork.png') => {
    setIsProcessing(true);
    setBackendError(null);
    setIsUserUploaded(false);

    const meta = SAMPLE_IMAGES.find((s) => s.id === sampleId);

    if (meta && meta.imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const targetW = img.naturalWidth || 1600;
        const targetH = img.naturalHeight || 1200;
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          setOriginalImageData(imgData);
          setMetadata({
            name: filename,
            width: targetW,
            height: targetH,
            aspectRatio: targetW / targetH
          });
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        try {
          const imgData = generateSampleImageData(sampleId, 800, 600);
          setOriginalImageData(imgData);
          setMetadata({
            name: filename,
            width: imgData.width,
            height: imgData.height,
            aspectRatio: imgData.width / imgData.height
          });
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = meta.imageSrc;
      return;
    }

    setTimeout(() => {
      try {
        const imgData = generateSampleImageData(sampleId, 800, 600);
        setOriginalImageData(imgData);
        setMetadata({
          name: filename,
          width: imgData.width,
          height: imgData.height,
          aspectRatio: imgData.width / imgData.height
        });
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  };

  // Re-run processor when originalImageData, activeFilter, parameters, or retryTrigger change
  useEffect(() => {
    if (!originalImageData) return;

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsProcessing(true);

    if (activeFilter === 'sketch') {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Debounce Python server requests by 120ms
      processingTimeoutRef.current = setTimeout(async () => {
        try {
          const { processPencilSketchWithPython } = await import('../services/pencilSketchAPI');
          const res = await processPencilSketchWithPython(
            originalImageData,
            parameters.sketch,
            controller.signal
          );
          setProcessedImageData(res.imageData);
          setDurationMs(res.durationMs);
          setPythonBlob(res.blob);
          setActiveEngineName('Python Vision Engine (DoG + CLAHE + Structure Tensor)');
          setBackendError(null);
          setIsOfflineSample(false);
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          console.error('[KernelLab DevLog] Python Pencil Sketch processing error:', err);
          setPythonBlob(null);
          setBackendError('Pencil Sketch processing is temporarily unavailable. Please try again.');
          setIsOfflineSample(false);
          setActiveEngineName('Python Vision Engine (Error)');
        } finally {
          setIsProcessing(false);
        }
      }, 120);

    } else {
      // Direct client-side mathematical processing for other filters (Oil, Neon, Film, Halftone, Kernel)
      setPythonBlob(null);
      setBackendError(null);
      setIsOfflineSample(false);
      setActiveEngineName('Client-Side WebGL / SIMD Engine');

      processingTimeoutRef.current = setTimeout(() => {
        try {
          const result: ProcessedResult = processImage(
            originalImageData,
            activeFilter,
            parameters
          );
          setProcessedImageData(result.imageData);
          setDurationMs(result.durationMs);
        } catch (err) {
          console.error('Error processing image:', err);
        } finally {
          setIsProcessing(false);
        }
      }, 30);
    }

    return () => {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [originalImageData, activeFilter, parameters, retryTrigger]);

  // Handle uploaded user files - uploaded images take priority
  const handleFileUpload = (file: File) => {
    setIsUserUploaded(true);
    setBackendError(null);
    setIsOfflineSample(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        const maxDim = 1800;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);

        setOriginalImageData(imgData);
        setMetadata({
          name: file.name,
          width: w,
          height: h,
          aspectRatio: w / h,
          sizeBytes: file.size
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetProject = () => {
    setParameters(JSON.parse(JSON.stringify(DEFAULT_PARAMETERS)));
    setIsUserUploaded(false);
    setBackendError(null);
    setIsOfflineSample(false);
    loadSampleArtwork('greenhouse-conservatory', 'victorian_glass_conservatory.png');
  };

  const handleRetryBackend = () => {
    setBackendError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#08070D] text-[#e6e0ea]">
      {/* Top Toolbar */}
      <TopToolbar
        onBackToHome={onBackToHome}
        metadata={metadata}
        durationMs={durationMs}
        isProcessing={isProcessing}
        activeEngineName={activeEngineName}
        onSelectSample={(sampleId) => {
          loadSampleArtwork(sampleId, `${sampleId}.png`);
        }}
        onFileUpload={handleFileUpload}
        onResetProject={handleResetProject}
      />

      {/* Main Studio Middle Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Filter Selector Sidebar */}
        <FilterSidebar
          activeFilter={activeFilter}
          onSelectFilter={(f) => {
            setActiveFilter(f);
            setBackendError(null);
            // Update browser URL hash/pathname cleanly
            if (typeof window !== 'undefined') {
              window.history.replaceState({ view: 'studio', filterId: f }, '', `/studio/${f}`);
            }
          }}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Center Interactive Enlarged Canvas */}
        <ImageCanvas
          originalImageData={originalImageData}
          processedImageData={processedImageData}
          isProcessing={isProcessing}
          comparisonMode={comparisonMode}
          metadata={metadata}
          onFileUpload={handleFileUpload}
          backendError={backendError}
          onRetry={handleRetryBackend}
          isOfflineSample={isOfflineSample}
          activeFilterName={FILTER_NAMES[activeFilter]}
        />

        {/* Right Parameter Adjustment Sidebar */}
        <AdjustmentPanel
          activeFilter={activeFilter}
          parameters={parameters}
          onChangeParameters={setParameters}
          isOpenMobile={isMobileAdjustmentOpen}
          onCloseMobile={() => setIsMobileAdjustmentOpen(false)}
        />
      </div>

      {/* Bottom Toolbar */}
      <BottomToolbar
        comparisonMode={comparisonMode}
        onChangeComparisonMode={setComparisonMode}
        metadata={metadata}
        activeFilterName={FILTER_NAMES[activeFilter]}
        processedImageData={processedImageData}
        pythonBlob={pythonBlob}
        onToggleFilterDrawer={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        onToggleAdjustmentDrawer={() => setIsMobileAdjustmentOpen(!isMobileAdjustmentOpen)}
      />
    </div>
  );
};
