// --------------------------------------------------------------------------
//  Helpers for tokens, models, and math to be used elsewhere

import {
  Base64Embedding,
  EmbeddingVector,
  ModelName
} from "./types.js";

// --------------------------------------------------------------------------
const DEFAULT_MAX_TOKENS_COMPLETION = 1024; // tokens reserved for the answer
const DEFAULT_MAX_TOKENS_FOR_MODEL = 4000; // max tokens for text-davinci-003
const MAX_TOKENS_FOR_MODEL : {[name in ModelName] : number} = {
  "text-davinci-003": 4000,
  "openai:text-embedding-ada-002": 8191,
  "gpt-3.5-turbo": 4096,
};
const EMBEDDING_VECTOR_LENGTH = 1536;

function encodeEmbedding(data : EmbeddingVector) : Base64Embedding {
  return Buffer.from(new Float32Array(data).buffer).toString("base64");
}

function decodeEmbedding(data : Base64Embedding) : EmbeddingVector {
  return Array.from(
    new Float32Array(new Uint8Array(Buffer.from(data, "base64")).buffer)
  );
}

function dotProduct(vecA : EmbeddingVector, vecB : EmbeddingVector) : number {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec : EmbeddingVector) : number {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

// Cosine similarity is the dot products of the two vectors divided by the product of their magnitude
// https://en.wikipedia.org/wiki/Cosine_similarity
//
// We use this to compare two embedding vectors
function cosineSimilarity(vecA : EmbeddingVector, vecB : EmbeddingVector) : number {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

function getMaxTokensForModel(model : ModelName) : number {
  return MAX_TOKENS_FOR_MODEL[model] || DEFAULT_MAX_TOKENS_FOR_MODEL;
}

export {
  encodeEmbedding,
  decodeEmbedding,
  cosineSimilarity,
  getMaxTokensForModel,
  DEFAULT_MAX_TOKENS_COMPLETION,
  DEFAULT_MAX_TOKENS_FOR_MODEL,
  EMBEDDING_VECTOR_LENGTH,
};
