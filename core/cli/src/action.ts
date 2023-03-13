import { Base } from "./base.js";
import { Config } from "./config.js";
import { Options } from "./options.js";
import inquirer from "inquirer";
import { Command } from "commander";

export interface RunArguments {
  args: string[];
  options: any;
  command: string;
}

export type ActionArgs = { [arg: string]: any };
export type ClientOptions = { [key: string]: any };

export abstract class Action extends Base {
  #options: ActionArgs;

  constructor(options: ActionArgs) {
    super(options);
    this.#options = options;
  }

  abstract run({ args, options, command }: RunArguments): Promise<void>;

  // TODO: get this into complete
  completionOptions(subcommandOptions: any) {
    const opts = new Options(this.#options);
    const configOption = this.#options.config;
    const config = new Config(this.#options).load(configOption);
    return opts.normalizeCompletionOptions(subcommandOptions, config);
  }

  clientOptions(): ClientOptions {
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

type ActionConstructor = new (options: ActionArgs) => Action;

export const actor = (cls: ActionConstructor, program: Command) => {
  return (...args: string[]) => {
    const [options, command] = args.slice(-2);
    args = args.slice(0, -2);
    const action: Action = new cls(program.opts());
    action.run({ args, options, command });
  };
};
