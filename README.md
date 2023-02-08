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
let polymathResults = await polymath.results("How long is a piece of string?");
```

`polymathResults` is an object that contains:

- `bits`: an array of all of the bits that matched. Each bit contains:
  - `text`: string;
  - `embedding`: Vector;
  - `similarity?`: number;
  - `token_count`: number;

- `context`: A helpful string of all of the text to easily be used in 
  a completion request.

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

When you setup a polymath object you have to pass in some options:

```js
let polymath = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ['./libraries/knowledge-string.json'],
    promptTemplate: "Answer using the context below please.\n\nContext: {context}\n\nQuestion: {prompt}\n\nAnswer:"
});
```

# Sample

You will see a sample.js file that you can run locally and play around to see the output.

It uses a simple library `libraries/knowledge-string.json` that you can poke at too.

# Tasks

We are just getting started here, lots to do!

For example:

- [ ]  Implement `servers` vs. local libraries so the client makes a network call
- [ ]  Implement access control so the library omit's private information
- [ ]  Be smarter with the number of tokens
- [ ]  Allow configuration of more of the OpenAI settings for completion (e.g. `stop:'\n'`)
- [ ]  Load configuration (from host.SECRET.json, env variables, Firestore)
- [ ]  Have multiple library loading options, so `pinecone` becomes a library option vs. in memory via JSON
- [ ]  Create a CLI