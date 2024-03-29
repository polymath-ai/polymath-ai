import { AskOptions, LibraryData, PackedLibraryData } from "@polymath-ai/types";
import { encodeEmbedding } from "./utils.js";

import { filterResults } from "./results.js";

export abstract class PolymathHost {
  async queryPacked(args: AskOptions): Promise<PackedLibraryData> {
    const results = await this.query(args);

    const packed: PackedLibraryData = {
      version: results.version,
      embedding_model: results.embedding_model,
      bits: filterResults(
        args,
        results.bits.map((bit) => ({
          ...bit,
          embedding: encodeEmbedding(bit.embedding || []),
        }))
      ),
    };

    return packed;
  }

  abstract query(args: AskOptions): Promise<LibraryData>;
}
