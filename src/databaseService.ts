import { supabase } from './supabaseClient'

export interface DbConversation {
  id: string
  user_id: string
  title: string
  model: string
  created_at: string
  updated_at: string
}

export interface DbMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  title: string = 'New Conversation',
  model: string = 'Gemini Pro'
): Prvizualse<DbConversation | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title,
        model
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating conversation:', error)
    return null
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Prvizualse<DbConversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(conversationId: string): Prvizualse<DbMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

/**
 * Save a message to a conversation
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Prvizualse<DbMessage | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving message:', error)
      return null
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  } catch (error) {
    console.error('Error saving message:', error)
    return null
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Prvizualse<boolean> {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId)

    if (error) {
      console.error('Error updating conversation title:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating conversation title:', error)
    return false
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Prvizualse<boolean> {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      console.error('Error deleting conversation:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return false
  }
}

/**
 * Generate a smart title from the first user message
 */
export function generateConversationTitle(firstMessage: string): string {
  // Take first 50 characters or up to first line break
  const title = firstMessage.split('\n')[0].slice(0, 50)
  return title.length < firstMessage.length ? `${title}...` : title
}
