import { z } from "zod";

const EMBEDDING_VECTOR_LENGTH = 1536;

const embeddingVector = z
  .array(z.number())
  .length(
    EMBEDDING_VECTOR_LENGTH,
    `Embedding vector must be ${EMBEDDING_VECTOR_LENGTH} elements long.`
  )
  .describe(
    "A list of floating point numbers that represent an embedding vector."
  );

const base64Embedding = z
  .string()
  .describe("A base64 encoded string that represents an embedding vector.");

const embeddingModelName = z.literal("openai.com:text-embedding-ada-002");

const completionModelName = z.enum([
  "text-davinci-003",
  "gpt-3.5-turbo",
  "gpt-4",
]);

const modelName = z.union([embeddingModelName, completionModelName]);

const bitInfo = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .describe("The URL that refers to the original location of the bit."),
  image_url: z
    .optional(z.string())
    .describe("The URL of an image, associated with the bit."),
  title: z.optional(z.string()),
  description: z.optional(z.string()),
});

export const schemas = {
  embeddingVector,
  base64Embedding,
  embeddingModelName,
  completionModelName,
  modelName,
  bitInfo,
};
