import { AskOptions, LibraryData, PackedLibraryData } from "@polymath-ai/types";
import { encodeEmbedding } from "./utils.js";

export abstract class PolymathHost {
  async askPacked(args: AskOptions): Promise<PackedLibraryData> {
    const results = await this.ask(args);

    const packed: PackedLibraryData = {
      version: results.version,
      embedding_model: results.embedding_model,
      bits: results.bits.map((bit) => ({
        ...bit,
        embedding: encodeEmbedding(bit.embedding || []),
      })),
    };

    return packed;
  }

  abstract ask(args: AskOptions): Promise<LibraryData>;
}
