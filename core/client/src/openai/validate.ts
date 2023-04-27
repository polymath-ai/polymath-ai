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
} from "./types.js";

export type ValidationIssue = {
  message: string;
  description: string;
};

const getDescription = (
  validator: z.AnyZodObject,
  path: (string | number)[]
): string => {
  let cursor = validator.shape;
  path.forEach((key) => (cursor = cursor[key]));
  return cursor.description;
};

export class ValidationError extends Error {
  issues: ValidationIssue[];
  constructor(validator: z.AnyZodObject, zodError: z.ZodError) {
    super("Validation error");
    this.name = "ValidationError";
    this.issues = zodError.issues.map((issue) => ({
      message: `"${issue.path.join("/")}" ${issue.message}`,
      description: getDescription(validator, issue.path),
    }));
  }

  toString() {
    return `${this.message}:\n${this.issues
      .map((issue) => `  - ${issue.message}\n      ${issue.description}\n`)
      .join("\n")}`;
  }
}

const formatZodError = (validator: z.AnyZodObject, error: z.ZodError) => {
  return new ValidationError(validator, error);
};

export const validateCompletionRequest = (
  request: unknown
): CompletionRequest => {
  const validation = completionRequest.safeParse(request);
  if (validation.success) return validation.data;
  throw formatZodError(completionRequest, validation.error);
};

export const validateChatCompletionRequest = (
  request: unknown
): ChatCompletionRequest => {
  const validation = chatCompletionRequest.safeParse(request);
  if (validation.success) return validation.data;
  throw formatZodError(chatCompletionRequest, validation.error);
};

export const validateEmbeddingRequest = (
  request: unknown
): EmbeddingRequest => {
  const validation = embeddingRequest.safeParse(request);
  if (validation.success) return validation.data;
  throw formatZodError(embeddingRequest, validation.error);
};
