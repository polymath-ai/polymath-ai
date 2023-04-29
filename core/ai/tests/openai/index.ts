import test from "ava";

import fs from "fs";

import { CompletionStreamer } from "../../src/openai/index.js";
import { CompletionResponse } from "../../src/openai/types.js";

const validStreamIn = fs
  .readFileSync("tests/data/valid-stream-in.txt", "utf-8")
  .split("\n");

const validStreamOut = JSON.parse(
  fs.readFileSync("tests/data/valid-stream-out.json", "utf-8")
);

test("CompletionStreamer happily consumes valid stream data", async (t) => {
  const streamer = new CompletionStreamer();
  const writer = streamer.writable.getWriter();
  const reader = streamer.readable.getReader();
  validStreamIn.forEach((line) => {
    writer.write(new TextEncoder().encode(line));
  });
  writer.close();
  validStreamOut.forEach(async (expected: object) => {
    const result = await reader.read();
    t.deepEqual(result.value, expected);
    t.false(result.done);
  });
  const done = await reader.read();
  t.true(done.done);
});

test("CompletionStreamer knows how to pipe", async (t) => {
  const streamer = new CompletionStreamer();
  const stream = new ReadableStream({
    start(controller) {
      validStreamIn.forEach((line) => {
        controller.enqueue(new TextEncoder().encode(line));
      });
    },
  });
  const response = stream.pipeThrough(
    streamer
  ) as unknown as AsyncIterable<CompletionResponse>;
  let count = 0;
  for await (const chunk of response) {
    t.deepEqual(chunk, validStreamOut[count++]);
  }
});
