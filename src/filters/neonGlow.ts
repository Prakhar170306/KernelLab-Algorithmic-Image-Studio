/**
 * Filter 3 — Neon Edge Glow
 * 
 * Implements:
 * 1. Grayscale luminance extraction
 * 2. Sobel edge detection (Gx, Gy)
 * 3. Edge magnitude calculation & thresholding
 * 4. Spectral neon color mapping
 * 5. Optical Gaussian bloom glow generation
 * 6. Additive compositing with controllable dark background
 */

import { NeonParameters } from '../engine/types';
import { clamp, fastGaussianBlur, computeSobelEdges } from '../engine/convolution';
import { toGrayscaleArray } from '../engine/colorUtils';

const NEON_PALETTES = {
  violet: { r: 168, g: 85, b: 247 },   // Electric Violet #A855F7
  magenta: { r: 236, g: 56, b: 188 },  // Vibrant Magenta #EC38BC
  cyan: { r: 94, g: 234, b: 212 },     // Accent Cyan #5EEAD4
  emerald: { r: 52, g: 211, b: 153 },  // Laser Emerald #34D399
  amber: { r: 251, g: 191, b: 36 }     // Hyper Amber #FBBF24
};

export function applyNeonGlow(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  params: NeonParameters
): Uint8ClampedArray {
  const totalPixels = width * height;
  const dst = new Uint8ClampedArray(srcData.length);

  // 1. Grayscale
  const gray = toGrayscaleArray(srcData, width, height);

  // 2. Sobel Edge Detection
  const { magnitude } = computeSobelEdges(gray, width, height);

  // 3. Neon Color Mapping for Core Edges
  const baseNeon = NEON_PALETTES[params.neonColor] || NEON_PALETTES.violet;
  const edgeBuffer = new Uint8ClampedArray(srcData.length);

  const threshold = params.edgeThreshold;

  for (let i = 0; i < totalPixels; i++) {
    const mag = magnitude[i];
    const idx = i << 2;

    if (mag > threshold) {
      // Normalize edge strength between threshold and 255
      const strength = Math.min(1.0, (mag - threshold) / (255 - threshold));
      edgeBuffer[idx] = Math.round(baseNeon.r * strength);
      edgeBuffer[idx + 1] = Math.round(baseNeon.g * strength);
      edgeBuffer[idx + 2] = Math.round(baseNeon.b * strength);
      edgeBuffer[idx + 3] = 255;
    } else {
      edgeBuffer[idx] = 0;
      edgeBuffer[idx + 1] = 0;
      edgeBuffer[idx + 2] = 0;
      edgeBuffer[idx + 3] = 255;
    }
  }

  // 4. Optical Gaussian Bloom Glow
  const glowBuffer = fastGaussianBlur(edgeBuffer, width, height, params.glowRadius);

  // 5. Additive Compositing over Darkened Original Background
  const bgDim = 1.0 - params.backgroundDarkness;
  const glowGain = params.glowIntensity;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i << 2;

    // Darkened original background
    const bgR = srcData[idx] * bgDim;
    const bgG = srcData[idx + 1] * bgDim;
    const bgB = srcData[idx + 2] * bgDim;

    // Core crisp edge
    const coreR = edgeBuffer[idx];
    const coreG = edgeBuffer[idx + 1];
    const coreB = edgeBuffer[idx + 2];

    // Ambient optical glow bloom
    const glowR = glowBuffer[idx] * glowGain;
    const glowG = glowBuffer[idx + 1] * glowGain;
    const glowB = glowBuffer[idx + 2] * glowGain;

    // Screen / Additive combine
    const r = bgR + coreR * 1.2 + glowR;
    const g = bgG + coreG * 1.2 + glowG;
    const b = bgB + coreB * 1.2 + glowB;

    dst[idx] = clamp(Math.round(r), 0, 255);
    dst[idx + 1] = clamp(Math.round(g), 0, 255);
    dst[idx + 2] = clamp(Math.round(b), 0, 255);
    dst[idx + 3] = srcData[idx + 3];
  }

  return dst;
}
