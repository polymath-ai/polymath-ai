// This is probably where `core/validation` will live eventually.

import { chatCompletionRequest, completionRequest } from "./schemas.js";
import { ChatCompletionRequest, CompletionRequest } from "./index.js";

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
