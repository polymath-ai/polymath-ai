# The Story of Poly and Math

I'm looking for Knowledge, I'm looking for Truth. I have so many questions.

When it's time to look for answers, I have options.

## The Local Library

First, I can go to my own library at home, and look through my notebooks.

```js
let client = new Polymath({
  apiKey: "the-key-to-the-wise-one",
  libraryFiles: ["./library/knowledge.json"],
});
```

I have a lot of books within, but I know that there are others wise.

## Serving up Poly and Math

When it comes to anything science related, I get some context from two others.

I take my query and I ask `Poly` and I ask `Math`.

```js
let client = new Polymath({
  apiKey: "the-key-to-the-wise-one",
  servers: ["https://poly.polymath.host", "https://math.polymath.host"],
});

let results = await client.ask("How long is a piece of string?");
```

## Gems are hidden in the Pinecone tree

The squirrels love to... well squirrel away knowledge. One place they
love to do this is via [pinecone](https://pinecone.io).

If you know where the tree is, you can query that library:

```js
let client = new Polymath({
  apiKey: "the-key-to-the-wise-one",
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    baseUrl: process.env.PINECONE_BASE_URL,
    namespace: process.env.PINECONE_NAMESPACE,
  },
});

let results = await client.ask("How long is a piece of string?");
```

## The Completion

With context from both `Poly` and `Math`, I then go to the top of the mountain
and ask `ePiano`, the ultimate oracle, for The Completion, handing over all of
the context.

```js
client.completion(query, results);
```

## The Curator

The other day I asked a particularly tough question, and I feel bad saying it,
but I was somewhat surprised that `Poly` came back with the goods!

"How did you do it?", I asked. `Poly` told me that they actually asked around
and spoke to `Attia` and `PubMed`! Nice of you to do that `Poly`!
