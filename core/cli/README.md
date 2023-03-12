# Polymath CLI

A Polymath CLI for interacting with all things Polymath.

It wraps the [Polymath JS client](https://github.com/polymath-ai/polymath-js-client/),
and will always be a lean CLI shim on top of that.

## Setup

You can run a local `polymath` cli via `npx`, E.g.:

```shell
npx polymath -c local-knowledge complete --completion-model gpt-3.5-turbo "How long is a piece of string?"
```

Download and install the `polymath` cli globally:

```shell
npm install -g @polymath-ai/cli
```

## Commands

Commands will look for options in the following order of precedence:

- A given command line argument
- Use the `--config filename`. The CLI will search for the first config file
  in the following order:
  . `--config configpath`: try to load the file
  . `--config configname`: try to load `~/.polymath/config/$configname.json`
- `~/.polymath/config/default.json`: default config location
- Environment variables will be used for some settings. e.g. `OPENAI_API_KEY`

There are some global options for all commands:

- `polymath -d`: turn on debug mode (more output)
- `polymath -c config`: load up the config
- `polymath -v`: show the version
- `polymath -h`: show the help

We have certain standard arguments that various command reuse:

- `--input-file`: single file to use as an input
- `--input-directory`: single directory to use an input
- `--output-file`: when outputting a single file (e.g. a library.json)
- `--input`: a type of input (e.g. medium)
- `--output`: a type of output (e.g. pinecone)

When arguments aren't given, we will prompt the user for them.

Commands that we do ✅, and will ❌, support:

### Ask a polymath for context ✅

```shell
polymath [-c configfileorname] ask "how long is a piece of string?"
```

If no query is given, we will ask for one.

It will also takes arguments: ✅

- `--openai-api-key="the openapi key"`: defaults to `$OPENAI_API_KEY` in env / .env
- `--server https://glazkov.com`: pass as many of these as you want
- `--libraries path/to/libraryOrDirectory`: pass in more of these too
- `--pinecone --pinecone-api-key="The Key" --pinecone-base-url="The URL" --pinecone-namespace=namespace`: use pinecone with all of it's sub settings. If not found, will also look in env / .env (e.g. PINECONE_API_KEY, PINECONE_BASE_URL, PINECONE_NAMESPACE)

### Ask a polymath for a full completion ✅

```shell
polymath [-c configfileorname] complete "how long is a piece of string?"
```

It takes the same arguments as `ask` but also uses OpenAI config options and other arguments to overrule them (e.g. `max_tokens`, `stop`, etc)

### Ask a polymath to `stream` a full completion ✅

```shell
polymath -c local-knowledge complete --completion-stream true --completion-model gpt-3.5-turbo "How long is a piece of string?"
```

This example turns on streaming, and sets the completion model to the new default turbo mode.

### Import content ❌

```shell
polymath import --input=medium --input-directory=path/to/export-backup/ --output-file=./libraries/medium-2023.json
```

### Export content ❌

```shell
polymath export --input-library=... --output=pinecone --pinecone-api-key="The Key" --pinecone-base-url="The URL" --pinecone-namespace=namespace
```

### Check information and validate an Polymath Endpoint ❌

Go ahead and great a Polymath Endpoint to get information on what is supported,
and do a lil validation check to boot.

```shell
polymath info --server https://glazkov.com`
```

## Development

To hack on the CLI, once you git clone, you will probably want to `npm link` in the root directory and then you will have access to running the `polymath` shell command.

Setup at least a `~/.polymath/config/default.json` and you are off to the races.
