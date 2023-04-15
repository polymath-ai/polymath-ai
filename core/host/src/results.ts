import {
  Bit,
  PackedBit,
  OmitConfiguration,
  OmitConfigurationField,
  OmitKeys,
  TypedObject,
  CountType,
  AskOptions,
} from "@polymath-ai/types";

const KeysToOmit = (omit: OmitConfiguration): OmitConfigurationField[] => {
  if (omit == "") return [];
  if (omit == "*") return TypedObject.keys(OmitKeys);
  if (typeof omit == "string") omit = [omit];
  return omit;
};

// Remove fields from the given bits in place.
export const omit = (
  omitString: OmitConfiguration,
  bits: Bit[] | PackedBit[]
): void => {
  const omitKeys = KeysToOmit(omitString);
  for (let i = 0; i < bits.length; i++) {
    for (let j = 0; j < omitKeys.length; j++) {
      switch (omitKeys[j]) {
        case "text":
          delete bits[i].text;
          break;
        case "info":
          delete bits[i].info;
          break;
        case "embedding":
          delete bits[i].embedding;
          break;
        case "similarity":
          delete bits[i].similarity;
          break;
        case "token_count":
          delete bits[i].token_count;
          break;
        default:
          throw new Error("Unknown omit key: " + omitKeys[j]);
      }
    }
  }
};

export const filterByTokenCount = (
  maxTokens: number,
  bits: PackedBit[]
): PackedBit[] => {
  let totalTokens = 0;
  const includedBits: PackedBit[] = [];
  for (let i = 0; i < bits.length; i++) {
    const bit: PackedBit = bits[i];
    if (!bit.token_count) throw new Error("Unexpectedly missing `token_count`");
    const bitTokenCount = bit.token_count;
    if (totalTokens + bitTokenCount > maxTokens) {
      return includedBits;
    }
    totalTokens += bitTokenCount;
    includedBits.push(bit);
  }
  return includedBits;
};

export const trim = (
  count: number,
  countType: CountType = "bit",
  bits: PackedBit[]
): PackedBit[] => {
  if (countType == "token") return filterByTokenCount(count, bits);
  return bits.slice(0, count);
};

export const filterResults = (
  options: AskOptions,
  bits: PackedBit[]
): PackedBit[] => {
  if (options.count) bits = trim(options.count, options.count_type, bits);
  if (options.omit) omit(options.omit, bits);
  return bits;
};
