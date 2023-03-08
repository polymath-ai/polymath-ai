import test from "ava";

import { encodeEmbedding, decodeEmbedding } from "../src/utils.js";

test("When decoding an encoded it comes back the same", (t) => {
  let sampleEmbedding = [
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

function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}
