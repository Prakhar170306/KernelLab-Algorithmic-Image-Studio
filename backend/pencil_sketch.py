"""
Fine-Art Pencil Sketch Transformation Engine
Authoritative Python Implementation

Pipeline Stages:
1. OpenCV image ingestion & adaptive preprocessing
2. Adaptive CLAHE contrast normalization
3. Percentile-based robust intensity normalization
4. Difference-of-Gaussians (DoG) line extraction
5. Soft sigmoid contour thresholding
6. Multi-scale dodge/burn tonal shading
7. Structure-tensor-based stroke orientation analysis
8. Directional hatching convolution
9. GrabCut-based subject/background isolation
10. Procedural graphite paper grain synthesis
11. Adaptive graphite composition
12. Final 16-bit / 8-bit fine graphite grayscale image export
"""

import os
import cv2
import numpy as np
from scipy.ndimage import gaussian_filter


def normalize_intensity(image: np.ndarray, low_pct: float = 1.0, high_pct: float = 99.0) -> np.ndarray:
    """Percentile-based robust intensity normalization to [0.0, 1.0]."""
    p_low, p_high = np.percentile(image, (low_pct, high_pct))
    if p_high <= p_low:
        return np.clip(image.astype(np.float32) / 255.0, 0.0, 1.0)
    norm = (image.astype(np.float32) - p_low) / (p_high - p_low)
    return np.clip(norm, 0.0, 1.0)


def difference_of_gaussians(gray: np.ndarray, sigma: float = 1.0, k: float = 1.6, gamma: float = 0.98) -> np.ndarray:
    """
    Extract sharp pencil line contours via Difference-of-Gaussians (DoG):
    DoG(x, y) = G(x, y, sigma) - gamma * G(x, y, k * sigma)
    """
    g1 = cv2.GaussianBlur(gray, (0, 0), sigma)
    g2 = cv2.GaussianBlur(gray, (0, 0), sigma * k)
    dog = g1.astype(np.float32) - (gamma * g2.astype(np.float32))
    return dog


def sigmoid_threshold(dog: np.ndarray, strength: float = 0.9, phi: float = 12.0, epsilon: float = 0.0) -> np.ndarray:
    """
    Soft sigmoid contour thresholding:
    Converts Difference-of-Gaussians response into clean pencil line density [0, 1].
    Values near 0 = dark graphite lines, near 1 = white paper.
    """
    # Centered sigmoid
    scaled = phi * (dog - epsilon)
    # Numerical stability clip
    clipped = np.clip(scaled, -30.0, 30.0)
    response = 1.0 / (1.0 + np.exp(-clipped))
    
    # Scale contour darkness by line_strength
    lines = 1.0 - (1.0 - response) * strength
    return np.clip(lines, 0.0, 1.0)


def multiscale_color_dodge(gray: np.ndarray, tone_strength: float = 0.65) -> np.ndarray:
    """
    Multi-scale color dodge shading:
    Combines inverted blurred layers across multiple octaves to produce
    realistic pencil graphite tonal transitions.
    """
    inv = 255.0 - gray.astype(np.float32)
    scales = [3.0, 9.0, 21.0, 45.0]
    weights = [0.35, 0.30, 0.20, 0.15]
    
    dodge_accum = np.zeros_like(gray, dtype=np.float32)
    gray_f = gray.astype(np.float32)

    for sigma, w in zip(scales, weights):
        blurred_inv = cv2.GaussianBlur(inv, (0, 0), sigma)
        denom = 255.0 - blurred_inv
        denom[denom < 1.0] = 1.0  # Prevent divide-by-zero
        dodge = (gray_f * 255.0) / denom
        dodge = np.clip(dodge, 0.0, 255.0)
        dodge_accum += w * dodge

    # Tone strength modulation
    shading = dodge_accum / 255.0
    shading = 1.0 - (1.0 - shading) * tone_strength
    return np.clip(shading, 0.0, 1.0)


def compute_structure_tensor_hatching(gray: np.ndarray, hatch_strength: float = 0.85) -> np.ndarray:
    """
    Directional hatching convolution based on the local structure tensor:
    Determines dominant edge tangents and generates cross-hatched strokes.
    """
    # Compute image gradients
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)

    # Structure tensor components
    j_xx = cv2.GaussianBlur(gx * gx, (0, 0), 2.5)
    j_yy = cv2.GaussianBlur(gy * gy, (0, 0), 2.5)
    j_xy = cv2.GaussianBlur(gx * gy, (0, 0), 2.5)

    # Tangent angle: theta = 0.5 * atan2(2*Jxy, Jxx - Jyy) + pi/2
    theta = 0.5 * np.arctan2(2.0 * j_xy, j_xx - j_yy) + (np.pi / 2.0)

    # Directional hatching filter along dominant stroke angle
    # Create oriented line kernels at 4 discrete angular quantization bins
    h, w = gray.shape
    hatch_map = np.ones((h, w), dtype=np.float32)

    kernel_len = 9
    angles = [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4]
    
    for a in angles:
        kernel = np.zeros((kernel_len, kernel_len), dtype=np.float32)
        center = kernel_len // 2
        cos_a = np.cos(a)
        sin_a = np.sin(a)
        for step in range(-center, center + 1):
            kx = int(round(center + step * cos_a))
            ky = int(round(center + step * sin_a))
            if 0 <= kx < kernel_len and 0 <= ky < kernel_len:
                kernel[ky, kx] = 1.0
        k_sum = np.sum(kernel)
        if k_sum > 0:
            kernel /= k_sum

        # Filter inverted luminance to identify shadowed areas needing hatch lines
        filtered = cv2.filter2D(255.0 - gray.astype(np.float32), -1, kernel) / 255.0
        # Angle similarity mask
        angle_diff = np.abs(np.mod(theta - a + np.pi / 2, np.pi) - np.pi / 2)
        weight = np.exp(- (angle_diff ** 2) / 0.35)
        
        hatch_map -= (filtered * weight * 0.25 * hatch_strength)

    return np.clip(hatch_map, 0.0, 1.0)


def grabcut_foreground_mask(image_bgr: np.ndarray) -> np.ndarray:
    """
    GrabCut-based subject/background isolation:
    Separates primary foreground subject from background to guide pencil emphasis.
    """
    try:
        h, w = image_bgr.shape[:2]
        if h < 20 or w < 20:
            return np.ones((h, w), dtype=np.float32)

        margin_x = max(2, int(w * 0.05))
        margin_y = max(2, int(h * 0.05))
        rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)

        mask = np.zeros((h, w), np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)

        cv2.grabCut(image_bgr, mask, rect, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_RECT)
        fg_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 1.0, 0.35).astype(np.float32)
        # Soften mask boundary
        fg_mask = cv2.GaussianBlur(fg_mask, (21, 21), 0)
        return fg_mask
    except Exception:
        # Graceful fallback if GrabCut encounters singular contours
        return np.ones((image_bgr.shape[0], image_bgr.shape[1]), dtype=np.float32)


def generate_paper_grain(height: int, width: int, grain_strength: float = 0.16, seed: int = 42) -> np.ndarray:
    """
    Procedural graphite paper grain:
    Generates microscopic cold-press cotton paper grain with high-frequency surface bumps.
    """
    if seed is not None:
        np.random.seed(seed)

    raw_noise = np.random.normal(0.0, 1.0, (height, width)).astype(np.float32)
    # Smooth noise to emulate physical cotton fiber granularity
    fine_grain = cv2.GaussianBlur(raw_noise, (3, 3), 0.8)
    medium_grain = cv2.GaussianBlur(raw_noise, (7, 7), 1.6)
    
    grain = 0.7 * fine_grain + 0.3 * medium_grain
    # Normalize grain to mean 1.0 with variance controlled by grain_strength
    grain = 1.0 + (grain * grain_strength * 0.15)
    return np.clip(grain, 0.7, 1.3)


def photo_to_fine_pencil_sketch(
    image_path: str,
    output_path: str,
    max_dim: int = 1800,
    line_strength: float = 0.9,
    hatch_strength: float = 0.85,
    tone_strength: float = 0.65,
    grain_strength: float = 0.16,
    paper_tone: float = 0.08,
    seed: int = 42
) -> str:
    """
    Authoritative Photo to Fine-Art Pencil Sketch Transformation.
    
    Parameters:
    - image_path: Input source image file path
    - output_path: Destination PNG output path
    - max_dim: Maximum dimension for downscaling (preserves aspect ratio)
    - line_strength: Contour pencil line emphasis [0.1, 2.5]
    - hatch_strength: Directional pencil cross-hatching strength [0.0, 2.0]
    - tone_strength: Multi-scale graphite tonal shading [0.0, 2.0]
    - grain_strength: Cold-press paper texture grain [0.0, 1.0]
    - paper_tone: Base warm paper tone reflectivity [0.0, 0.4]
    - seed: Stochastic random seed for repeatable texture synthesis
    
    Returns:
    - Output image path on success
    """
    if seed is not None:
        np.random.seed(seed)

    # 1. Ingest image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Failed to read image from path: {image_path}")

    # Resize if larger than max_dim (preserving exact aspect ratio)
    h, w = img.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        new_w = max(1, int(round(w * scale)))
        new_h = max(1, int(round(h * scale)))
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
        h, w = new_h, new_w

    # 2. Grayscale & CLAHE contrast equalization
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray_clahe = clahe.apply(gray)

    # 3. Percentile intensity normalization
    norm_gray = (normalize_intensity(gray_clahe, 1.0, 99.0) * 255.0).astype(np.uint8)

    # 4. Difference-of-Gaussians (DoG) line extraction & Sigmoid Thresholding
    dog_response = difference_of_gaussians(norm_gray, sigma=1.0, k=1.6, gamma=0.98)
    line_art = sigmoid_threshold(dog_response, strength=line_strength, phi=14.0, epsilon=0.0)

    # 5. Multi-scale dodge/burn tonal shading
    tonal_shading = multiscale_color_dodge(norm_gray, tone_strength=tone_strength)

    # 6. Structure-tensor directional hatching
    hatching = compute_structure_tensor_hatching(norm_gray, hatch_strength=hatch_strength)

    # 7. GrabCut subject/background isolation
    fg_mask = grabcut_foreground_mask(img)
    # Modulate hatching and lines with foreground mask (so background is gentle, foreground is sharp)
    effective_hatch = 1.0 - (1.0 - hatching) * (0.4 + 0.6 * fg_mask)

    # 8. Procedural graphite paper grain
    grain = generate_paper_grain(h, w, grain_strength=grain_strength, seed=seed)

    # 9. Adaptive graphite composition:
    # Multiply line art * tonal shading * directional hatching * paper grain
    graphite_layers = line_art * tonal_shading * effective_hatch * grain

    # 10. Paper tone injection (subtle ivory/warm paper base reflectivity)
    # Output = paper_tone_base * graphite
    paper_base = 1.0 - paper_tone
    final_float = graphite_layers * paper_base + paper_tone

    # Clip to valid 8-bit range [0, 255]
    final_output = np.clip(np.round(final_float * 255.0), 0, 255).astype(np.uint8)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    # Write output PNG
    success = cv2.imwrite(output_path, final_output)
    if not success:
        raise IOError(f"Failed to write processed image to: {output_path}")

    return output_path
