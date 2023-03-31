import { encode } from "gpt-3-encoder";

import {
  AskOptions,
  BitInfo,
  CountType,
  OmitConfiguration,
  OmitKeys,
  OmitConfigurationField,
  PackedBit,
  PackedLibraryData,
  TypedObject,
} from "@polymath-ai/types";

import { DEFAULT_MAX_TOKENS_FOR_MODEL } from "./utils.js";

const KeysToOmit = (omit: OmitConfiguration): OmitConfigurationField[] => {
  if (omit == "") return [];
  if (omit == "*") return TypedObject.keys(OmitKeys);
  if (typeof omit == "string") omit = [omit];
  return omit;
};

// --------------------------------------------------------------------------
// A container for the resulting bits
//
// let p = new Polymath({..})
// let pr = await p.ask("How long is a piece of string?");
// pr.context(DEFAULT_MAX_TOKENS_COMPLETION) // return the string of context limited to 1025 tokens
// --------------------------------------------------------------------------
class PolymathResults {
  _bits: PackedBit[];
  _askOptions: AskOptions | undefined;

  constructor(bits: PackedBit[], askOptions?: AskOptions) {
    this._bits = bits;
    this._askOptions = askOptions;
  }

  bits(maxTokensWorth = 0): PackedBit[] {
    const bits = maxTokensWorth > 0 ? this.maxBits(maxTokensWorth) : this._bits;
    return bits;
  }

  context(maxTokensWorth = 0): string {
    return this.bits(maxTokensWorth)
      .map((bit) => bit.text)
      .join("\n");
  }

  // Return as many bits as can fit the number of tokens
  maxBits(maxTokens = DEFAULT_MAX_TOKENS_FOR_MODEL): PackedBit[] {
    let totalTokens = 0;
    const includedBits = [];
    for (let i = 0; i < this._bits.length; i++) {
      const bit = this._bits[i];
      const bitTokenCount = bit.token_count || encode(bit.text || "").length; // TODO: no token_count huh?
      if (totalTokens + bitTokenCount > maxTokens) {
        return includedBits;
      }
      totalTokens += bitTokenCount;
      includedBits.push(bit);
    }
    return includedBits;
  }

  // Add the new bits, resort, and re-max
  mergeBits(bits: PackedBit[]) {
    this._bits.push(...bits);
  }

  omit(omitString: OmitConfiguration): void {
    const omitKeys = KeysToOmit(omitString);
    for (let i = 0; i < this._bits.length; i++) {
      for (let j = 0; j < omitKeys.length; j++) {
        switch (omitKeys[j]) {
          case "text":
            delete this._bits[i].text;
            break;
          case "info":
            delete this._bits[i].info;
            break;
          case "embedding":
            delete this._bits[i].embedding;
            break;
          case "similarity":
            delete this._bits[i].similarity;
            break;
          case "token_count":
            delete this._bits[i].token_count;
            break;
          default:
            throw new Error("Unknown omit key: " + omitKeys[j]);
        }
      }
    }
  }

  trim(count: number, countType: CountType = "bit"): void {
    if (countType == "bit") {
      this._bits = this._bits.slice(0, count);
    }
    else if (countType == "token") {
      this._bits = this.maxBits(count);
    }
  }

  sortBitsBySimilarity(): void {
    this._bits = this._bits.sort(
      (a, b) => (b.similarity || 0) - (a.similarity || 0)
    );
  }

  // Return info objects ordered by the most similarity, no duplicates
  infoSortedBySimilarity(): BitInfo[] {
    const uniqueInfos: BitInfo[] = [];
    return this._bits
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .filter((bit) => {
        const info: BitInfo = bit.info || { url: "" };
        if (!uniqueInfos.some((ui) => ui.url === info.url)) {
          uniqueInfos.push(info);
          return true;
        }
        return false;
      })
      .map((bit) => bit.info || { url: "" });
  }

  // Return a JSON response appropriate for sending back to a client
  response(): PackedLibraryData {
    const response: PackedLibraryData = {
      version:
        this._askOptions && this._askOptions.version
          ? this._askOptions.version
          : 1,
      embedding_model:
        this._askOptions && this._askOptions.query_embedding_model
          ? this._askOptions.query_embedding_model
          : "openai.com:text-embedding-ada-002",
      bits: this._bits,
    };
    if (this._askOptions?.omit) {
      this.omit(this._askOptions.omit);
      response.omit = this._askOptions.omit;
    }
    if (this._askOptions?.count_type) {
      response.count_type = this._askOptions.count_type || "bit";
    }
    // default to sorting
    if (this._askOptions?.sort == "similarity" || !this._askOptions?.sort) {
      this.sortBitsBySimilarity();
    }
    if (this._askOptions?.count) {
      this.trim(this._askOptions.count, this._askOptions?.count_type);
    }

    return response;
  }
}

export { PolymathResults };
