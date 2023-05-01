# Polymath Monorepo

This repository contains all the Polymath Node packages. It is set up as a monorepo, using Node's built-in [workspace](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true) capability.

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

See [CLI README](./core/cli/README.md) for more information on how to use the `polymath` tool.

## Managing packages within the monorepo

:one: First, decide where the package will reside. There are three different directories, each serving a different purpose:

- `core` -- contains packages that are core to the project.
- `kits` -- contains packages that are used as starter kits for various environments, like `remix` or `firebase`.
- `seeds` -- for early experimental ideas that are not fully fleshed out.

:two: Next, decide on the name of the package. Pick a memorable name that is both descriptive and short. Abbreviations are okay as long as they are easily recognizable, like `cli`. Avoid redundant words, like `polymath` or `ai`.

:three: Create a new package:

```bash
npm init --scope=@polymath-ai -y -w ./${place}/${package}
```

where `${package}` is the name of the package to be added and `${place}` is the directory in which the package will reside.

:four: Decide whether the package will be published to `npm`. If no, add the following to the `package.json` file:

```json
{
  "private": true
}
```

Otherwise, make sure to name the package according to the following convention:

```json
{
  "name": "@polymath-ai/${package}[${-suffix}]"
}
```

where `${package}` is the name of the package.

For packages in the `kits` directory, the suffix is `-kit`. For packages in the `seeds` directory, the suffix is `-seed`. For packages in the `core` directory, the suffix is omitted.

:five: Organize the package. All packages within the monorepo have a similar structure:

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

One exception might be the [JS-to-TS bridge](core/infra/typescript.md#js-to-ts-bridge-for-cli), which is necessary to make the TypeScript CLI tools work.

There is a convenient `seeds/blank` directory that contains the necessary files to start a new package. Copy this directory to a new place and rename it to the name of the package.

## Working with monorepo

Because some packages use TypeScript, we need to make sure the code is built and ready to go before we use it.

To make this easy and convenient, we use [Turborepo](https://turbo.build/repo/docs). Turborepo is a build tool designed to work well with monorepos.

To install Turborepo, run:

```bash
npm i -g turbo
```

Once installed, you can use the `turbo` command to build the project. To build the entire project, run:

```bash
turbo build
```

in the root of the project. To work within a specific package, change your working directory to this package and do the same. For example, to build the `core/cli` package:

```bash
cd core/cli
turbo build
```

Same thing works for tests. To test the entire project, run:

```bash
turbo test
```

To run test for a specific package, follow the same pattern as with `build`. For example, to test the `core/cli` package:

```bash
cd core/cli
turbo test
```

Turborepo is fairly opinionless, so if you don't want to use it, you can get the same results (with more typing and checking) by using `npm` directly.

In this case, use `-w ${place}/${package}` to scope all usual `npm` activity to a particular package. For example, to run tests just in `core/cli`:

```bash

npm test -w core/cli

```

To add a new dev dependency `foo` in `kits/remix`:

```bash

npm i foo -w kits/remix

```

And so on.

## Wiring dependencies between packages

To add one package in the monorepo as a dependency on another, you need to do some manual writing. Because `npm` seems to always go look for the package in the registry first, we need to add dependencies for yet-unpublished packages by hand.

In the directory of the package where you need to add the dependency, edit the contents of `dependencies` (or `devDependencies`) to add the entry for the package on which you want this package to depend:

```json
"dependencies": {
  "@polymath-ai/${package}[-${suffix}]": "*",
}
```

Using `*` is okay for our case, since we always publish packages in lockstep.

Where `${version}` is the current version of the package. For example:

```json5
"dependencies": {
  // ...
  "@polymath-ai/remix-kit": "*"
},
"devDependencies": {
  // ...
  "@polymath-ai/tsconfig": "*"
}
```

## Testing

We use [ava](https://github.com/avajs/ava) for testing.

We place test files into a separate `tests` directory, with the same file name name as what they test.

## Watch workflow

To make development with TypeScript super-easy, use the `turbo watch` command. Open a separate terminal window and run:

```bash
turbo watch
```

This will start continuous compilation process that will enable you to write your TS without having to think about the explicit build step.

## Publishing packages

To publish packages, we use [changesets](https://github.com/changesets/changesets). The publishing workflow is:

1. Run `npx changeset` to create a new changeset. This will prompt you to select the packages that have changed, and will create a new changeset file in the `.changeset` directory.

2. Run `npx changeset version` to bump the version numbers of the packages that have changed. This will update the `package.json` files of the packages that have changed, and will create a new commit with the changes.

3. Run `turbo build` to build the packages that have changed and make sure that the latest output is published.

4. Run `npx changeset publish` to publish the packages that have changed. This will create a new tag for the new version, and will publish the packages to the npm registry.

5. Run `git push --follow-tags` to push the tags created by the steps above to the main repo.

## Filing bugs

When creating a Github issue:

- apply the relevant label (bug, feature, etc.)
- apply scope label, if the bug is scoped to a particular package. The format of the label is `scope:${package}`, where `${package}` is the name of the package directory in the repo. For example, `scope:cli` or `scope:client`. If the label doesn't exist, create it using the convention above.
