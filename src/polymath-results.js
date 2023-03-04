// --------------------------------------------------------------------------
// A container for the resulting bits
//
// let p = new Polymath({..})
// let pr = await p.ask("How long is a piece of string?");
// pr.context(DEFAULT_MAX_TOKENS_COMPLETION) // return the string of context limited to 1025 tokens
// --------------------------------------------------------------------------
class PolymathResults {
  constructor(bits) {
    this._bits = bits;
  }

  bits(maxTokensWorth = 0) {
    let bits = maxTokensWorth > 0 ? this.maxBits(maxTokensWorth) : this._bits;
    return bits;
  }

  context(maxTokensWorth = 0) {
    return this.bits(maxTokensWorth)
      .map((bit) => bit.text)
      .join("\n");
  }

  // Return as many bits as can fit the number of tokens
  maxBits(maxTokens = DEFAULT_MAX_TOKENS_FOR_MODEL) {
    let totalTokens = 0;
    const includedBits = [];
    for (let i = 0; i < this._bits.length; i++) {
      const bit = this._bits[i];
      if (!bit.token_count) bit.token_count = encode(bit.text).length; // TODO: no token_count huh?
      if (totalTokens + bit.token_count > maxTokens) {
        return includedBits;
      }
      totalTokens += bit.token_count;
      includedBits.push(bit);
    }
    return includedBits;
  }

  // Add the new bits, resort, and re-max
  mergeBits(bits) {
    this._bits.push(...bits);
  }

  omit(omitString) {
    const omitKeys = omitString.split(/\s*,\s*/);
    for (let i = 0; i < this._bits.length; i++) {
      for (let j = 0; j < omitKeys.length; j++) {
        delete this._bits[i][omitKeys[j]];
      }
    }
  }

  trim(count, countType = "bits") {
    if (countType != "bits") {
      throw new Error("Only bits are supported at this time");
    }
    this._bits = this._bits.slice(0, count);
  }

  sortBitsBySimilarity() {
    this._bits = this._bits.sort((a, b) => b.similarity - a.similarity);
  }

  // Return info objects ordered by the most similarity, no duplicates
  infoSortedBySimilarity() {
    const uniqueInfos = [];
    return this._bits
      .sort((a, b) => b.similarity - a.similarity)
      .filter((bit) => {
        const info = bit.info;
        if (!uniqueInfos.some((ui) => ui.url === info.url)) {
          uniqueInfos.push(info);
          return true;
        }
        return false;
      })
      .map((bit) => bit.info);
  }
}

export { PolymathResults };
