/**
 * Filter 1 — Fine-Art Pencil Sketch
 * 
 * Implements a 6-stage mathematical pencil sketch pipeline:
 * 1. Grayscale luminance extraction with contrast tuning
 * 2. Grayscale bit inversion: Inv(I) = 255 - I
 * 3. Separable Gaussian blur on the inverted buffer
 * 4. Color Dodge blending: Dodged = (Grayscale / (255 - BlurredInv)) * 255
 * 5. Edge enhancement with fine Laplacian kernel
 * 6. Subtle graphite shading and texture depth
 * 
 * ARCHITECTURAL ADAPTER:
 * Designed with IPencilSketchEngine interface so custom proprietary algorithms
 * can be plugged in directly with zero UI modifications.
 */

import { SketchParameters } from '../engine/types';
import { clamp, fastGaussianBlur } from '../engine/convolution';
import { colorDodge, adjustContrast, getLuminance, mulberry32 } from '../engine/colorUtils';

export interface IPencilSketchEngine {
  readonly id: string;
  readonly name: string;
  process(
    srcData: Uint8ClampedArray,
    width: number,
    height: number,
    params: SketchParameters
  ): Uint8ClampedArray;
}

/**
 * Default High-Precision Mathematical Pencil Sketch Engine
 */
export class MathematicalPencilSketchEngine implements IPencilSketchEngine {
  readonly id = 'mathematical-pencil-sketch-v1';
  readonly name = 'KernelLab Precision Pencil Engine';

  process(
    srcData: Uint8ClampedArray,
    width: number,
    height: number,
    params: SketchParameters
  ): Uint8ClampedArray {
    const totalPixels = width * height;
    const output = new Uint8ClampedArray(srcData.length);

    // 1. Grayscale conversion with adaptive contrast normalization
    const gray = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      const idx = i << 2;
      const lum = getLuminance(srcData[idx], srcData[idx + 1], srcData[idx + 2]);
      // Adaptive CLAHE-like contrast curve
      gray[i] = adjustContrast(lum, 1.25);
    }

    // 2. Invert grayscale for multi-scale color dodge shading
    const invRgba = new Uint8ClampedArray(srcData.length);
    for (let i = 0; i < totalPixels; i++) {
      const invVal = 255 - gray[i];
      const idx = i << 2;
      invRgba[idx] = invVal;
      invRgba[idx + 1] = invVal;
      invRgba[idx + 2] = invVal;
      invRgba[idx + 3] = 255;
    }

    // 3. Multi-scale blur passes (simulating multi-octave DoG & dodge)
    const blurredSmall = fastGaussianBlur(invRgba, width, height, 3);
    const blurredLarge = fastGaussianBlur(invRgba, width, height, 10);

    // 4. Color Dodge shading modulated by tone_strength
    const shaded = new Float32Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      const idx = i << 2;
      const g = gray[i];
      const bSmall = blurredSmall[idx];
      const bLarge = blurredLarge[idx];

      const dodge1 = colorDodge(g, bSmall);
      const dodge2 = colorDodge(g, bLarge);
      const combinedDodge = (dodge1 * 0.6 + dodge2 * 0.4) / 255.0;

      // Modulate with tone_strength
      shaded[i] = 1.0 - (1.0 - combinedDodge) * params.tone_strength;
    }

    // 5. Difference-of-Gaussians (DoG) Line Contours modulated by line_strength
    const lineArt = new Float32Array(totalPixels);
    for (let y = 0; y < height; y++) {
      const y0 = Math.max(0, y - 1) * width;
      const y1 = y * width;
      const y2 = Math.min(height - 1, y + 1) * width;

      for (let x = 0; x < width; x++) {
        const x0 = Math.max(0, x - 1);
        const x2 = Math.min(width - 1, x + 1);
        const centerIdx = y1 + x;

        // Laplacian second-derivative response
        const gVal = gray[centerIdx];
        const laplacian = Math.abs(
          4 * gVal - gray[y0 + x] - gray[y2 + x] - gray[y1 + x0] - gray[y1 + x2]
        ) / 255.0;

        // Soft sigmoid-like contour darkening
        const lineVal = 1.0 - Math.min(1.0, laplacian * 2.8 * params.line_strength);
        lineArt[centerIdx] = lineVal;
      }
    }

    // 6. Directional cross-hatching texture modulated by hatch_strength
    const hatching = new Float32Array(totalPixels);
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const idx = row + x;
        const g = gray[idx] / 255.0;
        // 45-degree and 135-degree hatching in shadowed regions
        const pattern1 = (x + y) % 6 === 0 ? 0.35 : 0.0;
        const pattern2 = (x - y + 10000) % 7 === 0 ? 0.35 : 0.0;
        const shadowMask = Math.max(0, 1.0 - g);
        const hatchAmount = (pattern1 + pattern2) * shadowMask * params.hatch_strength * 0.45;
        hatching[idx] = 1.0 - hatchAmount;
      }
    }

    // 7. Deterministic procedural graphite paper grain (Mulberry32 PRNG)
    const random = mulberry32(params.seed || 42);
    const grainFactor = params.grain_strength * 0.25;

    // 8. Adaptive Graphite Composition & Paper Tone
    const paperBase = 1.0 - params.paper_tone;

    for (let i = 0; i < totalPixels; i++) {
      const noise = ((random() + random()) - 1.0) * grainFactor;
      const grain = 1.0 + noise;

      // Multiply line_art * tone_shading * hatching * grain
      const graphite = lineArt[i] * shaded[i] * hatching[i] * grain;

      // Apply warm paper tone base
      const finalVal = clamp(Math.round((graphite * paperBase + params.paper_tone) * 255.0), 0, 255);

      const outIdx = i << 2;
      output[outIdx] = finalVal;
      output[outIdx + 1] = finalVal;
      output[outIdx + 2] = finalVal;
      output[outIdx + 3] = srcData[outIdx + 3];
    }

    return output;
  }
}

/**
 * Adapter holder: easily swap in any custom pencil sketch engine
 */
let activePencilEngine: IPencilSketchEngine = new MathematicalPencilSketchEngine();

export function setPencilSketchEngine(engine: IPencilSketchEngine) {
  activePencilEngine = engine;
}

export function getPencilSketchEngine(): IPencilSketchEngine {
  return activePencilEngine;
}

export function applyPencilSketch(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  params: SketchParameters
): Uint8ClampedArray {
  return activePencilEngine.process(srcData, width, height, params);
}
