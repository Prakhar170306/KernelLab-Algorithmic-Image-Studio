"""
Unit tests for Python Pencil Sketch Pipeline
"""

import os
import tempfile
import numpy as np
import cv2
import pytest

from backend.pencil_sketch import (
    photo_to_fine_pencil_sketch,
    normalize_intensity,
    difference_of_gaussians,
    sigmoid_threshold,
    multiscale_color_dodge,
    compute_structure_tensor_hatching,
    generate_paper_grain
)


@pytest.fixture
def sample_test_image():
    """Generates a synthetic high-contrast geometric test image."""
    img = np.zeros((200, 200, 3), dtype=np.uint8)
    cv2.circle(img, (100, 100), 50, (255, 200, 180), -1)
    cv2.rectangle(img, (40, 40), (160, 160), (40, 80, 200), 2)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        cv2.imwrite(f.name, img)
        temp_path = f.name
    yield temp_path
    if os.path.exists(temp_path):
        os.remove(temp_path)


def test_pencil_sketch_generation(sample_test_image):
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as out_f:
        out_path = out_f.name

    try:
        result_path = photo_to_fine_pencil_sketch(
            image_path=sample_test_image,
            output_path=out_path,
            max_dim=250,
            line_strength=0.9,
            hatch_strength=0.85,
            tone_strength=0.65,
            grain_strength=0.16,
            paper_tone=0.08,
            seed=42
        )
        assert os.path.exists(result_path)
        output_img = cv2.imread(result_path, cv2.IMREAD_GRAYSCALE)
        assert output_img is not None
        assert output_img.shape[0] == 200
        assert output_img.shape[1] == 200
        # Output should be in valid grayscale range [0, 255]
        assert output_img.min() >= 0
        assert output_img.max() <= 255
    finally:
        if os.path.exists(out_path):
            os.remove(out_path)


def test_grain_repeatability():
    g1 = generate_paper_grain(100, 100, grain_strength=0.2, seed=123)
    g2 = generate_paper_grain(100, 100, grain_strength=0.2, seed=123)
    np.testing.assert_array_almost_equal(g1, g2)
