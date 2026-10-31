/**
 * Section 7 — Custom 3x3 Convolution Kernel Engine & Presets
 */

import { KernelParameters } from '../engine/types';
import { convolve3x3 } from '../engine/convolution';

export interface KernelPreset {
  id: string;
  name: string;
  description: string;
  matrix: number[][];
  divisor: number;
  offset: number;
}

export const KERNEL_PRESETS: KernelPreset[] = [
  {
    id: 'identity',
    name: 'Identity',
    description: 'Zero transformation pass-through preserving exact pixel fidelity.',
    matrix: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ],
    divisor: 1,
    offset: 0
  },
  {
    id: 'gaussian',
    name: 'Gaussian Blur',
    description: '3x3 binomial spatial low-pass filter smoothing high frequency noise.',
    matrix: [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ],
    divisor: 16,
    offset: 0
  },
  {
    id: 'box-blur',
    name: 'Box Blur',
    description: 'Uniform area averaging kernel producing soft optical defocusing.',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    divisor: 9,
    offset: 0
  },
  {
    id: 'sharpen',
    name: 'Sharpen',
    description: 'Unsharp masking kernel amplifying gradient boundaries and acutance.',
    matrix: [
      [ 0, -1,  0],
      [-1,  5, -1],
      [ 0, -1,  0]
    ],
    divisor: 1,
    offset: 0
  },
  {
    id: 'edge-detect',
    name: 'Edge Detection',
    description: 'Laplacian second-derivative operator highlighting high contrast frontiers.',
    matrix: [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ],
    divisor: 1,
    offset: 0
  },
  {
    id: 'emboss',
    name: 'Emboss (Bas-Relief)',
    description: 'Directional relief kernel creating 3D tactile stone and metal contours.',
    matrix: [
      [-2, -1,  0],
      [-1,  1,  1],
      [ 0,  1,  2]
    ],
    divisor: 1,
    offset: 128
  },
  {
    id: 'ridge-horizontal',
    name: 'Horizontal Sobel',
    description: 'First derivative directional operator isolating horizontal gradients.',
    matrix: [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1]
    ],
    divisor: 1,
    offset: 128
  }
];

export function computeKernelSum(matrix: number[][]): number {
  let sum = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      sum += matrix[r][c] || 0;
    }
  }
  return sum;
}

export function applyCustomKernel(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  params: KernelParameters
): Uint8ClampedArray {
  const sum = computeKernelSum(params.matrix);
  let effectiveDivisor = params.divisor;

  if (params.normalize) {
    effectiveDivisor = sum !== 0 ? sum : 1;
  }

  return convolve3x3(
    srcData,
    width,
    height,
    params.matrix,
    effectiveDivisor,
    params.offset
  );
}
