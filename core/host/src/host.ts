import {
  AskOptions,
  Bit,
  LibraryData,
  PackedLibraryData,
} from "@polymath-ai/types";
import { encodeEmbedding } from "./utils.js";

export abstract class PolymathHost {
  async queryPacked(args: AskOptions): Promise<PackedLibraryData> {
    const results = await this.query(args);

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

  protected filterResults(args: AskOptions, bits: Bit[]): Bit[] {
    return bits;
  }

  abstract query(args: AskOptions): Promise<LibraryData>;
}
