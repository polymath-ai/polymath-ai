import { Polymath } from "@polymath-ai/client";

import { Action } from '../action.js';
import { Options } from "../options.js";
import chalk from "chalk";

export class Ask extends Action {
  opts

  constructor(options) {
    super(options);
    this.opts = options;
  }

  async run({ args, options, command }) {
    const question = args[0];
    const configOption = this.opts.config;

    const opts = new Options();

    const rawConfig = opts.loadRawConfig(configOption);
    let clientOptions = opts.normalizeClientOptions(
      this.opts,
      rawConfig
    );

    // console.log("CLIENT OPTIONS", clientOptions);

    if (!question) {
      question = await this.promptForQuestion();
    }

    console.log(chalk.green("\nYou asked: ") + chalk.bold(question));

    try {
      let client = new Polymath(clientOptions);

      let output;

      if (command == "ask") {
        this.debug('asking...');
        let results = await client.ask(question);
        output = results.context();
      } else {
        // completion
        this.debug('completing...');
        let completionOptions = opts.normalizeCompletionOptions(
          options,
          rawConfig
        );

        let results = await client.completion(
          question,
          null,
          null,
          completionOptions
        );

        let sources = results.infos
          ?.map((info) => {
            return chalk.dim(
              "Source: " + (info.title || info.description) + "\n" + info.url
            );
          })
          .join("\n\n");

        output = results.completion + "\n\n" + sources;
      }

      console.log(
        chalk.green("\nThe Polymath answered with:\n\n  ") + chalk.bold(output)
      );
    } catch (e) {
      console.error(`ERROR: ${e}`);
    }
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