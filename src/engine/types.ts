export type FilterType = 'sketch' | 'oil' | 'neon' | 'film' | 'halftone' | 'kernel';

export interface SketchParameters {
  line_strength: number;   // 0.1 to 2.5, default 0.9
  hatch_strength: number;  // 0.0 to 2.0, default 0.85
  tone_strength: number;   // 0.0 to 2.0, default 0.65
  grain_strength: number;  // 0.0 to 1.0, default 0.16
  paper_tone: number;      // 0.0 to 0.4, default 0.08
  max_dim: number;         // 600 to 3600, default 1800
  seed: number;            // default 42
}

export interface OilParameters {
  brushRadius: number;       // 1 to 5, default 2 (Kuwahara window radius)
  paintingIntensity: number; // 0.5 to 2.0, default 1.1
  smoothing: number;         // 0.1 to 1.0, default 0.7
  vibrance: number;          // 0.5 to 2.0, default 1.25
}

export interface NeonParameters {
  edgeThreshold: number;      // 10 to 120, default 45
  glowRadius: number;         // 1 to 8, default 4
  glowIntensity: number;      // 0.5 to 3.0, default 1.6
  neonColor: 'violet' | 'magenta' | 'cyan' | 'emerald' | 'amber'; // default violet
  backgroundDarkness: number; // 0.2 to 1.0, default 0.9
}

export interface FilmParameters {
  filmGrain: number;    // 0.0 to 1.0, default 0.45
  warmth: number;       // -0.5 to 0.5, default 0.18
  fade: number;         // 0.0 to 0.6, default 0.15
  contrast: number;     // 0.7 to 1.8, default 1.15
  vignette: number;     // 0.0 to 1.0, default 0.55
}

export interface HalftoneParameters {
  dotSize: number;       // 3 to 14, default 6
  gridDensity: number;   // 1 to 4, default 2
  angle: number;         // 0 to 90, default 45
  contrast: number;      // 0.6 to 2.0, default 1.3
  colorMode: 'cyberpunk' | 'cyan-magenta' | 'monochrome' | 'spectral'; // default cyberpunk
}

export interface KernelParameters {
  matrix: number[][];    // 3x3 array
  divisor: number;
  offset: number;
  normalize: boolean;
}

export type AllFilterParameters = {
  sketch: SketchParameters;
  oil: OilParameters;
  neon: NeonParameters;
  film: FilmParameters;
  halftone: HalftoneParameters;
  kernel: KernelParameters;
};

export interface ProcessedResult {
  imageData: ImageData;
  durationMs: number;
}

export interface ImageMetadata {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  sizeBytes?: number;
}

export type ComparisonMode = 'split' | 'side-by-side' | 'original-hold';
export type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';
