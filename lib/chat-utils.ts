import { supabase } from "./supabase"

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  translated_content?: string
  is_read: boolean
  created_at: string
}

export interface ChatConversation {
  id: string
  buyer_id: string
  vendor_id: string
  company_id: string
  last_message_at: string
}

export class ChatService {
  // Subscribe to real-time messages for a conversation
  static subscribeToMessages(conversationId: string, callback: (message: ChatMessage) => void) {
    if (!supabase) {
      console.warn("Supabase client not initialized")
      return null
    }
    return supabase!
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage)
        },
      )
      .subscribe()
  }

  // Send a new message
  static async sendMessage(message: Omit<ChatMessage, "id" | "created_at">) {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }
    const { data, error } = await supabase!
      .from("messages")
      .insert({
        ...message,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get messages for a conversation
  static async getMessages(conversationId: string, limit = 50) {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }
    const { data, error } = await supabase!
      .from("messages")
      .select(`
        *,
        sender:users(company_name, role)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  }

  // Get conversations for a user
  static async getConversations(userId: string) {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }
    const { data, error } = await supabase!
      .from("conversations")
      .select(`
        *,
        buyer:users!buyer_id(company_name, contact_person),
        vendor:users!vendor_id(company_name, contact_person),
        company:companies(company_name, logo_url)
      `)
      .or(`buyer_id.eq.${userId},vendor_id.eq.${userId}`)
      .order("last_message_at", { ascending: false })

    if (error) throw error
    return data
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, userId: string) {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }
    const { error } = await supabase!
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)

    if (error) throw error
  }

  // Create or get existing conversation
  static async createConversation(buyerId: string, vendorId: string, companyId: string) {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }
    // First check if conversation already exists
    const { data: existing } = await supabase!
      .from("conversations")
      .select("*")
      .eq("buyer_id", buyerId)
      .eq("vendor_id", vendorId)
      .eq("company_id", companyId)
      .single()

    if (existing) return existing

    // Create new conversation
    const { data, error } = await supabase!
      .from("conversations")
      .insert({
        buyer_id: buyerId,
        vendor_id: vendorId,
        company_id: companyId,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Translate message (placeholder for actual translation service)
  static async translateMessage(content: string, targetLanguage: "ja" | "en" | "vi") {
    // TODO: Integrate with translation service (Google Translate, DeepL, etc.)
    // For now, return mock translation
    const translations: Record<string, Record<string, string>> = {
      "Hello! Thank you for your interest.": {
        ja: "こんにちは！ご関心をお寄せいただき、ありがとうございます。",
        vi: "Xin chào! Cảm ơn bạn đã quan tâm.",
      },
      "We can provide a detailed proposal.": {
        ja: "詳細な提案を提供できます。",
        vi: "Chúng tôi có thể cung cấp một đề xuất chi tiết.",
      },
    }

    return translations[content]?.[targetLanguage] || content
  }
}
