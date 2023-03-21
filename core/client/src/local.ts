import fs from "fs";
import { globbySync } from "globby";

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
class PolymathLocal {
  _libraryBits: Bit[];

  constructor(libraries: LibraryFileNamePattern[]) {
    let expandedLibraries = this.expandLibraries(libraries);
    this._libraryBits = this.loadLibraryBits(expandedLibraries);
  }

  // Expand any directories or globs in the list of libraries
  // E.g. if you pass in ["./mybits/*.json", "./mybits2"], this will return
  // ["./mybits/1.json", "./mybits/2.json", "./mybits2/1.json", "./mybits2/2.json"]
  expandLibraries(libraries: LibraryFileNamePattern[]): LibraryFileName[] {
    let expandedLibraries = [];
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
    let libraryBits = [];
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

  ask(queryEmbedding: EmbeddingVector): Bit[] {
    return this.similarBits(queryEmbedding);
  }
}

export { PolymathLocal };
