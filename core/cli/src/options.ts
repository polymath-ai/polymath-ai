import { CompletionOptions } from "@polymath-ai/types";
import { Base } from "./base.js";

export class Options extends Base {
  constructor(args: any) {
    super(args);
  }

  // Munge together a clientOptions object from the config file
  // and the command line.
  normalizeClientOptions(programOptions: any, config: any) {
    const skipEmpties = (obj: any) =>
      Object.fromEntries(Object.entries(obj).filter(([_, v]) => !!v));

    // convert a main host config into the bits needed for the Polymath
    let clientConfig = config.client_options;

    let clientOptions = skipEmpties({
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
    rawConfig: any
  ): CompletionOptions {
    // convert a main host config into the bits needed for the Polymath
    const completionOptions: CompletionOptions = {};

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

    if (commandOptions.hasOwnProperty("completionStream")) {
      completionOptions.stream =
        commandOptions.completionStream.toLowerCase() === "true";
    } else if (rawConfig.completions_options?.stream) {
      completionOptions.stream = rawConfig.completions_options.stream;
    }

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
