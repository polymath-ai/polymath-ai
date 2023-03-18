import { Polymath } from "@polymath-ai/client";
import { Action, ActionArgs, RunArguments } from "../action.js";

export class Complete extends Action {
  opts: any;

  constructor(options: ActionArgs) {
    super(options);
  }

  sources(infos: any) {
    const { chalk } = this.say;
    return infos
      ?.map((info: any) => {
        return chalk.dim(
          "Source: " + (info.title || info.description) + "\n" + info.url
        );
      })
      .join("\n\n");
  }

  override async run({ args, options, command }: RunArguments) {
    let question: any = args[0];
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
      let completionOptions = this.completionOptions(options);

      if (completionOptions.stream) {
        // async mode baybee
        let streamProcessor = {
          processDelta: (delta: string | Uint8Array) => {
            if (delta) process.stdout.write(delta);
          },
          processResults: (finalResults: { infos: any }) => {
            process.stdout.write(
              "\n\n" + this.sources(finalResults.infos) + "\n"
            );
          },
        };

        log("The Polymath is answering with...\n");

        client.completion(
          question,
          null, // we don't have existing polymath results
          null, // we don't need no ask Options
          completionOptions,
          streamProcessor
        );
      } else {
        // TODO: Match `results` to the type returned by `client.completion`
        // Currently, I am using `any` to avoid a type error.
        let results: any = await client.completion(
          question,
          null, // we don't have existing polymath results
          null, // we don't need no ask Options
          completionOptions,
          null // don't have the stream processsor
        );

        let output = results.completion + "\n\n" + this.sources(results.infos);
        log("The Polymath answered with:\n\n", output);
      }
    } catch (e) {
      error("Failed to Ask Polymath", e);
    }
  }
}
