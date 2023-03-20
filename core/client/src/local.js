import fs from "fs";
import { globbySync } from "globby";

import { decodeEmbedding, cosineSimilarity } from "./utils.js";

// --------------------------------------------------------------------------
// Query a local library of bits
// --------------------------------------------------------------------------
class PolymathLocal {
  constructor(libraries) {
    let expandedLibraries = this.expandLibraries(libraries);
    this._libraryBits = this.loadLibraryBits(expandedLibraries);
  }

  // Expand any directories or globs in the list of libraries
  // E.g. if you pass in ["./mybits/*.json", "./mybits2"], this will return
  // ["./mybits/1.json", "./mybits/2.json", "./mybits2/1.json", "./mybits2/2.json"]
  expandLibraries(libraries) {
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
  loadLibraryBits(libraries) {
    let libraryBits = [];
    for (const filename of libraries) {
      try {
        const data = fs.readFileSync(filename, "utf8");
        const json = JSON.parse(data);
        const bits = json.bits.map((bit) => {
          return {
            ...bit,
            embedding: decodeEmbedding(bit.embedding),
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
  similarBits(embedding) {
    return (
      this._libraryBits
        .map((bit) => {
          return {
            ...bit,
            similarity: cosineSimilarity(embedding, bit.embedding),
          };
        })
        // sort by similarity descending
        .sort((a, b) => b.similarity - a.similarity)
    );
  }

  ask(queryEmbedding) {
    return this.similarBits(queryEmbedding);
  }
}

export { PolymathLocal };
