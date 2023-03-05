import test from "ava";

import { Options } from "./options.js";

test("normalizeClientOptions servers", (t) => {
  const opts = new Options(false);
  let result;

  result = opts.normalizeClientOptions(
    {},
    { client_options: { servers: ["config"] } }
  );
  t.deepEqual(result, { servers: ["config"] });

  result = opts.normalizeClientOptions(
    { servers: ["program"] },
    { client_options: {} }
  );
  t.deepEqual(result, { servers: ["program"] });

  result = opts.normalizeClientOptions({}, { client_options: {} });
  t.deepEqual(result, {});
});

test("normalizeClientOptions libraries", (t) => {
  const opts = new Options(false);
  let result;

  result = opts.normalizeClientOptions(
    { libraries: ["program"] },
    { client_options: { libraryFiles: ["config"] } }
  );
  t.deepEqual(result, { libraryFiles: ["program"] });

  result = opts.normalizeClientOptions(
    {},
    { client_options: { libraryFiles: ["config"] } }
  );
  t.deepEqual(result, { libraryFiles: ["config"] });

  result = opts.normalizeClientOptions({}, {});
  t.deepEqual(result, {});
});

test("normalizeClientOptions omit", (t) => {
  const opts = new Options(false);
  let result;

  result = opts.normalizeClientOptions({}, { client_options: { omit: "foo" } });
  t.deepEqual(result, { omit: "foo" });

  result = opts.normalizeClientOptions({}, {});
  t.deepEqual(result, {});
});
