import { Polymath } from "@polymath-ai/client";
import { Action } from "../action.js";

export class Ask extends Action {
  opts: any;

  constructor(options: any) {
    super(options);
  }

  async run({ args, options, command }: any) {
    const question = args[0];
    const { debug, error, log } = this.say;
    const clientOptions = this.clientOptions();

    // if (!question) {
    //   question = await this.promptForQuestion();
    // }

    log("You asked: ", question);

    try {
      let client = new Polymath(clientOptions);

      debug("asking...");
      let results = await client.ask(question);
      let output = results.context();

      log("The Polymath answered with:\n\n", output);
    } catch (e) {
      error("Failed to Ask Polymath", e);
    }
  }
}
