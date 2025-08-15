import { GoogleGenAI } from "@google/genai"

export async function generateAIResponse(message: string): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyDX8EkeJkVhsqK76SWz-S_euDYhV4gHGKU"

    if (!apiKey) {
      return "AIチャットボット機能を利用するには、管理者にお問い合わせください。"
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    })

    const config = {
      responseMimeType: "text/plain",
    }

    // Use the latest Gemini model
    const model = "gemini-2.5-pro-preview-06-05"

    const contents = [
      {
        role: "user",
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

    return fullResponse || "申し訳ございませんが、回答を生成できませんでした。お問い合わせフォームをご利用ください。"
  } catch (error) {
    console.error("Gemini AI Error:", error)

    if (error instanceof Error && (error.message.includes("API key not valid") || ('status' in error && error.status === 400))) {
      return "AIチャットボット機能の設定に問題があります。現在、AIサポートは利用できません。お問い合わせフォームをご利用ください。"
    }

    return "AIサービスに接続できません。お問い合わせフォームをご利用いただくか、しばらく後にお試しください。"
  }
}
