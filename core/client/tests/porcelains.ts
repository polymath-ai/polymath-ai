import test from "ava";

import { CompletionStreamer } from "../src/porcelains.js";

test("CompletionStreamer", async (t) => {
  const streamer = new CompletionStreamer();
  const writer = streamer.writable.getWriter();
  const reader = streamer.readable.getReader();
  writer.write(new TextEncoder().encode('data: [ "hello" ]\n'));
  writer.write(new TextEncoder().encode('data: [ "world" ]\n'));
  writer.write(new TextEncoder().encode("data: [DONE]\n"));
  writer.close();
  const result = await reader.read();
  t.deepEqual(result.value, ["hello"]);
  t.false(result.done);
  const result2 = await reader.read();
  t.deepEqual(result2.value, ["world"]);
  t.false(result2.done);
  const result3 = await reader.read();
  t.true(result3.done);
});
