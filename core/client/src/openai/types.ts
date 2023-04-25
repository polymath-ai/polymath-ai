import { z } from "zod";

import {
  chatCompletionRequest,
  completionRequest,
  completionResponse,
  embeddingRequest,
} from "./schemas.js";

export type CompletionRequest = z.infer<typeof completionRequest>;
export type ChatCompletionRequest = z.infer<typeof chatCompletionRequest>;
export type EmbeddingRequest = z.infer<typeof embeddingRequest>;

export type CompletionResponse = z.infer<typeof completionResponse>;

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
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
