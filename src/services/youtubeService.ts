const CLIENT_ID = '319737583897-gag7c4o0jrhlnsc3jr5ld9hshb6rmso8.apps.googleusercontent.com';
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ');

const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeChannel {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: string;
}

export interface UploadProgress {
  status: 'idle' | 'authenticating' | 'uploading' | 'processing' | 'done' | 'error';
  progress: number;
  message: string;
  videoId?: string;
  videoUrl?: string;
}

// Token storage
let accessToken: string | null = null;
let tokenExpiry: number = 0;

export function isAuthenticated(): boolean {
  return !!accessToken && Date.now() < tokenExpiry;
}

export function getAccessToken(): string | null {
  return isAuthenticated() ? accessToken : null;
}

export function logout(): void {
  accessToken = null;
  tokenExpiry = 0;
  localStorage.removeItem('yt_access_token');
  localStorage.removeItem('yt_token_expiry');
}

// Load token from localStorage on init
export function initAuth(): void {
  const storedToken = localStorage.getItem('yt_access_token');
  const storedExpiry = localStorage.getItem('yt_token_expiry');
  
  if (storedToken && storedExpiry) {
    const expiry = parseInt(storedExpiry, 10);
    if (Date.now() < expiry) {
      accessToken = storedToken;
      tokenExpiry = expiry;
    } else {
      logout();
    }
  }
}

// Initialize on module load
initAuth();

export function startOAuthFlow(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create OAuth URL
    const redirectUri = window.location.origin + window.location.pathname;
    const state = Math.random().toString(36).substring(2);
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('prompt', 'consent');

    // Store state for verification
    sessionStorage.setItem('oauth_state', state);

    // Open popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      authUrl.toString(),
      'youtube_oauth',
      `width=${width},height=${height},left=${left},top=${top},popup=1`
    );

    if (!popup) {
      reject(new Error('Popup engellenmiş. Lütfen popup izni verin.'));
      return;
    }

    // Listen for OAuth redirect
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          reject(new Error('Giriş penceresi kapatıldı'));
          return;
        }

        const popupUrl = popup.location.href;
        if (popupUrl.includes('access_token=')) {
          clearInterval(checkPopup);
          
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          
          const token = params.get('access_token');
          const expiresIn = parseInt(params.get('expires_in') || '3600', 10);
          const returnedState = params.get('state');

          popup.close();

          // Verify state
          const savedState = sessionStorage.getItem('oauth_state');
          if (returnedState !== savedState) {
            reject(new Error('Güvenlik doğrulaması başarısız'));
            return;
          }

          if (token) {
            accessToken = token;
            tokenExpiry = Date.now() + (expiresIn * 1000) - 60000; // 1 min buffer
            
            // Save to localStorage
            localStorage.setItem('yt_access_token', token);
            localStorage.setItem('yt_token_expiry', tokenExpiry.toString());
            
            resolve(token);
          } else {
            reject(new Error('Token alınamadı'));
          }
        }

        // Check for error
        if (popupUrl.includes('error=')) {
          clearInterval(checkPopup);
          popup.close();
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          reject(new Error(params.get('error_description') || 'Giriş hatası'));
        }
      } catch {
        // Cross-origin error - popup is on different domain, keep waiting
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkPopup);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Giriş zaman aşımına uğradı'));
    }, 300000);
  });
}

export async function getChannelInfo(): Promise<YouTubeChannel | null> {
  if (!accessToken) return null;

  try {
    const response = await fetch(
      `${YOUTUBE_API_URL}/channels?part=snippet,statistics&mine=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        logout();
      }
      return null;
    }

    const data = await response.json();
    const channel = data.items?.[0];

    if (!channel) return null;

    return {
      id: channel.id,
      title: channel.snippet.title,
      thumbnail: channel.snippet.thumbnails?.default?.url || '',
      subscriberCount: formatSubscriberCount(channel.statistics.subscriberCount),
    };
  } catch (error) {
    console.error('Channel info error:', error);
    return null;
  }
}

function formatSubscriberCount(count: string): string {
  const num = parseInt(count, 10);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return count;
}

export async function uploadVideo(
  videoBlob: Blob,
  title: string,
  description: string,
  tags: string[],
  onProgress: (progress: UploadProgress) => void
): Promise<string> {
  if (!accessToken) {
    throw new Error('Giriş yapılmamış');
  }

  onProgress({
    status: 'uploading',
    progress: 0,
    message: 'Video yükleniyor...',
  });

  // Prepare metadata
  const metadata = {
    snippet: {
      title: title.slice(0, 100),
      description: description.slice(0, 5000),
      tags: tags.slice(0, 500),
      categoryId: '22', // People & Blogs
      defaultLanguage: 'tr',
      defaultAudioLanguage: 'tr',
    },
    status: {
      privacyStatus: 'public', // public, private, unlisted
      selfDeclaredMadeForKids: false,
      embeddable: true,
      publicStatsViewable: true,
    },
  };

  // Create multipart body
  const boundary = '-------314159265358979323846';
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelimiter = '\r\n--' + boundary + '--';

  const metadataString = JSON.stringify(metadata);

  // Build multipart request
  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    metadataString +
    delimiter +
    'Content-Type: ' + videoBlob.type + '\r\n' +
    'Content-Transfer-Encoding: binary\r\n\r\n';

  // Combine parts
  const requestBodyParts = [
    new Blob([multipartRequestBody], { type: 'text/plain' }),
    videoBlob,
    new Blob([closeDelimiter], { type: 'text/plain' }),
  ];
  const requestBody = new Blob(requestBodyParts);

  try {
    const xhr = new XMLHttpRequest();
    
    const uploadPromise = new Promise<string>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress({
            status: 'uploading',
            progress: percent,
            message: `Yükleniyor... %${percent}`,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          const videoId = response.id;
          
          onProgress({
            status: 'done',
            progress: 100,
            message: 'Yükleme tamamlandı!',
            videoId,
            videoUrl: `https://youtube.com/shorts/${videoId}`,
          });
          
          resolve(videoId);
        } else {
          let errorMessage = 'Yükleme başarısız';
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.error?.message || errorMessage;
          } catch {}
          
          onProgress({
            status: 'error',
            progress: 0,
            message: errorMessage,
          });
          
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        onProgress({
          status: 'error',
          progress: 0,
          message: 'Ağ hatası',
        });
        reject(new Error('Ağ hatası'));
      });

      xhr.addEventListener('abort', () => {
        onProgress({
          status: 'error',
          progress: 0,
          message: 'Yükleme iptal edildi',
        });
        reject(new Error('Yükleme iptal edildi'));
      });
    });

    xhr.open('POST', `${YOUTUBE_UPLOAD_URL}?uploadType=multipart&part=snippet,status`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Content-Type', 'multipart/related; boundary="' + boundary + '"');
    xhr.send(requestBody);

    return await uploadPromise;
  } catch (error) {
    onProgress({
      status: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
    });
    throw error;
  }
}

// Convert recorded video chunks to a proper Blob
export function createVideoBlob(chunks: Blob[], mimeType: string): Blob {
  return new Blob(chunks, { type: mimeType });
}

