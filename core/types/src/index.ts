import { z } from "zod";

import {
  base64Embedding,
  completionModelName,
  embeddingModelName,
  embeddingVector,
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
  completionResponse,
} from "./schemas.js";

//TODO: consider having an enumeration of valid lenghts for known models
export type EmbeddingVector = z.infer<typeof embeddingVector>;
export type Base64Embedding = z.infer<typeof base64Embedding>;

export type EmbeddingModelName = z.infer<typeof embeddingModelName>;
export type CompletionModelName = z.infer<typeof completionModelName>;
export type ModelName = z.infer<typeof modelName>;

//A filename like './mybits/file.json'
export type LibraryFileName = string;
//A parttern deonoting a filename, like './mybits/*.json'
export type LibraryFileNamePattern = string;

//Copied from pinecone library because their configOpts are unexported
export type PineconeConfig = {
  apiKey?: string;
  baseUrl?: string;
  namespace?: string;
  topK?: number;
};

export type PineconeResult = {
  id: string;
  score: number;
  metadata: PineconeBit;
};

export type AccessTag = string;

export type PineconeBit = BitInfo & {
  text?: string;
  token_count?: number;
  access_tag?: AccessTag;
};

export type BitInfo = z.infer<typeof bitInfo>;
export type Bit = z.infer<typeof bit>;
export type PackedBit = z.infer<typeof packedBit>;
export type Sort = "similarity";
export type LibraryData = z.infer<typeof libraryData>;
export type PackedLibraryData = z.infer<typeof packedLibraryData>;

export const OmitKeys = {
  text: true,
  info: true,
  embedding: true,
  similarity: true,
  token_count: true,
} as const;

export type OmitConfigurationField = keyof typeof OmitKeys;

export type OmitConfiguration =
  | "*"
  | ""
  | OmitConfigurationField
  | OmitConfigurationField[];

export type AccessToken = string;

//TODO: audit uses of these, is it supposed to be bits or tokens?
export type CountType = z.infer<typeof countType>;

//May include `{context}` and `{query}`
export type PromptTemplate = string;

export type PolymathOptions = {
  askOptions?: AskOptions;
  //OpenAI API key
  apiKey?: string;
  pinecone?: PineconeConfig;
  completionOptions?: CompletionOptions;
  libraryFiles?: LibraryFileName[];
  servers?: Server[];
  promptTemplate?: PromptTemplate;
  debug?: boolean;
};

//TODO: is this actually an OpenAICompletionOptions or something?
export type CompletionOptions = {
  prompt_template?: PromptTemplate;
  model?: CompletionModelName;
  stream?: boolean;
  system?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  n?: number;
  stop?: string | string[];
  best_of?: number;
  echo?: false;
  logprobs?: number;
};

export type CompletionResponse = z.infer<typeof completionResponse>;

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: ChatCompletionUsage;
}

export interface ChatCompletionChoice {
  index?: number;
  message?: ChatCompletionResponseMessage;
  delta?: ChatCompletionResponseMessage;
  finish_reason?: string;
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionResponseMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type CompletionResult = {
  bits: PackedBit[];
  infos: BitInfo[];
  completion?: string;
  stream?:
    | AsyncIterable<CompletionResponse>
    | AsyncIterable<ChatCompletionResponse>;
};

export type AskOptions = z.infer<typeof askOptions>;
export type EndpointArgs = z.infer<typeof endpointArgs>;

export type IngestOptions = {
  destination: string;
};

export type PolymathHostType = "pinecone" | "file";

export type ServeOptions = {
  port: number;
};

export type ServeArgs = {
  type: PolymathHostType;
  options: ServeOptions;
};

export type Server = string;

//Versions of Object.entries(), Object.keys(), and Object.values() that preserve
//type for constrained type maps. By default they return [string, any]

//Use: instead of Object.keys(), do TypedObject.keys()

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

export class TypedObject {
  //Based on https://stackoverflow.com/a/59459000
  static keys<T extends object>(t: T): Array<keyof T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.keys(t) as any;
  }

  //Based on https://stackoverflow.com/a/62055863
  static entries<T extends object>(t: T): Entries<T>[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(t) as any;
  }
}

//TODO: rename to a better name.
//A HostConfig is what you might have in your `.polymath/config.SECRET.json`
export type HostConfig = z.infer<typeof hostConfig>;

// Convenient export of all schemas
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
  completionResponse,
};
