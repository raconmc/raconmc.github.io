export interface VideoProject {
  id: string;
  name: string;
  topText: string;
  topTextColor: string;
  topBgColor: string;
  topFontSize: number;
  bottomText: string;
  bottomTextColor: string;
  bottomBgColor: string;
  bottomFontSize: number;
  imageSrc: string | null;
  imageFilter: string;
  imageBrightness: number;
  imageContrast: number;
  imageSaturation: number;
  videoSrc: string | null;
  videoVolume: number;
  videoMuted: boolean;
  audioSrc: string | null;
  audioName: string;
  audioVolume: number;
  audioStartTime: number;
  audioFadeIn: number;
  audioFadeOut: number;
  outputQuality: 'low' | 'medium' | 'high' | 'ultra';
  outputFPS: number;
  watermark: string;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  watermarkOpacity: number;
  textShadow: boolean;
  createdAt: number;
}

export interface RecordingState {
  isRecording: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  status: 'idle' | 'preparing' | 'recording' | 'processing' | 'done' | 'error';
  errorMessage?: string;
}

export interface AudioTrack {
  src: string;
  name: string;
  duration: number;
}

export type TabType = 'text' | 'media' | 'audio' | 'style' | 'export' | 'youtube';

export const DEFAULT_PROJECT: Omit<VideoProject, 'id' | 'createdAt'> = {
  name: 'Yeni Proje',
  topText: 'ABONE OLMAYI UNUTMA',
  topTextColor: '#ff0000',
  topBgColor: '#ffffff',
  topFontSize: 46,
  bottomText: 'Hemen Sende Beğen',
  bottomTextColor: '#000000',
  bottomBgColor: '#ffffff',
  bottomFontSize: 42,
  imageSrc: null,
  imageFilter: 'none',
  imageBrightness: 100,
  imageContrast: 100,
  imageSaturation: 100,
  videoSrc: null,
  videoVolume: 100,
  videoMuted: true,
  audioSrc: null,
  audioName: '',
  audioVolume: 80,
  audioStartTime: 0,
  audioFadeIn: 0,
  audioFadeOut: 0,
  outputQuality: 'high',
  outputFPS: 30,
  watermark: '',
  watermarkPosition: 'bottom-right',
  watermarkOpacity: 50,
  textShadow: true,
};
