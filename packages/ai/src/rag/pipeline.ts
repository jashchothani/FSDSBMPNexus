import type { AICompletionRequest, AICompletionResponse, AISource } from '@repo/types';
import { AI_MAX_CONTEXT_TOKENS } from '@repo/config';
import type { BaseAIProvider } from '../providers/base.provider.js';

/**
 * RAG (Retrieval-Augmented Generation) pipeline for NexusAI.
 * Ensures AI responses are grounded in actual platform content.
 *
 * Flow:
 * 1. Query understanding
 * 2. Search SBMPNexus database for relevant content
 * 3. Build context from retrieved content
 * 4. Send grounded prompt to AI
 * 5. Return response with source citations
 */

export interface RAGContext {
  query: string;
  retrievedSources: AISource[];
  contextText: string;
  subjectId?: string;
}

export interface RAGResponse {
  content: string;
  sources: AISource[];
  suggestedQuestions: string[];
  isGrounded: boolean;
}

/**
 * Build a RAG context from retrieved database content.
 */
export function buildRAGContext(
  query: string,
  sources: AISource[],
  sourceTexts: { title: string; content: string; type: string }[]
): RAGContext {
  // Build context string from retrieved sources
  let contextText = '';
  let tokenEstimate = 0;

  for (const source of sourceTexts) {
    const sourceBlock = `\n--- Source: ${source.title} (${source.type}) ---\n${source.content}\n`;
    const estimatedTokens = Math.ceil(sourceBlock.length / 4);

    if (tokenEstimate + estimatedTokens > AI_MAX_CONTEXT_TOKENS) {
      break; // Don't exceed context limit
    }

    contextText += sourceBlock;
    tokenEstimate += estimatedTokens;
  }

  return {
    query,
    retrievedSources: sources,
    contextText,
  };
}

/**
 * Build the grounded system prompt for RAG-based responses.
 */
export function buildGroundedPrompt(context: RAGContext, answerMode?: string): string {
  let systemPrompt = `You are NexusAI, an intelligent academic assistant for the SBMPNexus platform.

IMPORTANT RULES:
1. Base your answers primarily on the provided source material from SBMPNexus.
2. Clearly distinguish between:
   - Information retrieved from SBMPNexus sources (cite them)
   - Your own explanations or elaborations (mark as "explanation")
   - Information you're uncertain about (explicitly say "I'm not certain about this")
3. NEVER invent university syllabus details, exam dates, question-paper history, or academic facts.
4. NEVER claim something "will definitely appear in the next exam."
5. For historical patterns, use language like "This topic has frequently appeared historically."
6. Be educational and clear, not unnecessarily verbose.
7. Format answers with proper markdown: headings, bullet points, bold for key terms.`;

  if (answerMode) {
    const modeInstructions: Record<string, string> = {
      SIMPLE_EXPLANATION: 'Provide a simple, easy-to-understand explanation suitable for beginners.',
      QUICK_REVISION: 'Provide a concise revision summary with key points and formulas.',
      TWO_MARK: 'Provide a brief answer suitable for a 2-mark question (2-3 sentences).',
      FIVE_MARK: 'Provide a structured answer suitable for a 5-mark question with key points and a brief explanation.',
      TEN_MARK: 'Provide a comprehensive answer suitable for a 10-mark question with detailed explanation, examples, and diagrams if applicable.',
      DETAILED: 'Provide a thorough, detailed explanation covering all aspects of the topic.',
      VIVA_PREP: 'Provide viva-style Q&A preparation with potential follow-up questions and concise answers.',
    };

    systemPrompt += `\n\nAnswer Mode: ${modeInstructions[answerMode] || 'Provide a clear, educational response.'}`;
  }

  if (context.contextText) {
    systemPrompt += `\n\n--- SBMPNEXUS SOURCE MATERIAL ---\n${context.contextText}\n--- END SOURCE MATERIAL ---`;
  } else {
    systemPrompt += `\n\nNo specific SBMPNexus sources were found for this query. Provide a general educational response but clearly note that you're providing general knowledge, not platform-specific content.`;
  }

  return systemPrompt;
}

/**
 * Generate suggested follow-up questions based on the conversation.
 */
export function generateSuggestedQuestions(query: string, _response: string): string[] {
  const suggestions: string[] = [];

  // Basic heuristic suggestions — the AI itself could also generate these
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('explain') || lowerQuery.includes('what')) {
    suggestions.push(`Give me a 5-mark answer for this`);
    suggestions.push(`Show previous year questions on this topic`);
    suggestions.push(`Quiz me on this topic`);
  }

  if (lowerQuery.includes('quiz') || lowerQuery.includes('test')) {
    suggestions.push(`Show me my weak topics`);
    suggestions.push(`Generate a harder quiz`);
  }

  if (suggestions.length === 0) {
    suggestions.push('Explain this in simpler terms');
    suggestions.push('Show related questions');
    suggestions.push('Create a study plan for this topic');
  }

  return suggestions.slice(0, 4);
}

/**
 * Execute a RAG-grounded AI request.
 */
export async function executeRAGRequest(
  provider: BaseAIProvider,
  context: RAGContext,
  conversationHistory: { role: 'user' | 'assistant' | 'system'; content: string }[],
  answerMode?: string
): Promise<RAGResponse> {
  const systemPrompt = buildGroundedPrompt(context, answerMode);

  const messages: AICompletionRequest['messages'] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: context.query },
  ];

  const response = await provider.chatCompletion({ messages });

  return {
    content: response.content,
    sources: context.retrievedSources,
    suggestedQuestions: generateSuggestedQuestions(context.query, response.content),
    isGrounded: context.retrievedSources.length > 0,
  };
}
