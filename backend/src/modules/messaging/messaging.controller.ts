import { Request, Response, NextFunction } from 'express';
import { messagingService } from './messaging.service';
import { createConversationSchema, sendMessageSchema } from './messaging.validation';

export class MessagingController {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const conversations = await messagingService.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }

  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const data = createConversationSchema.parse(req.body);
      const conversation = await messagingService.createConversation(userId, data);
      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { conversationId } = req.params;
      const messages = await messagingService.getMessages(conversationId, userId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { conversationId } = req.params;
      const data = sendMessageSchema.parse(req.body);
      const message = await messagingService.sendMessage(conversationId, userId, data);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { conversationId } = req.params;
      const result = await messagingService.markAsRead(conversationId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const messagingController = new MessagingController();
