/* eslint-disable @typescript-eslint/no-empty-interface */
import { z } from "zod";

import {
  chatCompletionRequest,
  completionRequest,
  completionResponse,
  embeddingRequest,
} from "./schemas.js";

export interface CompletionRequest extends z.input<typeof completionRequest> {}
export interface ValidatedCompletionRequest
  extends z.output<typeof completionRequest> {}
export interface ChatCompletionRequest
  extends z.input<typeof chatCompletionRequest> {}
export interface ValidatedChatCompletionRequest
  extends z.output<typeof chatCompletionRequest> {}
export interface EmbeddingRequest extends z.input<typeof embeddingRequest> {}
export interface ValidatedEmbeddingRequest
  extends z.output<typeof embeddingRequest> {}

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
