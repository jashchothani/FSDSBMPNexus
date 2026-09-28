import type {
  AICompletionRequest,
  AICompletionResponse,
  AIImageAnalysisRequest,
  DocumentAnalysisResult,
  AIProviderConfig,
} from '@repo/types';

/**
 * Abstract base class for AI providers.
 * Concrete implementations: NVIDIAProvider, MockProvider.
 * This abstraction ensures the app is never permanently coupled to one AI provider.
 */
export abstract class BaseAIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  /** Get the provider name. */
  abstract get name(): string;

  /** Check if the provider is available and configured. */
  abstract isAvailable(): boolean;

  /** Send a chat completion request. */
  abstract chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse>;

  /** Send a streaming chat completion request. */
  abstract chatCompletionStream(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<AICompletionResponse>;

  /** Analyze an image (for question extraction, understanding). */
  abstract analyzeImage(request: AIImageAnalysisRequest): Promise<AICompletionResponse>;

  /** Analyze a document (extract questions, classify, etc.). */
  abstract analyzeDocument(text: string, prompt: string): Promise<DocumentAnalysisResult>;

  /** Generate embeddings for text (for semantic search/similarity). */
  abstract generateEmbedding(text: string): Promise<number[]>;

  /**
   * Check if vision/multimodal capabilities are available.
   * Not all providers or model configurations support image input.
   */
  abstract supportsVision(): boolean;

  /**
   * Check if embedding generation is supported.
   */
  abstract supportsEmbeddings(): boolean;
}
