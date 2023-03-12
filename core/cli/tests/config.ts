import test from "ava";

import os from "os";
import path from "path";

import { Config } from "../src/config.js";

import mockfs from "mock-fs";

test("homedir path", (t) => {
  const config = new Config({ debug: false });
  const result = Config.homeDirPath("foo");
  const expected = path.join(os.homedir(), ".polymath", "config", "foo.json");
  t.deepEqual(result, expected);
});

test("load config from exact path", (t) => {
  const filename = "../foo";
  const localPath = path.resolve(filename);
  const answer = { config: "exact path" };
  mockfs({
    [localPath]: JSON.stringify(answer),
  });
  const config = new Config({ debug: false });
  const result = config.load(filename);
  t.deepEqual(result, answer);
  mockfs.restore();
});

test("load config from homedir", (t) => {
  const filename = "foo";
  const answer = { config: "homedir" };
  mockfs({
    [Config.homeDirPath(filename)]: JSON.stringify(answer),
  });
  const config = new Config({ debug: false });
  const result = config.load(filename);
  t.deepEqual(result, answer);
  mockfs.restore();
});

test("load default config", (t) => {
  const answer = { config: "default" };
  mockfs({
    [Config.homeDirPath("default")]: JSON.stringify(answer),
  });
  const config = new Config({ debug: false });
  const result = config.load();
  t.deepEqual(result, answer);
  mockfs.restore();
});
