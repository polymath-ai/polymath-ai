import {
  AskOptions,
  PackedLibraryData,
} from "@polymath-ai/types";

export type Endpoint = (args: AskOptions) => Promise<PackedLibraryData>;
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
  args: AskOptions;
  response: PackedLibraryData;
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
  endpoint: Endpoint;
  log: ValidationLogger = new ValidationLogger();

  constructor(endpoint: Endpoint) {
    this.endpoint = endpoint;
  }

  async validate(args: AskOptions, ...checks: ValidationCheck[]) {
    let response: PackedLibraryData;
    try {
      response = await this.endpoint(args);
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
