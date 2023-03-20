//TODO: consider having an enumeration of valid lenghts for known models
export type EmbeddingVector = number[];
export type Base64Embedding = string;

export type EmbeddingModelName = 'openai:text-embedding-ada-002';

export type CompletionModelName = 'text-davinci-003' | 'gpt-3.5-turbo';

export type ModelName = EmbeddingModelName | CompletionModelName;

//A filename like './mybits/file.json'
export type LibraryFileName = string;
//A parttern deonoting a filename, like './mybits/*.json'
export type LibraryFileNamePattern = string;

export type Bit = {
    text: string,
    embedding: EmbeddingVector
}

export type BitSimilarity = Bit & {
    similarity: number
}

export type PackedBit = {
    [Key in keyof Bit]: Bit[Key] extends EmbeddingVector ? Base64Embedding : Bit[Key];
};

export type LibraryData = {
    bits: Bit[]
}

export type PackedLibraryData = {
    [Key in keyof LibraryData]: LibraryData[Key] extends Bit[] ? PackedBit[] : LibraryData[Key];
}

export type OmitConfiguration = string;
export type AccessToken = string;

export type AskOptions = {
    version? : string,
    query_embedding_model? : EmbeddingModelName,
    count? : number,
    count_type? : 'bit' | 'token'
    omit?: OmitConfiguration,
    access_token? : AccessToken,
};

export type Server = string;