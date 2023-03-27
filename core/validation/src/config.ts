import { schemas, HostConfig } from "@polymath-ai/types";

export const validateHostConfig = (config: unknown): HostConfig => {
  return schemas.hostConfig.strict().parse(config);
};
