import test from "ava";

import { Validator } from "../src/validator.js";
import { PolymathArgs, PolymathResponse } from "../src/harness.js";

test("validator smoke test", async (t) => {
  const makeRequest = async (args: PolymathArgs): Promise<PolymathResponse> => {
    return { bits: [{ token_count: args.count - 1 }] };
  };
  const validator = new Validator(makeRequest);
  const result = await validator.run();
  t.true(result.valid);
});
