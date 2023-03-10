# Polymath Monorepo

This repository contains all the Polymath Node packages. It is set up as a monor, using Node's built-in [workspace](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true) capability.

## Getting started

After cloning the repo, run

```bash
npm i
```

This will install all of the dependencies for all of the packages in the monorepo.

Next, set up the environment variables. Create the file `.env` in the root directory of the monorepo, and add values for the following variables:

- `OPENAI_API_KEY` -- the OpenAI API Key
- `PINECONE_API_KEY` -- the Pinecone API Key
- `PINECONE_BASE_URL` -- the base URL for the Pinecone database
- `PINECONE_NAMESPACE` -- the Pinecone namespace

After that, try running the tests:

```bash
npm test
```

Most tests should pass.

Finally, try running the CLI:

```bash

npx polymath -c wdl complete "what is Web platform?"

```

## Managing packages within the monorepo

To create a new package, run:

```bash
npm init --scope=@polymath-ai -y -w ./packages/${package}
```

where `${package}` is the name of the package to be added.

To add one package in the monorepo as a dependency on another, run:

```bash
npm install @polymath-ai/${dependency} -w ./packages/${package}
```

where `${dependency}` is the name of the package to be added as a dependency, and `${package}` is the name of the package that will have the dependency added.

All packages within the monorepo have a similar structure:

```text

├── package.json
├── src
│   └── index.js
├────── <dir>
│        ├── <file>.js
│
│        ...
├── tests
│   └── <file>.js
│
│   ...

```

We try to place most of the code into sub-directories of the `src` directory, organizing them according to their purpose.

## Testing

We use [ava](https://github.com/avajs/ava) for testing.

We place test files into a separate `tests` directory, with the same file name name as what they test.

## Publishing packages

To publish packages, we use [changesets](https://github.com/changesets/changesets). The publishing workflow is:

1. Run `changeset` to create a new changeset. This will prompt you to select the packages that have changed, and will create a new changeset file in the `.changeset` directory.

2. Run `changeset version` to bump the version numbers of the packages that have changed. This will update the `package.json` files of the packages that have changed, and will create a new commit with the changes.

3. Run `changeset publish` to publish the packages that have changed. This will create a new tag for the new version, and will publish the packages to the npm registry.

## Filing bugs

When creating a Github issue:

- apply the relevant label (bug, feature, etc.)
- apply scope label, if the bug is scoped to a particular package. The format of the label is `scope:${package}`, where `${package}` is the name of the package directory in the repo. For example, `scope:cli` or `scope:client`. If the label doesn't exist, create it using the convention above.
