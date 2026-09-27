import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { loadEnv, getEnv } from '@repo/config';
import { connectDB } from '@repo/database';
import { createAIProvider } from '@repo/ai';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { createRoutes } from './routes/index.js';
import { createServer } from 'http';
import { initSocketServer } from './socket.js';

async function main() {
  // 1. Validate environment
  const env = loadEnv();
  console.log(`\n🚀 SBMPNexus API — ${env.NODE_ENV} mode\n`);

  // 2. Connect to MongoDB
  await connectDB(env.MONGODB_URI);

  // 3. Initialize AI provider
  const aiProvider = createAIProvider({
    apiKey: env.NVIDIA_API_KEY,
    baseUrl: env.NVIDIA_BASE_URL,
    textModel: env.NVIDIA_TEXT_MODEL,
    visionModel: env.NVIDIA_VISION_MODEL,
  });

  // 4. Create Express app
  const app = express();

  // 5. Global middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('short'));
  }

  // 6. Health check
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        ai: aiProvider.isAvailable() ? 'configured' : 'mock',
      },
    });
  });

  // 7. API Routes
  app.use('/api', createRoutes(aiProvider));

  // 8. Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // 9. Create HTTP Server & Initialize Socket.IO
  const httpServer = createServer(app);
  const io = initSocketServer(httpServer);

  // Attach io to app locals so routes can use it if needed
  app.locals.io = io;

  // 10. Start server
  const port = env.PORT;
  httpServer.listen(port, () => {
    console.log(`✅ API server running at http://localhost:${port}`);
    console.log(`   Health: http://localhost:${port}/health`);
    console.log(`   API:    http://localhost:${port}/api`);
    console.log(`   Socket: ws://localhost:${port}\n`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
