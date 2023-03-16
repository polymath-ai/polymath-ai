export type PolymathResponse = any;
export type PolymathArgs = any;
export type RequestMaker = (args: PolymathArgs) => Promise<PolymathResponse>;
export type Checker = (c: ValidationContext) => boolean;

export interface ValidationResult {
  description: string;
  success: boolean;
  exception?: Error;
}

class ValidationLogger {
  results: ValidationResult[] = [];

  exception(exception: Error) {
    const success = false;
    const description = exception.message;
    this.results.push({ description, success, exception });
  }

  log(success: boolean, description: string) {
    this.results.push({ description, success });
  }
}

interface ValidationContext {
  args: PolymathArgs;
  response: PolymathResponse;
}

class ValidationCheck {
  description: string;
  handler: Checker;

  constructor(description: string, handler: Checker) {
    this.description = description;
    this.handler = handler;
  }

  run(log: ValidationLogger, c: ValidationContext) {
    log.log(this.handler(c), this.description);
  }
}

// A simple test-like validation harness.
export class Harness {
  makeRequest: RequestMaker;
  log: ValidationLogger = new ValidationLogger();

  constructor(makeRequest: RequestMaker) {
    this.makeRequest = makeRequest;
  }

  async validate(args: PolymathArgs, ...checks: ValidationCheck[]) {
    // TODO: Validate args.
    let response: PolymathResponse = null;
    try {
      response = await this.makeRequest(args);
    } catch (e: any) {
      this.log.exception(e);
      return;
    }
    try {
      checks.forEach((check) => check.run(this.log, { response, args }));
    } catch (e: any) {
      this.log.exception(e);
    }
  }
}

export const check = (description: string, checker: Checker) => {
  return new ValidationCheck(description, checker);
};
