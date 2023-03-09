import { PolymathEndpoint } from "@polymath-ai/client";
import { Action } from "../action.js";

export class Validate extends Action {
  constructor(options) {
    super(options);
  }

  async run({ args, options, command }) {
    const { debug, error, log } = this.say;
    const clientOptions = this.clientOptions();
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
    }
    log("\nDone validating servers\n\n");
  }
}
