import { z } from "zod";

export const embeddingVectorSchema = z
  .array(z.number())
  .describe(
    "A list of floating point numbers that represent an embedding vector."
  );

export const base64EmbeddingSchema = z
  .string()
  .describe("A base64 encoded string that represents an embedding vector.");

export const bitInfoSchema = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .describe("The URL that refers to the original location of the bit."),
  image_url: z
    .optional(z.string())
    .describe("The URL of an image, associated with the bit."),
  title: z.optional(z.string()),
  description: z.optional(z.string()),
});
