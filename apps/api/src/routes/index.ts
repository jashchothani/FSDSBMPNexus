import { Router } from 'express';
import type { BaseAIProvider } from '@repo/ai';
import { authRoutes } from './auth.routes.js';
import { academicRoutes } from './academic.routes.js';
import { paperRoutes } from './paper.routes.js';
import { questionRoutes } from './question.routes.js';
import { bookmarkRoutes } from './bookmark.routes.js';
import { searchRoutes } from './search.routes.js';
import { createAIRoutes } from './ai.routes.js';
import { adminRoutes } from './admin.routes.js';
import { arenaRoutes } from './arena.routes.js';
import { chatRoutes } from './chat.routes.js';
import { toolsRoutes } from './tools.routes.js';

/**
 * Create all API routes.
 * The AI provider is injected here to avoid global state.
 */
export function createRoutes(aiProvider: BaseAIProvider): Router {
  const router = Router();

  // Auth
  router.use('/auth', authRoutes);

  // Academic hierarchy
  router.use('/', academicRoutes);

  // Content
  router.use('/papers', paperRoutes);
  router.use('/questions', questionRoutes);

  // User features
  router.use('/bookmarks', bookmarkRoutes);

  // Search
  router.use('/search', searchRoutes);

  // AI
  router.use('/ai', createAIRoutes(aiProvider));

  // Admin
  router.use('/admin', adminRoutes);

  // Arena
  router.use('/arena', arenaRoutes);

  // Chat
  router.use('/chat', chatRoutes);

  // Academic Utilities & Document Tools
  router.use('/tools', toolsRoutes);

  return router;
}
