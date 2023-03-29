# Polymath Ingest

This is a libraries that can be used to ingest data from a source and convert it into a format that can be used by the Polymath system.

## Standalone ingestion tool

See: @polymath/cli

## API

### Extend `Ingester` for use in the CLI

You are able to extend the `Ingester` class to create your own importer.

1. Create a new class that extends `Ingester`
2. Implement the `getStringsFromSource` method
   a. getStringsFromSource should return an AsyncGenerator of partially filled out bits that is the *full string* of data from the source.
   b. The `text` property of the bit should be the full string of data from the source. The `info` property of the bit should be an object that contains any additional information about the bit. The `info` property is optional.

```
class MYRSS extends Ingester {

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
`> polymath ingest rss https://paul.kinlan.me/index.xml`

### Embed the `Ingest` process

It is possible to use the `Ingest` process directly in your own code, for example if you want to run a custom export as the embeddings are generated. The process will load the correct plugin and start processing it.

```
import { Ingest } from "@polymath/ingest";

const ingest = new Ingest({ /* options */ });

for await(const bit of ingest.run({ args, options, command })) {
  console.log(`${bit.url}: Embedding: ${bit.embedding}`);)  
}

```
