import { type NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/gemini-ai"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { headers } from "next/headers"
import { z } from "zod"

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  conversationId: z.string().optional(),
  userId: z.string().optional(),
  context: z.object({
    companyId: z.string().optional(),
    previousMessages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string()
    })).optional()
  }).optional(),
  stream: z.boolean().optional()
})

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 10, // Max requests
  window: 60000, // Time window in milliseconds (1 minute)
}

// In-memory cache for rate limiting (in production, use Redis)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()

// Response cache with TTL
const responseCache = new Map<string, { response: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getRateLimitKey(): Promise<string> {
  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown"
  
  return `rate-limit:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const limit = rateLimitCache.get(key)

  if (!limit || now > limit.resetTime) {
    // Reset or initialize rate limit
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.window
    })
    return {
      allowed: true,
      remaining: RATE_LIMIT.requests - 1,
      resetTime: now + RATE_LIMIT.window
    }
  }

  if (limit.count >= RATE_LIMIT.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: limit.resetTime
    }
  }

  // Increment counter
  limit.count++
  rateLimitCache.set(key, limit)
  
  return {
    allowed: true,
    remaining: RATE_LIMIT.requests - limit.count,
    resetTime: limit.resetTime
  }
}

function getCacheKey(message: string, context?: Record<string, unknown>): string {
  const contextStr = context ? JSON.stringify(context) : ""
  return `cache:${message}:${contextStr}`
}

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response
  }
  responseCache.delete(key) // Remove expired cache
  return null
}

function setCachedResponse(key: string, response: string): void {
  // Limit cache size
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value
    if (firstKey) responseCache.delete(firstKey)
  }
  
  responseCache.set(key, {
    response,
    timestamp: Date.now()
  })
}

async function saveMessageToDatabase(
  message: string,
  response: string,
  userId?: string,
  conversationId?: string
): Promise<void> {
  if (!isSupabaseAvailable() || !supabase) return

  try {
    // Save user message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId || "anonymous",
      content: message,
      type: "text",
      created_at: new Date().toISOString()
    })

    // Save AI response
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: "ai-assistant",
      content: response,
      type: "text",
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to save message to database:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = chatRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request", 
          details: validationResult.error.errors 
        },
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
          }
        }
      )
    }

    const { message, conversationId, userId, context, stream } = validationResult.data

    // Check rate limit
    const rateLimitKey = await getRateLimitKey()
    const { allowed, remaining, resetTime } = checkRateLimit(rateLimitKey)
    
    if (!allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(RATE_LIMIT.requests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(resetTime).toISOString(),
            "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000))
          }
        }
      )
    }

    // Check cache for non-streaming requests
    if (!stream) {
      const cacheKey = getCacheKey(message, context)
      const cachedResponse = getCachedResponse(cacheKey)
      
      if (cachedResponse) {
        return NextResponse.json(
          { 
            response: cachedResponse,
            cached: true 
          },
          {
            headers: {
              "X-RateLimit-Limit": String(RATE_LIMIT.requests),
              "X-RateLimit-Remaining": String(remaining),
              "X-RateLimit-Reset": new Date(resetTime).toISOString(),
              "X-Cache": "HIT"
            }
          }
        )
      }
    }

    // Generate AI response with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    let aiResponse: string
    try {
      // Build prompt with context
      let prompt = message
      if (context?.previousMessages && context.previousMessages.length > 0) {
        const contextStr = context.previousMessages
          .slice(-5) // Last 5 messages for context
          .map(msg => `${msg.role}: ${msg.content}`)
          .join("\n")
        prompt = `Previous conversation:\n${contextStr}\n\nUser: ${message}`
      }

      aiResponse = await generateAIResponse(prompt)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout" },
          { status: 504 }
        )
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }

    // Save to database asynchronously
    if (conversationId && userId) {
      saveMessageToDatabase(message, aiResponse, userId, conversationId)
        .catch(err => console.error("Background save failed:", err))
    }

    // Cache the response for non-streaming requests
    if (!stream) {
      const cacheKey = getCacheKey(message, context)
      setCachedResponse(cacheKey, aiResponse)
    }

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const chunks = aiResponse.split(" ") // Simulate streaming
          for (const chunk of chunks) {
            const data = `data: ${JSON.stringify({ chunk: chunk + " " })}\n\n`
            controller.enqueue(encoder.encode(data))
            await new Promise(resolve => setTimeout(resolve, 50)) // Simulate delay
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        }
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-RateLimit-Limit": String(RATE_LIMIT.requests),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": new Date(resetTime).toISOString(),
        }
      })
    }

    // Return standard JSON response
    return NextResponse.json(
      { 
        response: aiResponse,
        conversationId: conversationId || null,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT.requests),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": new Date(resetTime).toISOString(),
          "X-Cache": "MISS"
        }
      }
    )

  } catch (error) {
    console.error("Chat API Error:", error)
    
    // Determine error type and appropriate response
    let statusCode = 500
    let errorMessage = "Internal server error"
    
    if (error instanceof Error && error.message?.includes("API key")) {
      statusCode = 503
      errorMessage = "AI service unavailable"
    } else if (error instanceof Error && error.message?.includes("quota")) {
      statusCode = 503
      errorMessage = "AI service quota exceeded"
    } else if (error instanceof Error && error.message?.includes("network")) {
      statusCode = 503
      errorMessage = "Network error"
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      },
      { status: statusCode }
    )
  }
}

// OPTIONS endpoint for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}