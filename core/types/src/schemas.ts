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

// TODO: Remove the nulls from these fields.
// Currently, the info fields are nullable and optional. This is because
// our old Python implementation is happy to send nulls. We should make these
// just not come through over the wire.
const bitInfo = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .describe(
      "Required. The URL that refers to the original location of the bit."
    ),
  image_url: z
    .optional(z.union([z.string(), z.null()]))
    .describe("The URL of an image, associated with the bit. Can be null."),
  title: z.optional(z.union([z.string(), z.null()])),
  description: z.optional(z.union([z.string(), z.null()])),
});

const accessTag = z.string();

const bitId = z.string();

const bit = z.object({
  //Omit settings could lead to anhy part of Bit being omitted.
  id: bitId.optional(),
  text: z.string().optional(),
  token_count: z.number().optional(),
  embedding: embeddingVector.optional(),
  info: bitInfo.optional(),
  similarity: z.number().optional(),
  access_tag: accessTag.optional(),
});

const packedBit = bit.extend({
  embedding: base64Embedding.optional(),
});

const omitConfigurationField = z.enum([
  "text",
  "info",
  "embedding",
  "similarity",
  "token_count",
]);

const omitConfiguration = z.union([
  z.literal("*"),
  z.literal(""),
  omitConfigurationField,
  z.array(omitConfigurationField),
]);

const sort = z.literal("similarity");

const countType = z.enum(["token", "bit"]);

const libraryData = z.object({
  version: z.number(),
  embedding_model: embeddingModelName,
  omit: omitConfiguration.optional(),
  count_type: countType.optional(),
  sort: sort.optional(),
  bits: z.array(bit),
});

const packedLibraryData = libraryData.extend({
  bits: z.array(packedBit),
});

const askOptions = z.object({
  version: z.number().optional(),
  query_embedding: embeddingVector.optional(),
  query_embedding_model: embeddingModelName.optional(),
  count: z.number().optional(),
  count_type: countType.optional(),
  omit: omitConfiguration.optional(),
  access_token: z.string().optional(),
  sort: sort.optional(),
});

const endpointArgs = askOptions.extend({
  version: z.number().default(1),
  query_embedding: embeddingVector,
  query_embedding_model: embeddingModelName.default(
    "openai.com:text-embedding-ada-002"
  ),
});

const server = z.string().url();
// TODO: Validate as path.
const libraryFileName = z.string();

const pineconeConfig = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  namespace: z.string().optional(),
  topK: z.number().optional(),
});

const clientOptions = z.object({
  apiKey: z.string().optional(),
  servers: z.array(server).optional(),
  pinecone: pineconeConfig.optional(),
  libraryFiles: z.array(libraryFileName).optional(),
  omit: omitConfiguration.optional(),
  debug: z.boolean().optional(),
});

const serverOption = z.object({
  default: z.boolean().optional(),
  url: z.string().url(),
  name: z.string(),
});

const promptTemplate = z.string();

const completionOptions = z.object({
  prompt_template: promptTemplate.optional(),
  model: completionModelName.optional(),
  stream: z.boolean().optional(),
  system: z.string().optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  top_p: z.number().optional(),
  presence_penalty: z.number().optional(),
  frequency_penalty: z.number().optional(),
  n: z.number().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  best_of: z.number().optional(),
  echo: z.boolean().optional(),
  logprobs: z.number().optional(),
});

// TODO: Rename and change the key too.
// This is only used in the web application clients so far.
const webAppViewOptions = z.object({
  headername: z.string().optional(),
  placeholder: z.string().optional(),
  fun_queries: z.array(z.string()).optional(),
  source_prefixes: z.record(z.string()).optional(),
});

const hostConfig = z.object({
  endpoint: z.string().url().optional(),
  default_private_access_tag: accessTag.optional(),
  default_api_key: z.string().optional(),
  //TODO: refactor to be literally PolymathOptions?
  client_options: clientOptions.optional(),
  //TODO: rename to hosts?
  server_options: z.array(serverOption).optional(),
  completion_options: completionOptions.optional(),
  info: webAppViewOptions.optional(),
});

export const schemas = {
  embeddingVector,
  base64Embedding,
  embeddingModelName,
  completionModelName,
  modelName,
  bitInfo,
  bit,
  packedBit,
  libraryData,
  countType,
  packedLibraryData,
  askOptions,
  endpointArgs,
  hostConfig,
};
