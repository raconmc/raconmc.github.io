import { useRef } from 'react';
import { Image, Film, Upload, X } from 'lucide-react';
import type { VideoProject } from '../types';

interface MediaPanelProps {
  project: VideoProject;
  onChange: (updates: Partial<VideoProject>) => void;
  onVideoLoad: (url: string) => void;
  onImageLoad: (url: string) => void;
}

export function MediaPanel({ project, onChange, onVideoLoad, onImageLoad }: MediaPanelProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        onChange({ imageSrc: src });
        onImageLoad(src);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ videoSrc: url });
      onVideoLoad(url);
    }
  };

  const removeImage = () => {
    onChange({ imageSrc: null });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeVideo = () => {
    onChange({ videoSrc: null });
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Image Upload */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Image size={16} className="text-purple-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Görsel (Tweet/Resim)</h3>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {project.imageSrc ? (
          <div className="relative group">
            <img
              src={project.imageSrc}
              alt="Preview"
              className="w-full h-40 object-contain bg-dark-800 rounded-xl"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full py-10 border-2 border-dashed border-dark-400 rounded-xl flex flex-col items-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-dark-600 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Upload size={20} className="text-gray-400 group-hover:text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300 font-medium">Görsel Yükle</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
            </div>
          </button>
        )}

        {project.imageSrc && (
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full py-2.5 bg-dark-600 rounded-xl text-sm text-gray-300 hover:bg-dark-500 transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={14} />
            Görseli Değiştir
          </button>
        )}

        {/* Image adjustments */}
        {project.imageSrc && (
          <div className="space-y-3 pt-2 border-t border-dark-400">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Parlaklık: {project.imageBrightness}%
              </label>
              <input
                type="range"
                min="20"
                max="200"
                value={project.imageBrightness}
                onChange={(e) => onChange({ imageBrightness: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Kontrast: {project.imageContrast}%
              </label>
              <input
                type="range"
                min="20"
                max="200"
                value={project.imageContrast}
                onChange={(e) => onChange({ imageContrast: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Doygunluk: {project.imageSaturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={project.imageSaturation}
                onChange={(e) => onChange({ imageSaturation: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Film size={16} className="text-orange-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Arka Plan Videosu</h3>
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/mov"
          onChange={handleVideoChange}
          className="hidden"
        />

        {project.videoSrc ? (
          <div className="relative group">
            <div className="w-full h-32 bg-dark-800 rounded-xl flex items-center justify-center overflow-hidden">
              <video
                src={project.videoSrc}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            </div>
            <button
              onClick={removeVideo}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X size={14} className="text-white" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-md text-xs text-emerald-400 font-medium">
              ✓ Video Yüklendi
            </div>
          </div>
        ) : (
          <button
            onClick={() => videoInputRef.current?.click()}
            className="w-full py-10 border-2 border-dashed border-dark-400 rounded-xl flex flex-col items-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-dark-600 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Film size={20} className="text-gray-400 group-hover:text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300 font-medium">Video Yükle</p>
              <p className="text-xs text-gray-500 mt-1">MP4, WEBM, MOV</p>
            </div>
          </button>
        )}

        {project.videoSrc && (
          <button
            onClick={() => videoInputRef.current?.click()}
            className="w-full py-2.5 bg-dark-600 rounded-xl text-sm text-gray-300 hover:bg-dark-500 transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={14} />
            Videoyu Değiştir
          </button>
        )}
      </div>
    </div>
  );
}
