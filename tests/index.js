import test from "ava";
import { Polymath } from "../main.js";

test("Polymath requires an OpenAI API Key", (t) => {
  try {
    let p = new Polymath({
      apiKey: "sk-fake-api-key",
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    t.pass();
  } catch (e) {
    t.fail();
  }
});

test("Polymath errors without an OpenAI API Key", (t) => {
  try {
    new Polymath();
    t.fail();
  } catch (e) {
    t.pass();
  }
});

test("Polymath gets results", async (t) => {
  try {
    let p = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    let r = await p.results("How long is a piece of string?");

    if (r.context()) {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("Polymath gets completions", async (t) => {
  try {
    let p = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    let r = await p.completion("How long is a piece of string?");

    if (r.completion) {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("Polymath can get embeddings", async (t) => {
  let p = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ["./libraries/knowledge-string.json"],
  });

  let embedding = await p.generateEmbedding("ePiano");

  if (embedding.length == 1536) {
	t.pass();
  } else {
	t.fail();
  }
});
