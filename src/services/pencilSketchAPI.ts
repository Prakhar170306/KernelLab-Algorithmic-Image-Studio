/**
 * Service client communicating with the Python Computer Vision Backend.
 * Sends raw image buffers and filter parameters to /api/filters/pencil-sketch.
 */

export interface PythonSketchParameters {
  line_strength: number;   // default 0.9
  hatch_strength: number;  // default 0.85
  tone_strength: number;   // default 0.65
  grain_strength: number;  // default 0.16
  paper_tone: number;      // default 0.08
  max_dim: number;         // default 1800
  seed: number;            // default 42
}

export const DEFAULT_PYTHON_SKETCH_PARAMS: PythonSketchParameters = {
  line_strength: 0.9,
  hatch_strength: 0.85,
  tone_strength: 0.65,
  grain_strength: 0.16,
  paper_tone: 0.08,
  max_dim: 1800,
  seed: 42
};

export interface SketchAPIResponse {
  imageData: ImageData;
  blob: Blob;
  durationMs: number;
  engine: 'python-backend' | 'client-adapter-fallback';
  isServerActive: boolean;
  serverMessage?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/**
 * Checks if the Python Vision Engine backend is alive and reachable.
 */
export async function checkBackendHealth(): Promise<{ isHealthy: boolean; details?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      return { isHealthy: true, details: data };
    }
  } catch (err) {
    // Backend health probe failed or timed out
  }
  return { isHealthy: false };
}

/**
 * Executes photo_to_fine_pencil_sketch via the Python FastAPI endpoint.
 */
export async function processPencilSketchWithPython(
  imageSource: Blob | File | ImageData,
  params: PythonSketchParameters,
  signal?: AbortSignal
): Promise<SketchAPIResponse> {
  const startTime = performance.now();

  // Convert ImageData to Blob if needed
  let imageBlob: Blob;
  if (imageSource instanceof Blob) {
    imageBlob = imageSource;
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = imageSource.width;
    canvas.height = imageSource.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.putImageData(imageSource, 0, 0);

    imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to encode image blob'))), 'image/png');
    });
  }

  // Construct multipart/form-data
  const formData = new FormData();
  formData.append('file', imageBlob, 'source_image.png');
  formData.append('line_strength', params.line_strength.toString());
  formData.append('hatch_strength', params.hatch_strength.toString());
  formData.append('tone_strength', params.tone_strength.toString());
  formData.append('grain_strength', params.grain_strength.toString());
  formData.append('paper_tone', params.paper_tone.toString());
  formData.append('max_dim', params.max_dim.toString());
  formData.append('seed', params.seed.toString());

  try {
    const response = await fetch(`${API_BASE_URL}/api/filters/pencil-sketch`, {
      method: 'POST',
      body: formData,
      signal
    });

    if (!response.ok) {
      let technicalDetails = '';
      try {
        const errorJson = await response.json();
        technicalDetails = JSON.stringify(errorJson);
        console.error('[KernelLab DevLog] Python Pencil Sketch API failed with status ' + response.status, errorJson);
      } catch {
        technicalDetails = await response.text();
        console.error('[KernelLab DevLog] Python Pencil Sketch API failed with status ' + response.status, technicalDetails);
      }
      throw new Error('Pencil Sketch processing is temporarily unavailable. Please try again.');
    }

    const outputBlob = await response.blob();
    const durationMs = Math.round((performance.now() - startTime) * 10) / 10;

    // Decode returned PNG into ImageData
    const imgBitmap = await createImageBitmap(outputBlob);
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imgBitmap.width;
    resultCanvas.height = imgBitmap.height;
    const resCtx = resultCanvas.getContext('2d');
    if (!resCtx) throw new Error('Cannot obtain 2D context for result');
    resCtx.drawImage(imgBitmap, 0, 0);
    const resultImageData = resCtx.getImageData(0, 0, imgBitmap.width, imgBitmap.height);

    return {
      imageData: resultImageData,
      blob: outputBlob,
      durationMs,
      engine: 'python-backend',
      isServerActive: true,
      serverMessage: response.headers.get('X-KernelLab-Engine') || 'Python-OpenCV-CLAHE-DoG'
    };
  } catch (err: any) {
    if (signal?.aborted) {
      throw err; // Re-throw aborts
    }
    throw err;
  }
}
