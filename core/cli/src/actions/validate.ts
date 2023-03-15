import { PolymathEndpoint } from "@polymath-ai/client";
import { Action, ClientOptions, RunArguments } from "../action.js";

export class Validate extends Action {
  constructor(options: any) {
    super(options);
  }

  override async run({ args, options, command }: RunArguments): Promise<void> {
    const { debug, error, log } = this.say;
    const clientOptions: ClientOptions = this.clientOptions();
    const servers: string[] = clientOptions?.servers;
    if (!servers) {
      error("No servers defined in config file");
      return;
    }
    for (const server of servers) {
      log(`Validating server ${server}...`);
      const endpoint = new PolymathEndpoint(server);
      const result = await endpoint.validate();
      if (result.valid) {
        log(`Server ${server} is valid`);
      } else {
        error(`Server ${server} is invalid`);
      }

      if (!this.isDebug) continue;

      debug("Validation details:");
      result.details.forEach((item: any) => {
        debug(`- ${item.description}`);
        if (item.exception) {
          const exception = item.exception;
          error(exception.stack);
        }
      });
    }
    log("\nDone validating servers\n\n");
  }
}
