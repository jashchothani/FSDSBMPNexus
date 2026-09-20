import OpenAI from 'openai';
import type {
  AICompletionRequest,
  AICompletionResponse,
  AIImageAnalysisRequest,
  DocumentAnalysisResult,
} from '@repo/types';
import { BaseAIProvider } from './base.provider.js';

/**
 * NVIDIA AI Provider using the OpenAI-compatible API at integrate.api.nvidia.com/v1.
 * Supports text completion, vision (when model supports it), and document analysis.
 */
export class NVIDIAProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: { apiKey: string; baseUrl: string; textModel: string; visionModel?: string }) {
    super({
      provider: 'nvidia',
      textModel: config.textModel,
      visionModel: config.visionModel,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      maxTokens: 4000,
      temperature: 0.3,
    });

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  get name(): string {
    return 'NVIDIA';
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.textModel,
        messages: request.messages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        stream: false,
      });

      const choice = response.choices[0];
      return {
        content: choice?.message?.content ?? '',
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
        finishReason: choice?.finish_reason ?? undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown AI error';
      throw new Error(`NVIDIA AI completion failed: ${message}`);
    }
  }

  async chatCompletionStream(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<AICompletionResponse> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.textModel,
        messages: request.messages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        stream: true,
      });

      let fullContent = '';
      let model = this.config.textModel;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          onChunk(delta);
        }
        if (chunk.model) model = chunk.model;
      }

      return {
        content: fullContent,
        model,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown AI error';
      throw new Error(`NVIDIA AI streaming failed: ${message}`);
    }
  }

  async analyzeImage(request: AIImageAnalysisRequest): Promise<AICompletionResponse> {
    if (!this.supportsVision()) {
      throw new Error('Vision model not configured. Image analysis is not available.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.visionModel!,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: request.prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${request.mimeType};base64,${request.imageBase64}`,
                },
              },
            ] as OpenAI.Chat.Completions.ChatCompletionContentPart[],
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: 0.2,
        stream: false,
      });

      const choice = response.choices[0];
      return {
        content: choice?.message?.content ?? '',
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown AI error';
      throw new Error(`NVIDIA image analysis failed: ${message}`);
    }
  }

  async analyzeDocument(text: string, prompt: string): Promise<DocumentAnalysisResult> {
    const systemPrompt = `You are an academic document analyzer. Analyze the given document text and extract structured information.
Return your response as valid JSON matching this exact structure:
{
  "questions": [{ "text": "...", "questionNumber": "1a", "marks": 5, "estimatedType": "LONG_ANSWER" }],
  "topics": ["topic1", "topic2"],
  "units": ["unit1"],
  "difficulty": "MEDIUM",
  "metadata": { "totalQuestions": 0, "estimatedMarks": 0, "subjectHints": ["DBMS"] }
}`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${prompt}\n\nDocument text:\n${text}` },
      ],
      temperature: 0.1,
      maxTokens: 4000,
    });

    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response.content;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1]!;
      }
      return JSON.parse(jsonStr.trim()) as DocumentAnalysisResult;
    } catch {
      // Return a safe fallback if AI response isn't valid JSON
      return {
        questions: [],
        topics: [],
        units: [],
        difficulty: 'MEDIUM',
        metadata: { totalQuestions: 0, estimatedMarks: 0, subjectHints: [] },
      };
    }
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    // NVIDIA API catalog may have embedding models, but availability varies.
    // For now, return empty — the system degrades gracefully without embeddings.
    console.warn('Embedding generation not yet implemented for NVIDIA provider.');
    return [];
  }

  supportsVision(): boolean {
    return !!this.config.visionModel;
  }

  supportsEmbeddings(): boolean {
    return false; // Will be enabled when a verified embedding model is available
  }
}
