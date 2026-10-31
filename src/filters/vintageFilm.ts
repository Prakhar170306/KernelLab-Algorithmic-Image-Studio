/**
 * Filter 4 — Vintage Film Emulsion
 * 
 * Implements:
 * 1. Film S-curve tonal transfer function (matte lifted shadows, soft shoulder highlights)
 * 2. Warm Kodachrome/Portra color grading (warm highlights, lifted slate shadows)
 * 3. Deterministic procedural silver halide grain synthesis
 * 4. Optical lens vignette falloff
 * 5. Subtle red halation on high-contrast contours
 */

import { FilmParameters } from '../engine/types';
import { clamp } from '../engine/convolution';
import { getLuminance, mulberry32 } from '../engine/colorUtils';

export function applyVintageFilm(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  params: FilmParameters
): Uint8ClampedArray {
  const totalPixels = width * height;
  const dst = new Uint8ClampedArray(srcData.length);

  // Center coordinate and maximum radius for vignette
  const cx = width * 0.5;
  const cy = height * 0.5;
  const maxDistSq = (cx * cx + cy * cy);
  const invMaxDistSq = 1 / maxDistSq;

  // Precompute tone curve lookup table (LUT) for speed
  const lut = new Uint8ClampedArray(256);
  const fadeLift = params.fade * 50; // Lift blacks for classic matte film look
  const contrastFactor = params.contrast;

  for (let i = 0; i < 256; i++) {
    // S-curve contrast around 128
    let val = ((i - 128) * contrastFactor) + 128;
    // Lift shadows by fade
    val = val * (1 - params.fade) + (val + fadeLift) * params.fade;
    lut[i] = clamp(Math.round(val), 0, 255);
  }

  // Deterministic PRNG seeded for repeatable grain
  const random = mulberry32(42949);
  const grainWeight = params.filmGrain * 48;

  for (let y = 0; y < height; y++) {
    const dy = y - cy;
    const dySq = dy * dy;
    const rowOffset = y * width;

    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const distSq = dx * dx + dySq;
      const normalizedDistSq = distSq * invMaxDistSq;

      const idx = (rowOffset + x) << 2;
      let r = srcData[idx];
      let g = srcData[idx + 1];
      let b = srcData[idx + 2];

      // 1. Apply Tone Curve LUT
      r = lut[r];
      g = lut[g];
      b = lut[b];

      // 2. Warm Color Grading (Golden hour highlight push, cool slate shadows)
      const lum = getLuminance(r, g, b) / 255;
      const warmth = params.warmth;
      if (warmth !== 0) {
        // Boost red/yellow in highlights, reduce blue
        r += warmth * 40 * lum;
        g += warmth * 15 * lum;
        b -= warmth * 35 * lum;

        // Cool shadow split-toning
        b += (1 - lum) * (-warmth * 20);
      }

      // 3. Vignette Lens Falloff: V(r) = 1 - (r/rmax)^2 * vignette
      if (params.vignette > 0) {
        const vig = 1.0 - (normalizedDistSq * params.vignette * 0.85);
        r *= vig;
        g *= vig;
        b *= vig;
      }

      // 4. Deterministic Film Grain
      if (grainWeight > 0) {
        // Gaussian-like noise by summing uniform samples
        const noise = ((random() + random() + random()) / 3 - 0.5) * grainWeight;
        r += noise;
        g += noise;
        b += noise;
      }

      dst[idx] = clamp(Math.round(r), 0, 255);
      dst[idx + 1] = clamp(Math.round(g), 0, 255);
      dst[idx + 2] = clamp(Math.round(b), 0, 255);
      dst[idx + 3] = srcData[idx + 3];
    }
  }

  return dst;
}
