import os
import cv2
import numpy as np

def unsharp_mask(image, sigma=1.0, strength=1.2):
    blurred = cv2.GaussianBlur(image, (0, 0), sigma)
    sharpened = cv2.addWeighted(image, 1.0 + strength, blurred, -strength, 0)
    return np.clip(sharpened, 0, 255).astype(np.uint8)

def main():
    art_dir = 'public/assets/artworks'
    dist_dir = 'dist/assets/artworks'
    os.makedirs(dist_dir, exist_ok=True)

    TARGET_W = 960
    TARGET_H = 600

    # 1. PENCIL SKETCH
    # Greenhouse conservatory sketch: center dome, archways, and lush monstera leaves
    pencil = cv2.imread(f'{art_dir}/card_pencil.png')
    # Crop inside the paper: y: 43..235, x: 116..423
    crop_pencil = pencil[43:235, 116:423]
    # Resize with Lanczos
    res_pencil = cv2.resize(crop_pencil, (TARGET_W, TARGET_H), interpolation=cv2.INTER_LANCZOS4)
    res_pencil = unsharp_mask(res_pencil, sigma=1.0, strength=1.1)
    cv2.imwrite(f'{art_dir}/card_pencil.png', res_pencil)
    cv2.imwrite(f'{dist_dir}/card_pencil.png', res_pencil)
    print('Processed card_pencil.png:', res_pencil.shape)

    # 2. IMPASTO OIL PAINTING
    # Mountain lake landscape with twilight impasto reflections
    oil = cv2.imread(f'{art_dir}/card_oil.png')
    # The mountain lake is at y: 38..228, x: 150..454
    crop_oil = oil[38:228, 150:454]
    res_oil = cv2.resize(crop_oil, (TARGET_W, TARGET_H), interpolation=cv2.INTER_LANCZOS4)
    res_oil = unsharp_mask(res_oil, sigma=1.0, strength=1.1)
    cv2.imwrite(f'{art_dir}/card_oil.png', res_oil)
    cv2.imwrite(f'{dist_dir}/card_oil.png', res_oil)
    print('Processed card_oil.png:', res_oil.shape)

    # 3. NEON EDGE GLOW
    # Cyberpunk supercar with purple neon wireframe and cyan headlights
    neon = cv2.imread(f'{art_dir}/card_neon.png')
    # Car center crop: y: 38..233, x: 155..467
    crop_neon = neon[38:233, 155:467]
    res_neon = cv2.resize(crop_neon, (TARGET_W, TARGET_H), interpolation=cv2.INTER_LANCZOS4)
    res_neon = unsharp_mask(res_neon, sigma=1.0, strength=1.2)
    cv2.imwrite(f'{art_dir}/card_neon.png', res_neon)
    cv2.imwrite(f'{dist_dir}/card_neon.png', res_neon)
    print('Processed card_neon.png:', res_neon.shape)

    # 4. VINTAGE FILM & HALATION
    # Warm Parisian cafe interior with glowing pendant lamps and barista
    film = cv2.imread(f'{art_dir}/card_film.png')
    # Cafe interior crop: y: 43..228, x: 122..418
    crop_film = film[43:228, 122:418]
    res_film = cv2.resize(crop_film, (TARGET_W, TARGET_H), interpolation=cv2.INTER_LANCZOS4)
    res_film = unsharp_mask(res_film, sigma=1.0, strength=1.0)
    cv2.imwrite(f'{art_dir}/card_film.png', res_film)
    cv2.imwrite(f'{dist_dir}/card_film.png', res_film)
    print('Processed card_film.png:', res_film.shape)

    # 5. HALFTONE DOT-MATRIX
    # Apollo astronaut helmet with halftone dots and space Earth
    # Load original raw/card before inpaint
    ht = cv2.imread(f'{art_dir}/card_halftone.png')
    mask = np.zeros(ht.shape[:2], dtype=np.uint8)
    gray = cv2.cvtColor(ht, cv2.COLOR_BGR2GRAY)
    # Mask text in top-left space background
    text_pixels = (gray > 28) & (np.arange(ht.shape[0])[:, None] < 70) & (np.arange(ht.shape[1])[None, :] < 175)
    mask[text_pixels] = 255
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=1)
    cleaned_ht = cv2.inpaint(ht, mask, 5, cv2.INPAINT_TELEA)

    crop_ht = cleaned_ht[25:225, 130:450]
    res_ht = cv2.resize(crop_ht, (TARGET_W, TARGET_H), interpolation=cv2.INTER_LANCZOS4)
    res_ht = unsharp_mask(res_ht, sigma=0.8, strength=1.2)
    cv2.imwrite(f'{art_dir}/card_halftone.png', res_ht)
    cv2.imwrite(f'{dist_dir}/card_halftone.png', res_ht)
    print('Processed card_halftone.png:', res_ht.shape)

if __name__ == '__main__':
    main()
