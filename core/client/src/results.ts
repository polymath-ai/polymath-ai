import {
  AskOptions,
  BitInfo,
  CountType,
  OmitConfiguration,
  PackedBit,
  PackedLibraryData
} from "./types.js";

import {
  DEFAULT_MAX_TOKENS_FOR_MODEL
} from "./utils.js";

// --------------------------------------------------------------------------
// A container for the resulting bits
//
// let p = new Polymath({..})
// let pr = await p.ask("How long is a piece of string?");
// pr.context(DEFAULT_MAX_TOKENS_COMPLETION) // return the string of context limited to 1025 tokens
// --------------------------------------------------------------------------
class PolymathResults {

  _bits : PackedBit[]
  _askOptions : AskOptions

  constructor(bits : PackedBit[], askOptions : AskOptions) {
    this._bits = bits;
    this._askOptions = askOptions;
  }

  bits(maxTokensWorth = 0) : PackedBit[] {
    let bits = maxTokensWorth > 0 ? this.maxBits(maxTokensWorth) : this._bits;
    return bits;
  }

  context(maxTokensWorth = 0) : string {
    return this.bits(maxTokensWorth)
      .map((bit) => bit.text)
      .join("\n");
  }

  // Return as many bits as can fit the number of tokens
  maxBits(maxTokens = DEFAULT_MAX_TOKENS_FOR_MODEL) : PackedBit[] {
    let totalTokens = 0;
    const includedBits = [];
    for (let i = 0; i < this._bits.length; i++) {
      const bit = this._bits[i];
      const bitTokenCount = bit.token_count ||  encodeURI(bit.text || '').length; // TODO: no token_count huh?
      if (totalTokens + bitTokenCount > maxTokens) {
        return includedBits;
      }
      totalTokens += bitTokenCount;
      includedBits.push(bit);
    }
    return includedBits;
  }

  // Add the new bits, resort, and re-max
  mergeBits(bits : PackedBit[]) {
    this._bits.push(...bits);
  }

  omit(omitString : OmitConfiguration) : void {
    const omitKeys = omitString.split(/\s*,\s*/);
    for (let i = 0; i < this._bits.length; i++) {
      for (let j = 0; j < omitKeys.length; j++) {
        switch (omitKeys[j]){
          case 'text': 
            delete this._bits[i].text;
            break;
          case 'info':
            delete this._bits[i].info;
            break;
          case 'embedding':
            delete this._bits[i].embedding;
            break;
          case 'similarity':
            delete this._bits[i].similarity;
            break;
          case 'token_count':
            delete this._bits[i].token_count;
            break;
          default:
            throw new Error('Unknown omit key: ' + omitKeys[j]);
        }
      }
    }
  }

  trim(count : number, countType : CountType = "bit") : void {
    if (countType != "bit") {
      throw new Error("Only bits are supported at this time");
    }
    this._bits = this._bits.slice(0, count);
  }

  sortBitsBySimilarity() : void {
    this._bits = this._bits.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  }

  // Return info objects ordered by the most similarity, no duplicates
  infoSortedBySimilarity() {
    const uniqueInfos : BitInfo[] = [];
    return this._bits
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .filter((bit) => {
        const info : BitInfo = bit.info || {url: ''};
        if (!uniqueInfos.some((ui) => ui.url === info.url)) {
          uniqueInfos.push(info);
          return true;
        }
        return false;
      })
      .map((bit) => bit.info);
  }

  // Return a JSON response appropriate for sending back to a client
  response() {
    let response : PackedLibraryData = {
      version: this._askOptions.version ?? 1,
      embedding_model:
        this._askOptions.query_embedding_model || "openai:text-embedding-ada-002",
      bits: this._bits
    };
    if (this._askOptions?.omit) {
      this.omit(this._askOptions.omit);
      response.omit = this._askOptions.omit;
    }
    if (this._askOptions?.count_type) {
      response.count_type = this._askOptions.count_type || "bits";
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
