# KernelLab — Algorithmic Precision Studio

[![Live Application](https://img.shields.io/badge/Live%20Demo-kernellab.ai.studio-00E5FF?style=for-the-badge&logo=google-chrome&logoColor=black)](https://kernellab.ai.studio/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)

**Live Application:** [https://kernellab.ai.studio/](https://kernellab.ai.studio/)

**KernelLab** is a high-precision computational image processing studio and visual workbench. It combines ultra-fast, browser-native 2D convolution kernels powered by HTML5 Canvas TypedArrays with an authoritative, multi-stage Python computer vision pipeline.

---

## 🌟 Key Features

### 1. Authoritative Algorithmic Filter Suite
* **Fine-Art Graphite Pencil Sketch** *(Python OpenCV Backend)*: 
  A 12-stage classical computer vision pipeline featuring CLAHE exposure normalization, Difference-of-Gaussians (DoG) line extraction, sigmoid contour thresholding, multi-scale color dodge/burn tonal shading, structure-tensor stroke orientation analysis with directional hatching, GrabCut foreground isolation, and procedural cotton paper grain synthesis.
* **Oil Painting** *(Browser-Native)*:
  Classical Kuwahara non-linear filter with quadrant variance minimization ($\min \text{Var}_Q \to \text{MeanColor}(Q)$) preserving crisp feature boundaries while synthesizing painterly, impasto brushstroke aesthetics.
* **Neon Edge Glow** *(Browser-Native)*:
  Dual-axis Sobel spatial first derivatives ($|G| = \sqrt{G_x^2 + G_y^2}$), threshold gating, continuous spectral color mapping, and multi-pass Gaussian bloom convolution.
* **Vintage Film** *(Browser-Native)*:
  Film-emulsion tone mapping LUT with golden-hour color temperature shifts, shadow toe compression, radial vignette falloff, and deterministic Mulberry32 halide grain synthesis.
* **Cyberpunk Halftone** *(Browser-Native)*:
  Rotated 2D dot-screen rasterization with continuous luminance sampling, geometric density scaling, and custom duotone/tri-color spectral palettes.
* **Custom 3×3 Matrix Convolution Playground** *(Browser-Native)*:
  Live 9-cell spatial kernel matrix editor with real-time divisor normalization, offset control, and instant presets (Laplacian Edge Detection, Sobel Horizontal/Vertical, Ridge Detection, Gaussian Smoothing, Sharpen, Emboss, Box Blur).

### 2. Interactive Studio Light Table
* **Real-Time Interactive Adjustments**: Fine-tune contrast, exposure, line weight, stroke density, tone strength, grain intensity, and paper texture on the fly.
* **Interactive Split Comparison Slider**: Compare unprocessed original photography side-by-side with transformed filter results.
* **Sample Gallery & Custom File Ingestion**: Ingest high-resolution images via drag-and-drop or select from curated sample benchmarks.
* **High-Fidelity Canvas Export**: Export processed results directly to uncompressed PNG format.

### 3. Privacy-First & Zero AI Paywalls
* **Zero Generative AI / No Paywalls**: All outputs are synthesized purely through deterministic mathematical computer vision algorithms.
* **Strict Temporary Lifecycle**: Backend image transformations occur in ephemeral, UUID-isolated memory spaces with guaranteed immediate disk cleanup (`finally` block lifecycle).
* **Client-Side Processing**: Client filters run 100% locally within browser RAM without network overhead.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite, Tailwind CSS 4 |
| **Graphics Engine** | HTML5 Canvas 2D API, Direct TypedArray pixel manipulation (`Uint8ClampedArray`) |
| **Animation & Icons** | Motion (Framer Motion), Lucide React |
| **Full-Stack Server** | Express, Node.js, `tsx`, `multer` |
| **Python Backend** | Python 3.10+, OpenCV (`cv2`), NumPy, SciPy, FastAPI, Uvicorn |
| **Testing Suite** | Pytest, TypeScript Compiler (`tsc --noEmit`), Vite Production Builder |

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
* **Node.js**: $\ge 18.0.0$
* **npm**: $\ge 9.0.0$
* **Python**: $\ge 3.10$

### 2. Clone the Repository
```bash
git clone https://github.com/Prakhar170306/KernelLab-Algorithmic-Image-Studio.git
cd KernelLab-Algorithmic-Image-Studio
```

### 3. Environment Variables Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Contents of `.env`:
```env
# Optional: GEMINI_API_KEY if integrating AI Studio extensions
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Live or local URL where the application is hosted
APP_URL="http://localhost:3000"

# Optional: Custom backend endpoint (defaults to local express proxy)
# VITE_API_BASE_URL="http://localhost:8000"
```

### 4. Install Node Dependencies
```bash
npm install --legacy-peer-deps
```

### 5. Python Backend Setup
Create and activate a dedicated virtual environment:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install required Python packages
pip install -r backend/requirements.txt
```

---

## 🧪 Testing & Quality Assurance

### Run Python Backend Tests
Verify the 12-stage pencil sketch algorithm and paper grain synthesis:
```bash
python -m pytest backend/tests
```

### Run Frontend Typecheck & Build Verification
```bash
# Typecheck TypeScript code
npm run lint

# Production bundle build
npm run build
```

---

## 💻 Running the Application

### Option A: Unified Full-Stack Dev Server (Recommended)
Launches the Express API bridge and the Vite development server simultaneously:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Standalone FastAPI Backend + Vite Frontend
Run the dedicated FastAPI microservice:
```bash
# Terminal 1: Start FastAPI microservice
uvicorn backend.main:app --port 8000 --reload

# Terminal 2: Start Vite frontend
export VITE_API_BASE_URL="http://localhost:8000"
npm run dev
```

### Option C: Standalone CLI Conversion
Process any photo directly from your terminal using the Python CLI:
```bash
python pencil_sketch.py input.jpg output.png
```

---

## 🔒 Security & Privacy

* **Zero Persistent Storage**: No images uploaded to the backend are permanently stored, indexed, or shared.
* **Deterministic Execution**: Zero statistical machine learning or external cloud inference models are used.
* **Sanitized Secrets**: No credentials or private API keys are required for core filtering functionality.

---

## 📄 License & Attribution

Distributed under the MIT License. Developed with precision by [Prakhar Saulakhe](https://github.com/Prakhar170306).
