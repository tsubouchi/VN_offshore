import { type NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/gemini-ai"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "メッセージが必要です" }, { status: 400 })
    }

    const response = await generateAIResponse(message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
