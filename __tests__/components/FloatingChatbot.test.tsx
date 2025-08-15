import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot'

// Mock fetch API
global.fetch = jest.fn()

describe('FloatingChatbot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        response: 'AIからの返答です。ベトナムオフショア開発についてお答えします。' 
      }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render chat button initially', () => {
    render(<FloatingChatbot />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should open chat window when button is clicked', () => {
    render(<FloatingChatbot />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    expect(screen.getByText('AIコンシェルジェ')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('メッセージを入力...')).toBeInTheDocument()
  })

  it('should display initial greeting message', () => {
    render(<FloatingChatbot />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    expect(screen.getByText(/ベトナムオフショア開発マッチングプラットフォーム/)).toBeInTheDocument()
  })

  it('should close chat window when X button is clicked', () => {
    render(<FloatingChatbot />)
    const openButton = screen.getByRole('button')
    
    fireEvent.click(openButton)
    
    const closeButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg.lucide-x')
    )
    
    if (closeButton) {
      fireEvent.click(closeButton)
    }
    
    expect(screen.queryByText('AIコンシェルジェ')).not.toBeInTheDocument()
  })

  it('should send message when Enter key is pressed', async () => {
    const user = userEvent.setup()
    render(<FloatingChatbot />)
    
    // Open chat
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Type message
    const input = screen.getByPlaceholderText('メッセージを入力...')
    await user.type(input, 'テストメッセージ')
    
    // Press Enter
    await user.keyboard('{Enter}')
    
    // Check if message appears
    await waitFor(() => {
      expect(screen.getByText('テストメッセージ')).toBeInTheDocument()
    })
    
    // Check if API was called
    expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'テストメッセージ' }),
    }))
  })

  it('should display AI response after sending message', async () => {
    const user = userEvent.setup()
    render(<FloatingChatbot />)
    
    // Open chat
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Send message
    const input = screen.getByPlaceholderText('メッセージを入力...')
    await user.type(input, 'テスト')
    await user.keyboard('{Enter}')
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/AIからの返答です/)).toBeInTheDocument()
    })
  })

  it('should show loading indicator while waiting for response', async () => {
    // Mock delayed response
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ response: 'Delayed response' }),
      }), 100))
    )
    
    const user = userEvent.setup()
    render(<FloatingChatbot />)
    
    // Open chat and send message
    const button = screen.getByRole('button')
    await user.click(button)
    
    const input = screen.getByPlaceholderText('メッセージを入力...')
    await user.type(input, 'Test')
    await user.keyboard('{Enter}')
    
    // Check for loading animation
    const loadingElements = screen.getAllByRole('generic').filter(
      el => el.className.includes('animate-bounce')
    )
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('should handle API errors gracefully', async () => {
    // Suppress console.error for this test since we expect an error
    const originalError = console.error
    console.error = jest.fn()
    
    // Mock API error
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    const user = userEvent.setup()
    render(<FloatingChatbot />)
    
    // Open chat and send message
    const button = screen.getByRole('button')
    await user.click(button)
    
    const input = screen.getByPlaceholderText('メッセージを入力...')
    await user.type(input, 'Test')
    await user.keyboard('{Enter}')
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument()
    })
    
    // Restore console.error
    console.error = originalError
  })

  it('should disable input while loading', async () => {
    // Mock slow response
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )
    
    const user = userEvent.setup()
    render(<FloatingChatbot />)
    
    // Open chat and send message
    const button = screen.getByRole('button')
    await user.click(button)
    
    const input = screen.getByPlaceholderText('メッセージを入力...') as HTMLInputElement
    await user.type(input, 'Test')
    await user.keyboard('{Enter}')
    
    // Check if input is disabled
    await waitFor(() => {
      expect(input).toBeDisabled()
    })
  })

  it('should not send empty messages', async () => {
    const user = userEvent.setup()
    render(<FloatingChatbot />)
    
    // Open chat
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Try to send empty message
    const input = screen.getByPlaceholderText('メッセージを入力...')
    await user.keyboard('{Enter}')
    
    // API should not be called
    expect(global.fetch).not.toHaveBeenCalled()
  })
})