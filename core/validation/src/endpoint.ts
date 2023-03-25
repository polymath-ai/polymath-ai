import { PackedLibraryData, EndpointArgs, schemas } from "@polymath-ai/types";

export const validateResponse = (result: unknown): PackedLibraryData => {
  return schemas.packedLibraryData.parse(result);
};

export const validateEndpointArgs = (args: unknown): EndpointArgs => {
  return schemas.endpointArgs.parse(args);
};
