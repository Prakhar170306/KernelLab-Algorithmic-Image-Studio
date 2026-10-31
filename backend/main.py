"""
KernelLab Python Backend API
FastAPI server hosting the authoritative Fine-Art Pencil Sketch Computer Vision pipeline.
"""

import os
import uuid
import tempfile
import logging
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

try:
    from .pencil_sketch import photo_to_fine_pencil_sketch
except (ImportError, ValueError):
    from pencil_sketch import photo_to_fine_pencil_sketch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KernelLabBackend")

app = FastAPI(
    title="KernelLab Algorithmic Vision API",
    description="High-precision mathematical image processing backend powered by OpenCV and NumPy",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in dev environment and preview iframe
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
}

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


@app.get("/api/health")
async def health_check():
    """Health status and diagnostic info."""
    return {
        "status": "healthy",
        "service": "KernelLab Python Vision Engine",
        "pipeline": "Fine-Art Pencil Sketch (OpenCV + DoG + CLAHE + Structure Tensor)",
        "version": "1.0.0"
    }


@app.post("/api/filters/pencil-sketch")
async def process_pencil_sketch(
    file: UploadFile = File(..., description="Source image file (JPG, PNG, WebP)"),
    line_strength: float = Form(0.9, ge=0.1, le=3.0),
    hatch_strength: float = Form(0.85, ge=0.0, le=2.0),
    tone_strength: float = Form(0.65, ge=0.0, le=2.0),
    grain_strength: float = Form(0.16, ge=0.0, le=1.0),
    paper_tone: float = Form(0.08, ge=0.0, le=0.4),
    max_dim: int = Form(1800, ge=300, le=4000),
    seed: Optional[int] = Form(42)
):
    """
    Executes the full 12-stage Python pencil sketch algorithm.
    Validates, processes, returns the authentic output PNG, and guarantees temp file cleanup.
    """
    # 1. MIME Validation
    content_type = file.content_type.lower() if file.content_type else ""
    if content_type not in ALLOWED_MIME_TYPES and not any(file.filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported media type: '{file.content_type}'. Supported formats: JPG, PNG, WebP."
        )

    # 2. Secure Temporary Workspace
    session_id = uuid.uuid4().hex
    temp_dir = tempfile.mkdtemp(prefix=f"kernellab_{session_id}_")

    input_ext = os.path.splitext(file.filename)[1] or ".png"
    input_path = os.path.join(temp_dir, f"input{input_ext}")
    output_path = os.path.join(temp_dir, "pencil_sketch_output.png")

    try:
        # Read uploaded content with size guard
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Uploaded file exceeds 25MB limit."
            )

        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        with open(input_path, "wb") as f:
            f.write(content)

        logger.info(f"Processing sketch: size={len(content)}b, line_strength={line_strength}, max_dim={max_dim}")

        # 3. Call the Authoritative Python Algorithm
        photo_to_fine_pencil_sketch(
            image_path=input_path,
            output_path=output_path,
            max_dim=max_dim,
            line_strength=line_strength,
            hatch_strength=hatch_strength,
            tone_strength=tone_strength,
            grain_strength=grain_strength,
            paper_tone=paper_tone,
            seed=seed
        )

        if not os.path.exists(output_path):
            raise RuntimeError("Algorithm executed without creating output file.")

        # Read output image into memory so we can safely clean up temporary disk files immediately
        with open(output_path, "rb") as out_f:
            processed_bytes = out_f.read()

        from fastapi import Response
        return Response(
            content=processed_bytes,
            media_type="image/png",
            headers={
                "Content-Disposition": 'inline; filename="pencil_sketch.png"',
                "X-KernelLab-Engine": "Python-OpenCV-CLAHE-DoG"
            }
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Pencil sketch processing failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mathematical sketch pipeline error: {str(exc)}"
        )
    finally:
        # 4. Strict Resource Cleanup
        try:
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(output_path):
                os.remove(output_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except Exception as cleanup_err:
            logger.warning(f"Error during temporary file cleanup: {cleanup_err}")
