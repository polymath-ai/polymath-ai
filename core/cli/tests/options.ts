import test from "ava";

import { Options } from "../src/options.js";

test("normalizeClientOptions servers", (t) => {
  const opts = new Options({ debug: false });
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
  const opts = new Options({ debug: false });
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
  const opts = new Options({ debug: false });
  let result;

  result = opts.normalizeClientOptions(
    {},
    { client_options: { omit: "text" } }
  );
  t.deepEqual(result, { omit: "text" });

  result = opts.normalizeClientOptions({}, {});
  t.deepEqual(result, {});
});
