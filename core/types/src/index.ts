//TODO: consider having an enumeration of valid lenghts for known models
export type EmbeddingVector = number[];
export type Base64Embedding = string;

export type EmbeddingModelName = "openai.com:text-embedding-ada-002";

export type CompletionModelName = "text-davinci-003" | "gpt-3.5-turbo";

export type ModelName = EmbeddingModelName | CompletionModelName;

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

export type PineconeBit = BitInfo & {
  text?: string;
  token_count?: number;
  access_tag?: AccessTag;
};

export type BitInfo = {
  url: string;
  image_url?: string;
  title?: string;
  description?: string;
};

export type AccessTag = string;

export type BitID = string;

export type Bit = {
  //Omit settings could lead to anhy part of Bit being omitted.
  id?: BitID;
  text?: string;
  token_count?: number;
  embedding?: EmbeddingVector;
  info?: BitInfo;
  similarity?: number;
  access_tag?: AccessTag;
};

export type PackedBit = {
  [Key in keyof Bit]: Bit[Key] extends EmbeddingVector | undefined
    ? Base64Embedding | undefined
    : Bit[Key];
};

export type Sort = "similarity";

export type LibraryData = {
  version: number;
  embedding_model: EmbeddingModelName;
  omit?: OmitConfiguration;
  count_type?: CountType;
  sort?: Sort;
  bits: Bit[];
};

export type PackedLibraryData = {
  [Key in keyof LibraryData]: LibraryData[Key] extends Bit[]
    ? PackedBit[]
    : LibraryData[Key];
};

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
export type CountType = "bit" | "token";

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

export type AskOptions = {
  version?: number;
  query_embedding?: EmbeddingVector;
  query_embedding_model?: EmbeddingModelName;
  count?: number;
  count_type?: CountType;
  omit?: OmitConfiguration;
  access_token?: AccessToken;
  sort?: Sort;
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
