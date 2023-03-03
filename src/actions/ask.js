import { Polymath } from "@polymath-ai/client";

import { Action } from "../action.js";
import chalk from "chalk";

export class Ask extends Action {
  opts;

  constructor(options) {
    super(options);
  }

  async run({ args, options, command }) {
    const question = args[0];
    const { debug, error, log } = this.say;
    const clientOptions = this.options();

    if (!question) {
      question = await this.promptForQuestion();
    }

    log("You asked: ", question);

    try {
      let client = new Polymath(clientOptions);

      let output;

      debug("asking...");
      let results = await client.ask(question);
      output = results.context();

      log("The Polymath answered with:\n\n", output);
    } catch (e) {
      error("Failed to Ask Polymath", e);
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
