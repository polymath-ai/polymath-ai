export interface Bit {
  token_count: number;
}

export interface Response {
  version: number;
  //Currently the only supported model is 'openai.com:text-embedding-ada-002'.
  // That might change in the future.
  embedding_model: string;
  //Omit is optional. If provided, it is a string or array of strings that
  // specify which keys in bits are expected to be missing. '' means nothing is
  // supposed to be missing, and '*' means all bits are totally gone, that is
  // content: {}.
  omit?: string;
  //The type of the sort. May be omitted if type is 'any'.
  // Legal values are 'any', 'similarity', 'manual', and 'random'.
  sort?: string;
  bits: Bit[];
}
