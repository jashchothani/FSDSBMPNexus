import type {
  AICompletionRequest,
  AICompletionResponse,
  AIImageAnalysisRequest,
  DocumentAnalysisResult,
} from '@repo/types';
import { BaseAIProvider } from './base.provider.js';

/**
 * Mock AI provider for development and testing.
 * Returns realistic but clearly marked mock responses.
 * No external API calls are made.
 */
export class MockProvider extends BaseAIProvider {
  constructor() {
    super({
      provider: 'mock',
      textModel: 'mock-model',
      baseUrl: 'http://localhost',
      maxTokens: 4000,
      temperature: 0.3,
    });
  }

  get name(): string {
    return 'Mock';
  }

  isAvailable(): boolean {
    return true; // Always available
  }

  async chatCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    const userMessage = request.messages.find((m) => m.role === 'user')?.content ?? '';

    // Simulate processing delay
    await this.delay(500);

    const response = this.generateMockResponse(userMessage);

    return {
      content: response,
      model: 'mock-model',
      usage: {
        promptTokens: Math.ceil(userMessage.length / 4),
        completionTokens: Math.ceil(response.length / 4),
        totalTokens: Math.ceil((userMessage.length + response.length) / 4),
      },
      finishReason: 'stop',
    };
  }

  async chatCompletionStream(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<AICompletionResponse> {
    const response = await this.chatCompletion(request);
    const words = response.content.split(' ');

    for (const word of words) {
      onChunk(word + ' ');
      await this.delay(30);
    }

    return response;
  }

  async analyzeImage(request: AIImageAnalysisRequest): Promise<AICompletionResponse> {
    await this.delay(800);

    return {
      content: `**[Mock AI Analysis]**

I can see what appears to be an academic question or diagram in the uploaded image.

**Detected Content:**
- This appears to be a question from a Computer Science examination
- The image contains text that may relate to database management or algorithms

**Note:** This is a mock response. Configure a NVIDIA API key to enable real image analysis.

*Prompt received: ${request.prompt}*`,
      model: 'mock-vision-model',
    };
  }

  async analyzeDocument(_text: string, _prompt: string): Promise<DocumentAnalysisResult> {
    await this.delay(600);

    return {
      questions: [
        { text: '[Mock] Explain the concept demonstrated in this document.', questionNumber: '1', marks: 5, estimatedType: 'LONG_ANSWER' },
        { text: '[Mock] Define the key terms used in this topic.', questionNumber: '2', marks: 2, estimatedType: 'SHORT_ANSWER' },
      ],
      topics: ['[Mock Topic 1]', '[Mock Topic 2]'],
      units: ['[Mock Unit]'],
      difficulty: 'MEDIUM',
      metadata: {
        totalQuestions: 2,
        estimatedMarks: 7,
        subjectHints: ['[Mock Subject]'],
      },
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Return a deterministic mock embedding based on text length
    const dim = 384;
    const embedding = new Array(dim);
    for (let i = 0; i < dim; i++) {
      embedding[i] = Math.sin((text.length * (i + 1)) / dim);
    }
    return embedding;
  }

  supportsVision(): boolean {
    return true;
  }

  supportsEmbeddings(): boolean {
    return true;
  }

  private generateMockResponse(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('acid') || lowerQuery.includes('transaction')) {
      return `**[Mock AI — Configure NVIDIA API for real responses]**

## ACID Properties

ACID stands for **Atomicity, Consistency, Isolation, Durability**. These are the fundamental properties that guarantee reliable database transactions.

### 1. Atomicity
A transaction is treated as a single, indivisible unit. Either all operations within the transaction are completed, or none of them are.

### 2. Consistency
A transaction must transition the database from one valid state to another valid state, maintaining all defined rules and constraints.

### 3. Isolation
Concurrent transactions should not interfere with each other. Each transaction should behave as if it is the only transaction running.

### 4. Durability
Once a transaction is committed, its effects are permanent and survive system failures.

---
*⚠️ This is a mock response for development. Connect a NVIDIA API key for real AI-powered answers.*`;
    }

    if (lowerQuery.includes('normalization') || lowerQuery.includes('normal form')) {
      return `**[Mock AI — Configure NVIDIA API for real responses]**

## Normalization

Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.

### Normal Forms:
1. **1NF** — Eliminate repeating groups; each cell contains a single value
2. **2NF** — Remove partial dependencies on a composite key
3. **3NF** — Remove transitive dependencies
4. **BCNF** — Every determinant must be a candidate key

---
*⚠️ This is a mock response for development.*`;
    }

    return `**[Mock AI — Configure NVIDIA API for real responses]**

Thank you for your question about: "${query.substring(0, 100)}"

Here is a structured response:

### Key Concepts
- This topic involves fundamental principles from your course
- Understanding the core definitions is essential for exam preparation

### Exam Tips
- Focus on definitions and key differences
- Use diagrams where applicable
- Practice with previous year questions

### Related Topics
- Review related concepts in your unit
- Check the question bank for similar questions

---
*⚠️ This is a mock response for development. Connect a NVIDIA API key for real AI-powered answers.*`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
