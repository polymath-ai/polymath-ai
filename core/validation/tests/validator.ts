import test from "ava";

import { Validator } from "../src/validator.js";

test("run", async (t) => {
  const validator = new Validator();
  await validator.run();
  t.pass();
});
