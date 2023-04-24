import { z } from "zod";

import {
  chatCompletionRequest,
  completionRequest,
  embeddingRequest,
} from "./schemas.js";
import {
  ChatCompletionRequest,
  CompletionRequest,
  EmbeddingRequest,
} from "./index.js";

// This is probably where `core/validation` will live eventually.

const formatZodError = (error: z.ZodError) => {
  return error;
};

export const validateCompletionRequest = (
  request: unknown
): CompletionRequest => {
  const validation = completionRequest.safeParse(request);
  if (validation.success) return validation.data;
  throw formatZodError(validation.error);
};

export const validateChatCompletionRequest = (
  request: unknown
): ChatCompletionRequest => {
  const validation = chatCompletionRequest.safeParse(request);
  if (validation.success) return validation.data;
  throw formatZodError(validation.error);
};

export const validateEmbeddingRequest = (
  request: unknown
): EmbeddingRequest => {
  const validation = embeddingRequest.safeParse(request);
  if (validation.success) return validation.data;
  throw formatZodError(validation.error);
};
