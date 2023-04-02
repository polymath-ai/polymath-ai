import { join } from "path";
import { createHash } from "crypto";

import { Polymath } from "@polymath-ai/client";
import chalk from "chalk";
import { Ingester } from "./ingester.js";
import { PackedBit } from "@polymath-ai/types";
import { encodeEmbedding } from "./utils.js";
import { PolymathOptions } from "@polymath-ai/types";

const error = (...args: unknown[]) =>
  console.error(chalk.red("ERROR:", ...args));
const log = (msg: string, ...args: unknown[]) =>
  console.log(chalk.green(`\n${msg}`), chalk.bold(...args));

const generateId = (input: string): string =>
  createHash("md5").update(input).digest("hex");

export type IngestOptions = {
  destination?: string;
} & PolymathOptions;

export type IngestArguments = {
  importer: string;
  source: string;
  options?: IngestOptions;
};

// The importer is an API that can be used by any tool (e.g, the CLI.)
export class Ingest {
  async *run(args: IngestArguments): AsyncGenerator<PackedBit> {
    const importerArg = args.importer;
    const source = args.source;

    const debug = args.options?.debug;
    const apiKey = args.options?.apiKey;

    let loadedImporter: Ingester;

    if (apiKey == null) {
      error("Please provide an OpenAI API key");
      throw new Error("Please provide an OpenAI API key");
    }

    if (!importerArg) {
      error("Please configure an importer");
      throw new Error("Please configure an importer");
    }

    if (!importerArg.startsWith("../") && !importerArg.startsWith("./")) {
      log(`Loading built-in importer: ${importerArg}`);
      loadedImporter = await Ingester.load(
        join("builtin-importers", `${importerArg}.js`)
      );
    } else {
      log(`Loading external importer: ${importerArg}`);
      // We should probably do some validations.
      loadedImporter = await Ingester.load(importerArg);
    }

    if (!loadedImporter) {
      error(`Importer ${importerArg} not found`);
      throw new Error(`Importer ${importerArg} not found`);
    }

    // <any> is needed here because the typescript compiler doesn't like it when we use the `new` keyword on a dynamic import.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const importer: Ingester = new (loadedImporter as any)(
      args.options
    ) as Ingester;

    const polymath = new Polymath({ apiKey, debug });

    for await (const chunk of importer.generateChunks(source)) {
      log(`Importing chunk ${chunk.info?.url}`);
      if (chunk.text == null) {
        continue;
      }

      const id = generateId(source.trim() + "\n" + chunk.text.trim());
      log(`Id: ${id}`);
      const tokenCount = polymath.getPromptTokenCount(chunk.text);
      chunk.id = id;
      chunk.token_count = tokenCount;
      chunk.embedding = encodeEmbedding(
        await polymath.generateEmbedding(chunk.text)
      );

      log(`Token count: ${tokenCount}`);

      yield chunk;
    }

    log("\nDone importing\n\n");
  }
}
