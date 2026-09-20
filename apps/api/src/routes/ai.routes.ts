import { Router } from 'express';
import { aiChatSchema } from '@repo/types';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { uploadImage } from '../middleware/upload.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { AIConversationModel, Question, Paper, Material } from '@repo/database';
import type { BaseAIProvider } from '@repo/ai';
import { buildRAGContext, executeRAGRequest } from '@repo/ai';
import type { AISource } from '@repo/types';
import { v4 as uuidv4 } from 'uuid';

export function createAIRoutes(aiProvider: BaseAIProvider) {
  const router = Router();

  /**
   * POST /api/ai/chat
   * Send a message to NexusAI.
   */
  router.post('/chat', authenticate, validateBody(aiChatSchema), async (req, res, next) => {
    try {
      const { message, conversationId, answerMode, subjectId, usePlatformSources } = req.body;

      // 1. Retrieve relevant content from database (RAG)
      let sources: AISource[] = [];
      const sourceTexts: { title: string; content: string; type: string }[] = [];

      if (usePlatformSources !== false) {
        // Search questions
        const regex = new RegExp(message.split(' ').slice(0, 5).join('|'), 'i');
        const filter: Record<string, unknown> = {};
        if (subjectId) filter.subjectId = subjectId;

        const relatedQuestions = await Question.find({
          ...filter,
          text: regex,
        }).populate('topicIds', 'name').limit(5).lean();

        for (const q of relatedQuestions) {
          sources.push({
            type: 'DATABASE',
            title: q.text.substring(0, 100),
            resourceType: 'question',
            resourceId: q._id.toString(),
          });
          sourceTexts.push({
            title: `Question (${q.year || 'N/A'}, ${q.marks || '?'} marks)`,
            content: q.text,
            type: 'question',
          });
        }

        // Search materials
        const relatedMaterials = await Material.find({
          ...filter,
          status: 'APPROVED',
          $or: [{ title: regex }, { description: regex }],
        }).limit(3).lean();

        for (const m of relatedMaterials) {
          sources.push({
            type: 'DATABASE',
            title: m.title,
            resourceType: 'material',
            resourceId: m._id.toString(),
          });
          sourceTexts.push({
            title: m.title,
            content: m.description || m.title,
            type: 'material',
          });
        }
      }

      // 2. Build RAG context
      const context = buildRAGContext(message, sources, sourceTexts);
      if (subjectId) context.subjectId = subjectId;

      // 3. Get conversation history
      let conversationHistory: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];
      let conversation = conversationId
        ? await AIConversationModel.findOne({ _id: conversationId, userId: req.user!.userId })
        : null;

      if (conversation) {
        // Get last 10 messages for context
        conversationHistory = conversation.messages
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));
      }

      // 4. Execute RAG request
      const aiResponse = await executeRAGRequest(
        aiProvider,
        context,
        conversationHistory,
        answerMode
      );

      // 5. Save conversation
      const userMsg = {
        id: uuidv4(),
        role: 'user' as const,
        content: message,
        timestamp: new Date(),
      };

      const assistantMsg = {
        id: uuidv4(),
        role: 'assistant' as const,
        content: aiResponse.content,
        sources: aiResponse.sources,
        answerMode,
        suggestedQuestions: aiResponse.suggestedQuestions,
        timestamp: new Date(),
      };

      if (conversation) {
        conversation.messages.push(userMsg, assistantMsg);
        await conversation.save();
      } else {
        conversation = await AIConversationModel.create({
          userId: req.user!.userId,
          title: message.substring(0, 80),
          messages: [userMsg, assistantMsg],
          subjectId,
        });
      }

      res.json({
        success: true,
        data: {
          conversationId: conversation._id,
          message: assistantMsg,
          sources: aiResponse.sources,
          suggestedQuestions: aiResponse.suggestedQuestions,
          isGrounded: aiResponse.isGrounded,
        },
      });
    } catch (error) { next(error); }
  });

  /**
   * GET /api/ai/conversations
   * List user's AI conversations.
   */
  router.get('/conversations', authenticate, async (req, res, next) => {
    try {
      const conversations = await AIConversationModel.find({ userId: req.user!.userId })
        .select('title createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();
      res.json({ success: true, data: { conversations } });
    } catch (error) { next(error); }
  });

  /**
   * GET /api/ai/conversations/:id
   * Get a full conversation.
   */
  router.get('/conversations/:id', authenticate, async (req, res, next) => {
    try {
      const conversation = await AIConversationModel.findOne({
        _id: req.params.id,
        userId: req.user!.userId,
      }).lean();
      if (!conversation) throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
      res.json({ success: true, data: { conversation } });
    } catch (error) { next(error); }
  });

  /**
   * POST /api/ai/analyze-image
   * Analyze an uploaded image (question photo, diagram, etc.).
   */
  router.post('/analyze-image', authenticate, uploadImage, async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'NO_FILE', 'Please upload an image');
      }

      if (!aiProvider.supportsVision()) {
        throw new AppError(
          501,
          'VISION_UNAVAILABLE',
          'Image analysis is not available. The AI provider does not support vision capabilities. Configure a vision-capable model.'
        );
      }

      const imageBase64 = req.file.buffer.toString('base64');
      const prompt = (req.body.prompt as string) || 'Analyze this academic image. Extract any questions, identify the subject/topic, and provide an explanation.';

      const response = await aiProvider.analyzeImage({
        imageBase64,
        prompt,
        mimeType: req.file.mimetype,
      });

      res.json({
        success: true,
        data: {
          analysis: response.content,
          model: response.model,
        },
      });
    } catch (error) { next(error); }
  });

  return router;
}
