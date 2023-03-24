// TODO: don't just return some JSON, but have a wrapper using the JSON store that returns DEFAULTS etc

import polymathHostConfigJson from "~/config/host.SECRET.json";

import type { HostConfig } from "@polymath-ai/types";

const polymathHostConfig: HostConfig = polymathHostConfigJson as unknown as HostConfig;

export { polymathHostConfig };