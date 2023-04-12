import { PolymathHost } from "./host.js";

import { AskOptions, LibraryData } from "@polymath-ai/types";
import { VectorStore } from "@polymath-ai/db";

import { EMBEDDING_VECTOR_LENGTH } from "./utils.js";

const MAX_RESULTS = 10;

export class PolymathDb extends PolymathHost {
  store: VectorStore;

  constructor(path: string) {
    super();
    this.store = new VectorStore(path, EMBEDDING_VECTOR_LENGTH);
  }

  override async query(args: AskOptions): Promise<LibraryData> {
    const vector = args.query_embedding as number[];

    const reader = await this.store.createReader();

    const bits = await reader.search(vector, MAX_RESULTS);

    const libraryData: LibraryData = {
      version: 1,
      embedding_model: "openai.com:text-embedding-ada-002",
      bits,
    };

    return libraryData;
  }
}
