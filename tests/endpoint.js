import test from "ava";

import { PolymathEndpoint } from "../src/polymath-endpoint.js";

test("Try validating an endpoing (smoke test)", async (t) => {
  let endpoint = new PolymathEndpoint("https://polymath.glazkov.com");
  const result = await endpoint.validate();
  t.true(result);
});
