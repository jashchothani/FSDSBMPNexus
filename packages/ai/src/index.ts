import type { AIProviderConfig } from '@repo/types';
import { BaseAIProvider } from './providers/base.provider.js';
import { NVIDIAProvider } from './providers/nvidia.provider.js';
import { MockProvider } from './providers/mock.provider.js';

export { BaseAIProvider } from './providers/base.provider.js';
export { NVIDIAProvider } from './providers/nvidia.provider.js';
export { MockProvider } from './providers/mock.provider.js';
export {
  buildRAGContext,
  buildGroundedPrompt,
  generateSuggestedQuestions,
  executeRAGRequest,
  type RAGContext,
  type RAGResponse,
} from './rag/pipeline.js';

/**
 * Create the appropriate AI provider based on configuration.
 * Falls back to MockProvider when NVIDIA API is not configured.
 */
export function createAIProvider(config: {
  apiKey?: string;
  baseUrl?: string;
  textModel?: string;
  visionModel?: string;
}): BaseAIProvider {
  if (config.apiKey) {
    console.log('🤖 AI Provider: NVIDIA (API key configured)');
    return new NVIDIAProvider({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://integrate.api.nvidia.com/v1',
      textModel: config.textModel || 'meta/llama-3.3-70b-instruct',
      visionModel: config.visionModel,
    });
  }

  console.log('🤖 AI Provider: Mock (no API key — set NVIDIA_API_KEY for real AI)');
  return new MockProvider();
}
