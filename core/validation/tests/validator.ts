import test from "ava";

import { Validator } from "../src/validator.js";

test("run", async (t) => {
  const makeRequest = async () => {
    return "test";
  };
  const validator = new Validator(makeRequest);
  await validator.run();
  t.pass();
});
