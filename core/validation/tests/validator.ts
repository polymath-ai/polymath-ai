import test from "ava";

import { Request } from "../src/request.js";
import { Response } from "../src/response.js";
import { Validator } from "../src/validator.js";

test("validator smoke test", async (t) => {
  const endpoint = async (args: Request): Promise<Response> => {
    return {
      version: 1,
      embedding_model: "openai.com:text-embedding-ada-002",
      bits: [{ token_count: args.count - 1 }],
    };
  };
  const validator = new Validator(endpoint);
  const result = await validator.run();
  t.true(result.valid);
});
