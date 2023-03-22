import { Polymath } from "@polymath-ai/client";
import { Action } from "../action.js";

export class Ask extends Action {
  override async run(question: string): Promise<void> {
    const { debug, error, log } = this.say;
    const clientOptions = this.clientOptions();

    if (!question) {
      question = await this.promptForQuestion();
    }

    log("You asked: ", question);

    try {
      const client = new Polymath(clientOptions);

      debug("asking...");
      const results = await client.ask(question);
      const output = results.context();

      log("The Polymath answered with:\n\n", output);
    } catch (e) {
      error("Failed to Ask Polymath", e);
    }
  }
}
