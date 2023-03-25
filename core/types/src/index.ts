import { schemas } from "./schemas.js";
import { z } from "zod";

export { schemas };

//TODO: consider having an enumeration of valid lenghts for known models
export type EmbeddingVector = z.infer<typeof schemas.embeddingVector>;
export type Base64Embedding = z.infer<typeof schemas.base64Embedding>;

export type EmbeddingModelName = z.infer<typeof schemas.embeddingModelName>;
export type CompletionModelName = z.infer<typeof schemas.completionModelName>;
export type ModelName = z.infer<typeof schemas.modelName>;

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

export type BitInfo = z.infer<typeof schemas.bitInfo>;
export type Bit = z.infer<typeof schemas.bit>;
export type PackedBit = z.infer<typeof schemas.packedBit>;
export type Sort = "similarity";
export type LibraryData = z.infer<typeof schemas.libraryData>;
export type PackedLibraryData = z.infer<typeof schemas.packedLibraryData>;

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
export type CountType = z.infer<typeof schemas.countType>;

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

export type CompletionResult = {
  bits: PackedBit[];
  infos: BitInfo[];
  completion?: string;
};

export type AskOptions = z.infer<typeof schemas.askOptions>;
export type EndpointArgs = z.infer<typeof schemas.endpointArgs>;

export type IngestOptions = {
  destination: string;
};

export type StreamProcessor = {
  processDelta: (delta: string) => void;
  processResults: (results: CompletionResult) => void;
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
export type HostConfig = {
  endpoint?: string;
  default_private_access_tag?: string;
  default_api_key?: string;
  //TODO: refactor to be literally PolymathOptions?
  client_options?: ClientOptions;
  //TODO: rename to hosts?
  server_options?: ServerOption[];
  completions_options?: CompletionOptions;
  info?: WebAppViewOptions;
};

type ServerOption = {
  default?: boolean;
  url: string;
  name: string;
};

type ClientOptions = {
  servers?: Server[];
  pinecone?: PineconeConfig;
  libraryFiles?: LibraryFileName[];
  omit?: OmitConfiguration;
  debug?: boolean;
};

// Rename and change the key too. This is only used in the web application clients so far
type WebAppViewOptions = {
  headername?: string;
  placeholder?: string;
  fun_queries?: string[];
  source_prefixes?: {
    [key: string]: string;
  };
};
