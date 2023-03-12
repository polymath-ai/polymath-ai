import { PolymathEndpoint } from "@polymath-ai/client";
import { Action } from "../action.js";

export class Validate extends Action {
  constructor(options: any) {
    super(options);
  }

  async run({ args, options, command }: any) {
    const { debug, error, log } = this.say;
    const clientOptions: any = this.clientOptions();
    const servers = clientOptions?.servers;
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
      result.log.forEach((item: any) => debug(`- ${item.message}`));
    }
    log("\nDone validating servers\n\n");
  }
}
