/**
 * High-fidelity procedural sample artworks for instant studio testing.
 * Provides rich, high-contrast visual subjects for evaluating convolution filters.
 */

export interface SampleImageMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  aspectRatio: number;
  imageSrc?: string;
}

export const SAMPLE_IMAGES: SampleImageMeta[] = [
  {
    id: 'greenhouse-conservatory',
    name: 'Victorian Glass Conservatory',
    category: 'Architecture & Botanical',
    description: 'Intricate glass dome structure with lush tropical palms, warm sunlight, and fine graphite contours.',
    aspectRatio: 4 / 3,
    imageSrc: '/assets/artworks/conservatory_color.png'
  },
  {
    id: 'alpine-lake',
    name: 'Alpine Twilight Lake',
    category: 'Landscape & Impasto',
    description: 'Moody mountain peaks reflected in still alpine waters with rich pigment gradients.',
    aspectRatio: 16 / 10,
    imageSrc: '/assets/artworks/card_oil.png'
  },
  {
    id: 'cyber-supercar',
    name: 'Cyberpunk Neon Supercar',
    category: 'Automotive & Glow',
    description: 'Futuristic vehicle with electric magenta underglow and sharp specular highlights.',
    aspectRatio: 16 / 10,
    imageSrc: '/assets/artworks/card_neon.png'
  },
  {
    id: 'parisian-cafe',
    name: 'Parisian Twilight Bistro',
    category: 'Street & 35mm Film',
    description: 'Warm cafe terrace with incandescent halogen lamps and rich organic film halation.',
    aspectRatio: 16 / 10,
    imageSrc: '/assets/artworks/card_film.png'
  },
  {
    id: 'apollo-sculpture',
    name: 'Apollo Classical Sculpture',
    category: 'Sculpture & Chiaroscuro',
    description: 'High-contrast marble statue with deep shadow gradients and intricate facial contours.',
    aspectRatio: 4 / 3
  },
  {
    id: 'neo-tokyo-cyber',
    name: 'Neo-Tokyo Rainy Street',
    category: 'Architecture & Neon',
    description: 'Atmospheric cityscape with wet asphalt reflections, neon signage, and cyberpunk lighting.',
    aspectRatio: 4 / 3
  },
  {
    id: 'golden-coastline',
    name: 'Mediterranean Coastline',
    category: 'Landscape & Film',
    description: 'Cinematic sunset vista with coastal cliffs, sparkling waters, and warm Kodachrome hues.',
    aspectRatio: 4 / 3
  },
  {
    id: 'optical-target',
    name: 'Optical Calibration Target',
    category: 'Technical Optics',
    description: 'Geometric resolution pattern featuring concentric circles, spatial frequencies, and edge steps.',
    aspectRatio: 4 / 3
  }
];

export function generateSampleImageData(id: string, width = 800, height = 600): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2D context');

  switch (id) {
    case 'apollo-sculpture':
      renderApolloSculpture(ctx, width, height);
      break;
    case 'neo-tokyo-cyber':
      renderNeoTokyo(ctx, width, height);
      break;
    case 'golden-coastline':
      renderGoldenCoastline(ctx, width, height);
      break;
    case 'optical-target':
    default:
      renderOpticalTarget(ctx, width, height);
      break;
  }

  return ctx.getImageData(0, 0, width, height);
}

function renderApolloSculpture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep studio background with subtle radial vignette
  const bgGrad = ctx.createRadialGradient(w * 0.45, h * 0.45, 50, w * 0.5, h * 0.5, w * 0.7);
  bgGrad.addColorStop(0, '#1c1828');
  bgGrad.addColorStop(0.5, '#0d0a14');
  bgGrad.addColorStop(1, '#050308');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Pedestal base
  ctx.fillStyle = '#221f2d';
  ctx.beginPath();
  ctx.moveTo(w * 0.25, h * 0.95);
  ctx.lineTo(w * 0.75, h * 0.95);
  ctx.lineTo(w * 0.7, h * 0.82);
  ctx.lineTo(w * 0.3, h * 0.82);
  ctx.closePath();
  ctx.fill();

  // Bust / Torso with stone shading
  const torsoGrad = ctx.createLinearGradient(w * 0.3, h * 0.5, w * 0.7, h * 0.85);
  torsoGrad.addColorStop(0, '#f2edf7');
  torsoGrad.addColorStop(0.3, '#c8c0d6');
  torsoGrad.addColorStop(0.7, '#675f78');
  torsoGrad.addColorStop(1, '#1e1a27');
  ctx.fillStyle = torsoGrad;

  ctx.beginPath();
  ctx.moveTo(w * 0.32, h * 0.82);
  ctx.bezierCurveTo(w * 0.3, h * 0.65, w * 0.35, h * 0.55, w * 0.42, h * 0.52);
  ctx.lineTo(w * 0.42, h * 0.48);
  ctx.bezierCurveTo(w * 0.42, h * 0.48, w * 0.58, h * 0.48, w * 0.58, h * 0.48);
  ctx.lineTo(w * 0.58, h * 0.52);
  ctx.bezierCurveTo(w * 0.65, h * 0.55, w * 0.7, h * 0.65, w * 0.68, h * 0.82);
  ctx.closePath();
  ctx.fill();

  // Neck
  const neckGrad = ctx.createLinearGradient(w * 0.42, h * 0.4, w * 0.58, h * 0.5);
  neckGrad.addColorStop(0, '#e5dff0');
  neckGrad.addColorStop(0.6, '#988fa8');
  neckGrad.addColorStop(1, '#3b334a');
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.rect(w * 0.44, h * 0.4, w * 0.12, h * 0.12);
  ctx.fill();

  // Head and jaw oval
  const headGrad = ctx.createRadialGradient(w * 0.47, h * 0.28, 20, w * 0.5, h * 0.3, 140);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.35, '#dad2e6');
  headGrad.addColorStop(0.7, '#746c85');
  headGrad.addColorStop(1, '#1b1724');
  ctx.fillStyle = headGrad;

  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.3, w * 0.13, w * 0.17, 0, 0, Math.PI * 2);
  ctx.fill();

  // Classical curly hair volume
  ctx.fillStyle = '#615773';
  for (let a = -0.8; a < 0.9; a += 0.25) {
    const hx = w * 0.5 + Math.sin(a) * (w * 0.13);
    const hy = h * 0.19 + Math.cos(a) * (h * 0.04);
    ctx.beginPath();
    ctx.arc(hx, hy, w * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }

  // Strong dramatic key light on brow and nose
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.moveTo(w * 0.485, h * 0.22);
  ctx.lineTo(w * 0.495, h * 0.32);
  ctx.lineTo(w * 0.48, h * 0.33);
  ctx.lineTo(w * 0.48, h * 0.24);
  ctx.closePath();
  ctx.fill();

  // Eye sockets & deep cast shadows
  ctx.fillStyle = '#262033';
  // Left eye shadow
  ctx.beginPath();
  ctx.ellipse(w * 0.45, h * 0.26, w * 0.025, h * 0.012, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Right eye shadow (deep chiaroscuro)
  ctx.beginPath();
  ctx.ellipse(w * 0.54, h * 0.26, w * 0.028, h * 0.014, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Lips contour
  ctx.fillStyle = '#3a3147';
  ctx.beginPath();
  ctx.ellipse(w * 0.49, h * 0.37, w * 0.03, h * 0.008, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crisp rim light on right contour
  ctx.strokeStyle = 'rgba(221, 183, 255, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.3, w * 0.13, -Math.PI * 0.3, Math.PI * 0.4);
  ctx.stroke();
}

function renderNeoTokyo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Midnight sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  skyGrad.addColorStop(0, '#06040d');
  skyGrad.addColorStop(1, '#1b0c2e');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Distant skyscraper silhouettes
  ctx.fillStyle = '#110a1c';
  const buildings = [
    { x: 0.05, w: 0.12, h: 0.55 },
    { x: 0.2, w: 0.15, h: 0.65 },
    { x: 0.38, w: 0.24, h: 0.72 },
    { x: 0.65, w: 0.16, h: 0.58 },
    { x: 0.83, w: 0.14, h: 0.62 }
  ];

  buildings.forEach(b => {
    ctx.fillRect(w * b.x, h * (1 - b.h) * 0.6, w * b.w, h * 0.6);
    // Skyscraper lit windows
    ctx.fillStyle = 'rgba(94, 234, 212, 0.7)';
    for (let wy = h * (1 - b.h) * 0.6 + 20; wy < h * 0.6; wy += 18) {
      for (let wx = w * b.x + 10; wx < w * (b.x + b.w) - 10; wx += 14) {
        if (Math.sin(wx * 13 + wy * 17) > 0.1) {
          ctx.fillRect(wx, wy, 6, 8);
        }
      }
    }
    ctx.fillStyle = '#110a1c';
  });

  // Giant glowing holographic billboard
  const holoGrad = ctx.createLinearGradient(w * 0.4, h * 0.1, w * 0.6, h * 0.3);
  holoGrad.addColorStop(0, '#ec38bc');
  holoGrad.addColorStop(1, '#a855f7');
  ctx.fillStyle = holoGrad;
  ctx.fillRect(w * 0.4, h * 0.12, w * 0.2, h * 0.18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('KERNEL', w * 0.5, h * 0.21);
  ctx.fillText('0x7F', w * 0.5, h * 0.26);

  // Wet ground road with perspective
  const roadGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
  roadGrad.addColorStop(0, '#151020');
  roadGrad.addColorStop(0.5, '#221435');
  roadGrad.addColorStop(1, '#0c0714');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);

  // Vibrant neon reflections across wet road puddles
  const reflectPink = ctx.createRadialGradient(w * 0.5, h * 0.85, 10, w * 0.5, h * 0.85, 200);
  reflectPink.addColorStop(0, 'rgba(236, 56, 188, 0.7)');
  reflectPink.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
  reflectPink.addColorStop(1, 'transparent');
  ctx.fillStyle = reflectPink;
  ctx.fillRect(w * 0.3, h * 0.65, w * 0.4, h * 0.35);

  // Cyan street curb neon reflection
  const reflectCyan = ctx.createLinearGradient(w * 0.1, 0, w * 0.25, 0);
  reflectCyan.addColorStop(0, 'rgba(94, 234, 212, 0.6)');
  reflectCyan.addColorStop(1, 'transparent');
  ctx.fillStyle = reflectCyan;
  ctx.fillRect(0, h * 0.7, w * 0.25, h * 0.3);

  // Rain streaks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 200; i++) {
    const rx = (i * 37) % w;
    const ry = (i * 73) % h;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 4, ry + 16);
    ctx.stroke();
  }
}

function renderGoldenCoastline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Sunset gradient sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  skyGrad.addColorStop(0, '#1a103c');
  skyGrad.addColorStop(0.4, '#c04b6b');
  skyGrad.addColorStop(0.7, '#f48251');
  skyGrad.addColorStop(1, '#ffc86b');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.55);

  // Golden sun disc
  ctx.fillStyle = '#fff4d0';
  ctx.beginPath();
  ctx.arc(w * 0.65, h * 0.42, 45, 0, Math.PI * 2);
  ctx.fill();

  // Sea water with shimmering reflections
  const seaGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
  seaGrad.addColorStop(0, '#ff9e5e');
  seaGrad.addColorStop(0.3, '#8e385e');
  seaGrad.addColorStop(1, '#1b1c3c');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  // Sun trail on sea
  const trailGrad = ctx.createLinearGradient(w * 0.55, 0, w * 0.75, 0);
  trailGrad.addColorStop(0, 'transparent');
  trailGrad.addColorStop(0.5, 'rgba(255, 240, 180, 0.85)');
  trailGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = trailGrad;
  for (let y = h * 0.55; y < h; y += 4) {
    const trailWidth = 20 + (y - h * 0.55) * 0.5;
    ctx.fillRect(w * 0.65 - trailWidth / 2, y, trailWidth, 2);
  }

  // Coastal cliff silhouette
  ctx.fillStyle = '#140c1e';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.35);
  ctx.bezierCurveTo(w * 0.15, h * 0.4, w * 0.25, h * 0.58, w * 0.35, h * 0.7);
  ctx.lineTo(w * 0.42, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Pine tree silhouettes along ridge
  ctx.fillStyle = '#0a0610';
  for (let px = 0.05; px < 0.3; px += 0.04) {
    const tx = w * px;
    const ty = h * (0.36 + px * 0.5);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 12, ty + 40);
    ctx.lineTo(tx + 12, ty + 40);
    ctx.closePath();
    ctx.fill();
  }
}

function renderOpticalTarget(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#08070d';
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.5;

  // Concentric frequency circles
  for (let r = 20; r < Math.min(w, h) * 0.45; r += 16) {
    ctx.strokeStyle = r % 32 === 0 ? '#5eead4' : '#a855f7';
    ctx.lineWidth = r % 48 === 0 ? 3 : 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Siemens star radial spokes
  const spokes = 36;
  ctx.fillStyle = 'rgba(236, 56, 188, 0.35)';
  for (let i = 0; i < spokes; i += 2) {
    const a1 = (i * Math.PI * 2) / spokes;
    const a2 = ((i + 1) * Math.PI * 2) / spokes;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, Math.min(w, h) * 0.35, a1, a2);
    ctx.closePath();
    ctx.fill();
  }

  // Coordinate grid crosshairs
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, 40); ctx.lineTo(cx, h - 40);
  ctx.moveTo(40, cy); ctx.lineTo(w - 40, cy);
  ctx.stroke();

  // Calibration corner chips
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('KERNELLAB CALIBRATION MATRIX // 800x600 px', 60, 60);
  ctx.fillText('NYQUIST LIMIT: 0.5 CYC/PX', 60, 80);
}
