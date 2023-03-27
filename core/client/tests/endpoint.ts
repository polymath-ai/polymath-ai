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

test("prepareFormData correctly encodes query_embedding", (t) => {
  const endpoint = new PolymathEndpoint("foo");
  const form = endpoint.prepareFormData({
    version: 1,
    query_embedding: [0.1, 0.2, 0.3],
    query_embedding_model: "openai.com:text-embedding-ada-002",
  });
  t.is(form.get("query_embedding"), "zczMPc3MTD6amZk+");
});
