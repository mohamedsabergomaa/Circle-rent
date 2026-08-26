import { prisma } from '../../common/config/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CreateConversationDto, SendMessageDto } from './messaging.validation';
import { MessageSender } from '@prisma/client';

export class MessagingService {
  async getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ ownerId: userId }, { renterId: userId }],
      },
      include: {
        listing: { select: { name: true, image: true } },
        owner: { select: { fullName: true } },
        renter: { select: { fullName: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((conv) => {
      // If user is renter, the other party is owner. If user is owner, other party is renter.
      const isOwner = conv.ownerId === userId;
      const otherPartyName = isOwner ? conv.renter.fullName : conv.owner.fullName;
      const context = conv.messages.length > 0 ? conv.messages[0].body : 'No messages yet';

      return {
        id: conv.id,
        bookingId: conv.bookingId,
        listingName: conv.listing.name,
        listingImage: conv.listing.image,
        ownerName: otherPartyName,
        ownerInitial: otherPartyName.charAt(0).toUpperCase(),
        context,
        unread: conv._count.messages,
        updatedAt: conv.updatedAt.toISOString(),
      };
    });
  }

  async createConversation(renterId: string, data: CreateConversationDto) {
    // Cannot start a conversation with yourself
    if (renterId === data.ownerId) {
      throw ApiError.badRequest('Cannot start a conversation with yourself');
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({ where: { id: data.listingId } });
    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        listingId: data.listingId,
        ownerId: data.ownerId,
        renterId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          listingId: data.listingId,
          ownerId: data.ownerId,
          renterId,
        },
      });
    }

    return conversation;
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    if (conversation.ownerId !== userId && conversation.renterId !== userId) {
      throw ApiError.forbidden('Not authorized to access this conversation');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      sender: msg.senderType,
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
    }));
  }

  async sendMessage(conversationId: string, userId: string, data: SendMessageDto) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    if (conversation.ownerId !== userId && conversation.renterId !== userId) {
      throw ApiError.forbidden('Not authorized to post to this conversation');
    }

    const senderType = conversation.ownerId === userId ? MessageSender.owner : MessageSender.me;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        senderType,
        body: data.body,
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      sender: message.senderType,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    };
  }

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    if (conversation.ownerId !== userId && conversation.renterId !== userId) {
      throw ApiError.forbidden('Not authorized to access this conversation');
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }
}

export const messagingService = new MessagingService();
