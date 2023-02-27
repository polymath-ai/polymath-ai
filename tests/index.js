import test from "ava";
import { Polymath } from "../main.js";

//
// Most of these tests are more of the intergration variety.
// Later, we will split up into unit and integrations tests.
//
// npm run test # runs them all
// npm run test -- --watch # runs them all and watches for changes
// npx ava -m "Polymath gets one result with embedding omited locally" # runs a single test
//

test("Polymath requires an OpenAI API Key", (t) => {
  try {
    let client = new Polymath({
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

test("Polymath tells you when it's invalid", (t) => {
  try {
    let client = new Polymath({
      apiKey: "sk-fake-api-key",
    });

    if (!client.valid()) {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("Polymath tells you when it's invalid, allowing you to fix it later", (t) => {
  try {
    let client = new Polymath({
      apiKey: "sk-fake-api-key",
    });

    client.servers = ["https://polymath.almaer.com/"];

    if (client.valid()) {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("Polymath can get embeddings", async (t) => {
  let client = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ["./libraries/knowledge-string.json"],
  });

  let embedding = await client.generateEmbedding("ePiano");

  if (embedding.length == 1536) {
    t.pass();
  } else {
    t.fail();
  }
});

test("Polymath gets results", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    let r = await client.ask("How long is a piece of string?");

    if (r.context()) {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("Polymath gets results with glob library files", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/*.json"],
    });

    let r = await client.ask("How long is a piece of string?");

    if (r.context()) {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("Polymath gets results with directory", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries"],
    });

    let r = await client.ask("How long is a piece of string?");

    if (r.context()) {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("Polymath gets server results", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: ["https://polymath.almaer.com/"],
    });

    let r = await client.ask(
      "What is the best side effect of using an AI assistant?"
    );

    if (r.context()) {
      t.pass();
    }
  } catch (e) {
    console.log("ERROR:", e);
    t.fail();
  }
});

test("Polymath gets local completions", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    let r = await client.completion("How long is a piece of string?");

    if (r.completion) {
      t.pass();
    }
  } catch (e) {
    console.log("LOCAL ERROR:", e);
    t.fail();
  }
});

test("Polymath gets server completions", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: ["https://polymath.almaer.com/"],
    });

    let r = await client.completion(
      "What is the best side effect of using an AI assistant?"
    );

    if (r.completion) {
      t.pass();
    }
  } catch (e) {
    // console.log("ERROR:", e);
    t.fail();
  }
});

test("Polymath gets multiple server completions", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: [
        "https://remix.polymath.chat/",
        "https://preact.polymath.chat/",
      ],
    });

    let r = await client.completion("Can you use Remix with Preact?");

    if (r.completion) {
      t.pass();
    }
  } catch (e) {
    // console.log("ERROR MULTI:", e);
    t.fail();
  }
});

test("Polymath sends with extra otherOptions to limit count to 1 bit", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: ["https://remix.polymath.chat/"],
    });

    let r = await client.ask("When should you use a Button vs. a Link?", {
      count: 1,
    });

    if (r.bits().length == 1) {
      t.pass();
    }
  } catch (e) {
    console.log("ERROR OTHER OPTIONS:", e);
    t.fail();
  }
});

test("Polymath sends with extra otherOptions to omit embeddings", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: ["https://remix.polymath.chat/"],
    });

    let r = await client.ask("When should you use a Button vs. a Link?", {
      omit: "info,embedding",
      count: 1,
    });

    if (!r.bits()[0].embedding) {
      t.pass();
    }
  } catch (e) {
    console.log("ERROR OTHER OPTIONS EMBEDDINGS:", e);
    t.fail();
  }
});

test("Polymath gets one result with embedding omited locally", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    let r = await client.ask("How long is a piece of string?", {
      omit: "embedding",
      count: 1,
    });

    if (!r.bits()[0].embedding) {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("Polymath gets pinecone results", async (t) => {
  try {
    let client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      pinecone: {
        apiKey: process.env.PINECONE_API_KEY,
        baseUrl: process.env.PINECONE_BASE_URL,
        namespace: process.env.PINECONE_NAMESPACE,
        topK: 11,
      },
    });

    let r = await client.ask("How long is a piece of string?");

    // console.log("PINECONE RESULTS: ", JSON.stringify(r));

    if (r.context() && r.bits()[0].info.url) {
      t.pass();
    }
  } catch (e) {
    // console.log("ERROR: ", e);
    t.fail();
  }
});
