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
let polymathResults = await polymath.ask("How long is a piece of string?");
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
let completionResult = await polymath.completion("How long is a piece of string?");
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

You *have* to pass in an Open AI API key, and then you need to tell it where you want to ask for information.

This can be locally via library files such as:

```js
let polymath = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ['./libraries/knowledge-string.json'],
    promptTemplate: "Answer using the context below please.\n\nContext: {context}\n\nQuestion: {prompt}\n\nAnswer:"
});
```

And/or you can point to a remote server URL for a Polymath:

```js
let polymath = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    servers: ["https://polymath.almaer.com/"],
});
```

And why not ask multiple polymath servers?

```js
let polymath = new Polymath({
  apiKey: process.env.OPENAI_API_KEY,
  servers: [
    "https://remix.polymath.chat/",
    "https://preact.polymath.chat/"
  ]
});

let results = await polymath.completion("Can you use Remix with Preact?");
```

You can also pass in other optional info such as overriding the prompt that you wish to use:

```js
let polymath = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ['./libraries/knowledge-string.json'],
    promptTemplate: "Answer using the context below please.\n\nContext: {context}\n\nQuestion: {prompt}\n\nAnswer:"
});
```


# Tests

Tests are located in `tests/`. We use [ava](https://github.com/avajs/ava) for a simple test library.

To run them you will want to set your OpenAI API Key environment variable first, and some of the tests will
use the simple library `libraries/knowledge-string.json` that you can poke at too.
