type RequestMaker = (args: any) => Promise<any>;

export class Validator {
  makeRequest: RequestMaker;

  constructor(makeRequest: RequestMaker) {
    this.makeRequest = makeRequest;
  }

  async run() {
    const countTokens = (bits: any) =>
      bits.reduce((acc: any, bit: any) => acc + bit.token_count, 0);

    // This will be the validation log.
    const log = [];

    let valid = false;
    let response = null;

    // See if it even responds.
    let requestedTokenCount = 1500;
    try {
      response = await this.makeRequest({
        count: requestedTokenCount,
        count_type: "token",
      });
      log.push({
        message: "Server responded to request",
      });
    } catch (error: any) {
      console.error("Server did not respond to request", error);
      log.push({ message: "Server did not respond to request", error });
      return { valid, log };
    }

    // See if we received bits.
    if (!response.bits) {
      log.push({ message: "Server did not return any bits" });
      return { valid, log };
    }
    log.push({
      message: `Server returned ${response.bits.length} bits`,
    });

    // See if it counted tokens correctly.
    if (countTokens(response.bits) > requestedTokenCount) {
      log.push({ message: "Does not seem to respond to 'token' parameter." });
      return { valid, log };
    }
    log.push({
      message: "Server correctly accounted for the 'token' parameter",
    });

    // Try again with a different token count.
    requestedTokenCount = 1000;
    try {
      response = await this.makeRequest({
        count: requestedTokenCount,
        count_type: "token",
      });
      log.push({ message: "Server responded to request" });
    } catch (error) {
      log.push({ message: "Server did not respond to request", error });
      return { valid, log };
    }

    // See if it counted tokens correctly again.
    if (countTokens(response.bits) > requestedTokenCount) {
      log.push({ message: "Does not seem to respond to 'token' parameter." });
      return { valid, log };
    }
    log.push({
      message: "Server correctly accounted for the 'token' parameter",
    });

    valid = true;
    return { valid, log };
  }
}
