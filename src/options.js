import chalk from "chalk";
import fs from "fs";
import os from "os";
import path from "path";

export class Options {
  isDebug;

  constructor(isDebug) {
    this.isDebug = isDebug;
  }

  debug(...args) {
    if (this.isDebug) {
      console.log(chalk.blue("DEBUG:", ...args));
    }
  }

  // Hunt around the filesystem for a config file
  loadRawConfig(configOption) {
    let rawConfig;

    // if there is a configOption:
    if (configOption) {
      // try to load it as a filename
      try {
        const filename = path.resolve(configOption);
        this.debug(`Looking for config at: ${filename}`);

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
          this.debug(`Now, looking for config at: ${configPath}`);

          const config = fs.readFileSync(configPath, "utf8");
          rawConfig = JSON.parse(config);
        } catch (e) {
          console.error(`No config file at that location: ${e}`);
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

      this.debug(`Now, looking for a default config at ${configPath}`);

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

    clientOptions.apiKey =
      programOptions.openaiApiKey || rawConfig.default_api_key;

    clientOptions.servers = [].concat(
      programOptions.server,
      rawConfig.client_options?.servers
    );

    clientOptions.libraryFiles =
      programOptions.libraries ||
      rawConfig.client_options?.libraryFiles ||
      undefined;

    if (programOptions.pinecone) {
      clientOptions.pinecone = {
        apiKey: programOptions.pineconeApiKey,
        baseUrl: programOptions.pineconeBaseUrl,
        namespace: programOptions.pineconeNamespace,
      };
    } else if (rawConfig.client_options?.pinecone) {
      clientOptions.pinecone = rawConfig.client_options.pinecone;
    }

    if (rawConfig.client_options?.omit)
      clientOptions.omit = rawConfig.client_options.omit;

    if (rawConfig.client_options?.debug)
      clientOptions.debug = rawConfig.client_options.debug;

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
