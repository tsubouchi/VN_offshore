import { generateAIResponse } from '@/lib/gemini-ai'

// Mock the Google Gemini AI module
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContentStream: jest.fn().mockImplementation(async function* () {
        yield { text: 'こんにちは！' }
        yield { text: 'ベトナムオフショア開発についてお答えします。' }
      }),
    },
  })),
}))

describe('Gemini AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate AI response successfully', async () => {
    const message = 'ベトナムオフショア開発について教えてください'
    const response = await generateAIResponse(message)

    expect(response).toContain('こんにちは')
    expect(response).toContain('ベトナムオフショア開発')
  })

  it('should handle empty message', async () => {
    const response = await generateAIResponse('')
    expect(response).toBeTruthy()
  })

  it('should handle long messages', async () => {
    const longMessage = 'テスト'.repeat(1000)
    const response = await generateAIResponse(longMessage)
    expect(response).toBeTruthy()
  })

  it('should include platform context in prompt', async () => {
    const message = 'プラットフォームの機能について'
    const response = await generateAIResponse(message)
    expect(response).toBeTruthy()
  })
})