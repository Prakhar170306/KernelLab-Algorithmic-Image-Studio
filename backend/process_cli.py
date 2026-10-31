#!/usr/bin/env python3
"""
CLI entry point for photo_to_fine_pencil_sketch
Enables direct invocation from terminal, automated tests, or Node.js child processes.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import argparse
from pencil_sketch import photo_to_fine_pencil_sketch

def main():
    parser = argparse.ArgumentParser(description="Convert photo to fine-art pencil sketch")
    parser.add_argument("--input", required=True, help="Path to input image file")
    parser.add_argument("--output", required=True, help="Path to output PNG image")
    parser.add_argument("--max-dim", type=int, default=1800, help="Maximum dimension")
    parser.add_argument("--line-strength", type=float, default=0.9, help="Contour line strength")
    parser.add_argument("--hatch-strength", type=float, default=0.85, help="Directional hatching strength")
    parser.add_argument("--tone-strength", type=float, default=0.65, help="Tonal shading strength")
    parser.add_argument("--grain-strength", type=float, default=0.16, help="Paper grain strength")
    parser.add_argument("--paper-tone", type=float, default=0.08, help="Warm paper base tone")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")

    args = parser.parse_args()

    try:
        photo_to_fine_pencil_sketch(
            image_path=args.input,
            output_path=args.output,
            max_dim=args.max_dim,
            line_strength=args.line_strength,
            hatch_strength=args.hatch_strength,
            tone_strength=args.tone_strength,
            grain_strength=args.grain_strength,
            paper_tone=args.paper_tone,
            seed=args.seed
        )
        print(f"SUCCESS: {args.output}")
        sys.exit(0)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
