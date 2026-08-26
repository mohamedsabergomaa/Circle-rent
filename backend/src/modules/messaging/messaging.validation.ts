import { z } from 'zod';

export const createConversationSchema = z.object({
  listingId: z.string().uuid(),
  ownerId: z.string().uuid(),
});

export type CreateConversationDto = z.infer<typeof createConversationSchema>;

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
