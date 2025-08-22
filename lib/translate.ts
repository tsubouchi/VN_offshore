// Translation service using browser's built-in Translation API or a third-party service
// For production, you would use Google Translate API, DeepL, or Azure Translator

interface TranslationResult {
  translatedText: string
  detectedLanguage?: string
  confidence?: number
}

// Mock translations for demo purposes
const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    "こんにちは": "Hello",
    "ありがとうございます": "Thank you",
    "よろしくお願いします": "Nice to meet you / Please take care of this",
    "プロジェクトについて話しましょう": "Let's talk about the project",
    "いつまでに完成できますか？": "When can you complete it?",
    "見積もりをお願いします": "Please provide a quote",
    "承知いたしました": "Understood",
    "お疲れ様でした": "Thank you for your hard work",
  },
  ja: {
    "Hello": "こんにちは",
    "Thank you": "ありがとうございます",
    "How are you?": "お元気ですか？",
    "I need help with my project": "プロジェクトで助けが必要です",
    "When can we start?": "いつ始められますか？",
    "What is the timeline?": "スケジュールはどうなっていますか？",
    "Please send me the details": "詳細を送ってください",
    "I agree with the proposal": "提案に同意します",
    "Let me check and get back to you": "確認して返事します",
  },
  vi: {
    "Hello": "Xin chào",
    "Thank you": "Cảm ơn",
    "How are you?": "Bạn khỏe không?",
    "I need help with my project": "Tôi cần trợ giúp với dự án của tôi",
    "When can we start?": "Khi nào chúng ta có thể bắt đầu?",
    "What is the timeline?": "Lịch trình như thế nào?",
    "Please send me the details": "Vui lòng gửi cho tôi chi tiết",
    "I agree with the proposal": "Tôi đồng ý với đề xuất",
  }
}

// Language detection (simplified)
function detectLanguage(text: string): 'en' | 'ja' | 'vi' | 'unknown' {
  // Japanese detection
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
    return 'ja'
  }
  
  // Vietnamese detection (with diacritics)
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) {
    return 'vi'
  }
  
  // Default to English for Latin characters without Vietnamese diacritics
  if (/^[a-zA-Z\s.,!?]+$/.test(text)) {
    return 'en'
  }
  
  return 'unknown'
}

export async function translateText(
  text: string,
  targetLang: 'en' | 'ja' | 'vi',
  sourceLang?: 'en' | 'ja' | 'vi'
): Promise<TranslationResult> {
  try {
    // Detect source language if not provided
    const detectedLang = sourceLang || detectLanguage(text)
    
    // If source and target are the same, return original
    if (detectedLang === targetLang) {
      return {
        translatedText: text,
        detectedLanguage: detectedLang,
        confidence: 1
      }
    }
    
    // Check mock translations first (for demo)
    if (MOCK_TRANSLATIONS[targetLang] && MOCK_TRANSLATIONS[targetLang][text]) {
      return {
        translatedText: MOCK_TRANSLATIONS[targetLang][text],
        detectedLanguage: detectedLang,
        confidence: 0.95
      }
    }
    
    // In production, you would call a real translation API here
    // For example, using Google Translate API:
    /*
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: sourceLang,
        format: 'text'
      })
    })
    
    const data = await response.json()
    return {
      translatedText: data.data.translations[0].translatedText,
      detectedLanguage: data.data.translations[0].detectedSourceLanguage,
      confidence: 0.9
    }
    */
    
    // Fallback: Simple mock translation
    return {
      translatedText: `[${targetLang.toUpperCase()}] ${text}`,
      detectedLanguage: detectedLang,
      confidence: 0.5
    }
  } catch (error) {
    console.error('Translation error:', error)
    return {
      translatedText: text,
      detectedLanguage: 'unknown',
      confidence: 0
    }
  }
}

export async function translateBatch(
  texts: string[],
  targetLang: 'en' | 'ja' | 'vi',
  sourceLang?: 'en' | 'ja' | 'vi'
): Promise<TranslationResult[]> {
  return Promise.all(
    texts.map(text => translateText(text, targetLang, sourceLang))
  )
}

// Helper function to get user's preferred language
export function getUserPreferredLanguage(): 'en' | 'ja' | 'vi' {
  if (typeof window === 'undefined') return 'en'
  
  const stored = localStorage.getItem('preferredLanguage')
  if (stored && ['en', 'ja', 'vi'].includes(stored)) {
    return stored as 'en' | 'ja' | 'vi'
  }
  
  // Check browser language
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ja')) return 'ja'
  if (browserLang.startsWith('vi')) return 'vi'
  
  return 'en'
}

// Save user's language preference
export function setUserPreferredLanguage(lang: 'en' | 'ja' | 'vi') {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredLanguage', lang)
  }
}

// Common phrases for quick translation
export const COMMON_PHRASES = {
  greetings: {
    en: ["Hello", "Good morning", "Good afternoon", "Good evening", "How are you?"],
    ja: ["こんにちは", "おはようございます", "こんばんは", "お元気ですか？"],
    vi: ["Xin chào", "Chào buổi sáng", "Chào buổi chiều", "Chào buổi tối", "Bạn khỏe không?"]
  },
  business: {
    en: [
      "Thank you for your message",
      "I'll get back to you soon",
      "Could you provide more details?",
      "When is the deadline?",
      "What is your budget?",
      "I agree with the proposal",
      "Let's schedule a meeting"
    ],
    ja: [
      "メッセージありがとうございます",
      "すぐに返信いたします",
      "詳細を教えていただけますか？",
      "締切はいつですか？",
      "予算はいくらですか？",
      "提案に同意します",
      "会議の予定を立てましょう"
    ],
    vi: [
      "Cảm ơn tin nhắn của bạn",
      "Tôi sẽ phản hồi sớm",
      "Bạn có thể cung cấp thêm chi tiết không?",
      "Thời hạn là khi nào?",
      "Ngân sách của bạn là bao nhiêu?",
      "Tôi đồng ý với đề xuất",
      "Hãy lên lịch cho cuộc họp"
    ]
  }
}