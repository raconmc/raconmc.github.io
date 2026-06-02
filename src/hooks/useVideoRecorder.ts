import { useRef, useState, useCallback } from 'react';
import type { RecordingState, VideoProject } from '../types';

const INITIAL_STATE: RecordingState = {
  isRecording: false,
  currentTime: 0,
  duration: 0,
  progress: 0,
  status: 'idle',
};

async function fetchAudioBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return ctx.decodeAudioData(buf);
}

export function useVideoRecorder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const animRef = useRef(0);
  const chunksRef = useRef<Blob[]>([]);
  const activeRef = useRef(false);
  const acRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);
  const lastBlobRef = useRef<Blob | null>(null);

  const [recordingState, setRecordingState] = useState<RecordingState>(INITIAL_STATE);

  /* ─── CANVAS DRAW ─── */
  const drawFrame = useCallback((p: VideoProject) => {
    if (!activeRef.current) return;
    const cv = canvasRef.current;
    const vid = videoRef.current;
    const img = imageRef.current;
    if (!cv) return;
    const c = cv.getContext('2d');
    if (!c) return;
    const w = cv.width, h = cv.height, s = w / 720;

    c.fillStyle = '#000';
    c.fillRect(0, 0, w, h);

    const tH = Math.round(h * 0.102);
    const iH = Math.round(h * 0.39);
    const bH = Math.round(h * 0.086);
    const vY = tH + iH + bH;
    const vH = h - vY;

    // top text
    c.fillStyle = p.topBgColor;
    c.fillRect(0, 0, w, tH);
    const tFs = Math.round(p.topFontSize * s);
    c.fillStyle = p.topTextColor;
    c.font = `900 ${tFs}px "Segoe UI",Arial,sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    if (p.textShadow) { c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 4 * s; c.shadowOffsetX = 2 * s; c.shadowOffsetY = 2 * s; }
    // wrap
    const words = p.topText.toUpperCase().split(' ');
    let line = '';
    const lines: string[] = [];
    for (const word of words) {
      const test = line + word + ' ';
      if (c.measureText(test).width > w - 40 * s && line) { lines.push(line.trim()); line = word + ' '; }
      else line = test;
    }
    lines.push(line.trim());
    const lh = tFs * 1.15;
    const startY = (tH - lines.length * lh) / 2 + lh / 2;
    lines.forEach((l, i) => c.fillText(l, w / 2, startY + i * lh));
    c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetX = 0; c.shadowOffsetY = 0;

    // image
    if (img && img.src && img.naturalWidth > 0) {
      c.save();
      c.filter = `brightness(${p.imageBrightness}%) contrast(${p.imageContrast}%) saturate(${p.imageSaturation}%)`;
      const ia = img.naturalWidth / img.naturalHeight, aa = w / iH;
      let dw = w, dh = iH, dx = 0, dy = tH;
      if (ia > aa) { dh = w / ia; dy = tH + (iH - dh) / 2; } else { dw = iH * ia; dx = (w - dw) / 2; }
      c.drawImage(img, dx, dy, dw, dh);
      c.restore();
    } else { c.fillStyle = '#1a1a25'; c.fillRect(0, tH, w, iH); }

    // bottom text
    const bY = tH + iH;
    c.fillStyle = p.bottomBgColor;
    c.fillRect(0, bY, w, bH);
    const bFs = Math.round(p.bottomFontSize * s);
    c.fillStyle = p.bottomTextColor;
    c.font = `bold ${bFs}px "Segoe UI",Arial,sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (p.textShadow) { c.shadowColor = 'rgba(0,0,0,.2)'; c.shadowBlur = 3 * s; c.shadowOffsetX = s; c.shadowOffsetY = s; }
    c.fillText(p.bottomText, w / 2, bY + bH / 2);
    c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetX = 0; c.shadowOffsetY = 0;

    // video
    if (vid && vid.readyState >= 2) {
      const va = vid.videoWidth / vid.videoHeight, ea = w / vH;
      let vw = w, vh = vH, vx = 0, vy = vY;
      if (va > ea) { vh = w / va; vy = vY + (vH - vh) / 2; } else { vw = vH * va; vx = (w - vw) / 2; }
      c.drawImage(vid, vx, vy, vw, vh);
    } else { c.fillStyle = '#0a0a0f'; c.fillRect(0, vY, w, vH); }

    // watermark
    if (p.watermark) {
      c.save();
      const wf = Math.round(24 * s);
      c.font = `600 ${wf}px "Segoe UI",Arial,sans-serif`;
      c.fillStyle = `rgba(255,255,255,${p.watermarkOpacity / 100})`;
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      const ww = c.measureText(p.watermark).width, pad = 20 * s;
      let wx = pad, wy = pad + wf;
      if (p.watermarkPosition === 'top-right') wx = w - ww - pad;
      if (p.watermarkPosition === 'bottom-left') wy = h - pad;
      if (p.watermarkPosition === 'bottom-right') { wx = w - ww - pad; wy = h - pad; }
      c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 4;
      c.fillText(p.watermark, wx, wy);
      c.restore();
    }

    // progress update
    if (vid && activeRef.current) {
      setRecordingState(prev => ({
        ...prev,
        currentTime: vid.currentTime,
        duration: vid.duration || 0,
        progress: vid.duration ? (vid.currentTime / vid.duration) * 100 : 0,
      }));
    }
    animRef.current = requestAnimationFrame(() => drawFrame(p));
  }, []);

  /* ─── START ─── */
  const startRecording = useCallback(async (project: VideoProject) => {
    const cv = canvasRef.current;
    const vid = videoRef.current;
    if (!cv || !vid) { setRecordingState(x => ({ ...x, status: 'error', errorMessage: 'Canvas/video bulunamadı' })); return; }

    try {
      setRecordingState({ isRecording: false, currentTime: 0, duration: vid.duration || 0, progress: 0, status: 'preparing' });

      const qm: Record<string, { w: number; h: number }> = { low: { w: 360, h: 640 }, medium: { w: 540, h: 960 }, high: { w: 720, h: 1280 }, ultra: { w: 1080, h: 1920 } };
      const r = qm[project.outputQuality];
      cv.width = r.w; cv.height = r.h;

      chunksRef.current = [];
      activeRef.current = true;
      vid.loop = false;
      vid.currentTime = 0;

      const ac = new AudioContext();
      acRef.current = ac;
      const dest = ac.createMediaStreamDestination();
      let hasAudio = false;
      const dur = vid.duration || 60;

      // background music
      if (project.audioSrc) {
        try {
          const buf = await fetchAudioBuffer(ac, project.audioSrc);
          const src = ac.createBufferSource();
          src.buffer = buf;
          const gain = ac.createGain();
          if (project.audioFadeIn > 0) {
            gain.gain.setValueAtTime(0.0001, ac.currentTime);
            gain.gain.linearRampToValueAtTime(project.audioVolume / 100, ac.currentTime + project.audioFadeIn);
          } else {
            gain.gain.setValueAtTime(project.audioVolume / 100, ac.currentTime);
          }
          if (project.audioFadeOut > 0) {
            const fs = Math.max(0, dur - project.audioFadeOut);
            gain.gain.setValueAtTime(project.audioVolume / 100, ac.currentTime + fs);
            gain.gain.linearRampToValueAtTime(0.0001, ac.currentTime + dur);
          }
          src.connect(gain);
          gain.connect(dest);
          gain.connect(ac.destination);
          const off = project.audioStartTime || 0;
          const md = Math.min(dur, buf.duration - off);
          src.start(0, off, md > 0 ? md : undefined);
          srcRef.current = src;
          hasAudio = true;
        } catch (e) { console.warn('Music error:', e); }
      }

      // video audio
      if (!project.videoMuted) {
        try {
          vid.muted = false;
          vid.volume = project.videoVolume / 100;
          const vs: MediaStream | null = (vid as any).captureStream ? (vid as any).captureStream() : (vid as any).mozCaptureStream ? (vid as any).mozCaptureStream() : null;
          if (vs) {
            const at = vs.getAudioTracks();
            if (at.length > 0) {
              const ms = ac.createMediaStreamSource(new MediaStream(at));
              const g = ac.createGain();
              g.gain.value = project.videoVolume / 100;
              ms.connect(g);
              g.connect(dest);
              hasAudio = true;
            }
          }
        } catch (e) { console.warn('Video audio error:', e); }
      } else { vid.muted = true; }

      // combine
      const cs = cv.captureStream(project.outputFPS);
      const combined = new MediaStream();
      cs.getVideoTracks().forEach(t => combined.addTrack(t));
      if (hasAudio) {
        dest.stream.getAudioTracks().forEach(t => combined.addTrack(t));
      } else {
        const osc = ac.createOscillator();
        const sg = ac.createGain();
        sg.gain.value = 0;
        osc.connect(sg);
        sg.connect(dest);
        osc.start();
        dest.stream.getAudioTracks().forEach(t => combined.addTrack(t));
      }

      // mime
      let mime = 'video/webm';
      for (const t of ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']) {
        if (MediaRecorder.isTypeSupported(t)) { mime = t; break; }
      }

      const bps: Record<string, number> = { low: 1500000, medium: 3000000, high: 6000000, ultra: 12000000 };
      const rec = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: bps[project.outputQuality], audioBitsPerSecond: 128000 });

      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      rec.onstop = () => {
        activeRef.current = false;
        try { srcRef.current?.stop(); } catch { /* ok */ }
        srcRef.current = null;
        try { acRef.current?.close(); } catch { /* ok */ }
        acRef.current = null;

        setRecordingState(x => ({ ...x, status: 'processing' }));

        setTimeout(() => {
          const blob = new Blob(chunksRef.current, { type: mime });
          lastBlobRef.current = blob;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const safeName = project.name.replace(/\s+/g, '_');
          a.download = `shorts_${safeName}_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 60000);

          setRecordingState({ isRecording: false, currentTime: 0, duration: 0, progress: 100, status: 'done' });
          vid.loop = true;
          vid.muted = true;
          vid.currentTime = 0;
          vid.play().catch(() => {});
        }, 200);
      };

      rec.onerror = () => {
        activeRef.current = false;
        try { srcRef.current?.stop(); } catch { /* ok */ }
        try { acRef.current?.close(); } catch { /* ok */ }
        setRecordingState(x => ({ ...x, isRecording: false, status: 'error', errorMessage: 'Kayıt hatası' }));
      };

      recorderRef.current = rec;
      await vid.play();
      rec.start(100);
      drawFrame(project);
      setRecordingState({ isRecording: true, currentTime: 0, duration: vid.duration || 0, progress: 0, status: 'recording' });
    } catch (err) {
      console.error('Start error:', err);
      activeRef.current = false;
      try { srcRef.current?.stop(); } catch { /* ok */ }
      try { acRef.current?.close(); } catch { /* ok */ }
      setRecordingState(x => ({ ...x, isRecording: false, status: 'error', errorMessage: err instanceof Error ? err.message : 'Bilinmeyen hata' }));
    }
  }, [drawFrame]);

  /* ─── STOP ─── */
  const stopRecording = useCallback(() => {
    activeRef.current = false;
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = 0; }
    try { srcRef.current?.stop(); } catch { /* ok */ }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    const v = videoRef.current;
    if (v) { v.muted = true; v.pause(); }
  }, []);

  const handleVideoEnded = useCallback(() => { if (activeRef.current) stopRecording(); }, [stopRecording]);
  const resetState = useCallback(() => setRecordingState(INITIAL_STATE), []);

  return { canvasRef, videoRef, imageRef, audioRef, recordingState, startRecording, stopRecording, handleVideoEnded, resetState, lastBlobRef };
}

