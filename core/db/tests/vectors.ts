import test from "ava";
import fs from "fs";
import { withDir } from "tmp-promise";

import {
  PathMaker,
  VectorStore,
  VectorStoreReader,
  VectorStoreWriter,
} from "../src/vectors.js";
import { PackedBit, Bit } from "@polymath-ai/types";

// Helper functions and constants for loading the library.
// These are roughly the same as the ones in core/host/src/utils.ts, but
// are duplicated here to avoid a circular dependency.
const EMBEDDING_VECTOR_LENGTH = 1536;

const unpack = (packed: string | undefined) => {
  if (!packed) return undefined;
  return Array.from(
    new Float32Array(new Uint8Array(Buffer.from(packed, "base64")).buffer)
  );
};

const loadBits = (): Bit[] => {
  const s = fs.readFileSync("./tests/data/sample-library.json", "utf-8");
  const library = JSON.parse(s);
  return library.bits.map((bit: PackedBit) => {
    return {
      ...bit,
      embedding: unpack(bit.embedding),
    };
  });
};

const random_query = () =>
  new Array(EMBEDDING_VECTOR_LENGTH).fill(0).map(() => Math.random());

test("Store paths are constructed properly", (t) => {
  const path = "foo";
  const pathMaker = new PathMaker(path);
  t.deepEqual(pathMaker.databaseFile, "foo/database.db");
  t.deepEqual(pathMaker.vectorIndexFile, "foo/vector.idx");
});

test("Store paths are created", async (t) => {
  await withDir(async ({ path }) => {
    const pathMaker = new PathMaker(path);
    await pathMaker.ensure();
    t.true(pathMaker.exists());
  });
});

test("omnibus test to help me with bring up", async (t) => {
  await withDir(
    async ({ path }) => {
      const writer = new VectorStoreWriter(path);
      const bits = loadBits();
      await writer.write(bits);

      const reader = new VectorStoreReader();
      await reader.init(path);

      const query = random_query();
      const results = await reader.search(query, 5);
      t.is(results.length, 5);
      const result = results[0];
      t.truthy(result.text);
      t.assert(result.text?.length || 0 > 0);
      t.truthy(result.token_count);
    },
    { unsafeCleanup: true }
  );
});
