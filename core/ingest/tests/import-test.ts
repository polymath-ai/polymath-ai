import test from "ava";
import { Ingest, IngestArguments } from '../src/main.js';

test("init import with custom module", async (t) => {
  const importer = new Ingest();
  console.log(importer)

  const args: string[] = ["../../dist/test-data/custom-module/test.js", "test.com/"];
  const options: any = { apiKey: process.env.OPENAI_API_KEY };

  const importerArgs = {
    importer: args[0],
    source: args[1],
    options: options
  }

  const output = await importer.run(importerArgs)

  let counter = 1;

  for await (const item of output) {
    t.is(item.info?.url, `test.com/${counter++}`);
  }

  // the counter is at 7.
  t.is(counter, 7);
});


test("init import", (t) => {
  const importer = new Ingest();
  t.not(importer, null);
});
