import { join } from 'path';

import { Polymath } from "@polymath-ai/client";
import chalk from "chalk";
import { Ingester } from "./ingester.js";
import { Bit } from './types.js';
import { encodeEmbedding } from './utils.js';
import { PolymathOptions } from '@polymath-ai/types';

const error = (...args: any[]) => console.error(chalk.red("ERROR:", ...args));
const log = (msg: string, ...args: any[]) =>
  console.log(chalk.green(`\n${msg}`), chalk.bold(...args));
const debug = (...args: any[]) => console.log(chalk.blue("DEBUG:", ...args));

export type IngestOptions = {
  destination?: string;
} & PolymathOptions;

export type IngestArguments = {
  importer: string;
  source: string;
  options?: IngestOptions;
}

// The importer is an API that can be used by any tool (e.g, the CLI.)
export class Ingest {
  async *run(args: IngestArguments): AsyncGenerator<Bit> {
    const importerArg = args.importer;
    const source = args.source;

    const debug = args.options?.debug;
    const apiKey = args.options?.apiKey;
    
    let loadedImporter: Ingester;
  
    console.log(args)

    if (apiKey == null) {
      error("Please provide an OpenAI API key");
      throw new Error("Please provide an OpenAI API key");
    }

    if (!importerArg) {
      error("Please configure an importer");
      throw new Error("Please configure an importer");
    }

    if (!importerArg.startsWith('../') && !importerArg.startsWith('./')) {
      log(`Loading built-in importer: ${importerArg}`);
      loadedImporter = await Ingester.load(join('builtin-importers', `${importerArg}.js`));
    }
    else {
      log(`Loading external importer: ${importerArg}`);
      // We should probably do some validations.
      loadedImporter = await Ingester.load(importerArg);
    }

    if (!loadedImporter) {
      error(`Importer ${importerArg} not found`);
      throw new Error(`Importer ${importerArg} not found`);
    }

    // <any> is needed here because the typescript compiler doesn't like it when we use the `new` keyword on a dynamic import.
    const importer: Ingester = new (loadedImporter as any)(args.options) as Ingester;

    const polymath = new Polymath({ apiKey, debug });

    for await (const chunk of importer.generateChunks(source)) {
      log(`Importing chunk ${chunk.info?.url} \`${chunk.text}\``);
      
      if (chunk.text == null) { 
        continue; 
      }
    
      chunk.embedding = encodeEmbedding(await polymath.generateEmbedding(chunk.text));
      yield chunk;
    }

    log("\nDone importing\n\n");
  }
}