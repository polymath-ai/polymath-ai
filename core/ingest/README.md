# Polymath Ingest

This is a tool that is used to ingest data from a source and convert it into a format that can be used by the Polymath system.

## Standalone ingestion tool

Install: `npm install -g @polymath/ingest`

### Using Builtin importers

`@polymath/ingest --openai-api-key=[SECRET] rss https://paul.kinlan.me/index.xml`

### Using a self hosted importer

`@polymath/ingest --openai-api-key=[SECRET] ../test/import/html.js https://paul.kinlan.me/`

## API

### Extend `Importer` for use in the CLI

You are able to extend the `Importer` class to create your own importer.

1. Create a new class that extends `Importer`
2. Implement the `getStringsFromSource` method
   a. getStringsFromSource should return an AsyncGenerator of partially filled out bits that is the full string of data from the source.
   b. The `text` property of the bit should be the full string of data from the source. The `info` property of the bit should be an object that contains any additional information about the bit. The `info` property is optional.

```
class MYRSS extends Importer {

  constructor() {
    super();
  }

  async *getStringsFromSource(source: string): AsyncGenerator<Bit> {
    const feed = await (new RSSParser).parseURL(source);
    console.log(feed.title); // feed will have a `foo` property, type as a string

    for (const item of feed.items) {
      yield {
        text: item.content || "",
        info: {
          url: item.link || "",
          title: item.title || "",
        }
      };
    }
  }

}
```

E.g:
`> polymath-ingest rss https://paul.kinlan.me/index.xml`

### Embed the `Import` process

It is possible to use the `Import` process directly in your own code.

```
import { Importer } from "./importer.js";

const importer = new Importer({ /* options */ });

for await(const bit of importer.run({ args, options, command })) {
  console.log(`${bit.url}: Embedding: ${bit.embedding}`);)  
}

```