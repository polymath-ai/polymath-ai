// --------------------------------------------------------------------------
//  Helpers for tokens, models, and math to be used elsewhere

import {
  Base64Embedding,
  EmbeddingVector,
  ModelName,
} from "@polymath-ai/types";

// --------------------------------------------------------------------------
const DEFAULT_MAX_TOKENS_COMPLETION = 1024; // tokens reserved for the answer
const DEFAULT_MAX_TOKENS_FOR_MODEL = 4000; // max tokens for text-davinci-003
const MAX_TOKENS_FOR_MODEL: { [name in ModelName]: number } = {
  "text-davinci-003": 4000,
  "openai.com:text-embedding-ada-002": 8191,
  "gpt-3.5-turbo": 4096,
  "gpt-4": 4096,
};
const EMBEDDING_VECTOR_LENGTH = 1536;

function encodeEmbedding(data: EmbeddingVector): Base64Embedding {
  return Buffer.from(new Float32Array(data).buffer).toString("base64");
}
function getMaxTokensForModel(model: ModelName): number {
  return MAX_TOKENS_FOR_MODEL[model] || DEFAULT_MAX_TOKENS_FOR_MODEL;
}

export {
  encodeEmbedding,
  getMaxTokensForModel,
  DEFAULT_MAX_TOKENS_COMPLETION,
  DEFAULT_MAX_TOKENS_FOR_MODEL,
  EMBEDDING_VECTOR_LENGTH,
};
