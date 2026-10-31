/**
 * Filter 2 — Authentic Oil Painting via Kuwahara Filtering
 * 
 * Uses quadrant variance minimization to create crisp, edge-preserving
 * painterly strokes reminiscent of classical impasto canvas painting.
 */

import { OilParameters } from '../engine/types';
import { clamp } from '../engine/convolution';
import { rgbToHsl, hslToRgb } from '../engine/colorUtils';

export function applyOilPainting(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  params: OilParameters
): Uint8ClampedArray {
  const r = Math.max(1, Math.min(5, Math.round(params.brushRadius)));
  const dst = new Uint8ClampedArray(srcData.length);
  const n = (r + 1) * (r + 1); // Number of pixels in each quadrant
  const invN = 1 / n;

  for (let y = 0; y < height; y++) {
    const yMin = Math.max(0, y - r);
    const yMax = Math.min(height - 1, y + r);

    for (let x = 0; x < width; x++) {
      const xMin = Math.max(0, x - r);
      const xMax = Math.min(width - 1, x + r);

      // Define 4 quadrant bounds:
      // Q1: [x-r, x] x [y-r, y]
      // Q2: [x, x+r] x [y-r, y]
      // Q3: [x-r, x] x [y, y+r]
      // Q4: [x, x+r] x [y, y+r]
      const quadrants = [
        { x0: xMin, x1: x, y0: yMin, y1: y },
        { x0: x, x1: xMax, y0: yMin, y1: y },
        { x0: xMin, x1: x, y0: y, y1: yMax },
        { x0: x, x1: xMax, y0: y, y1: yMax }
      ];

      let minVariance = Infinity;
      let bestMeanR = 0;
      let bestMeanG = 0;
      let bestMeanB = 0;

      for (let q = 0; q < 4; q++) {
        const quad = quadrants[q];
        let sumR = 0, sumG = 0, sumB = 0;
        let sumSqR = 0, sumSqG = 0, sumSqB = 0;
        let count = 0;

        for (let py = quad.y0; py <= quad.y1; py++) {
          const rowOff = py * width;
          for (let px = quad.x0; px <= quad.x1; px++) {
            const idx = (rowOff + px) << 2;
            const cr = srcData[idx];
            const cg = srcData[idx + 1];
            const cb = srcData[idx + 2];

            sumR += cr; sumG += cg; sumB += cb;
            sumSqR += cr * cr; sumSqG += cg * cg; sumSqB += cb * cb;
            count++;
          }
        }

        if (count === 0) continue;
        const invC = 1 / count;
        const mR = sumR * invC;
        const mG = sumG * invC;
        const mB = sumB * invC;

        // Total variance across RGB channels
        const varR = (sumSqR * invC) - (mR * mR);
        const varG = (sumSqG * invC) - (mG * mG);
        const varB = (sumSqB * invC) - (mB * mB);
        const totalVariance = varR + varG + varB;

        if (totalVariance < minVariance) {
          minVariance = totalVariance;
          bestMeanR = mR;
          bestMeanG = mG;
          bestMeanB = mB;
        }
      }

      const outIdx = (y * width + x) << 2;
      let finalR = bestMeanR;
      let finalG = bestMeanG;
      let finalB = bestMeanB;

      // Apply smoothing blend with original pixel
      if (params.smoothing < 1.0) {
        const s = params.smoothing;
        finalR = finalR * s + srcData[outIdx] * (1 - s);
        finalG = finalG * s + srcData[outIdx + 1] * (1 - s);
        finalB = finalB * s + srcData[outIdx + 2] * (1 - s);
      }

      // Painting intensity / stroke contrast boost
      if (params.paintingIntensity !== 1.0) {
        const factor = params.paintingIntensity;
        finalR = ((finalR - 128) * factor) + 128;
        finalG = ((finalG - 128) * factor) + 128;
        finalB = ((finalB - 128) * factor) + 128;
      }

      let rVal = clamp(Math.round(finalR), 0, 255);
      let gVal = clamp(Math.round(finalG), 0, 255);
      let bVal = clamp(Math.round(finalB), 0, 255);

      // Color Vibrance boost for authentic rich oil pigments
      if (params.vibrance !== 1.0) {
        const [h, s, l] = rgbToHsl(rVal, gVal, bVal);
        const newS = clamp(s * params.vibrance, 0, 1);
        [rVal, gVal, bVal] = hslToRgb(h, newS, l);
      }

      dst[outIdx] = rVal;
      dst[outIdx + 1] = gVal;
      dst[outIdx + 2] = bVal;
      dst[outIdx + 3] = srcData[outIdx + 3];
    }
  }

  return dst;
}
