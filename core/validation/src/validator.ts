import { Harness, check, RequestMaker, ValidationResult } from "./harness.js";

export interface ValidatorResults {
  valid: boolean;
  details: ValidationResult[];
}

export class Validator {
  makeRequest: RequestMaker;

  constructor(makeRequest: RequestMaker) {
    this.makeRequest = makeRequest;
  }

  async run(): Promise<ValidatorResults> {
    const countTokens = (bits: any) =>
      bits.reduce((acc: any, bit: any) => acc + bit.token_count, 0);

    const harness = new Harness(this.makeRequest);

    await harness.validate(
      { count: 1500, count_type: "token" },
      check("Result contains bits", (c) => !!c.response.bits),
      check(
        "Server accurately responds to `token` parameter",
        (c) => countTokens(c.response.bits) < c.args.count
      )
    );

    await harness.validate(
      { count: 1000, count_type: "token" },
      check(
        "Server accurately responds to a different `token` parameter",
        (c) => countTokens(c.response.bits) < c.args.count
      )
    );

    const details = harness.log.results;
    const valid = details.every((entry) => entry.success);
    return { valid, details };
  }
}
