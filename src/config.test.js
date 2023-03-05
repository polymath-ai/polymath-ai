import test from "ava";

import os from "os";
import path from "path";

import { Config } from "./config.js";

import mockfs from "mock-fs";

test("homedir path", (t) => {
  const config = new Config(false);
  const result = Config.homeDirPath("foo");
  const expected = path.join(os.homedir(), ".polymath", "config", "foo.json");
  t.deepEqual(result, expected);
});

test("load config file", (t) => {
  const filename = "foo";
  const answer = { config: "homedir" };
  mockfs({
    [Config.homeDirPath(filename)]: JSON.stringify(answer),
  });
  const config = new Config(false);
  const result = config.load(filename);
  t.deepEqual(result, answer);
  mockfs.restore();
});
