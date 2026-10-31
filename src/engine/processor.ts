/**
 * Core image processing coordinator.
 * Dispatches image buffers to real mathematical algorithms and measures execution timing.
 */

import { FilterType, AllFilterParameters, ProcessedResult } from './types';
import { applyPencilSketch } from '../filters/pencilSketch';
import { applyOilPainting } from '../filters/oilPainting';
import { applyNeonGlow } from '../filters/neonGlow';
import { applyVintageFilm } from '../filters/vintageFilm';
import { applyCyberpunkHalftone } from '../filters/halftone';
import { applyCustomKernel } from '../filters/customKernel';

export function processImage(
  sourceImageData: ImageData,
  filterType: FilterType,
  allParams: AllFilterParameters
): ProcessedResult {
  const startTime = performance.now();
  const width = sourceImageData.width;
  const height = sourceImageData.height;
  const srcBuffer = sourceImageData.data;

  let outputBuffer: Uint8ClampedArray;

  switch (filterType) {
    case 'sketch':
      outputBuffer = applyPencilSketch(srcBuffer, width, height, allParams.sketch);
      break;

    case 'oil':
      outputBuffer = applyOilPainting(srcBuffer, width, height, allParams.oil);
      break;

    case 'neon':
      outputBuffer = applyNeonGlow(srcBuffer, width, height, allParams.neon);
      break;

    case 'film':
      outputBuffer = applyVintageFilm(srcBuffer, width, height, allParams.film);
      break;

    case 'halftone':
      outputBuffer = applyCyberpunkHalftone(srcBuffer, width, height, allParams.halftone);
      break;

    case 'kernel':
      outputBuffer = applyCustomKernel(srcBuffer, width, height, allParams.kernel);
      break;

    default:
      outputBuffer = new Uint8ClampedArray(srcBuffer);
      break;
  }

  const durationMs = Math.round((performance.now() - startTime) * 10) / 10;
  const outputImageData = new ImageData(width, height);
  outputImageData.data.set(outputBuffer);

  return {
    imageData: outputImageData,
    durationMs
  };
}

export const DEFAULT_PARAMETERS: AllFilterParameters = {
  sketch: {
    line_strength: 0.9,
    hatch_strength: 0.85,
    tone_strength: 0.65,
    grain_strength: 0.16,
    paper_tone: 0.08,
    max_dim: 1800,
    seed: 42
  },
  oil: {
    brushRadius: 2,
    paintingIntensity: 1.15,
    smoothing: 0.75,
    vibrance: 1.3
  },
  neon: {
    edgeThreshold: 45,
    glowRadius: 4,
    glowIntensity: 1.7,
    neonColor: 'violet',
    backgroundDarkness: 0.88
  },
  film: {
    filmGrain: 0.45,
    warmth: 0.18,
    fade: 0.15,
    contrast: 1.15,
    vignette: 0.55
  },
  halftone: {
    dotSize: 6,
    gridDensity: 2,
    angle: 45,
    contrast: 1.3,
    colorMode: 'cyberpunk'
  },
  kernel: {
    matrix: [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ],
    divisor: 1,
    offset: 0,
    normalize: false
  }
};
