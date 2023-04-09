# Lightweight vector store for Poylmath.

To use:

```js
import { VectorStore } from "@polymath-ai/db";

// A directory where the database will reside.
// The store will create the directory and populate it with two files:
// - `database.db` -- the duckdb database that stores useful metadata.
// - `vector.idx` -- the hnswlib index that stores the vector index.
const path = "/path/to/store";
const store = new VectorStore(path, dimensions);
```

To write bits into it:

```js
const bits = ["array", "of", "bits"];
const writer = await store.createWriter();
await writer.write(bits);
```

Two query:

```js
const query = []; // the vector as an array of numbers
const resultCount = 5; // number of results to return
const reader = await store.createReader();
const results = await reader.search(query, resultCount);
```
