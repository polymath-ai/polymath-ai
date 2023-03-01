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

It will also takes arguments: ❌

- `--openai-api-key="the openapi key"`: defaults to `$OPENAI_API_KEY` in env / .env
- `--server https://glazkov.com`: pass as many of these as you want
- `--libraries path/to/libraryOrDirectory`: pass in more of these too
- `--pinecone --pinecone-api-key="The Key" --pinecone-base-url="The URL" --pinecone-namespace=namespace`: use pinecone with all of it's sub settings. If not found, will also look in env / .env (e.g. PINECONE_API_KEY, PINECONE_BASE_URL, PINECONE_NAMESPACE)

### Ask a polymath for a full completion ✅

```shell
polymath [-c configfileorname] complete "how long is a piece of string?"
```

It takes the same arguments as `ask` but also uses OpenAI config options and other arguments to overrule them (e.g. `max_tokens`, `stop`, etc)

### Import content ❌

```shell
polymath import --input=medium --input-directory=path/to/export-backup/ --output-file=./libraries/medium-2023.json
```

### Export content ❌

```shell
polymath export --input-library=... --output=pinecone --pinecone-api-key="The Key" --pinecone-base-url="The URL" --pinecone-namespace=namespace
```
