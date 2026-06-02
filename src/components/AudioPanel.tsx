import { useRef, useState, useEffect } from 'react';
import { Music, Upload, X, Volume2, VolumeX, Play, Pause, Clock, Waves } from 'lucide-react';
import type { VideoProject } from '../types';

interface AudioPanelProps {
  project: VideoProject;
  onChange: (updates: Partial<VideoProject>) => void;
  onAudioLoad: (url: string, name: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function AudioPanel({ project, onChange, onAudioLoad, audioRef }: AudioPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioRef, project.audioSrc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ audioSrc: url, audioName: file.name, audioStartTime: 0 });
      onAudioLoad(url, file.name);
    }
  };

  const removeAudio = () => {
    if (project.audioSrc) {
      URL.revokeObjectURL(project.audioSrc);
    }
    onChange({ audioSrc: null, audioName: '', audioStartTime: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setAudioDuration(0);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !project.audioSrc) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio && audioDuration) {
      const time = (Number(e.target.value) / 100) * audioDuration;
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Music Upload */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Music size={16} className="text-pink-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Arka Plan Müziği</h3>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {project.audioSrc ? (
          <div className="space-y-4">
            {/* Audio Info */}
            <div className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Waves size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{project.audioName}</p>
                <p className="text-xs text-gray-500">{formatTime(audioDuration)} süre</p>
              </div>
              <button
                onClick={removeAudio}
                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Audio Player */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={18} className="text-white" />
                  ) : (
                    <Play size={18} className="text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioDuration ? (currentTime / audioDuration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">
                  {formatTime(currentTime)} / {formatTime(audioDuration)}
                </span>
              </div>
            </div>

            {/* Change Audio Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-dark-600 rounded-xl text-sm text-gray-300 hover:bg-dark-500 transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={14} />
              Müziği Değiştir
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-10 border-2 border-dashed border-dark-400 rounded-xl flex flex-col items-center gap-3 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-dark-600 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
              <Music size={20} className="text-gray-400 group-hover:text-pink-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300 font-medium">Müzik Yükle</p>
              <p className="text-xs text-gray-500 mt-1">MP3, WAV, OGG, M4A</p>
            </div>
          </button>
        )}
      </div>

      {/* Audio Settings */}
      {project.audioSrc && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Volume2 size={16} className="text-emerald-400" />
            Ses Ayarları
          </h3>

          {/* Audio Volume */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Müzik Sesi: {project.audioVolume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={project.audioVolume}
              onChange={(e) => {
                const vol = Number(e.target.value);
                onChange({ audioVolume: vol });
                if (audioRef.current) {
                  audioRef.current.volume = vol / 100;
                }
              }}
              className="w-full"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} />
              Başlangıç Zamanı: {formatTime(project.audioStartTime)}
            </label>
            <input
              type="range"
              min="0"
              max={Math.max(audioDuration - 1, 0)}
              step="0.5"
              value={project.audioStartTime}
              onChange={(e) => onChange({ audioStartTime: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Fade In */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Fade In: {project.audioFadeIn}s
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={project.audioFadeIn}
              onChange={(e) => onChange({ audioFadeIn: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Fade Out */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Fade Out: {project.audioFadeOut}s
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={project.audioFadeOut}
              onChange={(e) => onChange({ audioFadeOut: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Video Audio Settings */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Volume2 size={16} className="text-blue-400" />
          Video Sesi
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Video sesi</span>
          <button
            onClick={() => onChange({ videoMuted: !project.videoMuted })}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              project.videoMuted 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {project.videoMuted ? (
              <>
                <VolumeX size={14} />
                <span className="text-xs font-medium">Kapalı</span>
              </>
            ) : (
              <>
                <Volume2 size={14} />
                <span className="text-xs font-medium">Açık</span>
              </>
            )}
          </button>
        </div>

        {!project.videoMuted && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Video Sesi: {project.videoVolume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={project.videoVolume}
              onChange={(e) => onChange({ videoVolume: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <h4 className="text-sm font-bold text-amber-400 mb-2">💡 İpuçları</h4>
        <ul className="text-xs text-amber-200/80 space-y-1">
          <li>• Müzik ve video sesi birlikte kaydedilir</li>
          <li>• Başlangıç zamanı ile müziğin hangi saniyeden başlayacağını seçin</li>
          <li>• Fade in/out ile yumuşak geçişler ekleyin</li>
          <li>• Telif haksız müzikler kullanmaya özen gösterin</li>
        </ul>
      </div>
    </div>
  );
}
