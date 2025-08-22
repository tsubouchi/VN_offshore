import { type NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/gemini-ai"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { cookies } from "next/headers"
import { z } from "zod"

// Request validation schema
const chatbotRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  language: z.enum(["ja", "en", "vi"]).optional().default("ja"),
  sessionId: z.string().optional(),
  metadata: z.object({
    page: z.string().optional(),
    companyId: z.string().optional(),
    userId: z.string().optional(),
    userType: z.enum(["guest", "buyer", "vendor"]).optional()
  }).optional()
})

// Intent types for better responses
enum Intent {
  GREETING = "greeting",
  COMPANY_INFO = "company_info",
  PRICING = "pricing",
  FEATURES = "features",
  SUPPORT = "support",
  REGISTRATION = "registration",
  SEARCH_HELP = "search_help",
  GENERAL = "general"
}

// Session management
interface ChatSession {
  id: string
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>
  context: Record<string, unknown>
  createdAt: string
  lastActivity: string
}

const sessions = new Map<string, ChatSession>()
const SESSION_TTL = 30 * 60 * 1000 // 30 minutes

// Intent detection
function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase()
  
  const intentPatterns: Record<Intent, RegExp[]> = {
    [Intent.GREETING]: [
      /^(hello|hi|hey|こんにちは|はじめまして|xin chào)/i,
      /(good\s+(morning|afternoon|evening)|おはよう|こんばんは)/i
    ],
    [Intent.COMPANY_INFO]: [
      /(company|企業|会社|công ty|vendor|ベンダー)/i,
      /(profile|プロフィール|information|情報|thông tin)/i
    ],
    [Intent.PRICING]: [
      /(price|pricing|cost|料金|価格|費用|giá)/i,
      /(how much|いくら|bao nhiêu)/i
    ],
    [Intent.FEATURES]: [
      /(feature|機能|function|tính năng)/i,
      /(what can|できること|có thể làm gì)/i
    ],
    [Intent.SUPPORT]: [
      /(help|support|サポート|助けて|hỗ trợ|giúp)/i,
      /(problem|issue|問題|vấn đề)/i
    ],
    [Intent.REGISTRATION]: [
      /(register|registration|sign up|登録|đăng ký)/i,
      /(create account|アカウント作成|tạo tài khoản)/i
    ],
    [Intent.SEARCH_HELP]: [
      /(search|検索|find|探す|tìm kiếm)/i,
      /(filter|フィルター|絞り込み|lọc)/i
    ],
    [Intent.GENERAL]: []
  }

  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => pattern.test(lowerMessage))) {
      return intent as Intent
    }
  }

  return Intent.GENERAL
}

// Generate context-aware prompt
function generateContextAwarePrompt(
  message: string, 
  intent: Intent, 
  language: string,
  session?: ChatSession,
  metadata?: Record<string, unknown>
): string {
  const systemPrompts: Record<string, string> = {
    ja: "あなたはベトナムオフショア開発マッチングプラットフォームのAIアシスタントです。丁寧で親切な日本語で回答してください。",
    en: "You are an AI assistant for the Vietnam offshore development matching platform. Please respond in a helpful and professional manner.",
    vi: "Bạn là trợ lý AI cho nền tảng kết nối phát triển offshore Việt Nam. Vui lòng trả lời một cách hữu ích và chuyên nghiệp."
  }

  const contextInfo: string[] = [systemPrompts[language] || systemPrompts.ja]

  // Add intent-specific context
  switch (intent) {
    case Intent.COMPANY_INFO:
      contextInfo.push(language === "ja" 
        ? "ユーザーは企業情報について質問しています。ベトナムの開発会社の特徴や強みを説明してください。"
        : "The user is asking about company information. Explain the features and strengths of Vietnamese development companies.")
      break
    case Intent.PRICING:
      contextInfo.push(language === "ja"
        ? "ユーザーは料金について質問しています。一般的な価格帯と、費用対効果について説明してください。"
        : "The user is asking about pricing. Explain typical price ranges and cost-effectiveness.")
      break
    case Intent.FEATURES:
      contextInfo.push(language === "ja"
        ? "プラットフォームの主要機能を説明してください：企業検索、レビュー、メッセージング、AIサポートなど。"
        : "Explain the platform's main features: company search, reviews, messaging, AI support, etc.")
      break
    case Intent.REGISTRATION:
      contextInfo.push(language === "ja"
        ? "登録プロセスを説明し、buyer（日本企業）とvendor（ベトナム企業）の違いを明確にしてください。"
        : "Explain the registration process and clarify the difference between buyers (Japanese companies) and vendors (Vietnamese companies).")
      break
    case Intent.SEARCH_HELP:
      contextInfo.push(language === "ja"
        ? "検索機能の使い方を説明してください。技術スタック、地域、企業規模でのフィルタリングが可能です。"
        : "Explain how to use the search function. Filtering by technology stack, location, and company size is available.")
      break
  }

  // Add session context if available
  if (session && session.messages.length > 0) {
    const recentMessages = session.messages.slice(-3)
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n")
    contextInfo.push(`Previous conversation:\n${recentMessages}`)
  }

  // Add metadata context
  if (metadata?.page) {
    contextInfo.push(`User is currently on: ${metadata.page}`)
  }
  if (metadata?.userType) {
    contextInfo.push(`User type: ${metadata.userType}`)
  }

  return `${contextInfo.join("\n\n")}\n\nUser: ${message}`
}

// Session management functions
function getOrCreateSession(sessionId?: string): ChatSession {
  // Clean up expired sessions
  const now = Date.now()
  for (const [id, session] of sessions.entries()) {
    if (now - new Date(session.lastActivity).getTime() > SESSION_TTL) {
      sessions.delete(id)
    }
  }

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!
    session.lastActivity = new Date().toISOString()
    return session
  }

  const newSession: ChatSession = {
    id: sessionId || crypto.randomUUID(),
    messages: [],
    context: {},
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  }

  sessions.set(newSession.id, newSession)
  return newSession
}

// Quick replies based on intent
function getQuickReplies(intent: Intent, language: string): string[] {
  const quickReplies: Record<string, Record<Intent, string[]>> = {
    ja: {
      [Intent.GREETING]: [
        "企業を探す",
        "料金について",
        "登録方法"
      ],
      [Intent.COMPANY_INFO]: [
        "技術スタックで検索",
        "地域で検索",
        "レビューを見る"
      ],
      [Intent.PRICING]: [
        "見積もりを依頼",
        "企業を比較",
        "サポートに連絡"
      ],
      [Intent.FEATURES]: [
        "デモを見る",
        "登録する",
        "詳細を読む"
      ],
      [Intent.SUPPORT]: [
        "よくある質問",
        "お問い合わせ",
        "ドキュメント"
      ],
      [Intent.REGISTRATION]: [
        "Buyerとして登録",
        "Vendorとして登録",
        "ログイン"
      ],
      [Intent.SEARCH_HELP]: [
        "React企業を探す",
        "ホーチミンの企業",
        "50-100人規模"
      ],
      [Intent.GENERAL]: [
        "企業を探す",
        "機能について",
        "サポート"
      ]
    },
    en: {
      [Intent.GREETING]: [
        "Search companies",
        "About pricing",
        "How to register"
      ],
      [Intent.COMPANY_INFO]: [
        "Search by tech stack",
        "Search by location",
        "View reviews"
      ],
      [Intent.PRICING]: [
        "Request quote",
        "Compare companies",
        "Contact support"
      ],
      [Intent.FEATURES]: [
        "View demo",
        "Sign up",
        "Read more"
      ],
      [Intent.SUPPORT]: [
        "FAQs",
        "Contact us",
        "Documentation"
      ],
      [Intent.REGISTRATION]: [
        "Register as Buyer",
        "Register as Vendor",
        "Login"
      ],
      [Intent.SEARCH_HELP]: [
        "Find React companies",
        "Companies in HCMC",
        "50-100 employees"
      ],
      [Intent.GENERAL]: [
        "Search companies",
        "About features",
        "Get support"
      ]
    },
    vi: {
      [Intent.GREETING]: [
        "Tìm công ty",
        "Về giá cả",
        "Cách đăng ký"
      ],
      [Intent.COMPANY_INFO]: [
        "Tìm theo công nghệ",
        "Tìm theo khu vực",
        "Xem đánh giá"
      ],
      [Intent.PRICING]: [
        "Yêu cầu báo giá",
        "So sánh công ty",
        "Liên hệ hỗ trợ"
      ],
      [Intent.FEATURES]: [
        "Xem demo",
        "Đăng ký",
        "Đọc thêm"
      ],
      [Intent.SUPPORT]: [
        "Câu hỏi thường gặp",
        "Liên hệ chúng tôi",
        "Tài liệu"
      ],
      [Intent.REGISTRATION]: [
        "Đăng ký Buyer",
        "Đăng ký Vendor",
        "Đăng nhập"
      ],
      [Intent.SEARCH_HELP]: [
        "Tìm công ty React",
        "Công ty tại TP.HCM",
        "50-100 nhân viên"
      ],
      [Intent.GENERAL]: [
        "Tìm công ty",
        "Về tính năng",
        "Hỗ trợ"
      ]
    }
  }

  const replies = quickReplies[language]?.[intent] || quickReplies.ja[Intent.GENERAL]
  return replies
}

// Analytics tracking
async function trackChatbotInteraction(
  sessionId: string,
  message: string,
  intent: Intent,
  language: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseAvailable() || !supabase) return

  try {
    await supabase.from("chatbot_analytics").insert({
      session_id: sessionId,
      message,
      intent,
      language,
      metadata,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to track chatbot interaction:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const validationResult = chatbotRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request",
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { message, language, sessionId, metadata } = validationResult.data

    // Get or create session
    const session = getOrCreateSession(sessionId)

    // Detect intent
    const intent = detectIntent(message)

    // Track interaction asynchronously
    trackChatbotInteraction(session.id, message, intent, language, metadata)
      .catch(err => console.error("Analytics tracking failed:", err))

    // Generate context-aware prompt
    const prompt = generateContextAwarePrompt(message, intent, language, session, metadata)

    // Generate AI response with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    let aiResponse: string
    try {
      aiResponse = await generateAIResponse(prompt)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        const fallbackResponses: Record<string, string> = {
          ja: "申し訳ございません。応答に時間がかかっています。もう一度お試しください。",
          en: "Sorry, the response is taking too long. Please try again.",
          vi: "Xin lỗi, phản hồi mất quá nhiều thời gian. Vui lòng thử lại."
        }
        aiResponse = fallbackResponses[language] || fallbackResponses.ja
      } else {
        throw error
      }
    } finally {
      clearTimeout(timeout)
    }

    // Update session
    session.messages.push(
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "assistant", content: aiResponse, timestamp: new Date().toISOString() }
    )

    // Keep only last 10 messages in session
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20)
    }

    // Get quick replies
    const quickReplies = getQuickReplies(intent, language)

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("chatbot_session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL / 1000 // Convert to seconds
    })

    return NextResponse.json({
      response: aiResponse,
      sessionId: session.id,
      intent,
      quickReplies,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Chatbot API error:", error)

    // Fallback responses for common errors
    const errorResponses: Record<string, string> = {
      ja: "申し訳ございません。エラーが発生しました。しばらくしてからもう一度お試しください。",
      en: "Sorry, an error occurred. Please try again later.",
      vi: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau."
    }

    return NextResponse.json(
      { 
        error: errorResponses.ja,
        sessionId: crypto.randomUUID(),
        quickReplies: ["サポートに連絡", "FAQを見る", "もう一度試す"]
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve session history
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("chatbot_session")?.value

    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({
        sessionId: null,
        messages: [],
        context: {}
      })
    }

    const session = sessions.get(sessionId)!
    
    return NextResponse.json({
      sessionId: session.id,
      messages: session.messages,
      context: session.context
    })

  } catch (error) {
    console.error("Chatbot GET error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    )
  }
}

// OPTIONS endpoint for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}