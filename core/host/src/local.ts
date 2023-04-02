import fs from "fs";
import { globbySync } from "globby";

import { PolymathHost } from "./host.js";
import { AskOptions, LibraryData } from "@polymath-ai/types";

import {
  Bit,
  EmbeddingVector,
  LibraryFileName,
  LibraryFileNamePattern,
  PackedLibraryData,
} from "@polymath-ai/types";

import { decodeEmbedding, cosineSimilarity } from "./utils.js";

// --------------------------------------------------------------------------
// Query a local library of bits
// --------------------------------------------------------------------------
class PolymathLocal implements PolymathHost {
  _libraryBits: Bit[];

  constructor(libraries: LibraryFileNamePattern[]) {
    const expandedLibraries = this.expandLibraries(libraries);
    this._libraryBits = this.loadLibraryBits(expandedLibraries);
  }

  // Expand any directories or globs in the list of libraries
  // E.g. if you pass in ["./mybits/*.json", "./mybits2"], this will return
  // ["./mybits/1.json", "./mybits/2.json", "./mybits2/1.json", "./mybits2/2.json"]
  expandLibraries(libraries: LibraryFileNamePattern[]): LibraryFileName[] {
    const expandedLibraries = [];
    for (const filepattern of libraries) {
      const files = globbySync([filepattern, "!*.SECRET.*"], {
        expandDirectories: {
          extensions: ["json"],
        },
      });
      expandedLibraries.push(...files);

      // console.log("In: ", libraries);
      // console.log("Out: ", expandedLibraries);
    }
    return expandedLibraries;
  }

  // Load up all of the library bits from the given library JSON files
  loadLibraryBits(libraries: LibraryFileName[]): Bit[] {
    const libraryBits = [];
    for (const filename of libraries) {
      try {
        const data = fs.readFileSync(filename, "utf8");
        const json: PackedLibraryData = JSON.parse(data);
        const bits = json.bits.map((bit) => {
          return {
            ...bit,
            embedding: decodeEmbedding(bit.embedding || ""),
          };
        });
        libraryBits.push(...bits);
        // libraryBits = [...libraryBits, ...bits];
      } catch (e) {
        console.error(
          `Error reading or parsing library file "${filename}": ${e}`
        );
      }
    }
    return libraryBits;
  }

  // Given an embedding, find the bits with the most similar embeddings
  similarBits(embedding: EmbeddingVector): Bit[] {
    return (
      this._libraryBits
        .map((bit) => {
          if (!bit.embedding) throw new Error("Bit was missing embedding");
          return {
            ...bit,
            similarity: cosineSimilarity(embedding, bit.embedding),
          };
        })
        // sort by similarity descending
        .sort((a, b) => b.similarity - a.similarity)
    );
  }

  async ask(args: AskOptions): Promise<LibraryData> {
    const queryEmbedding = args.query_embedding;
    if (!queryEmbedding)
      throw new Error("Ask options are missing query_embedding");
    return new Promise((resolve) => {
      // TODO: Do something better here. Hard-coding "version" and
      // "embedding_model" is just a workaround. Ideally, these come down
      // from the libraries themselves.
      const result: LibraryData = {
        version: 1,
        embedding_model: "openai.com:text-embedding-ada-002",
        bits: this.similarBits(queryEmbedding),
      };
      resolve(result);
    });
  }
}

export { PolymathLocal };
