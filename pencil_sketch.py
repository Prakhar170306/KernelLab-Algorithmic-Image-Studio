"""
Fine-Art Graphite Pencil Sketch Converter
==========================================
Converts an arbitrary input photograph into a fine-art graphite pencil
sketch: soft tonal gradients (multi-scale dodge/burn), directional
hatching, clean DoG-based line contours, and a textured paper background.

Fully adaptive: every threshold is derived from the image's own
statistics (percentiles) or its resolution (relative sigmas), so no
constant is tuned to one specific photo. Works on portraits, animals,
landscapes, architecture, dark or bright exposures alike.

Dependencies: opencv-python, numpy, scipy
"""

import cv2
import numpy as np
from scipy.ndimage import gaussian_filter, sobel


# --------------------------------------------------------------------------- #
# 1. PREPROCESSING & NORMALIZATION
# --------------------------------------------------------------------------- #
def _load_and_normalize(image_path: str, max_dim: int):
    """Load image, resize, convert to grayscale, and adaptively normalize
    exposure/contrast so both under- and over-exposed photos converge to a
    comparable tonal range before any sketch processing happens."""
    bgr = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if bgr is None:
        raise FileNotFoundError(f"Could not read image at: {image_path}")

    scale = max_dim / max(bgr.shape[:2])
    if scale < 1.0:  # only downscale, never upscale a small image
        bgr = cv2.resize(bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    gray_raw = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0

    # CLAHE: local adaptive contrast so detail survives in both shadows
    # and highlights, regardless of how the source photo was exposed.
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray_clahe = clahe.apply((gray_raw * 255).astype(np.uint8)).astype(np.float32) / 255.0

    # CLAHE over-flattens large smooth regions (sky, bokeh, walls) toward
    # mid-grey. Blending it with the plain percentile-stretched original
    # keeps CLAHE's shadow/highlight recovery while preserving the real
    # relative darkness/brightness of flat areas, so dark backgrounds stay
    # dark and bright ones stay bright -- still fully adaptive, no photo-
    # specific tuning.
    lo, hi = np.percentile(gray_raw, [0.5, 99.5])
    gray_stretch = np.clip((gray_raw - lo) / max(hi - lo, 1e-6), 0.0, 1.0)
    gray = 0.55 * gray_stretch + 0.45 * gray_clahe

    return bgr, gray


def _safe_blur(a: np.ndarray, sigma: float) -> np.ndarray:
    """Gaussian blur via scipy.ndimage -- numerically exact (no FFT ringing
    / negative-value artifacts that large cv2.filter2D kernels can produce),
    so it never introduces NaNs regardless of input content."""
    if sigma <= 0:
        return a.copy()
    return gaussian_filter(a, sigma=sigma, mode="nearest")


def _adaptive_norm(x: np.ndarray, lo_pct: float = 2, hi_pct: float = 98) -> np.ndarray:
    """Percentile-based min-max normalization to 0..1, robust to outliers
    and automatically adaptive to each image/response map's own range."""
    lo, hi = np.percentile(x, [lo_pct, hi_pct])
    return np.clip((x - lo) / max(hi - lo, 1e-6), 0.0, 1.0)


def _estimate_subject_mask(bgr: np.ndarray) -> np.ndarray:
    """Softly separate the main subject from its background using GrabCut,
    seeded with a generous centered rectangle (where a photographed subject
    -- a person, product cutout, animal portrait, etc. -- almost always
    sits). This is what lets a busy, repetitive, or artificial background
    (a checkerboard "transparency" pattern, a cluttered room, patterned
    wallpaper) get rendered as a soft, simplified backdrop instead of being
    sketched stroke-for-stroke like the subject.

    Fully adaptive and self-checking: if GrabCut's result looks degenerate
    (covers almost everything or almost nothing -- e.g. on a landscape or
    flat-lay photo with no single dominant subject), it falls back to a
    uniform mask of 1.0, so non-portrait images are simply left untouched
    rather than risking a bad segmentation.
    """
    h, w = bgr.shape[:2]
    try:
        mask = np.zeros((h, w), np.uint8)
        rect = (int(w * 0.04), int(h * 0.03), int(w * 0.92), int(h * 0.94))
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        cv2.grabCut(bgr, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
        fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 1.0, 0.0).astype(np.float32)

        coverage = fg.mean()
        if coverage < 0.03 or coverage > 0.97:
            return np.ones((h, w), np.float32)  # degenerate -- treat whole image as subject

        # Soft, wide feather so the transition reads as a natural falloff
        # (like shallow depth of field) rather than a cutout edge.
        feather = max(h, w) * 0.01
        fg = _safe_blur(fg, feather)
        return np.clip(fg, 0.0, 1.0)
    except cv2.error:
        return np.ones((h, w), np.float32)


# --------------------------------------------------------------------------- #
# 2. LINE ART & CONTOURS  (Difference-of-Gaussians, soft-thresholded)
# --------------------------------------------------------------------------- #
def _extract_line_art(gray: np.ndarray, base_sigma: float) -> np.ndarray:
    """Extended DoG edge/contour extraction at two scales (fine detail +
    broader contour), combined and passed through a soft sigmoid threshold
    instead of a hard binary cutoff -- this avoids the harsh, noisy edges
    a simple `edges > T` threshold produces."""

    def dog(s1, s2):
        return _safe_blur(gray, s1) - _safe_blur(gray, s2)

    fine = dog(base_sigma * 0.6, base_sigma * 1.6)
    coarse = dog(base_sigma * 1.2, base_sigma * 3.2)
    combined = np.clip(-(fine + 0.6 * coarse), 0, None)

    # Soft (sigmoid) threshold: center + steepness derived from the map's
    # own percentiles, so it adapts per image instead of a fixed constant.
    p_lo, p_mid, p_hi = np.percentile(combined, [50, 80, 99.5])
    steepness = 8.0 / max(p_hi - p_lo, 1e-6)
    soft = 1.0 / (1.0 + np.exp(-steepness * (combined - p_mid)))
    return _adaptive_norm(soft, 1, 99.5)


# --------------------------------------------------------------------------- #
# 3. TONAL SHADING (multi-scale dodge/burn) & DIRECTIONAL HATCHING
# --------------------------------------------------------------------------- #
def _multiscale_dodge_burn(gray: np.ndarray, size_ref: float) -> np.ndarray:
    """Classic photographic "dodge" pencil-sketch technique, generalized to
    multiple blur radii and averaged. Each scale: invert -> blur -> color-
    dodge blend with the original. Small radii recover fine midtone detail
    (e.g. facial shading), large radii produce the soft, airy tonal
    gradients typical of graphite shading. Averaging scales prevents any
    single radius from blowing out highlights or crushing shadows.
    """
    inv = 1.0 - gray
    radii = [size_ref * f for f in (0.01, 0.025, 0.06)]  # small/med/large, scale-relative
    dodged = []
    for r in radii:
        blurred = _safe_blur(inv, max(r, 0.5))
        d = gray / np.clip(1.0 - blurred, 1e-3, 1.0)
        dodged.append(np.clip(d, 0, 1))
    tone = np.mean(dodged, axis=0)
    return tone


def _structure_tensor_orientation(gray: np.ndarray, sigma: float):
    """Compute local stroke orientation (the direction artists' hatching
    naturally follows edges/contours) via the 2D structure tensor, plus a
    confidence map (how trustworthy that direction is). In flat, low-
    gradient regions (confidence -> 0) orientation is noisy/meaningless,
    so callers blend toward a stable default direction there."""
    smooth = _safe_blur(gray, sigma * 0.5)
    gx = sobel(smooth, axis=1)
    gy = sobel(smooth, axis=0)

    Jxx = _safe_blur(gx * gx, sigma)
    Jyy = _safe_blur(gy * gy, sigma)
    Jxy = _safe_blur(gx * gy, sigma)

    # Edge confidence, adaptively normalized to this image's own gradient range.
    energy = np.sqrt(np.maximum(Jxx + Jyy, 0.0))
    confidence = _adaptive_norm(energy, 30, 95)

    theta = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy) + np.pi / 2
    return theta, confidence


def _directional_hatching(gray: np.ndarray, theta: np.ndarray, confidence: np.ndarray,
                           size_ref: float, n_directions: int = 16, seed: int = 0) -> np.ndarray:
    """Build directional convolution ("pencil stroke") kernels and apply the
    one matching each pixel's local orientation to a sparse noise field --
    producing hatch marks that follow the subject's contours, with a
    default (vertical) direction in flat/background areas for a classic
    graphite paper-shading look."""
    rng = np.random.default_rng(seed)
    h, w = gray.shape

    default_theta = np.pi / 2  # vertical hatching in flat/background regions
    vx = confidence * np.cos(2 * theta) + (1 - confidence) * np.cos(2 * default_theta)
    vy = confidence * np.sin(2 * theta) + (1 - confidence) * np.sin(2 * default_theta)
    blended_theta = 0.5 * np.arctan2(vy, vx)
    bin_idx = (np.mod(blended_theta, np.pi) / np.pi * n_directions).astype(int) % n_directions

    def line_kernel(length: int, angle: float) -> np.ndarray:
        k = np.zeros((length, length), np.float32)
        c = length // 2
        dx, dy = np.cos(angle), np.sin(angle)
        pt1 = (int(round(c - dx * c)), int(round(c - dy * c)))
        pt2 = (int(round(c + dx * c)), int(round(c + dy * c)))
        cv2.line(k, pt1, pt2, 1.0, 1, lineType=cv2.LINE_AA)
        return k / max(k.sum(), 1e-6)

    def oriented_strokes(density: float, length: int) -> np.ndarray:
        length = max(length | 1, 3)  # odd, >=3
        noise = (rng.random((h, w)) > (1 - density)).astype(np.float32)
        stack = np.stack([cv2.filter2D(noise, -1, line_kernel(length, i * np.pi / n_directions))
                           for i in range(n_directions)])
        chosen = np.take_along_axis(stack, bin_idx[None], axis=0)[0]
        return _adaptive_norm(chosen, 1, 99)

    fine_len = max(int(size_ref * 0.012), 5)
    coarse_len = max(int(size_ref * 0.035), 9)
    fine = oriented_strokes(0.45, fine_len)
    coarse = oriented_strokes(0.12, coarse_len)

    # Fine strokes dominate on strong contours (e.g. fur/feather/hair detail),
    # coarser strokes dominate flat paper/background regions.
    return confidence * fine + (1 - confidence) * coarse


# --------------------------------------------------------------------------- #
# 4. TEXTURE INTEGRATION (procedural paper grain)
# --------------------------------------------------------------------------- #
def _paper_grain(shape, strength: float = 0.16, seed: int = 1) -> np.ndarray:
    """Procedural canvas/paper grain: band-limited noise (soft fibrous
    texture) layered with very fine high-frequency speckle, mimicking the
    tooth of real pencil paper. Multiplicative, so it modulates the sketch
    rather than adding visible noise on its own."""
    rng = np.random.default_rng(seed)
    fibrous = _safe_blur(rng.random(shape).astype(np.float32), 1.1)
    fibrous = _adaptive_norm(fibrous, 2, 98)
    speckle = rng.random(shape).astype(np.float32)
    grain = 0.7 * fibrous + 0.3 * speckle
    return (1 - strength) + strength * grain


# --------------------------------------------------------------------------- #
# 5. MAIN PIPELINE
# --------------------------------------------------------------------------- #
def photo_to_fine_pencil_sketch(
    image_path: str,
    output_path: str,
    max_dim: int = 1800,
    line_strength: float = 0.9,
    hatch_strength: float = 0.85,
    tone_strength: float = 0.65,
    grain_strength: float = 0.16,
    paper_tone: float = 0.08,
    seed: int = 0,
):
    """
    Convert an arbitrary photo into a fine-art graphite pencil sketch.

    Parameters
    ----------
    image_path, output_path : str
        Input photo path and where to save the resulting sketch (PNG).
    max_dim : int
        Longest-edge working resolution. Higher = finer, sharper strokes
        (and slower). 1600-2400 is a good range for detailed results.
    line_strength, hatch_strength, tone_strength : float
        Relative blend weights for contour lines, directional hatching,
        and multi-scale dodge/burn tonal shading respectively. These are
        style knobs (how heavy each ingredient is), not per-image
        thresholds -- the underlying detection stays fully adaptive.
    grain_strength : float
        How visible the procedural paper texture is (0 = none).
    paper_tone : float
        Minimum brightness of the "paper" (keeps backgrounds a soft
        graphite grey rather than crushing to pure black).
    seed : int
        RNG seed for the stroke/grain noise fields (reproducibility).

    Returns
    -------
    np.ndarray
        The final sketch, float32 in [0, 1], grayscale.
    """
    bgr, gray = _load_and_normalize(image_path, max_dim)
    h, w = gray.shape
    size_ref = max(h, w)
    dog_sigma = max(size_ref / 900.0, 0.6)

    # Unsharp mask (adaptive, scale-relative) for crisper strokes before
    # strokes/lines are derived from the image.
    blur_s = _safe_blur(gray, size_ref * 0.0015 + 0.4)
    gray_sharp = np.clip(gray + 0.6 * (gray - blur_s), 0, 1)

    lines = _extract_line_art(gray_sharp, dog_sigma)
    tone = _multiscale_dodge_burn(gray_sharp, size_ref)
    theta, confidence = _structure_tensor_orientation(gray_sharp, max(size_ref / 250.0, 2.0))
    hatching = _directional_hatching(gray_sharp, theta, confidence, size_ref, seed=seed)

    # Subject isolation: keep full linework/hatching detail on the main
    # subject, but fade a *busy or artificial background* (patterned
    # wallpaper, a flattened "transparency" checkerboard, clutter) down to
    # soft, mostly-untextured paper -- the way a real pencil artist would
    # render background as a loose suggestion rather than copy every detail.
    subject_mask = _estimate_subject_mask(bgr)
    bg_detail_floor = 0.18   # background still gets a little texture, never zero
    detail_mix = bg_detail_floor + (1.0 - bg_detail_floor) * subject_mask

    # --- Combine layers into graphite "darkness" ---
    # tone_strength controls how strongly the dodge/burn tone map pushes
    # pixels toward dark graphite shadow -- higher = deeper, more
    # contrasty shadows; lower = flatter/airier shading.
    shade = np.clip(1 - tone, 0, 1) ** (1.0 / max(tone_strength, 0.05))

    # Hatching and contour lines each get a *baseline* presence
    # (independent of local shade) plus an extra boost in darker regions.
    # Real graphite work always leaves some visible stroke texture even
    # across bright, flatly-lit skin/midtones -- pencil "tooth" on the
    # paper -- rather than leaving highlights perfectly blank; multiplying
    # hatching/lines purely by shade (so they vanish wherever shade is low)
    # is what produced a flat, blank-looking "comic outline" instead of a
    # textured pencil drawing.
    graphite = (
        0.55 * shade
        + hatch_strength * hatching * (0.30 + 0.70 * shade)
        + line_strength * lines * (0.35 + 0.65 * shade)
    ) * detail_mix

    # Adaptive final contrast stretch: rescale the graphite "darkness" map
    # by ITS OWN percentiles so every photo makes full use of the tonal
    # range (deep darks where the content has them, clean paper-white
    # highlights) regardless of how contrasty or flat the raw combination
    # came out -- no fixed brightness/contrast constant tuned to one photo.
    graphite = _adaptive_norm(graphite, 0.5, 99.5)

    grain = _paper_grain((h, w), strength=grain_strength, seed=seed + 1)

    sketch = 1.0 - np.clip(graphite, 0, 1)
    sketch = paper_tone + sketch * (0.97 - paper_tone)   # avoid pure black / pure white
    sketch = sketch * grain
    sketch = np.nan_to_num(np.clip(sketch, 0.0, 1.0), nan=1.0)

    out_8u = (sketch * 255).astype(np.uint8)
    cv2.imwrite(output_path, out_8u)
    return sketch, bgr


# --------------------------------------------------------------------------- #
# 6. GOOGLE COLAB: UPLOAD + SIDE-BY-SIDE DISPLAY
# --------------------------------------------------------------------------- #
def run_in_colab():
    """Upload a photo in Colab, run the pipeline, and show original vs.
    sketch side by side. Call this directly in a Colab cell."""
    import matplotlib.pyplot as plt
    from google.colab import files

    uploaded = files.upload()
    in_path = list(uploaded.keys())[0]
    out_path = "pencil_sketch_output.png"

    sketch, original_bgr = photo_to_fine_pencil_sketch(in_path, out_path)

    plt.figure(figsize=(16, 8))
    plt.subplot(1, 2, 1)
    plt.imshow(cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB))
    plt.title("Original")
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.imshow(sketch, cmap="gray")
    plt.title("Graphite Pencil Sketch")
    plt.axis("off")

    plt.tight_layout()
    plt.show()

    files.download(out_path)


if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 3:
        photo_to_fine_pencil_sketch(sys.argv[1], sys.argv[2])
        print(f"Saved: {sys.argv[2]}")
    else:
        print("Usage: python pencil_sketch.py <input_image> <output_image>")
