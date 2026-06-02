import { Download, Monitor, Gauge, Zap, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { VideoProject, RecordingState } from '../types';

interface ExportPanelProps {
  project: VideoProject;
  onChange: (updates: Partial<VideoProject>) => void;
  recordingState: RecordingState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetState: () => void;
}

const QUALITY_OPTIONS = [
  { value: 'low' as const, label: '360p', desc: 'Hızlı işlem', size: '~5 MB/dk', icon: '📱' },
  { value: 'medium' as const, label: '540p', desc: 'Dengeli', size: '~12 MB/dk', icon: '💻' },
  { value: 'high' as const, label: '720p HD', desc: 'Yüksek kalite', size: '~25 MB/dk', icon: '🖥️' },
  { value: 'ultra' as const, label: '1080p FHD', desc: 'En yüksek', size: '~50 MB/dk', icon: '🎬' },
];

const FPS_OPTIONS = [
  { value: 15, label: '15', desc: 'Düşük' },
  { value: 24, label: '24', desc: 'Film' },
  { value: 30, label: '30', desc: 'Normal' },
  { value: 60, label: '60', desc: 'Akıcı' },
];

export function ExportPanel({
  project,
  onChange,
  recordingState,
  onStartRecording,
  onStopRecording,
  onResetState,
}: ExportPanelProps) {
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isDisabled = recordingState.status === 'recording' || recordingState.status === 'preparing' || recordingState.status === 'processing';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quality Selection */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Monitor size={16} className="text-cyan-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Çözünürlük</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ outputQuality: opt.value })}
              disabled={isDisabled}
              className={`p-3 rounded-xl text-left transition-all ${
                project.outputQuality === opt.value
                  ? 'bg-emerald-500/20 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-dark-800 border-2 border-transparent hover:border-dark-300'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-lg mb-1">{opt.icon}</div>
              <p className={`text-sm font-bold ${project.outputQuality === opt.value ? 'text-emerald-400' : 'text-white'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{opt.size}</p>
            </button>
          ))}
        </div>
      </div>

      {/* FPS Selection */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Gauge size={16} className="text-violet-400" />
          </div>
          <h3 className="font-bold text-white text-sm">Kare Hızı (FPS)</h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {FPS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ outputFPS: opt.value })}
              disabled={isDisabled}
              className={`py-3 rounded-xl text-center transition-all ${
                project.outputFPS === opt.value
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-dark-800 border border-dark-400 text-gray-400 hover:border-dark-300 hover:text-white'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <p className="font-bold">{opt.label}</p>
              <p className="text-[10px] text-gray-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {recordingState.status === 'preparing' && (
        <div className="glass-card rounded-2xl p-5 border-blue-500/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="text-blue-400 animate-spin" />
            <div>
              <h3 className="font-bold text-blue-400 text-sm">Hazırlanıyor...</h3>
              <p className="text-xs text-gray-500">Video ve ses kaynakları ayarlanıyor</p>
            </div>
          </div>
        </div>
      )}

      {recordingState.status === 'recording' && (
        <div className="glass-card rounded-2xl p-5 space-y-4 border-red-500/30 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h3 className="font-bold text-red-400 text-sm">Kaydediliyor...</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(recordingState.currentTime)}</span>
              <span>{formatTime(recordingState.duration)}</span>
            </div>
            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(recordingState.progress, 100)}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-500">
              %{recordingState.progress.toFixed(1)} tamamlandı
            </p>
          </div>
        </div>
      )}

      {recordingState.status === 'processing' && (
        <div className="glass-card rounded-2xl p-5 border-amber-500/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="text-amber-400 animate-spin" />
            <div>
              <h3 className="font-bold text-amber-400 text-sm">İşleniyor...</h3>
              <p className="text-xs text-gray-500">Video dosyası oluşturuluyor</p>
            </div>
          </div>
        </div>
      )}

      {recordingState.status === 'done' && (
        <div className="glass-card rounded-2xl p-5 border-emerald-500/30 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-400 text-sm">Tamamlandı!</h3>
                <p className="text-xs text-gray-500">Video indirilmeye başladı</p>
              </div>
            </div>
            <button
              onClick={onResetState}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-dark-600 transition-colors"
            >
              Yeni Video
            </button>
          </div>
        </div>
      )}

      {recordingState.status === 'error' && (
        <div className="glass-card rounded-2xl p-5 border-red-500/30 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-red-400 text-sm">Hata Oluştu</h3>
                <p className="text-xs text-gray-500">{recordingState.errorMessage || 'Bilinmeyen hata'}</p>
              </div>
            </div>
            <button
              onClick={onResetState}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-dark-600 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="space-y-3">
        {recordingState.status !== 'recording' && recordingState.status !== 'processing' ? (
          <button
            onClick={onStartRecording}
            disabled={!project.videoSrc || recordingState.status === 'preparing'}
            className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
              project.videoSrc && recordingState.status !== 'preparing'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98]'
                : 'bg-dark-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            {recordingState.status === 'preparing' ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Hazırlanıyor...
              </>
            ) : (
              <>
                <Download size={20} />
                Videoyu Oluştur ve İndir
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-xl shadow-red-500/25 active:scale-[0.98] transition-all animate-pulse"
          >
            <Zap size={20} />
            Kaydı Durdur
          </button>
        )}

        {!project.videoSrc && recordingState.status === 'idle' && (
          <p className="text-center text-xs text-amber-400/70">
            ⚠️ Dışa aktarmak için önce bir video yükleyin
          </p>
        )}
      </div>

      {/* Audio status */}
      {project.audioSrc && (
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🎵</span>
            <h4 className="text-sm font-bold text-pink-400">Müzik Dahil Edilecek</h4>
          </div>
          <div className="text-xs text-pink-200/70 space-y-0.5">
            <p>• <strong>{project.audioName}</strong></p>
            <p>• Ses: %{project.audioVolume} | Başlangıç: {project.audioStartTime}s</p>
            {project.audioFadeIn > 0 && <p>• Fade In: {project.audioFadeIn}s</p>}
            {project.audioFadeOut > 0 && <p>• Fade Out: {project.audioFadeOut}s</p>}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-dark-800/50 rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bilgi</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Video süresi, yüklenen videonun süresi kadar olacaktır</li>
          <li>• Müzik arka plan müziği olarak videoya gömülür</li>
          <li>• Ses dosyası <strong>AudioBuffer</strong> ile decode edilir (güvenilir)</li>
          <li>• Tarayıcınız WebM formatını destekler</li>
          <li>• Yüksek kalite daha uzun işlem süresi gerektirir</li>
        </ul>
      </div>
    </div>
  );
}
