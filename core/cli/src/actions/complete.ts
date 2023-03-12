import { Polymath } from "@polymath-ai/client";
import { Action } from "../action.js";

export class Complete extends Action {
  opts: any;

  constructor(options: any) {
    super(options);
  }

  async run({ args, options, command }: any) {
    let question: any = args[0];
    const { debug, error, log, chalk } = this.say;
    const clientOptions = this.clientOptions();

    // if (!question) {
    //   question = await this.promptForQuestion();
    // }

    log("You asked: ", question);

    try {
      let client = new Polymath(clientOptions);

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
        ?.map((info: any) => {
          return chalk.dim(
            "Source: " + (info.title || info.description) + "\n" + info.url
          );
        })
        .join("\n\n");

      let output = results.completion + "\n\n" + sources;
      log("The Polymath answered with:\n\n", output);
    } catch (e) {
      error("Failed to Ask Polymath", e);
    }
  }
}
