import React from 'react';
import { Smartphone, ImageIcon } from 'lucide-react';
import type { VideoProject, RecordingState } from '../types';

interface PreviewProps {
  project: VideoProject;
  recordingState: RecordingState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onVideoEnded: () => void;
}

export function Preview({
  project,
  recordingState,
  videoRef,
  imageRef,
  canvasRef,
  audioRef,
  onVideoEnded,
}: PreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone Frame Header */}
      <div className="flex items-center gap-2 text-gray-400">
        <Smartphone size={16} />
        <span className="text-xs font-medium uppercase tracking-wider">Canlı Önizleme</span>
        {recordingState.status === 'recording' && (
          <span className="flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-red-500/20 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400 font-bold">REC</span>
          </span>
        )}
        {recordingState.status === 'recording' && project.audioSrc && (
          <span className="flex items-center gap-1 ml-1 px-2 py-0.5 bg-pink-500/20 rounded-full">
            <span className="text-[10px]">🎵</span>
            <span className="text-xs text-pink-400 font-bold">MÜZİK</span>
          </span>
        )}
      </div>

      {/* Phone Frame */}
      <div className="relative">
        {/* Phone bezel */}
        <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] p-3 shadow-2xl shadow-black/50">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />

          {/* Screen */}
          <div className="relative w-[280px] h-[500px] rounded-[2rem] overflow-hidden bg-black">
            {/* Top Text */}
            <div
              className="w-full text-center px-3 py-3 font-black"
              style={{
                backgroundColor: project.topBgColor,
                color: project.topTextColor,
                fontSize: `${Math.max(project.topFontSize * 0.39, 10)}px`,
                lineHeight: 1.2,
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textShadow: project.textShadow ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {project.topText.toUpperCase() || 'Üst Yazı'}
            </div>

            {/* Image Area */}
            <div className="w-full h-[155px] bg-black flex items-center justify-center overflow-hidden">
              {project.imageSrc ? (
                <img
                  src={project.imageSrc}
                  alt="Content"
                  className="w-full h-full object-contain"
                  style={{
                    filter: `brightness(${project.imageBrightness}%) contrast(${project.imageContrast}%) saturate(${project.imageSaturation}%)`,
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-600">
                  <ImageIcon size={24} />
                  <span className="text-xs">Görsel Seçin</span>
                </div>
              )}
            </div>

            {/* Bottom Text */}
            <div
              className="w-full text-center px-3 py-2.5 font-bold"
              style={{
                backgroundColor: project.bottomBgColor,
                color: project.bottomTextColor,
                fontSize: `${Math.max(project.bottomFontSize * 0.39, 10)}px`,
                lineHeight: 1.2,
                minHeight: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textShadow: project.textShadow ? '1px 1px 2px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {project.bottomText || 'Alt Yazı'}
            </div>

            {/* Video Area */}
            <div className="flex-1 w-full bg-gray-950" style={{ height: '260px' }}>
              {project.videoSrc ? (
                <video
                  ref={videoRef}
                  src={project.videoSrc}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onEnded={onVideoEnded}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
                      <span className="text-lg">▶</span>
                    </div>
                    <span className="text-xs">Video Seçin</span>
                  </div>
                </div>
              )}
            </div>

            {/* Watermark Preview */}
            {project.watermark && (
              <div
                className="absolute text-white text-[10px] font-semibold pointer-events-none"
                style={{
                  opacity: project.watermarkOpacity / 100,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  ...(project.watermarkPosition.includes('top')
                    ? { top: '48px' }
                    : { bottom: '8px' }),
                  ...(project.watermarkPosition.includes('left')
                    ? { left: '12px' }
                    : { right: '12px' }),
                }}
              >
                {project.watermark}
              </div>
            )}

            {/* Audio indicator */}
            {project.audioSrc && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full">
                <span className="text-[10px]">🎵</span>
                <span className="text-[9px] text-gray-300 truncate max-w-[80px]">
                  {project.audioName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reflection effect */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* ===== GİZLİ ELEMENTLER (Kayıt motoru için) ===== */}

      {/* Render canvas - her zaman DOM'da */}
      <canvas ref={canvasRef} width={720} height={1280} className="hidden" />

      {/* Resim (canvas'a çizmek için) - her zaman DOM'da */}
      <img
        ref={imageRef}
        src={project.imageSrc || ''}
        alt=""
        className="hidden"
        crossOrigin="anonymous"
      />

      {/* Ses elementi (önizleme play/pause için) - HER ZAMAN DOM'da olmalı */}
      <audio
        ref={audioRef}
        src={project.audioSrc || ''}
        preload="auto"
        className="hidden"
      />
    </div>
  );
}
