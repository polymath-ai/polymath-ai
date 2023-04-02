import fs from "fs";
import { URL } from "node:url";

import { Command, Option } from "commander";

import { Ask } from "./actions/ask.js";
import { Complete, CompletionArgs } from "./actions/complete.js";
import { Validate } from "./actions/validate.js";
import { IngestAction } from "./actions/ingest.js";
import { IngestOptions, PolymathHostType } from "@polymath-ai/types";
import { CLIBaseOptions } from "./action.js";
import { Serve } from "./actions/serve.js";

type NPMPackageConfig = {
  version: string;
};

// TODO: Implement a nice API for this.
class CLI {
  program: Command;

  constructor() {
    this.program = new Command();
  }

  loadVersionInfo(): NPMPackageConfig {
    // Get the description and version from our own package.json
    return JSON.parse(
      fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8")
    );
  }

  run(): void {
    const program = this.program;
    const { version } = this.loadVersionInfo();

    program.version(version);

    program.option("-d, --debug", "output extra debugging");
    program.option("-c, --config <path>", "config file");
    program.addOption(
      new Option("--openai-api-key <key>", "OpenAI API key").env(
        "OPENAI_API_KEY"
      )
    );
    program.option("-s, --servers <endpoints...>", "Polymath server endpoints");
    program.option(
      "-l, --libraries <libOrDirectory...>",
      "Library files or directory"
    );

    program.option("-p, --pinecone", "Use pinecone");
    program.addOption(
      new Option("--pinecone-api-key <key>", "pinecone api key").env(
        "PINECONE_API_KEY"
      )
    );
    program.addOption(
      new Option("--pinecone-base-url <url>", "pinecone base url").env(
        "PINECONE_BASE_URL"
      )
    );
    program.addOption(
      new Option("--pinecone-namespace <namespace>", "pinecone namespace").env(
        "PINECONE_NAMESPACE"
      )
    );

    //
    // SUB COMMANDS
    //

    program
      .command("ask")
      .description("Ask a question to a Polymath")
      .argument("[question]", "The question to ask")
      .action((question: string) => {
        const action = new Ask(program.opts());
        action.run(question);
      });

    program
      .command("complete")
      .description("Ask a Polymath for a completion")
      .argument("[question]", "Ask a Polymath for a completion")
      .option("-m, --completion-model <model>", "the completion model to use")
      .option(
        "--completion-system <system-message>",
        "add a system prompt for the chat message completion"
      )
      .option(
        "--completion-temperature <temp>",
        "the completion temperature (0-2)"
      )
      .option(
        "--completion-max-tokens <max-tokens>",
        "the max tokens for completion"
      )
      .option("--completion-top-p <top-p>", "the top_p for completion")
      .option("--completion-n <n>", "the n for completion")
      .option(
        "--completion-stream <stream>",
        "Turn on streaming with true for completion"
      )
      .option("--completion-stop <stop>", "Set a stop term for completion")
      .option(
        "--completion-prompt-template <prompt>",
        "a prompt template to rewrite"
      )
      .alias("completion")
      .action((question: string, opts: CompletionArgs) => {
        const action = new Complete(program.opts());
        action.run(question, opts);
      });

    program
      .command("validate")
      .description("Validate a Polymath endpoint")
      .action(() => {
        const action = new Validate(program.opts());
        action.run();
      });

    program
      .command("ingest")
      .description("Ingest a source into a Polymath")
      .argument("[ingestor]", "Which ingester should the Polymath use?")
      .argument("[source...]", "What source should be ingested?")
      .option(
        "-o, --destination <destination>",
        "The directory where the output should be written."
      )
      .action(
        (
          ingestLibrary: string,
          sources: string[],
          options: IngestOptions & CLIBaseOptions
        ) => {
          for (const source of sources) {
            const allOptions = { ...options, ...program.opts() };
            const action = new IngestAction(allOptions);
            action.run({ importer: ingestLibrary, source });
          }
        }
      );

    program
      .command("serve")
      .description("Serve a Polymath library")
      .argument(
        "[type]",
        'The type of library to serve. Can be either "pinecone" or "file" (default).',
        "file"
      )
      .action((type: PolymathHostType) => {
        const action = new Serve(program.opts());
        action.run({ type });
      });
    program.parse();
  }
}

export { CLI };
