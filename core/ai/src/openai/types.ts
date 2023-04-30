import { z } from "zod";

import {
  chatCompletionRequest,
  completionRequest,
  completionResponse,
  embeddingRequest,
} from "./schemas.js";

export type CompletionRequest = z.input<typeof completionRequest>;
export type ChatCompletionRequest = z.input<typeof chatCompletionRequest>;
export type EmbeddingRequest = z.input<typeof embeddingRequest>;

export type CompletionResponse = z.infer<typeof completionResponse>;

/** OpenAI Chat completion response
 * @see https://platform.openai.com/docs/api-reference/chat
 */
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  /**
   * The model used to generate the chat completion.
   */
  model: string;
  choices: ChatCompletionChoice[];
  usage?: ChatCompletionUsage;
}

export interface ChatCompletionChoice {
  index?: number;
  message?: ChatCompletionResponseMessage;
  delta?: ChatCompletionResponseMessage;
  finish_reason?: string;
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionResponseMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
