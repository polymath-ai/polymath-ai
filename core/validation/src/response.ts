import { PackedLibraryData, schemas } from "@polymath-ai/types";

export const validateResponse = (result: unknown): PackedLibraryData => {
  const validationResult = schemas.packedLibraryData.safeParse(result);
  if (validationResult.success) return validationResult.data;
  throw validationResult.error;
};
