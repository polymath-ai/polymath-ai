import test from "ava";
import { Import } from '../src/main.js';

test("init import with custom module", async (t) => {
  const importer = new Import();
  console.log(importer)

  const args: string[] = ["../../dist/test-data/custom-module/test.js", "test.com/"];
  const options: any = { "openaiApiKey": "test" };
  const command: string = "";

  const output = await importer.run({ args, options, command })

  let counter = 1;

  for await (const item of output) {
    t.is(item.info?.url, `test.com/${counter++}`);
  }

  // the counter is at 7.
  t.is(counter, 7);
});


test("init import", (t) => {
  const importer = new Import();
  t.not(importer, null);
});
