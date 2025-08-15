import { GoogleGenAI } from "@google/genai"

export async function generateAIResponse(message: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return "AIチャットボット機能を利用するには、管理者にお問い合わせください。"
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    })

    const config = {
      responseMimeType: "text/plain" as const,
    }

    const model = "gemini-1.5-flash"

    const contents = [
      {
        role: "user" as const,
        parts: [
          {
            text: `あなたはベトナムと日本企業のオフショア開発マッチングプラットフォームのコンシェルジェAIです。
            ユーザーの質問に対して、親切で専門的な回答を日本語で提供してください。
            
            プラットフォームの機能:
            - ベトナムのオフショア開発会社の検索・比較
            - 企業プロフィールの閲覧
            - リアルタイムチャット機能
            - レビュー・評価システム
            - 管理ダッシュボード
            
            ユーザーの質問: ${message}`,
          },
        ],
      },
    ]

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    let fullResponse = ""
    for await (const chunk of response) {
      if (chunk.text) {
        fullResponse += chunk.text
      }
    }

    return fullResponse || "申し訳ございませんが、回答を生成できませんでした。"
  } catch (error) {
    console.error("Gemini AI Error:", error)
    if (error?.message?.includes("API key not valid")) {
      return "AIチャットボット機能の設定に問題があります。管理者にお問い合わせください。"
    }
    return "AIサービスに一時的な問題が発生しています。しばらく後にお試しください。"
  }
}
