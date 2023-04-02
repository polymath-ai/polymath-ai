import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-3-encoder";
import {
  PolymathPinecone,
  PolymathLocal,
  encodeEmbedding,
} from "@polymath-ai/host";
import { PolymathResults } from "./results.js";
import { PolymathEndpoint } from "./endpoint.js";
import {
  getMaxTokensForModel,
  DEFAULT_MAX_TOKENS_COMPLETION,
} from "./utils.js";

// Initialize .env variables
import * as dotenv from "dotenv";
import { findUpSync } from "find-up";

import {
  AskOptions,
  CompletionOptions,
  CompletionResult,
  EmbeddingVector,
  LibraryFileName,
  ModelName,
  PackedBit,
  PineconeConfig,
  PolymathOptions,
  PromptTemplate,
  Server,
  StreamProcessor,
} from "@polymath-ai/types";

dotenv.config({
  path: findUpSync(".env"),
});

// --------------------------------------------------------------------------
// This Polymath has some class.
// --------------------------------------------------------------------------
// Simple usage:
//
// let p = new Polymath({
//    apiKey: process.env.OPENAI_API_KEY,
//    libraryFiles: ['./libraries/knowledge-string.json']
// });
//
// let r = await p.ask("How long is a piece of string?");
// console.log("Context: ", r.context);
// --------------------------------------------------------------------------
class Polymath {
  askOptions?: AskOptions;
  completionOptions?: CompletionOptions;
  openai: OpenAIApi;
  libraries: LibraryFileName[];
  servers: Server[];
  pinecone?: PineconeConfig;
  promptTemplate: PromptTemplate;
  _debug: boolean;

  constructor(options: PolymathOptions) {
    // The OpenAI API Key
    if (!options.apiKey) {
      throw new Error("Polymath requires an api_key");
    }
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey: options.apiKey,
      })
    );

    // Reusable default ask options for embeddings
    this.askOptions = options.askOptions;

    // Reusable default completion options for completions
    this.completionOptions = options.completionOptions;

    // An array of JSON library filenames
    this.libraries = options.libraryFiles || [];

    // An array of Polymath server endpoints
    this.servers = options.servers || [];

    // A Pinecone config
    this.pinecone = options.pinecone;

    // The prompt template. {context} and {query} will be replaced
    // The default is the classic from: https://github.com/openai/openai-cookbook/blob/main/examples/Question_answering_using_embeddings.ipynb
    this.promptTemplate =
      options.promptTemplate ||
      options.completionOptions?.prompt_template ||
      'Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "I don\'t know".\n\nContext:{context}\n\nQuestion: {query}\n\nAnswer:';

    this._debug = !!options.debug;
  }

  debug(message: string): void {
    if (!this._debug) return;
    console.log("DEBUG: " + message);
  }

  // Returns true if the Polymath is configured with at least one source
  validate() {
    return this.libraries.length || this.servers.length || this.pinecone;
  }

  // Given a users query, return the Polymath results which contain the bits that will make a good context for a completion
  async ask(query: string, askOptions?: AskOptions): Promise<PolymathResults> {
    if (!this.validate()) {
      throw new Error(
        "Polymath requires at least one library or polymath server or pinecone server"
      );
    }

    // If passed the query_embedding, use it. Otherwise, generate it.
    // Beware the fact that there is a chance generateEmbedding(query) != queryEmbedding
    const queryEmbedding =
      askOptions?.query_embedding || (await this.generateEmbedding(query));

    const args = askOptions
      ? { ...askOptions, query_embedding: queryEmbedding }
      : { query_embedding: queryEmbedding };

    // For each server and/or local library, get the results and merge it all together!
    const bits: PackedBit[] = [];

    // First, let's ask each of the servers
    if (Array.isArray(this.servers)) {
      this.debug("Asking servers: " + this.servers.join("\n"));

      const promises = this.servers.map((server) => {
        const endpoint = new PolymathEndpoint(server);
        return endpoint.ask(args);
      });

      const resultsArray = await Promise.all(promises);

      for (const results of resultsArray) {
        this.debug("Server Results: " + JSON.stringify(results));
        if (results.bits) {
          bits.push(...results.bits);
        }
      }
    }

    // Second, let's ask pinecone for some
    if (this.pinecone) {
      const ps = new PolymathPinecone(this.pinecone);
      //TODO: shouldn't pinecone also take an askOptions and filter appropriately?
      const results = await ps.askPacked(args);

      this.debug("Pinecone Results: " + JSON.stringify(results, null, 2));

      bits.push(...results.bits);
    }

    // Third, look for local bits
    if (Array.isArray(this.libraries)) {
      const ls = new PolymathLocal(this.libraries);
      const results = await ls.askPacked(args);

      this.debug("Local Results: " + JSON.stringify(results, null, 2));

      bits.push(...results.bits);
    }

    // Finally, clean up the results and return them!
    return new PolymathResults(bits, askOptions);
  }

  // Given input text such as the users query, return an embedding
  async generateEmbedding(input: string): Promise<EmbeddingVector> {
    try {
      const response = await this.openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: input,
      });

      return response.data.data[0].embedding;
    } catch (error) {
      this.debug(`Embedding Error: ${JSON.stringify(error)}`);
      return [];
    }
  }

  // Given a users query, return a completion with polymath results and the answer
  async completion(
    query: string,
    polymathResults?: PolymathResults,
    askOptions?: AskOptions,
    completionOptions?: CompletionOptions,
    streamProcessor?: StreamProcessor
  ): Promise<CompletionResult> {
    if (!polymathResults) {
      // get the polymath results here
      polymathResults = await this.ask(query, askOptions);
    }
    const responseBitsAndInfo = {
      bits: polymathResults.bits(),
      infos: polymathResults.infoSortedBySimilarity(),
    };

    completionOptions ||= this.completionOptions;

    const actualStreamProcessor = streamProcessor || {
      processDelta: (delta) => {
        if (delta) process.stdout.write(delta);
      },
      processResults: () => {
        process.stdout.write("\n\n");
      },
    };

    const model = completionOptions?.model || "text-davinci-003";

    // How much room do we have for the content?
    // 4000 - 1024 - tokens for the prompt with the query without the context
    const contextTokenCount =
      getMaxTokensForModel(model) -
      DEFAULT_MAX_TOKENS_COMPLETION -
      this.getPromptTokenCount(query);

    const prompt = this.getPrompt(
      query,
      polymathResults.context(contextTokenCount)
    );

    try {
      let response;
      let responseText;
      const axiosExtraInfo: { responseType?: "stream" } =
        completionOptions?.stream ? { responseType: "stream" } : {};

      if (this.isChatModel(model)) {
        const messages: ChatCompletionRequestMessage[] = [];
        if (completionOptions?.system) {
          messages.push({
            role: "system",
            content: completionOptions.system,
          });
        }
        messages.push({
          role: "user",
          content: prompt,
        });

        response = await this.openai.createChatCompletion(
          {
            model: model,
            messages: messages,
            temperature: completionOptions?.temperature || 0,
            max_tokens:
              completionOptions?.max_tokens || DEFAULT_MAX_TOKENS_COMPLETION,
            top_p: completionOptions?.top_p || 1,
            n: completionOptions?.n || 1,
            stream: completionOptions?.stream || false,
            stop: completionOptions?.stop,
            presence_penalty: completionOptions?.presence_penalty || 0,
            frequency_penalty: completionOptions?.frequency_penalty || 0,
          },
          axiosExtraInfo
        );
        if (completionOptions?.stream) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore See https://github.com/openai/openai-node/issues/18#issuecomment-1406961202
          response.data.on("data", (data: string) => {
            this.processData(
              data,
              model,
              actualStreamProcessor,
              responseBitsAndInfo
            );
          });
        } else {
          responseText = response.data.choices[0].message?.content;
        }
      } else {
        // text-davinci-003
        response = await this.openai.createCompletion(
          {
            model: model,
            prompt: prompt,
            temperature: completionOptions?.temperature || 0,
            max_tokens:
              completionOptions?.max_tokens || DEFAULT_MAX_TOKENS_COMPLETION,
            top_p: completionOptions?.top_p || 1,
            n: completionOptions?.n || 1,
            stream: completionOptions?.stream || false,
            logprobs: completionOptions?.logprobs || null,
            echo: completionOptions?.echo || false,
            stop: completionOptions?.stop || null,
            presence_penalty: completionOptions?.presence_penalty || 0,
            frequency_penalty: completionOptions?.frequency_penalty || 0,
            best_of: completionOptions?.best_of || 1,
          },
          axiosExtraInfo
        );
        if (completionOptions?.stream) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore See https://github.com/openai/openai-node/issues/18#issuecomment-1406961202
          response.data.on("data", (data: string) => {
            this.processData(
              data,
              model,
              actualStreamProcessor,
              responseBitsAndInfo
            );
          });
        } else {
          responseText = response.data.choices[0].text;
        }
      }

      // returning the first option for now
      return {
        ...responseBitsAndInfo,
        completion: responseText?.trim(),
      };
    } catch (error) {
      console.log("Error: ", error);
      this.debug(`Completion Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  getPrompt(query: string, context: string): string {
    return this.promptTemplate
      .replace("{context}", context)
      .replace("{query}", query);
  }

  // given the query, add the prompt template and return the encoded total
  getPromptTokenCount(query: string): number {
    return encode(query + this.promptTemplate).length;
  }

  // Does the model work with the OpenAI chat model API?
  isChatModel(model: ModelName): boolean {
    return ["gpt-3.5-turbo", "gpt-4"].includes(model);
  }

  processData(
    data: string,
    model: ModelName,
    streamProcessor: StreamProcessor,
    results: CompletionResult
  ) {
    const lines = data
      .toString()
      .split("\n")
      .filter((line) => line.trim() !== "");

    for (const line of lines) {
      const message = line.toString().replace(/^data: /, "");
      if (message === "[DONE]") {
        streamProcessor.processResults(results);
        return; // Stream finished
      }
      try {
        // console.log("Message", message);
        const parsed = JSON.parse(message);
        let delta;
        if (this.isChatModel(model)) {
          delta = parsed.choices[0].delta?.content;
        } else {
          delta = parsed.choices[0].text;
        }
        streamProcessor.processDelta(delta);
      } catch (error) {
        console.error("Could not JSON parse stream message", message, error);
      }
    }
  }
}

// Polymath, go back and help people!
export { Polymath, PolymathEndpoint };
export { DiscoveryError } from "./discover.js";
