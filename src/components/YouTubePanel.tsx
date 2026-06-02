import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, RefreshCw, Upload, LogIn, LogOut, Check,
  AlertCircle, Loader2, Copy, ExternalLink, Hash,
  Type, FileText, Wand2,
} from 'lucide-react';
import type { VideoProject } from '../types';
import { generateShortsContent, type GeneratedContent } from '../services/geminiService';
import {
  isAuthenticated, startOAuthFlow, getChannelInfo,
  logout, uploadVideo, type YouTubeChannel, type UploadProgress,
} from '../services/youtubeService';

function YtIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface Props {
  project: VideoProject;
  lastRecordedBlob: Blob | null;
}

export function YouTubePanel({ project, lastRecordedBlob }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ status: 'idle', progress: 0, message: '' });
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      getChannelInfo().then(setChannel);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const g = await generateShortsContent(project.topText, project.bottomText, !!project.audioSrc, project.audioName);
      setContent(g);
      setEditedTitle(g.title);
      setEditedDesc(g.description);
      setEditedTags(g.tags);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Hata');
    } finally {
      setIsGenerating(false);
    }
  }, [project]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await startOAuthFlow();
      setIsLoggedIn(true);
      setChannel(await getChannelInfo());
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Giriş başarısız');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => { logout(); setIsLoggedIn(false); setChannel(null); };

  const handleUpload = async () => {
    if (!lastRecordedBlob || !editedTitle) return;
    try {
      await uploadVideo(lastRecordedBlob, editedTitle, editedDesc, editedTags, setUploadProgress);
    } catch (e) { console.error(e); }
  };

  const addTag = () => {
    const t = newTag.trim().replace(/^#/, '');
    if (t && !editedTags.includes(t)) { setEditedTags([...editedTags, t]); setNewTag(''); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Account */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <YtIcon size={16} className="text-red-400" />
          </div>
          <h3 className="font-bold text-white text-sm">YouTube Hesabı</h3>
        </div>

        {isLoggedIn && channel ? (
          <div className="flex items-center justify-between p-3 bg-dark-800 rounded-xl">
            <div className="flex items-center gap-3">
              {channel.thumbnail && <img src={channel.thumbnail} alt="" className="w-10 h-10 rounded-full" />}
              <div>
                <p className="text-sm font-medium text-white">{channel.title}</p>
                <p className="text-xs text-gray-500">{channel.subscriberCount} abone</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Çıkış"><LogOut size={16} /></button>
          </div>
        ) : (
          <div className="space-y-3">
            <button onClick={handleLogin} disabled={isLoggingIn} className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              {isLoggingIn ? <><Loader2 size={18} className="animate-spin" />Giriş yapılıyor...</> : <><LogIn size={18} />Google ile Giriş Yap</>}
            </button>
            {loginError && <p className="text-xs text-red-400 text-center">{loginError}</p>}
          </div>
        )}
      </div>

      {/* AI */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Wand2 size={16} className="text-purple-400" /></div>
            <h3 className="font-bold text-white text-sm">AI İçerik Oluşturucu</h3>
          </div>
          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">Gemini AI</span>
        </div>
        <button onClick={handleGenerate} disabled={isGenerating || !project.topText} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-800 disabled:to-pink-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
          {isGenerating ? <><Loader2 size={18} className="animate-spin" />Oluşturuluyor...</> : <><Sparkles size={18} />Başlık &amp; Etiket Oluştur</>}
        </button>
        {genError && <p className="text-xs text-red-400 text-center">{genError}</p>}
        {!project.topText && <p className="text-xs text-amber-400/70 text-center">⚠️ İçerik oluşturmak için metin ekleyin</p>}
      </div>

      {/* Editor */}
      {content && (
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><FileText size={16} className="text-emerald-400" /></div>
            <h3 className="font-bold text-white text-sm">Video Bilgileri</h3>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1"><Type size={12} />Başlık</label>
              <button onClick={() => navigator.clipboard.writeText(editedTitle)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1"><Copy size={10} />Kopyala</button>
            </div>
            <input type="text" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} maxLength={100} className="w-full px-4 py-3 bg-dark-800 border border-dark-400 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
            <p className="text-[10px] text-gray-500 mt-1 text-right">{editedTitle.length}/100</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1"><FileText size={12} />Açıklama</label>
              <button onClick={() => navigator.clipboard.writeText(editedDesc)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1"><Copy size={10} />Kopyala</button>
            </div>
            <textarea value={editedDesc} onChange={e => setEditedDesc(e.target.value)} maxLength={5000} rows={4} className="w-full px-4 py-3 bg-dark-800 border border-dark-400 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none resize-none" />
            <p className="text-[10px] text-gray-500 mt-1 text-right">{editedDesc.length}/5000</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5"><Hash size={12} />Etiketler</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {editedTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded-lg group">
                  #{tag}
                  <button onClick={() => setEditedTags(editedTags.filter(t => t !== tag))} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Yeni etiket..." className="flex-1 px-3 py-2 bg-dark-800 border border-dark-400 rounded-lg text-white text-sm focus:border-emerald-500 focus:outline-none" />
              <button onClick={addTag} className="px-3 py-2 bg-dark-600 hover:bg-dark-500 rounded-lg text-gray-300 text-sm">Ekle</button>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-xl text-sm flex items-center justify-center gap-2">
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />Yeniden Oluştur
          </button>
        </div>
      )}

      {/* Upload */}
      {isLoggedIn && content && (
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center"><Upload size={16} className="text-red-400" /></div>
            <h3 className="font-bold text-white text-sm">YouTube'a Yükle</h3>
          </div>

          {lastRecordedBlob ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Check size={16} className="text-emerald-400" />
              <span className="text-sm text-emerald-400">Video hazır ({(lastRecordedBlob.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertCircle size={16} className="text-amber-400" />
              <span className="text-sm text-amber-400">Önce "Dışa Aktar" sekmesinden video oluşturun</span>
            </div>
          )}

          {uploadProgress.status === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400"><span>{uploadProgress.message}</span><span>%{uploadProgress.progress}</span></div>
              <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all" style={{ width: `${uploadProgress.progress}%` }} />
              </div>
            </div>
          )}

          {uploadProgress.status === 'done' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2"><Check size={18} className="text-emerald-400" /><span className="font-bold text-emerald-400">Yükleme Başarılı!</span></div>
              {uploadProgress.videoUrl && <a href={uploadProgress.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"><ExternalLink size={14} />Videoyu İzle</a>}
            </div>
          )}

          {uploadProgress.status === 'error' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-sm text-red-400">{uploadProgress.message}</span>
            </div>
          )}

          <button onClick={handleUpload} disabled={!lastRecordedBlob || !editedTitle || uploadProgress.status === 'uploading'} className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-red-800 disabled:to-red-700 text-white rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
            {uploadProgress.status === 'uploading' ? <><Loader2 size={20} className="animate-spin" />Yükleniyor... %{uploadProgress.progress}</> : <><YtIcon size={20} />YouTube'a Yükle</>}
          </button>
        </div>
      )}

      <div className="bg-dark-800/50 rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nasıl Çalışır?</h4>
        <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
          <li>Google hesabınızla giriş yapın</li>
          <li>AI ile başlık ve etiketler oluşturun</li>
          <li>"Dışa Aktar" sekmesinde video oluşturun</li>
          <li>YouTube'a yükleyin!</li>
        </ol>
      </div>
    </div>
  );
}
