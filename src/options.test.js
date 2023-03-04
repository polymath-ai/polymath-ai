import test from "ava";

import { Options } from "./options.js";

test("normalizeClientOptions with no program servers", (t) => {
  const opts = new Options(false);
  const result = opts.normalizeClientOptions(
    {},
    { client_options: { servers: ["config"] } }
  );
  t.deepEqual(result, { servers: ["config"] });
});

test("normalizeClientOptions with no config servers", (t) => {
  const opts = new Options(false);
  const result = opts.normalizeClientOptions(
    { server: ["program"] },
    { client_options: {} }
  );
  t.deepEqual(result, { servers: ["program"] });
});

test("normalizeClientOptions with no servers at all", (t) => {
  const opts = new Options(false);
  const result = opts.normalizeClientOptions({}, { client_options: {} });
  t.deepEqual(result, {});
});
