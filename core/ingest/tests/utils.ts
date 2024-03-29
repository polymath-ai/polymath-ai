import test from "ava";
import { readFile } from 'fs/promises';
import { encodeEmbedding, decodeEmbedding } from '../src/utils.js';
import { join } from "path";

test("encode embedding", async (t) => {
  // We're using a new encoding method so this compares it against the old one.
  const rawData = await readFile(join(process.cwd(), './test-data/embedding.json'), { encoding: 'utf8' });
  const jsonData = JSON.parse(rawData);
  const { embedding } = jsonData.data[0];

  const embeddingData = Buffer.from(new Float64Array(embedding).buffer).toString("base64");

  const newEmbedding = encodeEmbedding(embedding);

  t.is(newEmbedding, embeddingData);
});

test("decode embedding", async (t) => {
  // We're using a new encoding method so this compares it against the old one.
  const rawData = await readFile(join(process.cwd(), './test-data/embedding.json'), { encoding: 'utf8' });
  const jsonData = JSON.parse(rawData);
  const { embedding } = jsonData.data[0];

  // Encode the embedding data the old way.
  const embeddingData = Buffer.from(new Float64Array(embedding).buffer).toString("base64");

  const newEmbedding = decodeEmbedding(embeddingData);
  t.deepEqual(newEmbedding, embedding);
});