import type { HostConfig } from "@polymath-ai/types";
import { validateHostConfig } from "@polymath-ai/validation";
import fs from "fs";
import os from "os";
import path from "path";

import { Base } from "./base.js";

const loadJSON = (path: string): HostConfig => {
  const json = fs.readFileSync(path, "utf8");
  return validateHostConfig(JSON.parse(json));
};

export class Config extends Base {
  static homeDirPath(name: string): string {
    return path.join(os.homedir(), ".polymath", "config", `${name}.json`);
  }

  // Hunt around the filesystem for a config file
  load(configFile?: string | null): HostConfig {
    const { debug } = this.say;

    // if there is a configOption:
    if (configFile) {
      // try to load it as a filename
      const filename = path.resolve(configFile);
      debug(`Looking for config at: ${filename}`);

      if (fs.existsSync(filename)) return loadJSON(filename);

      // try to load ~/.polymath/config/<configOption>.json
      const configPath = Config.homeDirPath(configFile);
      debug(`Now, looking for config at: ${configPath}`);

      if (fs.existsSync(configPath)) return loadJSON(configPath);

      throw new Error(`No config file at "${filename}" or "${configPath}"`);
    }

    // try to load ~/.polymath/config/default.json
    const configPath = Config.homeDirPath("default");

    debug(`Now, looking for a default config at ${configPath}`);

    if (fs.existsSync(configPath)) return loadJSON(configPath);

    debug("No default config found.");
    return {};
  }
}
