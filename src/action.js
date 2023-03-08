import { Base } from "./base.js";
import { Config } from "./config.js";
import { Options } from "./options.js";

export class Action extends Base {
  #options;

  constructor(options) {
    super(options);
    this.#options = options;
  }

  // TODO: get this into complete
  completionOptions(subcommandOptions) {
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

export const actor = (cls, program) => {
  return (...args) => {
    const [options, command] = args.slice(-2);
    args = args.slice(0, -2);
    const ask = new cls(program.opts());
    ask.run({ args, options, command });
  };
};
