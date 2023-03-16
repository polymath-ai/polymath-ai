import test from "ava";

import { PolymathRequest } from "../src/request.js";
import { PolymathResponse } from "../src/response.js";
import { Validator } from "../src/validator.js";

test("validator smoke test", async (t) => {
  const makeRequest = async (
    args: PolymathRequest
  ): Promise<PolymathResponse> => {
    return { bits: [{ token_count: args.count - 1 }] };
  };
  const validator = new Validator(makeRequest);
  const result = await validator.run();
  t.true(result.valid);
});
