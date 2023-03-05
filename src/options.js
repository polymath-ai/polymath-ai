import fs from "fs";
import os from "os";
import path from "path";

import { Base } from "./base.js";

export class Options extends Base {
  constructor(isDebug) {
    super(isDebug);
  }

  // Hunt around the filesystem for a config file
  loadRawConfig(configOption) {
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
          const homeDir = os.homedir();
          const configPath = path.join(
            homeDir,
            ".polymath",
            "config",
            `${configOption}.json`
          );
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
      const homeDir = os.homedir();
      const configPath = path.join(
        homeDir,
        ".polymath",
        "config",
        "default.json"
      );

      debug(`Now, looking for a default config at ${configPath}`);

      const config = fs.readFileSync(configPath, "utf8");
      rawConfig = JSON.parse(config);
    }

    return rawConfig;
  }

  // Munge together a clientOptions object from the config file
  // and the command line.
  normalizeClientOptions(programOptions, rawConfig) {
    // convert a main host config into the bits needed for the Polymath
    let clientOptions = {};
    let clientConfig = rawConfig.client_options;

    const values = {
      apiKey: programOptions.openaiApiKey || rawConfig.default_api_key,
      servers: programOptions.servers || clientConfig?.servers,
      libraryFiles: programOptions.libraries || clientConfig?.libraryFiles,
      omit: clientConfig?.omit,
      debug: clientConfig?.debug,
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) clientOptions[key] = value;
    }

    if (programOptions.pinecone) {
      clientOptions.pinecone = {
        apiKey: programOptions.pineconeApiKey,
        baseUrl: programOptions.pineconeBaseUrl,
        namespace: programOptions.pineconeNamespace,
      };
    } else if (rawConfig.client_options?.pinecone) {
      clientOptions.pinecone = rawConfig.client_options.pinecone;
    }

    return clientOptions;
  }

  // Munge together a clientOptions object from the config file and the command line
  normalizeCompletionOptions(commandOptions, rawConfig) {
    // convert a main host config into the bits needed for the Polymath
    let completionOptions = {};

    completionOptions.model =
      commandOptions.completionModel || rawConfig.completions_options?.model;
    completionOptions.temperature =
      commandOptions.completionTemperature ||
      rawConfig.completions_options?.temperature;
    completionOptions.max_tokens =
      commandOptions.completionMaxTokens ||
      rawConfig.completions_options?.max_tokens;
    completionOptions.top_p =
      commandOptions.completionTopP || rawConfig.completions_options?.top_p;
    completionOptions.n = commandOptions.n || rawConfig.completions_options?.n;
    completionOptions.stream =
      commandOptions.completionStream || rawConfig.completions_options?.stream;

    if (
      commandOptions.completionSystem ||
      rawConfig.completions_options?.system
    )
      completionOptions.system =
        commandOptions.completionSystem ||
        rawConfig.completions_options?.system;

    // if there isn't a stop, we don't want one at all!
    if (commandOptions.completionStop || rawConfig.completions_options?.stop)
      completionOptions.stop =
        commandOptions.completionStop || rawConfig.completions_options?.stop;

    if (
      commandOptions.completionPromptTemplate ||
      rawConfig.completions_options?.promp_template
    )
      completionOptions.prompt_template =
        commandOptions.completionPromptTemplate ||
        rawConfig.completions_options?.promp_template;

    return completionOptions;
  }
}
