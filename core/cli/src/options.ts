import {
  CompletionOptions,
  HostConfig,
  PolymathOptions,
} from "@polymath-ai/types";
import { CLIBaseOptions } from "./action.js";
import { Base } from "./base.js";

export class Options extends Base {
  // Munge together a clientOptions object from the config file
  // and the command line.
  normalizeClientOptions(
    programOptions: CLIBaseOptions,
    config: HostConfig
  ): PolymathOptions {
    const skipEmpties = (obj: Record<string, unknown>) =>
      Object.fromEntries(Object.entries(obj).filter(([_, v]) => !!v));

    // convert a main host config into the bits needed for the Polymath
    const clientConfig = config.client_options;

    const clientOptions = skipEmpties({
      apiKey: programOptions.openaiApiKey || config.default_api_key,
      servers: programOptions.servers || clientConfig?.servers,
      libraryFiles: programOptions.libraries || clientConfig?.libraryFiles,
      omit: clientConfig?.omit,
      debug: clientConfig?.debug,
    });

    if (programOptions.pinecone) {
      clientOptions.pinecone = {
        apiKey: programOptions.pineconeApiKey,
        baseUrl: programOptions.pineconeBaseUrl,
        namespace: programOptions.pineconeNamespace,
      };
    } else if (config.client_options?.pinecone) {
      clientOptions.pinecone = config.client_options.pinecone;
    }

    return clientOptions;
  }

  // Munge together a clientOptions object from the config file and the command line
  normalizeCompletionOptions(
    commandOptions: any,
    rawConfig: HostConfig
  ): CompletionOptions {
    // convert a main host config into the bits needed for the Polymath
    const completionOptions: CompletionOptions = {};

    completionOptions.model =
      commandOptions.completionModel || rawConfig.completion_options?.model;
    completionOptions.temperature =
      commandOptions.completionTemperature ||
      rawConfig.completion_options?.temperature;
    completionOptions.max_tokens =
      commandOptions.completionMaxTokens ||
      rawConfig.completion_options?.max_tokens;
    completionOptions.top_p =
      commandOptions.completionTopP || rawConfig.completion_options?.top_p;
    completionOptions.n = commandOptions.n || rawConfig.completion_options?.n;

    if (
      Object.prototype.hasOwnProperty.call(commandOptions, "completionStream")
    ) {
      completionOptions.stream =
        commandOptions.completionStream.toLowerCase() === "true";
    } else if (rawConfig.completion_options?.stream) {
      completionOptions.stream = rawConfig.completion_options.stream;
    }

    if (commandOptions.completionSystem || rawConfig.completion_options?.system)
      completionOptions.system =
        commandOptions.completionSystem || rawConfig.completion_options?.system;

    // if there isn't a stop, we don't want one at all!
    if (commandOptions.completionStop || rawConfig.completion_options?.stop)
      completionOptions.stop =
        commandOptions.completionStop || rawConfig.completion_options?.stop;

    if (
      commandOptions.completionPromptTemplate ||
      rawConfig.completion_options?.prompt_template
    )
      completionOptions.prompt_template =
        commandOptions.completionPromptTemplate ||
        rawConfig.completion_options?.prompt_template;

    return completionOptions;
  }
}
