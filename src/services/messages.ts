import { api } from "../lib/api"

import type { Conversation, Message } from "../types"

export async function getConversations(): Promise<Conversation[]> {
  return api<Conversation[]>("/conversations")
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return api<Message[]>(`/conversations/${conversationId}/messages`)
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<Message> {
  return api<Message>(`/conversations/${conversationId}/messages`, {
    method: "POST",

    body: JSON.stringify({ body }),
  })
}

export async function ensureConversation(
  listingId: string,
  ownerId: string,
): Promise<Conversation> {
  return api<Conversation>("/conversations", {
    method: "POST",

    body: JSON.stringify({ listingId, ownerId }),
  })
}

export async function markRead(conversationId: string): Promise<void> {
  return api(`/conversations/${conversationId}/read`, { method: "PUT" })
}
