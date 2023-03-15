export type PolymathResponse = any;
export type PolymathArgs = any;
export type RequestMaker = (args: any) => Promise<PolymathResponse>;
export type Checker = (c: ValidationContext) => void;

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

  success(description: string) {
    const success = true;
    this.results.push({ description, success });
  }

  failure(description: string) {
    const success = false;
    this.results.push({ description, success });
  }
}

interface ValidationContext {
  response: PolymathResponse;
  args: PolymathArgs;
}

class ValidationCheck {
  description: string;
  handler: Checker;

  constructor(description: string, handler: Checker) {
    this.description = description;
    this.handler = handler;
  }

  run(c: ValidationContext) {
    this.handler(c);
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
      checks.forEach((check) => check.run({ response, args }));
    } catch (e: any) {
      this.log.exception(e);
    }
  }
}

export const check = (description: string, checker: Checker) => {
  return new ValidationCheck(description, checker);
};
