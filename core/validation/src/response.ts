import { PackedLibraryData, schemas } from "@polymath-ai/types";
import { ZodError } from "zod";

export type ResponseValidationResult =
  | { success: true; data: PackedLibraryData }
  | { success: false; error: ZodError };

export const validateResponse = (result: unknown): ResponseValidationResult => {
  return schemas.packedLibraryData.safeParse(result);
};
