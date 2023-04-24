// This is probably where `core/validation` will live eventually.

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

export const validateCompletionRequest = (
  request: unknown
): CompletionRequest => {
  return completionRequest.parse(request);
};

export const validateChatCompletionRequest = (
  request: unknown
): ChatCompletionRequest => {
  return chatCompletionRequest.parse(request);
};

export const validateEmbeddingRequest = (
  request: unknown
): EmbeddingRequest => {
  return embeddingRequest.parse(request);
};
