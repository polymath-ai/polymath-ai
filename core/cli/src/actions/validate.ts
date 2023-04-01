import { PolymathEndpoint, DiscoveryError } from "@polymath-ai/client";
import { PolymathOptions } from "@polymath-ai/types";
import { ValidationResult } from "@polymath-ai/validation/dist/src/harness.js";
import { Action } from "../action.js";

export class Validate extends Action {
  override async run(): Promise<void> {
    const { error, log } = this.say;
    const clientOptions: PolymathOptions = this.clientOptions();
    const servers: string[] = clientOptions?.servers || [];
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

      log("Validation details:");
      result.details.forEach((item: ValidationResult, i) => {
        log(`${i + 1}) ${item.description}`);
        if (item.exception) {
          const exception = item.exception;
          if (exception instanceof DiscoveryError) {
            const discoveryError = exception as DiscoveryError;
            const data = discoveryError.data;
            if (data.status) {
              error(`Status: ${data.status} ${data.statusText}`);
            }
            error(data.text);
          } else {
            error(exception.stack);
          }
        }
      });
    }
    log("\nDone validating servers\n\n");
  }
}
