import test from "ava";

import { Validator } from "../src/validator.js";

import {
  AskOptions,
  PackedLibraryData
} from "@polymath-ai/types";

test("validator smoke test", async (t) => {
  const endpoint = async (args: AskOptions): Promise<PackedLibraryData> => {
    return {
      version: 1,
      embedding_model: "openai.com:text-embedding-ada-002",
      bits: [{ token_count: (args.count || 0) - 1 }],
    };
  };
  const validator = new Validator(endpoint);
  const result = await validator.run();
  t.true(result.valid);
});
