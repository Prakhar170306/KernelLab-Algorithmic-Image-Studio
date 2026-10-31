import React from 'react';
import { Sliders, RotateCcw, Sparkles, Check, Info } from 'lucide-react';
import {
  FilterType,
  AllFilterParameters,
  SketchParameters,
  OilParameters,
  NeonParameters,
  FilmParameters,
  HalftoneParameters,
  KernelParameters
} from '../../engine/types';
import { DEFAULT_PARAMETERS } from '../../engine/processor';
import { KERNEL_PRESETS, computeKernelSum } from '../../filters/customKernel';

interface AdjustmentPanelProps {
  activeFilter: FilterType;
  parameters: AllFilterParameters;
  onChangeParameters: (updater: (prev: AllFilterParameters) => AllFilterParameters) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  activeFilter,
  parameters,
  onChangeParameters,
  isOpenMobile,
  onCloseMobile
}) => {
  const resetActiveFilter = () => {
    onChangeParameters((prev) => ({
      ...prev,
      [activeFilter]: JSON.parse(JSON.stringify(DEFAULT_PARAMETERS[activeFilter]))
    }));
  };

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-14 bottom-14 right-0 w-80 bg-[#14101F] border-l border-purple-500/15 flex flex-col z-30 transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-purple-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#5EEAD4]" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              Parameter Inspector
            </span>
          </div>

          <button
            onClick={resetActiveFilter}
            className="text-xs font-mono text-[#A8A1BA] hover:text-white flex items-center gap-1 transition-colors"
            title="Reset active filter to default parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Dynamic Controls Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          {activeFilter === 'sketch' && (
            <SketchControls
              params={parameters.sketch}
              onChange={(updater) =>
                onChangeParameters((p) => ({ ...p, sketch: updater(p.sketch) }))
              }
            />
          )}

          {activeFilter === 'oil' && (
            <OilControls
              params={parameters.oil}
              onChange={(updater) =>
                onChangeParameters((p) => ({ ...p, oil: updater(p.oil) }))
              }
            />
          )}

          {activeFilter === 'neon' && (
            <NeonControls
              params={parameters.neon}
              onChange={(updater) =>
                onChangeParameters((p) => ({ ...p, neon: updater(p.neon) }))
              }
            />
          )}

          {activeFilter === 'film' && (
            <FilmControls
              params={parameters.film}
              onChange={(updater) =>
                onChangeParameters((p) => ({ ...p, film: updater(p.film) }))
              }
            />
          )}

          {activeFilter === 'halftone' && (
            <HalftoneControls
              params={parameters.halftone}
              onChange={(updater) =>
                onChangeParameters((p) => ({ ...p, halftone: updater(p.halftone) }))
              }
            />
          )}

          {activeFilter === 'kernel' && (
            <KernelControls
              params={parameters.kernel}
              onChange={(updater) =>
                onChangeParameters((p) => ({ ...p, kernel: updater(p.kernel) }))
              }
            />
          )}
        </div>
      </aside>
    </>
  );
};

/* --- FILTER 1: PENCIL SKETCH CONTROLS (PYTHON CV PIPELINE) --- */
const SketchControls: React.FC<{
  params: SketchParameters;
  onChange: (updater: (prev: SketchParameters) => SketchParameters) => void;
}> = ({ params, onChange }) => {
  const presets = [
    { label: 'Fine Graphite (Default)', line_strength: 0.9, hatch_strength: 0.85, tone_strength: 0.65, grain_strength: 0.16, paper_tone: 0.08, max_dim: 1800, seed: 42 },
    { label: 'High Contrast DoG', line_strength: 1.5, hatch_strength: 1.2, tone_strength: 0.9, grain_strength: 0.22, paper_tone: 0.05, max_dim: 1800, seed: 42 },
    { label: 'Soft Classical', line_strength: 0.6, hatch_strength: 0.5, tone_strength: 0.45, grain_strength: 0.12, paper_tone: 0.12, max_dim: 1800, seed: 42 }
  ];

  return (
    <div className="space-y-5">
      {/* Backend Engine Notification Badge */}
      <div className="p-3 rounded-xl bg-[#08070D] border border-cyan-500/30 text-xs font-mono space-y-1">
        <div className="flex items-center justify-between text-[#5EEAD4]">
          <span className="font-semibold uppercase tracking-wider">Engine Architecture</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px]">OpenCV DoG</span>
        </div>
        <p className="text-[11px] text-[#A8A1BA] leading-relaxed">
          Powered by photo_to_fine_pencil_sketch() with CLAHE, Difference-of-Gaussians, and Structure-Tensor hatching.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Presets</label>
          <button
            onClick={() => onChange(() => ({
              line_strength: 0.9,
              hatch_strength: 0.85,
              tone_strength: 0.65,
              grain_strength: 0.16,
              paper_tone: 0.08,
              max_dim: 1800,
              seed: 42
            }))}
            className="text-[11px] font-mono text-[#5EEAD4] hover:underline"
          >
            Reset to Defaults
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange(() => ({ ...p }))}
              className="px-2 py-1.5 rounded-lg bg-[#08070D] border border-purple-500/25 hover:border-cyan-400 text-slate-300 hover:text-white transition-all truncate"
            >
              {p.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <SliderField
        label="Line Strength (DoG Sigmoid)"
        min={0.1} max={2.5} step={0.05}
        value={params.line_strength}
        format={(v) => `${v.toFixed(2)}`}
        onChange={(v) => onChange((p) => ({ ...p, line_strength: v }))}
      />

      <SliderField
        label="Hatching Strength (Structure Tensor)"
        min={0.0} max={2.0} step={0.05}
        value={params.hatch_strength}
        format={(v) => `${v.toFixed(2)}`}
        onChange={(v) => onChange((p) => ({ ...p, hatch_strength: v }))}
      />

      <SliderField
        label="Tone Strength (Multi-Scale Dodge)"
        min={0.0} max={2.0} step={0.05}
        value={params.tone_strength}
        format={(v) => `${v.toFixed(2)}`}
        onChange={(v) => onChange((p) => ({ ...p, tone_strength: v }))}
      />

      <SliderField
        label="Paper Grain (Micro-Texture)"
        min={0.0} max={1.0} step={0.02}
        value={params.grain_strength}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange((p) => ({ ...p, grain_strength: v }))}
      />

      <SliderField
        label="Paper Tone (Base Reflectivity)"
        min={0.0} max={0.4} step={0.01}
        value={params.paper_tone}
        format={(v) => `${(v * 100).toFixed(0)}%`}
        onChange={(v) => onChange((p) => ({ ...p, paper_tone: v }))}
      />

      <SliderField
        label="Processing Max Dimension"
        min={600} max={3600} step={100}
        value={params.max_dim}
        format={(v) => `${v} px`}
        onChange={(v) => onChange((p) => ({ ...p, max_dim: v }))}
      />

      <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-lg bg-[#08070D] border border-purple-500/20">
        <span className="text-slate-400">Random Seed:</span>
        <input
          type="number"
          value={params.seed}
          onChange={(e) => onChange((p) => ({ ...p, seed: parseInt(e.target.value) || 42 }))}
          className="w-20 text-right px-2 py-1 rounded bg-[#14101F] border border-purple-500/30 text-white font-mono text-xs focus:border-[#5EEAD4] focus:outline-none"
        />
      </div>
    </div>
  );
};

/* --- FILTER 2: OIL PAINTING CONTROLS --- */
const OilControls: React.FC<{
  params: OilParameters;
  onChange: (updater: (prev: OilParameters) => OilParameters) => void;
}> = ({ params, onChange }) => {
  const presets = [
    { label: 'Impasto Canvas', brushRadius: 2, paintingIntensity: 1.2, smoothing: 0.75, vibrance: 1.3 },
    { label: 'Soft Glaze', brushRadius: 1, paintingIntensity: 1.0, smoothing: 0.9, vibrance: 1.1 },
    { label: 'Heavy Palette', brushRadius: 4, paintingIntensity: 1.4, smoothing: 0.5, vibrance: 1.5 }
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Presets</label>
        <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange(() => ({ ...p }))}
              className="px-2 py-1.5 rounded-lg bg-[#08070D] border border-purple-500/25 hover:border-cyan-400 text-slate-300 hover:text-white transition-all truncate"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <SliderField
        label="Brush Radius (Kuwahara Window)"
        min={1} max={5} step={1}
        value={params.brushRadius}
        format={(v) => `${v} (${v * 2 + 1}×${v * 2 + 1})`}
        onChange={(v) => onChange((p) => ({ ...p, brushRadius: v }))}
      />

      <SliderField
        label="Painting Intensity"
        min={0.5} max={2.0} step={0.05}
        value={params.paintingIntensity}
        format={(v) => `${v.toFixed(2)}`}
        onChange={(v) => onChange((p) => ({ ...p, paintingIntensity: v }))}
      />

      <SliderField
        label="Smoothing Factor"
        min={0.1} max={1.0} step={0.05}
        value={params.smoothing}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange((p) => ({ ...p, smoothing: v }))}
      />

      <SliderField
        label="Color Vibrance (Pigment Boost)"
        min={0.5} max={2.0} step={0.05}
        value={params.vibrance}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange((p) => ({ ...p, vibrance: v }))}
      />
    </div>
  );
};

/* --- FILTER 3: NEON GLOW CONTROLS --- */
const NeonControls: React.FC<{
  params: NeonParameters;
  onChange: (updater: (prev: NeonParameters) => NeonParameters) => void;
}> = ({ params, onChange }) => {
  const colors: Array<{ id: NeonParameters['neonColor']; label: string; hex: string }> = [
    { id: 'violet', label: 'Violet', hex: '#A855F7' },
    { id: 'magenta', label: 'Magenta', hex: '#EC38BC' },
    { id: 'cyan', label: 'Cyan', hex: '#5EEAD4' },
    { id: 'emerald', label: 'Emerald', hex: '#34D399' },
    { id: 'amber', label: 'Amber', hex: '#FBBF24' }
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Neon Spectral Color</label>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange((p) => ({ ...p, neonColor: c.id }))}
              style={{ backgroundColor: c.hex }}
              className={`h-9 rounded-lg transition-transform flex items-center justify-center ${
                params.neonColor === c.id ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'
              }`}
              title={c.label}
            >
              {params.neonColor === c.id && <Check className="w-4 h-4 text-black font-bold" />}
            </button>
          ))}
        </div>
      </div>

      <SliderField
        label="Sobel Edge Threshold"
        min={10} max={120} step={1}
        value={params.edgeThreshold}
        format={(v) => `${v}`}
        onChange={(v) => onChange((p) => ({ ...p, edgeThreshold: v }))}
      />

      <SliderField
        label="Gaussian Glow Radius"
        min={1} max={8} step={1}
        value={params.glowRadius}
        format={(v) => `${v} px`}
        onChange={(v) => onChange((p) => ({ ...p, glowRadius: v }))}
      />

      <SliderField
        label="Glow Intensity"
        min={0.5} max={3.0} step={0.1}
        value={params.glowIntensity}
        format={(v) => `${v.toFixed(1)}×`}
        onChange={(v) => onChange((p) => ({ ...p, glowIntensity: v }))}
      />

      <SliderField
        label="Background Darkness"
        min={0.2} max={1.0} step={0.05}
        value={params.backgroundDarkness}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange((p) => ({ ...p, backgroundDarkness: v }))}
      />
    </div>
  );
};

/* --- FILTER 4: VINTAGE FILM CONTROLS --- */
const FilmControls: React.FC<{
  params: FilmParameters;
  onChange: (updater: (prev: FilmParameters) => FilmParameters) => void;
}> = ({ params, onChange }) => {
  const presets = [
    { label: 'Kodachrome 64', filmGrain: 0.45, warmth: 0.22, fade: 0.12, contrast: 1.2, vignette: 0.5 },
    { label: 'Portra 400', filmGrain: 0.35, warmth: 0.15, fade: 0.2, contrast: 1.1, vignette: 0.35 },
    { label: '1980s VHS', filmGrain: 0.7, warmth: -0.1, fade: 0.35, contrast: 0.95, vignette: 0.65 }
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Presets</label>
        <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange(() => ({ ...p }))}
              className="px-2 py-1.5 rounded-lg bg-[#08070D] border border-purple-500/25 hover:border-cyan-400 text-slate-300 hover:text-white transition-all truncate"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <SliderField
        label="Film Halide Grain"
        min={0.0} max={1.0} step={0.05}
        value={params.filmGrain}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange((p) => ({ ...p, filmGrain: v }))}
      />

      <SliderField
        label="Color Warmth"
        min={-0.5} max={0.5} step={0.02}
        value={params.warmth}
        format={(v) => (v > 0 ? `+${v.toFixed(2)}` : `${v.toFixed(2)}`)}
        onChange={(v) => onChange((p) => ({ ...p, warmth: v }))}
      />

      <SliderField
        label="Shadow Fade (Matte Lift)"
        min={0.0} max={0.6} step={0.02}
        value={params.fade}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange((p) => ({ ...p, fade: v }))}
      />

      <SliderField
        label="S-Curve Contrast"
        min={0.7} max={1.8} step={0.05}
        value={params.contrast}
        format={(v) => `${v.toFixed(2)}`}
        onChange={(v) => onChange((p) => ({ ...p, contrast: v }))}
      />

      <SliderField
        label="Lens Vignette"
        min={0.0} max={1.0} step={0.05}
        value={params.vignette}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => onChange((p) => ({ ...p, vignette: v }))}
      />
    </div>
  );
};

/* --- FILTER 5: HALFTONE CONTROLS --- */
const HalftoneControls: React.FC<{
  params: HalftoneParameters;
  onChange: (updater: (prev: HalftoneParameters) => HalftoneParameters) => void;
}> = ({ params, onChange }) => {
  const modes: Array<{ id: HalftoneParameters['colorMode']; label: string }> = [
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'cyan-magenta', label: 'Duotone' },
    { id: 'monochrome', label: 'Mono Silver' },
    { id: 'spectral', label: 'RGB Spectrum' }
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Color Matrix Mode</label>
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => onChange((p) => ({ ...p, colorMode: m.id }))}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                params.colorMode === m.id
                  ? 'bg-purple-900/40 border-[#5EEAD4] text-[#5EEAD4] font-bold'
                  : 'bg-[#08070D] border-purple-500/20 text-[#A8A1BA] hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <SliderField
        label="Geometric Dot Size"
        min={3} max={14} step={1}
        value={params.dotSize}
        format={(v) => `${v} px`}
        onChange={(v) => onChange((p) => ({ ...p, dotSize: v }))}
      />

      <SliderField
        label="Grid Density"
        min={1} max={4} step={1}
        value={params.gridDensity}
        format={(v) => `${v}×`}
        onChange={(v) => onChange((p) => ({ ...p, gridDensity: v }))}
      />

      <SliderField
        label="Rotational Angle"
        min={0} max={90} step={5}
        value={params.angle}
        format={(v) => `${v}°`}
        onChange={(v) => onChange((p) => ({ ...p, angle: v }))}
      />

      <SliderField
        label="Luminance Contrast"
        min={0.6} max={2.0} step={0.05}
        value={params.contrast}
        format={(v) => `${v.toFixed(2)}`}
        onChange={(v) => onChange((p) => ({ ...p, contrast: v }))}
      />
    </div>
  );
};

/* --- SECTION 7: CUSTOM CONVOLUTION KERNEL PLAYGROUND CONTROLS --- */
const KernelControls: React.FC<{
  params: KernelParameters;
  onChange: (updater: (prev: KernelParameters) => KernelParameters) => void;
}> = ({ params, onChange }) => {
  const sum = computeKernelSum(params.matrix);

  const setCell = (r: number, c: number, val: number) => {
    onChange((p) => {
      const nextMatrix = p.matrix.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? val : cell))
      );
      return { ...p, matrix: nextMatrix };
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset selector */}
      <div>
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Kernel Presets</label>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
          {KERNEL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                onChange(() => ({
                  matrix: preset.matrix.map((r) => [...r]),
                  divisor: preset.divisor,
                  offset: preset.offset,
                  normalize: false
                }))
              }
              className="px-2.5 py-1.5 rounded-lg bg-[#08070D] border border-purple-500/25 hover:border-[#5EEAD4] text-slate-300 hover:text-white transition-all text-left truncate"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3x3 Grid Inputs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">3×3 Tensor Matrix</label>
          <span className="text-xs font-mono text-[#5EEAD4]">
            Sum: <strong className="font-bold">{sum}</strong>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#08070D] border border-purple-500/30">
          {params.matrix.map((row, r) =>
            row.map((val, c) => (
              <input
                key={`${r}-${c}`}
                type="number"
                step="0.5"
                value={val}
                onChange={(e) => setCell(r, c, parseFloat(e.target.value) || 0)}
                className="w-full text-center py-2 rounded bg-[#14101F] border border-purple-500/30 text-white font-mono text-xs focus:border-[#5EEAD4] focus:outline-none"
              />
            ))
          )}
        </div>
      </div>

      {/* Math settings */}
      <div className="space-y-3 p-3 rounded-xl bg-[#08070D] border border-purple-500/25 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Divisor:</span>
          <input
            type="number"
            step="1"
            value={params.divisor}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 1;
              onChange((p) => ({ ...p, divisor: val }));
            }}
            className="w-20 text-right px-2 py-1 rounded bg-[#14101F] border border-purple-500/30 text-white"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Bias Offset:</span>
          <input
            type="number"
            step="5"
            value={params.offset}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              onChange((p) => ({ ...p, offset: val }));
            }}
            className="w-20 text-right px-2 py-1 rounded bg-[#14101F] border border-purple-500/30 text-white"
          />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-slate-400">Auto Normalize:</span>
          <input
            type="checkbox"
            checked={params.normalize}
            onChange={(e) => onChange((p) => ({ ...p, normalize: e.target.checked }))}
            className="w-4 h-4 accent-[#5EEAD4] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

/* --- REUSABLE SLIDER FIELD --- */
const SliderField: React.FC<{
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (v: number) => string;
  onChange: (val: number) => void;
}> = ({ label, min, max, step, value, format, onChange }) => {
  return (
    <div className="space-y-1.5 font-mono">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-[#5EEAD4] font-semibold">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-[#08070D] rounded-lg appearance-none cursor-pointer accent-[#EC38BC]"
      />
    </div>
  );
};
