import { Ingest, IngestArguments, IngestOptions } from "@polymath-ai/ingest";
import { Action, CLIBaseOptions } from "../action.js";
import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";
import { PackedLibraryData } from "@polymath-ai/types";

export function cleanFilePath(path: string): string {
  return path.replace(/[./:?]/g, "-");
}

export type { IngestArguments };

// Ask the dear listener for the ingestor as they didn't provide one to the CLI
async function promptForIngestionLibrary(): Promise<string> {
  const ingestor = await inquirer.prompt({
    type: "input",
    name: "result",
    message: "Which ingestion library do you want to use?",
  });
  return ingestor.result;
}

export class IngestAction extends Action {
  #options: IngestOptions & CLIBaseOptions;

  constructor(options: IngestOptions & CLIBaseOptions) {
    super(options);
    this.#options = options;
  }

  ingestClientOptions(): IngestOptions {
    // Ensure that we are taking the client options
    return { ...this.#options, ...this.clientOptions() } as IngestOptions;
  }

  override async run(args: IngestArguments): Promise<void> {
    const { source } = args;
    let { importer: ingestLibrary } = args;

    const { error, log } = this.say;
    const clientOptions = this.ingestClientOptions();
    const importer = new Ingest();

    if (!ingestLibrary) {
      ingestLibrary = await promptForIngestionLibrary();
    }

    log("You are using the ingest library: ", ingestLibrary);

    let { destination } = clientOptions;
    if (!destination) {
      destination = path.join(
        "./",
        `${cleanFilePath(ingestLibrary)}-${cleanFilePath(source)}.json`
      );
    } else {
      destination = path.join(
        destination,
        `${cleanFilePath(ingestLibrary)}-${cleanFilePath(source)}.json`
      );
    }

    try {
      const library: PackedLibraryData = {
        version: 1,
        embedding_model: "openai.com:text-embedding-ada-002",
        bits: [],
      };

      const importerArgs: IngestArguments = {
        importer: ingestLibrary,
        source,
        options: clientOptions,
      };

      for await (const bit of importer.run(importerArgs)) {
        library.bits.push(bit);
        // TODO, should we incrementally write the file?
      }

      await fs.writeFile(destination, JSON.stringify(library));
    } catch (exception) {
      error("Failed to Ingest", exception);
    }
  }
}
