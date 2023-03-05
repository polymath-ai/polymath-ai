import test from "ava";

import os from "os";
import path from "path";

import { Config } from "./config.js";

import mockfs from "mock-fs";

test("load config file", (t) => {
  const filename = "foo";
  const localPath = path.resolve(filename);
  const homedir = path.join(
    os.homedir(),
    ".polymath",
    "config",
    `${filename}.json`
  );
  const answer = { config: "homedir" };
  mockfs({
    [homedir]: JSON.stringify(answer),
  });
  const config = new Config(false);
  const result = config.load("foo");
  t.deepEqual(result, answer);
  mockfs.restore();
});
