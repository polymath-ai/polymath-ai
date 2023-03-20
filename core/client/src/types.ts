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

//Copied from pinecone library because their configOpts are unexported
export type PineconeConfig = {
    apiKey?: string;
    baseUrl?: string;
    namespace?: string;
    topK? : number;
};

export type PineconeResult = {
    id: string,
    score: number,
    metadata: PineconeBit
};

export type PineconeBit = BitInfo & {
    text?: string,
    token_count? : number,
    access_tag? :AccessTag,
}

export type BitInfo = {
    url: string
    image_url?: string,
    title? : string,
    description? : string
}

export type AccessTag = string;

export type BitID = string;

export type Bit = {
    //Omit settings could lead to anhy part of Bit being omitted.
    id? : BitID,
    text?: string,
    token_count?: number,
    embedding?: EmbeddingVector,
    info?: BitInfo,
    similarity?: number,
    access_tag? : AccessTag
}

export type PackedBit = {
    [Key in keyof Bit]: Bit[Key] extends (EmbeddingVector | undefined) ? Base64Embedding | undefined : Bit[Key];
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
    sort? : Sort,
};

export type Server = string;