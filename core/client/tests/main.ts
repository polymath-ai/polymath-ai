import { CompletionOptions } from "@polymath-ai/types";
import test from "ava";
import { Polymath } from "../src/main.js";

//
// Most of these tests are more of the intergration variety.
// Later, we will split up into unit and integrations tests.
//
// npm run test # runs them all
// npm run test -- --watch # runs them all and watches for changes
// npm run test -- --debug # turns on debug logging
//
// npx ava -m "Polymath gets one result with embedding omited locally" # runs a single test
// npx ava -m "Polymath gets one result with embedding omited locally" -- -d # turns on debug logging
//

const isDebug =
  process.argv.slice(2)[0] == "--debug" || process.argv.slice(2)[0] == "-d";
const log = (...args: unknown[]) => isDebug && console.log(...args);

test("Polymath requires an OpenAI API Key", (t) => {
  try {
    new Polymath({
      apiKey: "sk-fake-api-key",
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    t.pass();
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test("Polymath errors without an OpenAI API Key", (t) => {
  try {
    new Polymath({});
    t.fail();
  } catch (e) {
    log("ERROR:", e);
    t.pass();
  }
});

test("Polymath tells you when it's invalid", (t) => {
  try {
    const client = new Polymath({
      apiKey: "sk-fake-api-key",
    });

    if (!client.validate()) {
      t.pass();
    }
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test("Polymath tells you when it's invalid, allowing you to fix it later", (t) => {
  try {
    const client = new Polymath({
      apiKey: "sk-fake-api-key",
    });

    client.servers = ["https://polymath.almaer.com/"];

    if (client.validate()) {
      t.pass();
    }
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test("Polymath knows which models are ChatCompletion style", (t) => {
  try {
    const client = new Polymath({
      apiKey: "sk-fake-api-key",
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    if (
      client.isChatModel("gpt-3.5-turbo") &&
      client.isChatModel("gpt-4") &&
      !client.isChatModel("text-davinci-003")
    ) {
      t.pass();
    }
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test("Polymath can get embeddings", async (t) => {
  const client = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ["./libraries/knowledge-string.json"],
  });

  const embedding = await client.generateEmbedding("ePiano");

  if (embedding.length == 1536) {
    t.pass();
  } else {
    t.fail();
  }
});

test.skip("Polymath gets results", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    const r = await client.ask("How long is a piece of string?");

    console.log(r);

    if (r.context()) {
      t.pass();
    }
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test.skip("Polymath gets results with glob library files", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/*.json"],
    });

    const r = await client.ask("How long is a piece of string?");

    if (r.context()) {
      t.pass();
    } else {
      t.fail();
    }
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test.skip("Polymath gets results with directory", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries"],
    });

    const r = await client.ask("How long is a piece of string?");

    if (r.context()) {
      t.pass();
    }
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test("Polymath gets server results", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: ["https://polymath.almaer.com/"],
    });

    const r = await client.ask(
      "What is the best side effect of using an AI assistant?"
    );

    if (r.context()) {
      t.pass();
    }
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test("Polymath gets local completions", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    const r = await client.completion("How long is a piece of string?");

    if (r.completion) {
      log("Completion: ", r.completion);
      t.pass();
    }
  } catch (e) {
    log("LOCAL ERROR:", e);
    t.fail();
  }
});

test("Polymath gets local completions with the turbo model and a system message", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
      completionOptions: {
        model: "gpt-3.5-turbo",
        system: "You are a wise oracle with deep knowledge.",
      },
    });

    const r = await client.completion("How long is a piece of string?");

    if (r.completion) {
      log("Completion: ", r.completion);
      t.pass();
    }
  } catch (e) {
    log("LOCAL ERROR:", e);
    t.fail();
  }
});

test("Polymath gets local completions with the turbo model streaming", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    const completionOptions: CompletionOptions = {
      model: "gpt-3.5-turbo",
      stream: true,
    };

    const results = await client.completion(
      "How long is a piece of string?",
      undefined, // PolymathResults
      undefined, // askOptions
      completionOptions
    );
    t.assert(results.stream, "Stream is present");
    if (results.stream) {
      for await (const data of results.stream) {
        t.assert(data != null);
        t.pass();
        break;
      }
    }
  } catch (e) {
    log("LOCAL TURBO STREAMING ERROR:", e);
    t.fail();
  }
});

test("Polymath gets local completions with the OG model streaming", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    const completionOptions: CompletionOptions = {
      model: "text-davinci-003",
      stream: true,
    };

    const results = await client.completion(
      "How long is a piece of string?",
      undefined, // PolymathResults
      undefined, // askOptions
      completionOptions
    );
    t.assert(results.stream, "Stream is present");
    if (results.stream) {
      for await (const data of results.stream) {
        t.assert(data != null);
        t.pass();
        break;
      }
    }
  } catch (e) {
    log("LOCAL OG STREAMING ERROR:", e);
    t.fail();
  }
});

test.skip("Polymath gets server completions", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: ["https://polymath.almaer.com/"],
    });

    const r = await client.completion(
      "What is the best side effect of using an AI assistant?"
    );

    if (r.completion) {
      log("Completion: ", r.completion);
      t.pass();
    }
  } catch (e) {
    log("ERROR:", e);
    t.fail();
  }
});

test("Polymath gets multiple server completions", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: [
        "https://remix.polymath.chat/",
        "https://preact.polymath.chat/",
      ],
    });

    const r = await client.completion("Can you use Remix with Preact?");

    if (r.completion) {
      log("Completion: ", r.completion);
      t.pass();
    }
  } catch (e) {
    log("ERROR MULTI:", e);
    t.fail();
  }
});

test("Polymath sends with extra otherOptions to limit count to 1 bit", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: ["https://remix.polymath.chat/"],
    });

    const r = await client.ask("When should you use a Button vs. a Link?", {
      count: 1,
    });

    if (r.bits().length == 1) {
      t.pass();
    }
  } catch (e) {
    log("ERROR OTHER OPTIONS:", e);
    t.fail();
  }
});

test("Polymath sends with extra otherOptions to omit embeddings", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      servers: ["https://remix.polymath.chat/"],
    });

    const r = await client.ask("When should you use a Button vs. a Link?", {
      omit: ["info", "embedding"],
      count: 1,
    });

    if (!r.bits()[0].embedding) {
      t.pass();
    }
  } catch (e) {
    log("ERROR OTHER OPTIONS EMBEDDINGS:", e);
    t.fail();
  }
});

test("Polymath gets one result with embedding omited locally", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      libraryFiles: ["./libraries/knowledge-string.json"],
    });

    const r = await client.ask("How long is a piece of string?", {
      omit: "embedding",
      count: 1,
    });

    const response = r.response();
    if (!r.bits()[0].embedding && response.omit === "embedding") {
      t.pass();
    }
  } catch (e) {
    log("ERROR EMBEDDING:", e);
    t.fail();
  }
});

test.skip("Polymath gets pinecone results", async (t) => {
  try {
    const client = new Polymath({
      apiKey: process.env.OPENAI_API_KEY,
      pinecone: {
        apiKey: process.env.PINECONE_API_KEY,
        baseUrl: process.env.PINECONE_BASE_URL,
        namespace: process.env.PINECONE_NAMESPACE,
        topK: 11,
      },
    });

    const r = await client.ask("How long is a piece of string?");

    log("PINECONE RESULTS: ", JSON.stringify(r));

    if (r.context() && r.bits()[0].info?.url) {
      t.pass();
    }
  } catch (e) {
    log("ERROR: ", e);
    t.fail();
  }
});
