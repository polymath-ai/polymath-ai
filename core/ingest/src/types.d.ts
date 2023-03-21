export type Options = {
  outputFile: string;
}

export type BitInfo = {
  url?: string;
  title?: string;
  description?: string;
  image_url?: string;
}

export type Bit = {
  id?: string;
  text?: string;
  token_count?: number;
  embedding?: string; // not number[] because we need to store it as a string in the database.
  info?: BitInfo;
}

export type Library = {
  version: number;
  embedding_model: string;
  bits: Bit[];
}