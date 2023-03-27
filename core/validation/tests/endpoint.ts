import test from "ava";

import { validateEndpointArgs } from "../src/endpoint.js";

test("validateEndpointArgs demands query_embedding", (t) => {
  t.throws(() => {
    validateEndpointArgs({});
  });
});

test("validateEndpointArgs demands the right query_embedding length", (t) => {
  t.throws(() => {
    validateEndpointArgs({ query_embedding: [1, 2, 3, 4, 5, 6, 7, 8, 9] });
  });
  validateEndpointArgs({ query_embedding: new Array(1536).fill(0) });
});

test("validateEndpointArgs fills in defaults", (t) => {
  const args = validateEndpointArgs({
    query_embedding: new Array(1536).fill(0),
  });
  t.is(args.version, 1);
  t.is(args.query_embedding_model, "openai.com:text-embedding-ada-002");
  t.deepEqual(Object.keys(args), [
    "version",
    "query_embedding",
    "query_embedding_model",
  ]);
});
