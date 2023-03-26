import test from "ava";

import { Validator } from "../src/validator.js";

import { AskOptions, PackedBit, PackedLibraryData } from "@polymath-ai/types";

test("validator smoke test", async (t) => {
  const allBits: PackedBit[] = [{ token_count: 1000 }, { token_count: 300 }];
  const total_count = allBits.reduce(
    (acc, bit) => acc + (bit.token_count || 0),
    0
  );
  const endpoint = async (args: AskOptions): Promise<PackedLibraryData> => {
    const bits =
      (args.count || 0) > total_count ? allBits : allBits.slice(0, 1);
    return {
      version: 1,
      embedding_model: "openai.com:text-embedding-ada-002",
      bits,
    };
  };
  const validator = new Validator(endpoint);
  const result = await validator.run();
  t.true(result.valid);
});
