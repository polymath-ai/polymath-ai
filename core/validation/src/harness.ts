import { AskOptions, PackedLibraryData } from "@polymath-ai/types";
import { z } from "zod";
import { bitInfoSchema } from "@polymath-ai/types";

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

  validateResponse(response: unknown): PackedLibraryData {
    const bitSchema = z.object({
      id: z.optional(z.string()),
      text: z.optional(z.string()),
      token_count: z.optional(z.number()),
      embedding: z.optional(z.array(z.number())),
      info: z.optional(bitInfoSchema),
      similarity: z.optional(z.number()),
      access_tag: z.optional(z.string()),
    });

    const packedLibraryDataSchema = z.object({
      version: z.number(),
      embedding_model: z.string(),
      omit: z.optional(z.string()),
      count_type: z.optional(z.string()),
      sort: z.optional(z.string()),
      bits: z.array(bitSchema),
    });

    packedLibraryDataSchema.parse(response);
    return response as PackedLibraryData;
  }

  async validate(args: AskOptions, ...checks: ValidationCheck[]) {
    let response: PackedLibraryData;
    try {
      response = this.validateResponse(await this.endpoint(args));
    } catch (e) {
      this.log.exception(e as Error);
      return;
    }
    try {
      checks.forEach((check) => check.run(this.log, { response, args }));
    } catch (e) {
      this.log.exception(e as Error);
    }
  }
}

export const check = (description: string, checker: Checker) => {
  return new ValidationCheck(description, checker);
};
