import { Base, BaseArgs } from "./base.js";
import { Config } from "./config.js";
import { Options } from "./options.js";
import inquirer from "inquirer";
import { CompletionOptions, PolymathOptions } from "@polymath-ai/types";
import { CompletionArgs } from "./actions/complete.js";

export type ActionArgs = BaseArgs & {
  config?: string;
  [arg: string]: unknown;
};

//TODO: use the actual type from core/types
export type CLIBaseOptions = {
  debug?: boolean;
  config?: string;
  openaiApiKey?: string;
  servers?: string[];
  libraries?: string[];
  pinecone?: boolean;
  pineconeApiKey?: string;
  pineconeBaseUrl?: string;
  pineconeNamespace?: string;
};

export abstract class Action extends Base {
  #options: CLIBaseOptions;

  constructor(options: CLIBaseOptions) {
    super(options);
    this.#options = options;
  }

  abstract run(...arg: any[]): Promise<void>;

  // TODO: get this into complete
  completionOptions(subcommandOptions: CompletionArgs): CompletionOptions {
    const opts = new Options(this.#options);
    const configOption = this.#options.config;
    const config = new Config(this.#options).load(configOption);
    return opts.normalizeCompletionOptions(subcommandOptions, config);
  }

  clientOptions(): PolymathOptions {
    const opts = new Options(this.#options);
    const { debug } = this.say;

    const configOption = this.#options.config;
    const config = new Config(this.#options).load(configOption);
    const clientOptions = {
      ...opts.normalizeClientOptions(this.#options, config),
      debug: this.isDebug,
    };
    debug("Client options", JSON.stringify(clientOptions));
    return clientOptions;
  }

  // Ask the dear listener for a question as they didn't provide one to the CLI
  async promptForQuestion(): Promise<string> {
    let question = await inquirer.prompt({
      type: "input",
      name: "result",
      message: "What is your question?",
    });
    return question.result;
  }
}
