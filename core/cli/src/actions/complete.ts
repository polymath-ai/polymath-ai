import { Polymath } from "@polymath-ai/client";
import { BitInfo, CompletionResult, StreamProcessor } from "@polymath-ai/types";
import { Action } from "../action.js";

//TODO: rationalize with other existing types
export type CompletionArgs = {
  completionModel?: string;
  completionSystem?: string;
  completionMaxTokens?: string;
  completionTopP?: number;
  completionN?: number;
  completionStream?: boolean;
  completionStop?: string;
};

export class Complete extends Action {
  sources(infos: BitInfo[]): string {
    const { chalk } = this.say;
    return infos
      ?.map((info: BitInfo) => {
        return chalk.dim(
          "Source: " + (info.title || info.description) + "\n" + info.url
        );
      })
      .join("\n\n");
  }

  override async run(question: string, opts: CompletionArgs): Promise<void> {
    const { debug, error, log } = this.say;
    const clientOptions = this.clientOptions();

    if (!question) {
      question = await this.promptForQuestion();
    }

    log("You asked: ", question);

    try {
      let client = new Polymath(clientOptions);

      debug("completing...");
      // completion
      let completionOptions = this.completionOptions(opts);

      if (completionOptions.stream) {
        // async mode baybee
        let streamProcessor: StreamProcessor = {
          processDelta: (delta: string | Uint8Array) => {
            if (delta) process.stdout.write(delta);
          },
          processResults: (finalResults: CompletionResult) => {
            process.stdout.write(
              "\n\n" + this.sources(finalResults.infos) + "\n"
            );
          },
        };

        log("The Polymath is answering with...\n");

        client.completion(
          question,
          undefined, // we don't have existing polymath results
          undefined, // we don't need no ask Options
          completionOptions,
          streamProcessor
        );
      } else {
        // TODO: Match `results` to the type returned by `client.completion`
        // Currently, I am using `any` to avoid a type error.
        let results: CompletionResult = await client.completion(
          question,
          undefined, // we don't have existing polymath results
          undefined, // we don't need no ask Options
          completionOptions,
          undefined // don't have the stream processsor
        );

        let output = results.completion + "\n\n" + this.sources(results.infos);
        log("The Polymath answered with:\n\n", output);
      }
    } catch (e) {
      error("Failed to Ask Polymath", e);
    }
  }
}
