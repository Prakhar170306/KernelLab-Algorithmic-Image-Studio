/**
 * Fast mathematical convolution routines using typed arrays and boundary clamping.
 */

export function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

/**
 * 2D 3x3 Spatial Convolution
 */
export function convolve3x3(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][],
  divisor = 1,
  offset = 0
): Uint8ClampedArray {
  const dstData = new Uint8ClampedArray(srcData.length);
  const k00 = kernel[0][0], k01 = kernel[0][1], k02 = kernel[0][2];
  const k10 = kernel[1][0], k11 = kernel[1][1], k12 = kernel[1][2];
  const k20 = kernel[2][0], k21 = kernel[2][1], k22 = kernel[2][2];

  const invDiv = divisor !== 0 ? 1 / divisor : 1;

  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - 1) * width;
    const y1 = y * width;
    const y2 = Math.min(height - 1, y + 1) * width;

    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - 1);
      const x1 = x;
      const x2 = Math.min(width - 1, x + 1);

      const idx00 = (y0 + x0) << 2;
      const idx01 = (y0 + x1) << 2;
      const idx02 = (y0 + x2) << 2;
      const idx10 = (y1 + x0) << 2;
      const idx11 = (y1 + x1) << 2;
      const idx12 = (y1 + x2) << 2;
      const idx20 = (y2 + x0) << 2;
      const idx21 = (y2 + x1) << 2;
      const idx22 = (y2 + x2) << 2;

      const outIdx = (y1 + x1) << 2;

      // Channels R, G, B
      for (let c = 0; c < 3; c++) {
        const sum =
          srcData[idx00 + c] * k00 + srcData[idx01 + c] * k01 + srcData[idx02 + c] * k02 +
          srcData[idx10 + c] * k10 + srcData[idx11 + c] * k11 + srcData[idx12 + c] * k12 +
          srcData[idx20 + c] * k20 + srcData[idx21 + c] * k21 + srcData[idx22 + c] * k22;

        dstData[outIdx + c] = clamp((sum * invDiv) + offset, 0, 255);
      }
      dstData[outIdx + 3] = srcData[outIdx + 3]; // Preserve alpha
    }
  }

  return dstData;
}

/**
 * Separable Gaussian Blur (Horizontal pass followed by Vertical pass)
 * High performance O(2K * N) algorithm with calculated 1D binomial kernel.
 */
export function fastGaussianBlur(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const r = Math.max(1, Math.round(radius));
  const size = r * 2 + 1;
  const kernel = new Float32Array(size);
  const sigma = Math.max(r / 2, 0.8);
  const twoSigmaSq = 2 * sigma * sigma;

  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - r;
    const g = Math.exp(-(x * x) / twoSigmaSq);
    kernel[i] = g;
    sum += g;
  }
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }

  // Intermediate buffer for horizontal pass
  const temp = new Float32Array(width * height * 4);
  const dst = new Uint8ClampedArray(srcData.length);

  // Horizontal Pass
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0;
      for (let k = 0; k < size; k++) {
        const px = clamp(x + k - r, 0, width - 1);
        const idx = (rowOffset + px) << 2;
        const weight = kernel[k];
        rSum += srcData[idx] * weight;
        gSum += srcData[idx + 1] * weight;
        bSum += srcData[idx + 2] * weight;
      }
      const outIdx = (rowOffset + x) << 2;
      temp[outIdx] = rSum;
      temp[outIdx + 1] = gSum;
      temp[outIdx + 2] = bSum;
      temp[outIdx + 3] = srcData[outIdx + 3];
    }
  }

  // Vertical Pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let rSum = 0, gSum = 0, bSum = 0;
      for (let k = 0; k < size; k++) {
        const py = clamp(y + k - r, 0, height - 1);
        const idx = (py * width + x) << 2;
        const weight = kernel[k];
        rSum += temp[idx] * weight;
        gSum += temp[idx + 1] * weight;
        bSum += temp[idx + 2] * weight;
      }
      const outIdx = (y * width + x) << 2;
      dst[outIdx] = clamp(Math.round(rSum), 0, 255);
      dst[outIdx + 1] = clamp(Math.round(gSum), 0, 255);
      dst[outIdx + 2] = clamp(Math.round(bSum), 0, 255);
      dst[outIdx + 3] = temp[outIdx + 3];
    }
  }

  return dst;
}

/**
 * Sobel Edge Operator:
 * Returns both the edge magnitude image and raw gradient vectors.
 */
export function computeSobelEdges(
  grayscaleData: Uint8Array,
  width: number,
  height: number
): { magnitude: Uint8ClampedArray; gxArray: Int16Array; gyArray: Int16Array } {
  const magnitude = new Uint8ClampedArray(width * height);
  const gxArray = new Int16Array(width * height);
  const gyArray = new Int16Array(width * height);

  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - 1) * width;
    const y1 = y * width;
    const y2 = Math.min(height - 1, y + 1) * width;

    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - 1);
      const x2 = Math.min(width - 1, x + 1);

      // Sobel horizontal gradient Gx
      // [-1  0  1]
      // [-2  0  2]
      // [-1  0  1]
      const gx =
        -grayscaleData[y0 + x0] + grayscaleData[y0 + x2] +
        -2 * grayscaleData[y1 + x0] + 2 * grayscaleData[y1 + x2] +
        -grayscaleData[y2 + x0] + grayscaleData[y2 + x2];

      // Sobel vertical gradient Gy
      // [-1 -2 -1]
      // [ 0  0  0]
      // [ 1  2  1]
      const gy =
        -grayscaleData[y0 + x0] - 2 * grayscaleData[y0 + x] - grayscaleData[y0 + x2] +
        grayscaleData[y2 + x0] + 2 * grayscaleData[y2 + x] + grayscaleData[y2 + x2];

      const mag = Math.min(255, Math.round(Math.sqrt(gx * gx + gy * gy)));
      const idx = y1 + x;
      magnitude[idx] = mag;
      gxArray[idx] = gx;
      gyArray[idx] = gy;
    }
  }

  return { magnitude, gxArray, gyArray };
}
