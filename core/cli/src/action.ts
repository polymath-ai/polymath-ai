import { Base } from "./base.js";
import { Config } from "./config.js";
import { Options } from "./options.js";
import inquirer from "inquirer";

export class Action extends Base {
  #options;

  constructor(options: any) {
    super(options);
    this.#options = options;
  }

  // TODO: get this into complete
  completionOptions(subcommandOptions: any) {
    const opts = new Options(this.#options);
    const configOption = this.#options.config;
    const config = new Config(this.#options).load(configOption);
    return opts.normalizeCompletionOptions(subcommandOptions, config);
  }

  clientOptions() {
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
  async promptForQuestion() {
    let question = await inquirer.prompt({
      type: "input",
      name: "result",
      message: "What is your question?",
    });
    return question.result;
  }
}

export const actor = (cls: any, program: any) => {
  return (...args: any) => {
    const [options, command] = args.slice(-2);
    args = args.slice(0, -2);
    const ask = new cls(program.opts());
    ask.run({ args, options, command });
  };
};
