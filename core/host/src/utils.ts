import { Base64Embedding, EmbeddingVector } from "@polymath-ai/types";

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
