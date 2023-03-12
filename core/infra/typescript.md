# Our Typescript Setup

We use TypeScript in this project. Here's how it is configured.

## As close to the metal as possible

We try to make sure that the TypeScript mostly removes type annotations. This is why we use the following settings in `tsconfig.json`:

```json
{
  "lib": ["ES2022"],
  "module": "NodeNext",
  "target": "ES2022"
}
```

This may change as we start worrying about compatibility with older versions of Node.js.

## Centralized configuration

We use a centralized configuration setup. The `core/infra/tsconfig` directory contains all the configuration files for the TypeScript compiler. They are intended to be used by all packages in the monorepo.

To use the configuration, add the following to the `tsconfig.json` in your package:

```json
{
  "extends": "@polymath-ai/infra/tsconfig/base.json"
}
```

Because the TypeScript compiler resolves paths relative to the location of the `tsconfig.json` file, a typical `tsconfig.json` file should mostly contain path-y stuff and look something like this:

```json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*", "tests/**/*"],
  "extends": "@polymath-ai/infra/tsconfig/base.json"
}
```

The `composite` option is what makes next part of the setup possible.

## TypeScript is optional per package

A package may choose to use JS or TS. To enable picking and choosing which packages get to use TypeScipt, we use [references](https://www.typescriptlang.org/docs/handbook/project-references.html). To make your package use TypeScript, add it as a reference to `tsconfig.json` in the root of the monorepo:

```json
{
  "references": [{ "path": "${place}/${package}" }]
}
```

where `${place}` is the directory where the package is located, and `${package}` is the name of the package.

Without this reference, the package will be presumed to use JS.

## Explicit build step

We've chosen to use an "explicit build, locally built" configuration. In this configuration, TypeScript is generated into a `dist` directory of each package that uses TypeScript. This output is then used to run and publish the package.

Each package needs to configure a build step:

```json
{
  "scripts": {
    "build": "tsc -b"
  }
}
```

## JS-to-TS bridge for CLI

This works mostly fine, but there are some caveats. For example, when building a CLI tool, you need to make a JS-to-TS bridge file: a smallest-possible `index.js` file that sits at the root of your package, like this:

```js
#!/usr/bin/env node

import { CLI } from "./dist/src/cli.js";

new CLI().run();
```

You will need this because the `dist` directory may be blown away and recreated at any time, and invalidate the symlink in `node_modules/.bin` that makes the CLI tool work with `npx`.

## Integration with `ava`

To make our testing framework `ava` work with TypeScript, do the following. First, install `@ava/typescript` in your package:

```bash
npm i @ava/typescript -w ${place}/${package} --save-dev
```

Then, add the following to the `package.json` of your package:

```json
  "ava": {
    "files": [
      "tests/**/*.ts"
    ],
    "typescript": {
      "rewritePaths": {
        "./": "dist/"
      },
      "compile": false
    }
  }
```

Currently, `ava` [does not](https://github.com/avajs/typescript/issues/33) support watch mode for pre-compiled TypeScript. Once that's fixed, we'll incorporate it into the configuration.

## Turbo

To make building the project easier, we use [Turborepo](https://turbo.build/repo/docs). Turborepo is fairly opinionless a build tool designed to work well with monorepos.

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
