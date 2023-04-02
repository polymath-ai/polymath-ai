import test from "ava";

import { encodeEmbedding } from "../src/utils.js";
import { decodeEmbedding } from "@polymath-ai/host";

test("When decoding an encoded it comes back the same", (t) => {
  const sampleEmbedding = [
    -0.006929283495992422, -0.005336422007530928, -4.547132266452536e-5,
    -0.024047505110502243,
  ];

  if (
    arrayEquals(
      decodeEmbedding(encodeEmbedding(sampleEmbedding)),
      sampleEmbedding
    )
  ) {
    t.pass();
  } else {
    t.fail();
  }
});

function arrayEquals(a: unknown, b: unknown) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}
