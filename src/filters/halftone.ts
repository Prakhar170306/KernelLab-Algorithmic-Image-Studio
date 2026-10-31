/**
 * Filter 5 — Cyberpunk Halftone Rasterizer
 * 
 * Generates true mathematical geometric dot grids based on rotated coordinates
 * and sampled local luminance, styled in cyberpunk spectral palettes.
 */

import { HalftoneParameters } from '../engine/types';
import { clamp } from '../engine/convolution';
import { getLuminance, adjustContrast } from '../engine/colorUtils';

export function applyCyberpunkHalftone(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  params: HalftoneParameters
): Uint8ClampedArray {
  const dst = new Uint8ClampedArray(srcData.length);
  const totalPixels = width * height;

  // Background and Palette Definitions
  const bg = { r: 8, g: 7, b: 13 }; // Obsidian base
  const magenta = { r: 236, g: 56, b: 188 }; // #EC38BC
  const violet = { r: 168, g: 85, b: 247 };  // #A855F7
  const cyan = { r: 94, g: 234, b: 212 };    // #5EEAD4

  // Angle transformation
  const rad = (params.angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const cellSize = Math.max(3, params.dotSize * (5 - params.gridDensity));
  const maxDotRadius = cellSize * 0.72;

  // Pre-extract grayscale array
  const gray = new Uint8Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i << 2;
    const lum = getLuminance(srcData[idx], srcData[idx + 1], srcData[idx + 2]);
    gray[i] = adjustContrast(lum, params.contrast);
  }

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      // 1. Transform coordinate to rotated halftone grid space
      const u = x * cos - y * sin;
      const v = x * sin + y * cos;

      // 2. Identify grid cell center in rotated space
      const cellU = Math.floor(u / cellSize) * cellSize + cellSize * 0.5;
      const cellV = Math.floor(v / cellSize) * cellSize + cellSize * 0.5;

      // Distance from pixel to grid cell center
      const du = u - cellU;
      const dv = v - cellV;
      const dist = Math.sqrt(du * du + dv * dv);

      // 3. Map cell center back to original image coordinates to sample source luminance
      const sampleX = clamp(Math.round(cellU * cos + cellV * sin), 0, width - 1);
      const sampleY = clamp(Math.round(-cellU * sin + cellV * cos), 0, height - 1);
      const sampleIdx = sampleY * width + sampleX;
      const sampleLum = gray[sampleIdx];

      // Dot radius: inverted (darker pixels produce larger dots in halftone)
      // For glowing cyberpunk mode, bright regions emit glowing larger dots
      const isCyberpunk = params.colorMode === 'cyberpunk' || params.colorMode === 'cyan-magenta';
      const lumNorm = isCyberpunk ? sampleLum / 255 : (255 - sampleLum) / 255;
      const dotRadius = lumNorm * maxDotRadius;

      const outIdx = (rowOffset + x) << 2;

      // Smoothstep anti-aliasing around dot boundary
      const edgeSmooth = 1.0;
      let coverage = 0;
      if (dist <= dotRadius - edgeSmooth) {
        coverage = 1.0;
      } else if (dist <= dotRadius + edgeSmooth) {
        coverage = (dotRadius + edgeSmooth - dist) / (2 * edgeSmooth);
      }

      if (coverage > 0) {
        let dotR = 255, dotG = 255, dotB = 255;

        if (params.colorMode === 'cyberpunk') {
          // Three-tier spectral mapping: Cyan highlights, Magenta midtones, Violet deep
          if (sampleLum > 180) {
            dotR = cyan.r; dotG = cyan.g; dotB = cyan.b;
          } else if (sampleLum > 90) {
            dotR = magenta.r; dotG = magenta.g; dotB = magenta.b;
          } else {
            dotR = violet.r; dotG = violet.g; dotB = violet.b;
          }
        } else if (params.colorMode === 'cyan-magenta') {
          // Duotone gradient
          const t = sampleLum / 255;
          dotR = Math.round(cyan.r * t + magenta.r * (1 - t));
          dotG = Math.round(cyan.g * t + magenta.g * (1 - t));
          dotB = Math.round(cyan.b * t + magenta.b * (1 - t));
        } else if (params.colorMode === 'spectral') {
          // Sample direct original RGB at cell center with saturation boost
          const srcIdx = (sampleY * width + sampleX) << 2;
          dotR = srcData[srcIdx];
          dotG = srcData[srcIdx + 1];
          dotB = srcData[srcIdx + 2];
        } else {
          // Monochrome classic halftone
          const val = Math.round(sampleLum);
          dotR = val; dotG = val; dotB = val;
        }

        // Composite over obsidian background
        dst[outIdx] = Math.round(bg.r * (1 - coverage) + dotR * coverage);
        dst[outIdx + 1] = Math.round(bg.g * (1 - coverage) + dotG * coverage);
        dst[outIdx + 2] = Math.round(bg.b * (1 - coverage) + dotB * coverage);
      } else {
        dst[outIdx] = bg.r;
        dst[outIdx + 1] = bg.g;
        dst[outIdx + 2] = bg.b;
      }

      dst[outIdx + 3] = srcData[outIdx + 3];
    }
  }

  return dst;
}
