# cli

A Polymath CLI for interacting with all things Polymath.

## Setup

Download and install the `polymath` cli globally:

```shell
npm install -g @polymath-ai/cli
```

## Commands

Commands will look for options in the following order of precedence:

- A given command line argument
- The config that is setup via `polymath set config` or --config `path/to/config` (If there isn't a config at that path, will also look for a config file at `~/.polymath/config/$VALUE.json`. E.g. `polymath -C polaris ...` will use `~/.polymath/config/polaris.json` if there)
- Environment variables: e.g. `OPENAI_API_KEY`
- `~/.polymath/config/default.json`: default config location

We have certain standard arguments that various command reuse:

- `--input-file`: single file to use as an input
- `--input-directory`: single directory to use an input
- `--output-file`: when outputting a single file (e.g. a library.json)
- `--input`: a type of input (e.g. medium)
- `--output`: a type of output (e.g. pinecone)

When arguments aren't given, we will prompt the user for them.

Commands that we do ✅, and will ❌, support:

### Set the config to be used ❌

A default config to load if `--config` isn't passed in.

```shell
polymath set config path/to/configfile
```

### Query a polymath ❌

```shell
polymath query "how long is a piece of string?"
```

If no query is given, we will ask for one.

It takes arguments:

- `--openai-api-key="the openapi key"`: defaults to `$OPENAI_API_KEY` in env / .env
- `--server https://glazkov.com`: pass as many of these as you want
- `--libraries path/to/libraryOrDirectory`: pass in more of these too
- `--pinecone --pinecone-api-key="The Key" --pinecone-base-url="The URL" --pinecone-namespace=namespace`: use pinecone with all of it's sub settings. If not found, will also look in env / .env (e.g. PINECONE_API_KEY, PINECONE_BASE_URL, PINECONE_NAMESPACE)

### Import content ❌

```shell
polymath import --input=medium --input-directory=path/to/export-backup/ --output-file=./libraries/medium-2023.json
```

### Export content ❌

```shell
polymath export --input-library=... --output=pinecone --pinecone-api-key="The Key" --pinecone-base-url="The URL" --pinecone-namespace=namespace
```
