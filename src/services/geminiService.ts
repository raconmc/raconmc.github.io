const GEMINI_API_KEY = 'AIzaSyAQ-Ab8RN6La__MkRhTHWcgB_cGuPsJD0NHsTNJCIf8dWvhyZmY8-Q';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeneratedContent {
  title: string;
  description: string;
  tags: string[];
}

export async function generateShortsContent(
  topText: string,
  bottomText: string,
  hasMusic: boolean,
  musicName?: string
): Promise<GeneratedContent> {
  const prompt = `Sen bir YouTube Shorts içerik uzmanısın. Aşağıdaki bilgilere göre viral olabilecek bir Shorts videosu için başlık, açıklama ve etiketler oluştur.

Video İçeriği:
- Üst yazı: "${topText}"
- Alt yazı: "${bottomText}"
${hasMusic ? `- Arka plan müziği: "${musicName}"` : '- Müzik yok'}

Lütfen şu formatta JSON döndür (sadece JSON, başka bir şey yazma):
{
  "title": "Dikkat çekici, emoji içeren kısa başlık (max 100 karakter)",
  "description": "SEO uyumlu açıklama, call-to-action içermeli (max 500 karakter)",
  "tags": ["etiket1", "etiket2", "etiket3", "etiket4", "etiket5", "etiket6", "etiket7", "etiket8", "etiket9", "etiket10"]
}

Önemli:
- Türkçe olmalı
- Başlıkta emoji kullan
- Etiketler popüler ve alakalı olmalı
- #shorts etiketi mutlaka olmalı
- Sadece JSON formatında cevap ver`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API hatası');
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('Gemini yanıt vermedi');
    }

    // JSON'ı parse et (bazen markdown code block içinde gelebilir)
    let jsonStr = textContent;
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Direkt JSON olabilir
      const directMatch = textContent.match(/\{[\s\S]*\}/);
      if (directMatch) {
        jsonStr = directMatch[0];
      }
    }

    const parsed = JSON.parse(jsonStr);

    return {
      title: parsed.title || 'Shorts Video',
      description: parsed.description || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['shorts'],
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback içerik
    return {
      title: `🔥 ${topText.slice(0, 50)} #shorts`,
      description: `${topText}\n\n${bottomText}\n\n👍 Beğenmeyi ve abone olmayı unutma!\n\n#shorts #viral #trending`,
      tags: ['shorts', 'viral', 'trending', 'türkiye', 'fyp', 'keşfet', 'reels', 'tiktok'],
    };
  }
}

export async function regenerateContent(
  currentTitle: string,
  currentDescription: string,
  feedback: string
): Promise<GeneratedContent> {
  const prompt = `Mevcut YouTube Shorts içeriğini kullanıcı geri bildirimine göre yeniden oluştur.

Mevcut Başlık: "${currentTitle}"
Mevcut Açıklama: "${currentDescription}"
Kullanıcı Geri Bildirimi: "${feedback}"

Lütfen şu formatta JSON döndür (sadece JSON):
{
  "title": "Yeni başlık (max 100 karakter)",
  "description": "Yeni açıklama (max 500 karakter)",
  "tags": ["etiket1", "etiket2", "..."]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
      }),
    });

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    let jsonStr = textContent;
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) || textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = Array.isArray(jsonMatch) ? jsonMatch[1] || jsonMatch[0] : jsonMatch;
    }

    const parsed = JSON.parse(jsonStr);
    return {
      title: parsed.title,
      description: parsed.description,
      tags: parsed.tags,
    };
  } catch {
    return {
      title: currentTitle,
      description: currentDescription,
      tags: ['shorts'],
    };
  }
}

