import { z } from "zod";

const EMBEDDING_VECTOR_LENGTH = 1536;

export const embeddingVector = z
  .array(z.number())
  .length(
    EMBEDDING_VECTOR_LENGTH,
    `Embedding vector must be ${EMBEDDING_VECTOR_LENGTH} elements long.`
  )
  .describe(
    "A list of floating point numbers that represent an embedding vector."
  );

export const base64Embedding = z
  .string()
  .describe("A base64 encoded string that represents an embedding vector.");

export const embeddingModelName = z.literal(
  "openai.com:text-embedding-ada-002"
);

export const completionModelName = z.enum([
  "text-davinci-003",
  "gpt-3.5-turbo",
  "gpt-4",
]);

export const modelName = z.union([embeddingModelName, completionModelName]);

// TODO: Remove the nulls from these fields.
// Currently, the info fields are nullable and optional. This is because
// our old Python implementation is happy to send nulls. We should make these
// just not come through over the wire.
export const bitInfo = z.object({
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

export const bit = z.object({
  //Omit settings could lead to anhy part of Bit being omitted.
  id: bitId.optional(),
  text: z.string().optional(),
  token_count: z.number().optional(),
  embedding: embeddingVector.optional(),
  info: bitInfo.optional(),
  similarity: z.number().optional(),
  access_tag: accessTag.optional(),
});

export const packedBit = bit.extend({
  embedding: base64Embedding.optional(),
});

export const omitConfigurationField = z.enum([
  "text",
  "info",
  "embedding",
  "similarity",
  "token_count",
]);

export const omitConfiguration = z.union([
  z.literal("*"),
  z.literal(""),
  omitConfigurationField,
  z.array(omitConfigurationField),
]);

export const sort = z.literal("similarity");

export const countType = z.enum(["token", "bit"]);

export const libraryData = z.object({
  version: z.number(),
  embedding_model: embeddingModelName,
  omit: omitConfiguration.optional(),
  count_type: countType.optional(),
  sort: sort.optional(),
  bits: z.array(bit),
});

export const packedLibraryData = libraryData.extend({
  bits: z.array(packedBit),
});

export const askOptions = z.object({
  version: z.number().optional(),
  query_embedding: embeddingVector.optional(),
  query_embedding_model: embeddingModelName.optional(),
  count: z.number().optional(),
  count_type: countType.optional(),
  omit: omitConfiguration.optional(),
  access_token: z.string().optional(),
  sort: sort.optional(),
});

export const endpointArgs = askOptions.extend({
  version: z.number().default(1),
  query_embedding: embeddingVector,
  query_embedding_model: embeddingModelName.default(
    "openai.com:text-embedding-ada-002"
  ),
});

export const server = z.string().url();
// TODO: Validate as path.
export const libraryFileName = z.string();

export const pineconeConfig = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  namespace: z.string().optional(),
  topK: z.number().optional(),
});

export const clientOptions = z.object({
  apiKey: z.string().optional(),
  servers: z.array(server).optional(),
  pinecone: pineconeConfig.optional(),
  libraryFiles: z.array(libraryFileName).optional(),
  omit: omitConfiguration.optional(),
  debug: z.boolean().optional(),
});

export const serverOption = z.object({
  default: z.boolean().optional(),
  url: z.string().url(),
  name: z.string(),
});

const promptTemplate = z.string();

export const completionOptions = z.object({
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

/**
 * From https://github.com/openai/openai-node/blob/master/api.ts,
 * amalgamation of types
 * `CreateCompletionRequest` and `CreateChatCompletionRequest`
 */
const completionRequestSharedBits = z.object({
  // TODO: Reconcile with `completionModel`
  model: z
    .string()
    .describe(
      "ID of the model to use. You can use the [List models](docsapi-reference/models/list) API to see all of your available models, or see our [Model overview](/docs/models/overview) for descriptions of them."
    ),
  max_tokens: z
    .number()
    .int()
    .max(4096)
    .optional()
    .default(1024) // Actual default is 16, but that's nonsense.
    .describe(
      "he maximum number of [tokens](/tokenizer) to generate in the completion.  The token count of your prompt plus `max_tokens` cannot exceed the model's context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096). "
    ),
  temperature: z
    .number()
    .min(0.0)
    .max(2.0)
    .optional()
    .default(1)
    .describe(
      "What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.  We generally recommend altering this or `top_p` but not both. "
    ),
  top_p: z
    .number()
    .min(0.0)
    .max(1.0)
    .optional()
    .default(1)
    .describe(
      "An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.  We generally recommend altering this or `temperature` but not both."
    ),
  n: z
    .number()
    .int()
    .optional()
    .default(1)
    .describe(
      "How many completions to generate for each prompt.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`."
    ),
  stream: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Whether to stream back partial progress. If set, tokens will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available, with the stream terminated by a `data: [DONE]` message."
    ),
  stop: z
    .union([z.string(), z.array(z.string()).min(1).max(4)])
    .optional()
    .nullable()
    .default(null)
    .describe(
      "Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence."
    ),
  presence_penalty: z
    .number()
    .min(-2.0)
    .max(2.0)
    .optional()
    .default(0)
    .describe(
      "Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.  [See more information about frequency and presence penalties.](/docs/api-reference/parameter-details)"
    ),
  frequency_penalty: z
    .number()
    .min(-2.0)
    .max(2.0)
    .optional()
    .default(0)
    .describe(
      "Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.  [See more information about frequency and presence penalties.](/docs/api-reference/parameter-details)"
    ),
  logit_bias: z
    .record(z.number())
    .optional()
    .describe(
      'Modify the likelihood of specified tokens appearing in the completion.  Accepts a json object that maps tokens (specified by their token ID in the GPT tokenizer) to an associated bias value from -100 to 100. You can use this [tokenizer tool](/tokenizer?view=bpe) (which works for both GPT-2 and GPT-3) to convert text to token IDs. Mathematically, the bias is added to the logits generated by the model prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection of the relevant token.  As an example, you can pass `{"50256": -100}` to prevent the <|endoftext|> token from being generated.'
    ),
  user: z
    .string()
    .optional()
    .describe(
      "A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids)"
    ),
});

/**
 * From https://github.com/openai/openai-node/blob/master/api.ts, type
 * `CreateCompletionRequest`
 */
export const completionRequest = completionRequestSharedBits.extend({
  prompt: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .nullable()
    .default("<|endoftext|>")
    .describe(
      "The prompt(s) to generate completions for, encoded as a string, array of strings, array of tokens, or array of token arrays.  Note that <|endoftext|> is the document separator that the model sees during training, so if a prompt is not specified the model will generate as if from the beginning of a new document."
    ),
  suffix: z
    .string()
    .optional()
    .nullable()
    .default(null)
    .describe("The suffix that comes after a completion of inserted text."),
  echo: z
    .boolean()
    .optional()
    .default(false)
    .describe("Echo back the prompt in addition to the completion."),
  logprobs: z
    .number()
    .int()
    .max(5)
    .optional()
    .nullable()
    .default(null)
    .describe(
      "Include the log probabilities on the `logprobs` most likely tokens, as well the chosen tokens. For example, if `logprobs` is 5, the API will return a list of the 5 most likely tokens. The API will always return the `logprob` of the sampled token, so there may be up to `logprobs+1` elements in the response.  The maximum value for `logprobs` is 5. If you need more than this, please contact us through our [Help center](https://help.openai.com) and describe your use case. "
    ),
  best_of: z
    .number()
    .int()
    .optional()
    .default(1)
    .describe(
      'Generates `best_of` completions server-side and returns the "best" (the one with the highest log probability per token). Results cannot be streamed.  When used with `n`, `best_of` controls the number of candidate completions and `n` specifies how many to return - `best_of` must be greater than `n`.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.'
    ),
});

/**
 * From https://github.com/openai/openai-node/blob/master/api.ts, type
 * `CreateChatCompletionRequest`.
 */
export const chatCompletionRequest = completionRequestSharedBits.extend({
  messages: z.array(
    z.object({
      role: z
        .enum(["system", "user", "assistant"])
        .describe("The role of the author of this message."),
      content: z.string().describe("The contents of the message."),
      name: z
        .string()
        .max(64)
        .regex(/^[a-zA-Z0-9_]+$/)
        .optional()
        .describe("The name of the user in a multi-user chat"),
    })
  ),
});

/**
 * From the OpenAI API docs:
 *
 * ```json
 * {
 * "id": "cmpl-uqkvlQyYK7bGYrRHQ0eXlWi7",
 * "object": "text_completion",
 * "created": 1589478378,
 * "model": "text-davinci-003",
 * "choices": [
 *   {
 *     "text": "\n\nThis is indeed a test",
 *     "index": 0,
 *     "logprobs": null,
 *     "finish_reason": "length"
 *   }
 * ],
 * "usage": {
 *   "prompt_tokens": 5,
 *   "completion_tokens": 7,
 *   "total_tokens": 12
 * }
 *}
 *```
 */
export const completionResponse = z.object({
  id: z.string(),
  object: z.literal("text_completion"),
  created: z.number(),
  model: completionModelName,
  choices: z.array(
    z.object({
      text: z.string().optional(),
      index: z.number().optional(),
      logprobs: z.any().optional(),
      finish_reason: z.string().optional(),
    })
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
});

// TODO: Rename and change the key too.
// This is only used in the web application clients so far.
export const webAppViewOptions = z.object({
  headername: z.string().optional(),
  placeholder: z.string().optional(),
  fun_queries: z.array(z.string()).optional(),
  source_prefixes: z.record(z.string()).optional(),
});

export const hostConfig = z.object({
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
