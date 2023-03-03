import { Polymath } from "@polymath-ai/client";
import { Action } from "../action.js";
import chalk from "chalk"; // get this into base

export class Complete extends Action {
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

      debug("completing...");
      // completion
      let completionOptions = this.completionOptions(options);

      let results = await client.completion(
        question,
        null, // we don't have existing polymath results
        null, // we don't need no ask Options
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
      log("The Polymath answered with:\n\n", output);
    } catch (e) {
      error("Failed to Ask Polymath", e);
    }
  }
}
