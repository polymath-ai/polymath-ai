import { Base64Embedding, EmbeddingVector } from "@polymath-ai/types";
import { AskOptions, schemas } from "@polymath-ai/types";

// TODO: Deduplicate this constant.
export const EMBEDDING_VECTOR_LENGTH = 1536;

function dotProduct(vecA: EmbeddingVector, vecB: EmbeddingVector): number {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec: EmbeddingVector): number {
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
export function cosineSimilarity(
  vecA: EmbeddingVector,
  vecB: EmbeddingVector
): number {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

export function decodeEmbedding(data: Base64Embedding): EmbeddingVector {
  return Array.from(
    new Float32Array(new Uint8Array(Buffer.from(data, "base64")).buffer)
  );
}

export function encodeEmbedding(data: EmbeddingVector): Base64Embedding {
  return Buffer.from(new Float32Array(data).buffer).toString("base64");
}

export const fromObject = (data: Record<string, unknown>): AskOptions => {
  if (data.query_embedding)
    data.query_embedding = decodeEmbedding(data.query_embedding as string);
  if (data.version) data.version = parseInt(data.version as string);
  if (data.count) data.count = parseInt(data.count as string);
  // Important: Using `endpointArgs` fills in good defaults.
  return schemas.endpointArgs.parse(data) as AskOptions;
};

export const fromFormData = (formData: FormData): AskOptions => {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  return fromObject(data);
};
