import { Type, Palette } from 'lucide-react';
import type { VideoProject } from '../types';

interface TextPanelProps {
  project: VideoProject;
  onChange: (updates: Partial<VideoProject>) => void;
}

export function TextPanel({ project, onChange }: TextPanelProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Text Section */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Type size={16} className="text-red-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Üst Yazı</h3>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Metin
          </label>
          <input
            type="text"
            value={project.topText}
            onChange={(e) => onChange({ topText: e.target.value })}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-400 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none input-glow transition-all"
            placeholder="Üst yazınızı girin..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Yazı Rengi
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.topTextColor}
                onChange={(e) => onChange({ topTextColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-dark-400"
              />
              <input
                type="text"
                value={project.topTextColor}
                onChange={(e) => onChange({ topTextColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-dark-800 border border-dark-400 rounded-lg text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Arka Plan
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.topBgColor}
                onChange={(e) => onChange({ topBgColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-dark-400"
              />
              <input
                type="text"
                value={project.topBgColor}
                onChange={(e) => onChange({ topBgColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-dark-800 border border-dark-400 rounded-lg text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Yazı Boyutu: {project.topFontSize}px
          </label>
          <input
            type="range"
            min="20"
            max="72"
            value={project.topFontSize}
            onChange={(e) => onChange({ topFontSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Bottom Text Section */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Palette size={16} className="text-blue-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Alt Yazı</h3>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Metin
          </label>
          <input
            type="text"
            value={project.bottomText}
            onChange={(e) => onChange({ bottomText: e.target.value })}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-400 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none input-glow transition-all"
            placeholder="Alt yazınızı girin..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Yazı Rengi
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.bottomTextColor}
                onChange={(e) => onChange({ bottomTextColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-dark-400"
              />
              <input
                type="text"
                value={project.bottomTextColor}
                onChange={(e) => onChange({ bottomTextColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-dark-800 border border-dark-400 rounded-lg text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Arka Plan
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={project.bottomBgColor}
                onChange={(e) => onChange({ bottomBgColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-dark-400"
              />
              <input
                type="text"
                value={project.bottomBgColor}
                onChange={(e) => onChange({ bottomBgColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-dark-800 border border-dark-400 rounded-lg text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Yazı Boyutu: {project.bottomFontSize}px
          </label>
          <input
            type="range"
            min="20"
            max="72"
            value={project.bottomFontSize}
            onChange={(e) => onChange({ bottomFontSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
