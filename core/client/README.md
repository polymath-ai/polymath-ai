# @polymath-ai/client

`polymath` is a utility that uses AI to intelligently answer free-form
questions based on a particular library of content.

This is an ESM JavaScript client that you can use to ask a Polymath or series
of them a couple types of questions.

## Get me embedding results for a given query

This is the heart of what a Polymath does. It has a library of content, and
given a query, it will return a subset of the library bits that represent
good context for that given query.

```js
let polymathResults = await client.ask("How long is a piece of string?");
```

`polymathResults` is an object that contains:

- `bits`: a function that returns an array of all of the bits that matched. Each bit contains:

  - `text`: string;
  - `embedding`: Vector;
  - `similarity?`: number;
  - `token_count`: number;

- `context(tokenLength)`: A function that returns a helpful string of all of the text to easily be used in
  a completion request. Can limit the context by passing in the `tokenLength` limit.

- `maxBits(tokenLength)`: A function that returns the bits that fit into a given token length

## Get me a completion from a given query

This isn't the main job for a Polymath, but often you want to ask for a
completion, we want to make it simple to do so in one fell swoop.

```js
let completionResult = await client.completion(
  "How long is a piece of string?"
);
```

`completionResult` is an object that contains:

- `bits`: an array of all of the bits that matched. Same as above from `polymathResults`

- `infos`: An array with all of the info entries (without duplicates). They contain:

  - `url`: pointing to the source
  - `title?`: content title
  - `description?`: content description

- `completion`: text of the completion (answer) from the model

## Setting up the Polymath

When you setup a polymath object you have to pass in some options.

You _have_ to pass in an Open AI API key, and then you need to tell it where you want to ask for information.

This can be locally via library files. Place an array of files and/or file patterns that point to
individual files, file globs (e.g. `./libraries/*.json`), or directories (.json files will be loaded).

For example, with a specific file:

```js
let client = new Polymath({
  apiKey: process.env.OPENAI_API_KEY,
  libraryFiles: ["./libraries/knowledge-string.json"],
  promptTemplate:
    "Answer using the context below please.\n\nContext: {context}\n\nQuestion: {prompt}\n\nAnswer:",
});
```

And/or you can point to a remote server URL for a Polymath:

```js
let client = new Polymath({
  apiKey: process.env.OPENAI_API_KEY,
  servers: ["https://polymath.almaer.com/"],
});
```

And why not ask multiple polymath servers?

```js
let client = new Polymath({
  apiKey: process.env.OPENAI_API_KEY,
  servers: ["https://remix.polymath.chat/", "https://preact.polymath.chat/"],
});

let results = await polymath.completion("Can you use Remix with Preact?");
```

If you have stored your library in [Pinecone](https://pinecone.io) then you can tell Polymath to look there.

You will want to setup your environment variables, either directly or via a `.env` file.

```js
let client = new Polymath({
  apiKey: process.env.OPENAI_API_KEY,
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    baseUrl: process.env.PINECONE_BASE_URL,
    namespace: process.env.PINECONE_NAMESPACE,
  },
});

let r = await client.ask("How long is a piece of string?");
```

You can also pass in other optional info such as overriding the prompt that you wish to use:

```js
let polymath = new Polymath({
  apiKey: process.env.OPENAI_API_KEY,
  libraryFiles: ["./libraries/knowledge-string.json"],
  promptTemplate:
    "Answer using the context below please.\n\nContext: {context}\n\nQuestion: {prompt}\n\nAnswer:",
});
```

And if you want some debugging info, just pass in `debug: true`:

```js
let polymath = new Polymath({
  apiKey: process.env.OPENAI_API_KEY,
  libraryFiles: ["./libraries/knowledge-string.json"],
  debug: true,
});
```

You may want to process a completion as it streams to you. To do so you need to setup a streamProcessor:

```js
let client = new Polymath({
  apiKey: process.env.OPENAI_API_KEY,
  libraryFiles: ["./libraries/knowledge-string.json"],
});

let completionOptions = {
  model: "text-davinci-003",
  stream: true,
};

let streamProcessor = {
  processResults: (r) => {
    resolve();
    t.pass();
  },
  processDelta: (delta) => {
    // console.log("STREAMING DELTA:", delta);
  },
};

client.completion(
  "How long is a piece of string?",
  undefined, // PolymathResults
  undefined, // askOptions
  completionOptions,
  streamProcessor
);
```

# Tests

Tests are located in `tests/`. We use [ava](https://github.com/avajs/ava) for a simple test library.

To run them you will want to set your OpenAI API Key environment variable first, and some of the tests will
use the simple library `libraries/knowledge-string.json` that you can poke at too.
