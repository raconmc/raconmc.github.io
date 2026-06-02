import { Sparkles, RotateCcw, Eye, Type } from 'lucide-react';
import type { VideoProject } from '../types';
import { DEFAULT_PROJECT } from '../types';

interface StylePanelProps {
  project: VideoProject;
  onChange: (updates: Partial<VideoProject>) => void;
}

const PRESETS = [
  {
    name: '🔴 YouTube Klasik',
    topTextColor: '#ff0000',
    topBgColor: '#ffffff',
    bottomTextColor: '#000000',
    bottomBgColor: '#ffffff',
  },
  {
    name: '🌙 Gece Modu',
    topTextColor: '#60a5fa',
    topBgColor: '#1e293b',
    bottomTextColor: '#a5b4fc',
    bottomBgColor: '#1e293b',
  },
  {
    name: '🔥 Ateş',
    topTextColor: '#ffffff',
    topBgColor: '#dc2626',
    bottomTextColor: '#ffffff',
    bottomBgColor: '#ea580c',
  },
  {
    name: '💚 Yeşil Enerji',
    topTextColor: '#ffffff',
    topBgColor: '#059669',
    bottomTextColor: '#ffffff',
    bottomBgColor: '#10b981',
  },
  {
    name: '💜 Mor Rüya',
    topTextColor: '#ffffff',
    topBgColor: '#7c3aed',
    bottomTextColor: '#ffffff',
    bottomBgColor: '#a855f7',
  },
  {
    name: '⚡ Elektrik',
    topTextColor: '#fbbf24',
    topBgColor: '#1f2937',
    bottomTextColor: '#34d399',
    bottomBgColor: '#1f2937',
  },
  {
    name: '🌸 Sakura',
    topTextColor: '#be185d',
    topBgColor: '#fce7f3',
    bottomTextColor: '#9d174d',
    bottomBgColor: '#fbcfe8',
  },
  {
    name: '🌊 Okyanus',
    topTextColor: '#ffffff',
    topBgColor: '#0369a1',
    bottomTextColor: '#ffffff',
    bottomBgColor: '#0284c7',
  },
  {
    name: '🖤 Karanlık',
    topTextColor: '#ffffff',
    topBgColor: '#18181b',
    bottomTextColor: '#a1a1aa',
    bottomBgColor: '#27272a',
  },
  {
    name: '💛 Güneş',
    topTextColor: '#713f12',
    topBgColor: '#fef08a',
    bottomTextColor: '#854d0e',
    bottomBgColor: '#fde047',
  },
  {
    name: '🩵 Turkuaz',
    topTextColor: '#ffffff',
    topBgColor: '#0891b2',
    bottomTextColor: '#ffffff',
    bottomBgColor: '#06b6d4',
  },
  {
    name: '🩷 Neon',
    topTextColor: '#f0abfc',
    topBgColor: '#0f0f23',
    bottomTextColor: '#67e8f9',
    bottomBgColor: '#0f0f23',
  },
];

export function StylePanel({ project, onChange }: StylePanelProps) {
  const applyPreset = (preset: typeof PRESETS[0]) => {
    onChange({
      topTextColor: preset.topTextColor,
      topBgColor: preset.topBgColor,
      bottomTextColor: preset.bottomTextColor,
      bottomBgColor: preset.bottomBgColor,
    });
  };

  const resetAll = () => {
    onChange({
      topTextColor: DEFAULT_PROJECT.topTextColor,
      topBgColor: DEFAULT_PROJECT.topBgColor,
      topFontSize: DEFAULT_PROJECT.topFontSize,
      bottomTextColor: DEFAULT_PROJECT.bottomTextColor,
      bottomBgColor: DEFAULT_PROJECT.bottomBgColor,
      bottomFontSize: DEFAULT_PROJECT.bottomFontSize,
      imageBrightness: DEFAULT_PROJECT.imageBrightness,
      imageContrast: DEFAULT_PROJECT.imageContrast,
      imageSaturation: DEFAULT_PROJECT.imageSaturation,
      textShadow: DEFAULT_PROJECT.textShadow,
      watermarkOpacity: DEFAULT_PROJECT.watermarkOpacity,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Presets */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <h3 className="font-bold text-white text-sm">Hazır Temalar</h3>
          </div>
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-dark-500"
          >
            <RotateCcw size={12} />
            Sıfırla
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyPreset(preset)}
              className="text-left p-3 bg-dark-800 rounded-xl border border-dark-400 hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full border border-dark-300"
                  style={{ backgroundColor: preset.topBgColor }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-dark-300"
                  style={{ backgroundColor: preset.topTextColor }}
                />
              </div>
              <p className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                {preset.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Text Effects */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Type size={16} className="text-indigo-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Yazı Efektleri</h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Gölge Efekti</span>
          <button
            onClick={() => onChange({ textShadow: !project.textShadow })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              project.textShadow ? 'bg-emerald-500' : 'bg-dark-500'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                project.textShadow ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Watermark */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Eye size={16} className="text-cyan-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Filigran (Watermark)</h3>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Filigran Metni
          </label>
          <input
            type="text"
            value={project.watermark}
            onChange={(e) => onChange({ watermark: e.target.value })}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-400 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none input-glow transition-all"
            placeholder="@kanaladi"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Konum
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => onChange({ watermarkPosition: pos })}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  project.watermarkPosition === pos
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-dark-800 text-gray-400 border border-dark-400 hover:border-dark-300'
                }`}
              >
                {pos === 'top-left' && '↖ Sol Üst'}
                {pos === 'top-right' && '↗ Sağ Üst'}
                {pos === 'bottom-left' && '↙ Sol Alt'}
                {pos === 'bottom-right' && '↘ Sağ Alt'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Opaklık: {project.watermarkOpacity}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={project.watermarkOpacity}
            onChange={(e) => onChange({ watermarkOpacity: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
