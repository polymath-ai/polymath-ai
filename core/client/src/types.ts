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

export type BitInfo = {
    url: string
    //TODO: add missing fields
}

export type Bit = {
    text: string,
    token_count: number,
    embedding: EmbeddingVector,
    info: BitInfo
}

export type BitSimilarity = Bit & {
    similarity: number
}

export type PackedBit = {
    [Key in keyof Bit]: Bit[Key] extends EmbeddingVector ? Base64Embedding : Bit[Key];
};

export type Sort = 'similarity';

export type LibraryData = {
    version: number,
    embedding_model: EmbeddingModelName,
    omit? : OmitConfiguration,
    count_type? : CountType,
    sort? : Sort,
    bits: Bit[]
}

export type PackedLibraryData = {
    [Key in keyof LibraryData]: LibraryData[Key] extends Bit[] ? PackedBit[] : LibraryData[Key];
}

export type OmitConfiguration = string;
export type AccessToken = string;

//TODO: audit uses of these, is it supposed to be bits or tokens?
export type CountType = 'bit' | 'token';

export type AskOptions = {
    version? : number,
    query_embedding_model? : EmbeddingModelName,
    count? : number,
    count_type? : CountType,
    omit?: OmitConfiguration,
    access_token? : AccessToken,
};

export type Server = string;