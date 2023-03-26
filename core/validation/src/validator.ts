import { PackedBit } from "@polymath-ai/types";
import { Harness, check, Endpoint, ValidationResult } from "./harness.js";

// TODO: Deduplicate this constant.
const EMBEDDING_VECTOR_LENGTH = 1536;

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
    const countTokens = (bits: PackedBit[]) =>
      bits.reduce((acc, bit: PackedBit) => acc + (bit.token_count || 0), 0);

    const harness = new Harness(this.endpoint);
    const count_type = "token";

    // prepare a random embedding to send to the server
    const query_embedding = new Array(EMBEDDING_VECTOR_LENGTH)
      .fill(0)
      .map(() => Math.random());

    await harness.validate(
      { query_embedding, count: 1500, count_type },
      check("Result contains bits", (c) => !!c.response.bits),
      check(
        "Endpoint accurately responds to `token` parameter",
        (c) => countTokens(c.response.bits) < (c.args.count || 0)
      )
    );

    await harness.validate(
      { query_embedding, count: 1000, count_type },
      check(
        "Endpoint accurately responds to a different `token` parameter",
        (c) => countTokens(c.response.bits) < (c.args.count || 0)
      )
    );

    const details = harness.log.results;
    const valid = details.every((entry) => entry.success);
    return { valid, details };
  }
}
