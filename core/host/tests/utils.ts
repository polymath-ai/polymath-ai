import test from "ava";

import {
  encodeEmbedding,
  decodeEmbedding,
  fromFormData,
  EMBEDDING_VECTOR_LENGTH,
} from "../src/utils.js";

function arrayEquals(a: unknown, b: unknown) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

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

test("fromFormData correctly converts FormData to AskOptions", (t) => {
  const formData = new FormData();
  const vector = new Array(EMBEDDING_VECTOR_LENGTH).fill(0);
  const packedVector = encodeEmbedding(vector);
  formData.append("query_embedding", packedVector);

  const askOptions = fromFormData(formData);

  t.deepEqual(askOptions.query_embedding, vector);
  t.is(askOptions.version, 1);
  t.is(askOptions.query_embedding_model, "openai.com:text-embedding-ada-002");
});
