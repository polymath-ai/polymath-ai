import test from "ava";

import { PolymathEndpoint } from "../src/endpoint.js";

test("Try validating an endpoint (smoke test)", async (t) => {
  const endpoint = new PolymathEndpoint("https://polymath.glazkov.com");
  let result;

  result = await endpoint.validate();
  t.true(result.valid);

  const badEndpoint = new PolymathEndpoint("https://polymath.glazkov.com/nope");
  result = await badEndpoint.validate();
  t.false(result.valid);
});
