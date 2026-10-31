/**
 * Pixel color manipulation and mathematical blending utilities.
 */

import { clamp } from './convolution';

/**
 * Standard Rec. 709 Luminance: Y = 0.2126R + 0.7152G + 0.0722B
 */
export function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converts ImageData to a single-channel 8-bit luminance array
 */
export function toGrayscaleArray(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const gray = new Uint8Array(width * height);
  const total = width * height;
  for (let i = 0; i < total; i++) {
    const idx = i << 2;
    gray[i] = Math.round(0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2]);
  }
  return gray;
}

/**
 * Color Dodge Blend Mode:
 * Result = (Image / (255 - Blend)) * 255
 * Key formula for Fine-Art Pencil Sketch effect.
 */
export function colorDodge(base: number, blend: number): number {
  if (blend >= 255) return 255;
  const res = (base << 8) / (255 - blend);
  return res > 255 ? 255 : res;
}

/**
 * Contrast curve adjustment around midpoint 128
 */
export function adjustContrast(val: number, factor: number): number {
  return clamp(Math.round(((val - 128) * factor) + 128), 0, 255);
}

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 * Ensures film grain looks authentic and deterministic for identical settings.
 */
export function mulberry32(seed: number) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * RGB to HSL and back for vibrance and saturation
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
