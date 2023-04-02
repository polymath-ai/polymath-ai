# Polymath Host Implementation

This is a library that provides a host implementation for Polymath. It is designed to easily stand up a Polymath host.

There are two concrete implementations of the host:

1. `PolymathPinecone` that relies on [Pinecone](https://www.pinecone.io/) as a backend.

2. `PolymathFile` that serves local JSON files.

Both are sub-classes of `PolymathHost`, which has the following API:

```typescript

async ask(formData: FormData): Promise<PackedLibraryData>

async queryPacked(args: AskOptions): Promise<PackedLibraryData>

async query(args: AskOptions): Promise<LibraryData>

```

The `ask` method is the main entry point for the host. It takes a `FormData` object and returns a `PackedLibraryData` object, which can be served right out
as a JSON in HTTP response.

The `queryPacked` and `query` methods are convenience methods that take an `AskOptions` object and return a `PackedLibraryData` or `LibraryData` object, respectively. They are most useful for situations where you want to consume host directly in your code, without using HTTP.
