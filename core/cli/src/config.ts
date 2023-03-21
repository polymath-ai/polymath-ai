import fs from "fs";
import os from "os";
import path from "path";

import { Base } from "./base.js";

export class Config extends Base {
  static homeDirPath(name: string): string {
    return path.join(os.homedir(), ".polymath", "config", `${name}.json`);
  }

  // Hunt around the filesystem for a config file
  load(configOption: any) {
    let rawConfig;
    const { debug, error } = this.say;

    // if there is a configOption:
    if (configOption) {
      // try to load it as a filename
      try {
        const filename = path.resolve(configOption);
        debug(`Looking for config at: ${filename}`);

        const config = fs.readFileSync(filename, "utf8");
        rawConfig = JSON.parse(config);
      } catch (e) {
        // if that fails, try to load ~/.polymath/config/<configOption>.json
        try {
          const configPath = Config.homeDirPath(configOption);
          debug(`Now, looking for config at: ${configPath}`);

          const config = fs.readFileSync(configPath, "utf8");
          rawConfig = JSON.parse(config);
        } catch (e) {
          error("No config file at that location.", e);
          process.exit(1);
        }
      }
    } else {
      // if that fails, try to load ~/.polymath/config/default.json
      const configPath = Config.homeDirPath("default");

      debug(`Now, looking for a default config at ${configPath}`);

      const config = fs.readFileSync(configPath, "utf8");
      rawConfig = JSON.parse(config);
    }

    return rawConfig;
  }
}
