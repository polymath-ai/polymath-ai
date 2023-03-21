import { join } from 'path';

import { Polymath } from "@polymath-ai/client";
import chalk from "chalk";
import { Importer } from "./importer.js";
import { Bit, Options } from './types.js';
import { encodeEmbedding } from './utils.js';

const error = (...args: any[]) => console.error(chalk.red("ERROR:", ...args));
const log = (msg: string, ...args: any[]) =>
  console.log(chalk.green(`\n${msg}`), chalk.bold(...args));
const debug = (...args: any[]) => console.log(chalk.blue("DEBUG:", ...args));

interface RunArguments {
  args: string[];
  options: any;
  command: string;
}

// TODO: Might delete this.
function parseOptions(options: any): Options {
  return {
    outputFile: options.outputFile,
  };
}

// The importer is an API that can be used by any tool (e.g, the CLI.)
export class Import {
  async *run({ args, options, command }: RunArguments): AsyncGenerator<Bit> {
    const importerArg = args[0];
    const source = args[1];

    const { openaiApiKey, debug } = options;
    let loadedImporter: Importer;
    let parsedOptions: Options = parseOptions(options);

    if (openaiApiKey == null) {
      error("Please provide an OpenAI API key");
      throw new Error("Please provide an OpenAI API key");
    }

    if (args.length == 0) {
      error("Please configure an importer");
      throw new Error("Please configure an importer");
    }

    if (!importerArg.startsWith('../') && !importerArg.startsWith('./')) {
      log(`Loading built-in importer: ${importerArg}`);
      loadedImporter = await Importer.load(join('builtin-importers', `${importerArg}.js`));
    }
    else {
      log(`Loading external importer: ${importerArg}`);
      // We should probably do some validations.
      loadedImporter = await Importer.load(importerArg);
    }

    if (!loadedImporter) {
      error(`Importer ${importerArg} not found`);
      throw new Error(`Importer ${importerArg} not found`);
    }

    // <any> is needed here because the typescript compiler doesn't like it when we use the `new` keyword on a dynamic import.
    const importer: Importer = new (loadedImporter as any)(parsedOptions) as Importer;

    const polymath = new Polymath({ apiKey: openaiApiKey });

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