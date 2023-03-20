//TODO: consider having an enumeration of valid lenghts for known models
export type EmbeddingVector = number[];
export type Base64Embedding = string;

export type EmbeddingModelName = 'text-embedding-ada-002';

export type CompletionModelName = 'text-davinci-003' | 'gpt-3.5-turbo';

export type ModelName = EmbeddingModelName | CompletionModelName;