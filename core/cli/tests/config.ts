import test from "ava";

import os from "os";
import path from "path";

import { Config } from "../src/config.js";

import mockfs from "mock-fs";

test("homedir path", (t) => {
  const result = Config.homeDirPath("foo");
  const expected = path.join(os.homedir(), ".polymath", "config", "foo.json");
  t.deepEqual(result, expected);
});

test("load config from exact path", (t) => {
  const filename = "../foo";
  const localPath = path.resolve(filename);
  const answer = { endpoint: "http://exact-path.com" };
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
  const answer = { endpoint: "http://homedir.com" };
  mockfs({
    [Config.homeDirPath(filename)]: JSON.stringify(answer),
  });
  const config = new Config({ debug: false });
  const result = config.load(filename);
  t.deepEqual(result, answer);
  mockfs.restore();
});

test("load default config", (t) => {
  const answer = { endpoint: "http://default.com" };
  mockfs({
    [Config.homeDirPath("default")]: JSON.stringify(answer),
  });
  const config = new Config({ debug: false });
  const result = config.load(null);
  t.deepEqual(result, answer);
  mockfs.restore();
});

test("handle no config file gracefully", (t) => {
  mockfs({});
  const config = new Config({ debug: false });
  const result = config.load(null);
  t.deepEqual(result, {});
  mockfs.restore();
});

test("throw error if config file is invalid", (t) => {
  mockfs({
    [Config.homeDirPath("default")]: "not json",
  });
  let config = new Config({ debug: false });
  t.throws(() => config.load(null));
  mockfs.restore();

  mockfs({
    [Config.homeDirPath("default")]: '{ "random": "json" }',
  });
  config = new Config({ debug: false });
  t.throws(() => config.load(null));
  mockfs.restore();
});
