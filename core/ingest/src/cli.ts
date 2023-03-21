import fs from "fs";

import { Command, Option } from "commander";

import { Import } from "./main.js";
import { Bit, Library } from "./types.js";
import { cleanFilePath } from "./utils.js";

class CLI {
  private program;

  constructor() {
    this.program = new Command();
  }

  loadVersionInfo() {
    // Get the description and version from our own package.json
    return JSON.parse(fs.readFileSync("./package.json", "utf8"));
  }

  run() {
    const program = this.program;

    const { version, description } = this.loadVersionInfo();

    program.name("polymath-ingest").description(description).version(version);

    program.option("-d, --debug", "output extra debugging");
    program.addOption(
      new Option("--openai-api-key <key>", "OpenAI API key").env(
        "OPENAI_API_KEY"
      )
    );

    program
      .argument("[question]", "Which ingester should the Polymath use?")
      .argument("[source]", "What source should be ingested?")
      .action(async (...args: string[]) => {
        const importer = new Import();
        const [options, command] = args.slice(-2);
        args = args.slice(0, -2);

        const importerArg = args[0];
        const source = args[1];


        const library: Library = {
          version: 1,
          embedding_model: "openai.com:text-embedding-ada-002",
          bits: []
        };

        for await (const bit of importer.run({ args, options, command })) {
          library.bits.push(bit);
        }

        fs.writeFileSync(`${cleanFilePath(importerArg)}-${cleanFilePath(source)}.json`, JSON.stringify(library));

      });

    program.parse();
  }
}

export { CLI };