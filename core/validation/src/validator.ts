import { Harness, check, Endpoint, ValidationResult } from "./harness.js";

export interface ValidatorResults {
  valid: boolean;
  details: ValidationResult[];
}

export class Validator {
  endpoint: Endpoint;

  constructor(endpoint: Endpoint) {
    this.endpoint = endpoint;
  }

  async run(): Promise<ValidatorResults> {
    const countTokens = (bits: any) =>
      bits.reduce((acc: any, bit: any) => acc + bit.token_count, 0);

    const harness = new Harness(this.endpoint);

    await harness.validate(
      { count: 1500, count_type: "token" },
      check("Result contains bits", (c) => !!c.response.bits),
      check(
        "Endpoint accurately responds to `token` parameter",
        (c) => countTokens(c.response.bits) < c.args.count
      )
    );

    await harness.validate(
      { count: 1000, count_type: "token" },
      check(
        "Endpoint accurately responds to a different `token` parameter",
        (c) => countTokens(c.response.bits) < c.args.count
      )
    );

    const details = harness.log.results;
    const valid = details.every((entry) => entry.success);
    return { valid, details };
  }
}
