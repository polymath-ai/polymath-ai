import { Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-3-encoder";
import { PineconeClient } from "pinecone-client";
import * as dotenv from "dotenv";
import fs from "fs";
import { globbySync } from "globby";

// Initialize .env variables
dotenv.config();

// --------------------------------------------------------------------------
//  Time for some help
// --------------------------------------------------------------------------
const DEFAULT_MAX_TOKENS_COMPLETION = 1024; // tokens reserved for the answer
const DEFAULT_MODEL_TOKEN_COUNT = 4000; // max tokens for text-davinci-003
const MAX_TOKENS_FOR_MODEL = {
  "text-davinci-003": 4000,
  "text-embedding-ada-002": 8191,
  "gpt-3.5-turbo": 4096,
};

function encodeEmbedding(data) {
  return Buffer.from(new Float32Array(data).buffer).toString("base64");
}

function decodeEmbedding(data) {
  return Array.from(
    new Float32Array(new Uint8Array(Buffer.from(data, "base64")).buffer)
  );
}

function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

// Cosine similarity is the dot products of the two vectors divided by the product of their magnitude
// https://en.wikipedia.org/wiki/Cosine_similarity
//
// We use this to compare two embedding vectors
function cosineSimilarity(vecA, vecB) {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

function getMaxTokensForModel(model) {
  return MAX_TOKENS_FOR_MODEL[model] || DEFAULT_MAX_TOKENS_FOR_MODEL;
}

// --------------------------------------------------------------------------
//  Time for some class
// --------------------------------------------------------------------------

//
// Simple usage:
//
// let p = new Polymath({
//    apiKey: process.env.OPENAI_API_KEY,
//    libraryFiles: ['./libraries/knowledge-string.json']
// });
//
// let r = await p.ask("How long is a piece of string?");
// console.log("Context: ", r.context);
//
class Polymath {
  constructor(options) {
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
    this.libraries = options.libraryFiles;

    // An array of Polymath server endpoints
    this.servers = options.servers;

    // A Pinecone config
    this.pinecone = options.pinecone;

    // The prompt template. {context} and {query} will be replaced
    // The default is the classic from: https://github.com/openai/openai-cookbook/blob/main/examples/Question_answering_using_embeddings.ipynb
    this.promptTemplate =
      options.promptTemplate ||
      'Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "I don\'t know"\n\nnContext:{context}\n\nestion: {query}\n\nAnswer:';

    // `debug; true` was passed in
    this.debug = options.debug
      ? (output) => console.log("DEBUG: " + output)
      : () => {};
  }

  // Returns true if the Polymath is configured with at least one source
  validate() {
    return this.libraries || this.servers || this.pinecone;
  }

  // Given a users query, return the Polymath results which contain the bits that will make a good context for a completion
  async ask(query, askOptions) {
    if (!this.validate()) {
      throw new Error(
        "Polymath requires at least one library or polymath server or pinecone server"
      );
    }

    let queryEmbedding = await this.generateEmbedding(query);

    // For each server and/or local library, get the results and merge it all together!
    let bits = [];

    // First, let's ask each of the servers
    if (Array.isArray(this.servers)) {
      this.debug("Asking servers: " + this.servers.join("\n"));

      const promises = this.servers.map((server) => {
        const ps = new PolymathEndpoint(server);
        return ps.ask(queryEmbedding, askOptions);
      });

      const resultsArray = await Promise.all(promises);

      for (let results of resultsArray) {
        this.debug("Server Results: " + JSON.stringify(results));
        if (results.bits) {
          bits.push(...results.bits);
        }
      }
    }

    // Second, let's ask pinecone for some
    if (this.pinecone) {
      let ps = new PineconeServer(this.pinecone);
      let results = await ps.ask(queryEmbedding, askOptions);

      this.debug("Pinecone Results: " + JSON.stringify(results, 2));

      if (results) {
        bits.push(...results);
      }
    }

    // Third, look for local bits
    if (Array.isArray(this.libraries)) {
      let ls = new PolymathLocal(this.libraries);
      let results = ls.ask(queryEmbedding);

      this.debug("Local Results: " + JSON.stringify(results, 2));

      if (results) {
        bits.push(...results);
      }
    }

    // Finally, clean up the results and return them!
    let pr = new PolymathResults(bits);
    pr.sortBitsBySimilarity();
    if (askOptions?.omit) pr.omit(askOptions.omit);
    if (askOptions?.count) pr.trim(askOptions.count, askOptions?.count_type);

    return pr;
  }

  // Given input text such as the users query, return an embedding
  async generateEmbedding(input) {
    try {
      const response = await this.openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: input,
      });

      return response.data.data[0].embedding;
    } catch (error) {
      this.debug(`Embedding Error: ${JSON.stringify(error)}`);
      return {
        error: error,
      };
    }
  }

  // Given a users query, return a completion with polymath results and the answer
  async completion(query, polymathResults, askOptions, completionOptions) {
    if (!polymathResults) {
      // get the polymath results here
      polymathResults = await this.ask(query, askOptions);
    }

    completionOptions ||= this.completionOptions;

    let model = completionOptions?.model || "text-davinci-003";

    // How much room do we have for the content?
    // 4000 - 1024 - tokens for the prompt with the query without the context
    let contextTokenCount =
      getMaxTokensForModel(model) -
      DEFAULT_MAX_TOKENS_COMPLETION -
      this.getPromptTokenCount(query);

    let prompt = this.getPrompt(
      query,
      polymathResults.context(contextTokenCount)
    );

    try {
      const response = await this.openai.createCompletion({
        model: model,
        prompt: prompt,
        temperature: completionOptions?.temperature || 0,
        max_tokens:
          completionOptions?.max_tokens || DEFAULT_MAX_TOKENS_COMPLETION,
        top_p: completionOptions?.top_p || 1,
        n: completionOptions?.n || 1,
        stream: completionOptions?.stream || false,
        logprobs: completionOptions?.stream || null,
        echo: completionOptions?.echo || false,
        stop: completionOptions?.stop || null,
        presence_penalty: completionOptions?.presence_penalty || 0,
        frequency_penalty: completionOptions?.frequency_penalty || 0,
        best_of: completionOptions?.best_of || 1,
      });

      // returning the first option for now
      return {
        bits: polymathResults.bits(),
        infos: polymathResults.infoSortedBySimilarity(),
        completion: response.data.choices[0].text.trim(),
      };
    } catch (error) {
      this.debug(`Completion Error: ${JSON.stringify(error)}`);
      return {
        error: error,
      };
    }
  }

  getPrompt(query, context) {
    return this.promptTemplate
      .replace("{context}", context)
      .replace("{query}", query);
  }

  // given the query, add the prompt template and return the encoded total
  getPromptTokenCount(query) {
    return encode(query + this.promptTemplate).length;
  }
}

//
// A container for the resulting bits
//
// let p = new Polymath({..})
// let pr = await p.ask("How long is a piece of string?");
// pr.context(DEFAULT_MAX_TOKENS_COMPLETION) // return the string of context limited to 1025 tokens
//
class PolymathResults {
  constructor(bits) {
    this._bits = bits;
  }

  bits(maxTokensWorth = 0) {
    let bits = maxTokensWorth > 0 ? this.maxBits(maxTokensWorth) : this._bits;
    return bits;
  }

  context(maxTokensWorth = 0) {
    return this.bits(maxTokensWorth)
      .map((bit) => bit.text)
      .join("\n");
  }

  // Return as many bits as can fit the number of tokens
  maxBits(maxTokens = DEFAULT_MODEL_TOKEN_COUNT) {
    let totalTokens = 0;
    const includedBits = [];
    for (let i = 0; i < this._bits.length; i++) {
      const bit = this._bits[i];
      if (!bit.token_count) bit.token_count = encode(bit.text).length; // TODO: no token_count huh?
      if (totalTokens + bit.token_count > maxTokens) {
        return includedBits;
      }
      totalTokens += bit.token_count;
      includedBits.push(bit);
    }
    return includedBits;
  }

  // Add the new bits, resort, and re-max
  mergeBits(bits) {
    this._bits.push(...bits);
  }

  omit(omitString) {
    // this._bits = this._bits.filter((bit) => bit.text !== omitString);
    const omitKeys = omitString.split(/\s*,\s*/);
    for (let i = 0; i < this._bits.length; i++) {
      for (let j = 0; j < omitKeys.length; j++) {
        delete this._bits[i][omitKeys[j]];
      }
    }
  }

  trim(count, countType = "bits") {
    if (countType != "bits") {
      throw new Error("Only bits are supported at this time");
    }
    this._bits = this._bits.slice(0, count);
  }

  sortBitsBySimilarity() {
    this._bits = this._bits.sort((a, b) => b.similarity - a.similarity);
  }

  // Return info objects ordered by the most similarity, no duplicates
  infoSortedBySimilarity() {
    const uniqueInfos = [];
    return this._bits
      .sort((a, b) => b.similarity - a.similarity)
      .filter((bit) => {
        const info = bit.info;
        if (!uniqueInfos.some((ui) => ui.url === info.url)) {
          uniqueInfos.push(info);
          return true;
        }
        return false;
      })
      .map((bit) => bit.info);
  }
}

//
// Talk to remote servers and ask for their bits
//
class PolymathEndpoint {
  constructor(server) {
    this._server = server;
  }

  async ask(queryEmbedding, askOptions) {
    if (!queryEmbedding) {
      throw new Error("You need to ask a question of the Polymath");
    }

    // Configure all of the options
    const form = new FormData();
    form.append("version", askOptions?.version || "1");
    form.append(
      "query_embedding_model",
      askOptions?.query_embedding_model || "openai.com:text-embedding-ada-002"
    );
    form.append("query_embedding", encodeEmbedding(queryEmbedding));

    if (askOptions?.count) form.append("count", "" + askOptions?.count);

    // TODO: let the consumer know if passing in something that isn't valid (not token nor bit)
    if (askOptions?.count_type == "token" || askOptions?.count_type == "bit")
      form.append("count_type", askOptions?.count_type);

    // TODO: validate that the string is a list of valid items to omit (e.g. "embeddings,similarity")
    if (askOptions?.omit) form.append("omit", "" + askOptions?.omit);

    if (askOptions?.access_token)
      form.append("access_token", "" + askOptions?.access_token);

    // Send it all over to the Endpoint
    const url = new URL(this._server);
    const result = await (
      await fetch(url, {
        method: "POST",
        body: form,
      })
    ).json();

    return result;
  }
}

//
// Talk to Pinecone to do the vector search
//
class PineconeServer {
  constructor(config) {
    this._pinecone = new PineconeClient(config);
    this._topK = config.topK || 10;
  }

  async ask(queryEmbedding) {
    const result = await this._pinecone.query({
      vector: queryEmbedding,
      topK: this._topK,
      includeMetadata: true,
    });

    // console.log("Pinecone Results: ", result);

    return result?.matches.map((pineconeResult) => {
      return this.makeBit(pineconeResult);
    });
  }

  makeBit(pineconeResult) {
    let bit = {
      id: pineconeResult.id,
      info: { url: pineconeResult.metadata?.url },
    };

    if (pineconeResult.metadata?.text) bit.text = pineconeResult.metadata.text;
    if (pineconeResult.metadata?.token_count)
      bit.token_count = pineconeResult.metadata?.token_count;
    if (pineconeResult.metadata?.access_tag)
      bit.access_tag = pineconeResult.metadata?.access_tag;
    if (pineconeResult.metadata?.image_url)
      bit.info.image_url = pineconeResult.metadata.image_url;
    if (pineconeResult.metadata?.title)
      bit.info.title = pineconeResult.metadata.title;
    if (pineconeResult.metadata?.description)
      bit.info.description = pineconeResult.metadata.description;

    return bit;
  }
}

//
// Query a local library of bits
//
class PolymathLocal {
  constructor(libraries) {
    let expandedLibraries = this.expandLibraries(libraries);
    this._libraryBits = this.loadLibraryBits(expandedLibraries);

    // this.expandLibraries(libraries).then((expandedLibraries) => {
    //   this._libraryBits = this.loadLibraryBits(expandedLibraries);
    //   console.log("EX: ", expandedLibraries);
    // });
  }

  // Expand any directories or globs in the list of libraries
  // E.g. if you pass in ["./mybits/*.json", "./mybits2"], this will return
  // ["./mybits/1.json", "./mybits/2.json", "./mybits2/1.json", "./mybits2/2.json"]
  expandLibraries(libraries) {
    let expandedLibraries = [];
    for (const filepattern of libraries) {
      const files = globbySync([filepattern, "!*.SECRET.*"], {
        expandDirectories: {
          extensions: ["json"],
        },
      });
      expandedLibraries.push(...files);

      // console.log("In: ", libraries);
      // console.log("Out: ", expandedLibraries);

      return expandedLibraries;
    }
  }

  // Load up all of the library bits from the given library JSON files
  loadLibraryBits(libraries) {
    let libraryBits = [];
    for (const filename of libraries) {
      try {
        const data = fs.readFileSync(filename, "utf8");
        const json = JSON.parse(data);
        const bits = json.bits.map((bit) => {
          return {
            ...bit,
            embedding: decodeEmbedding(bit.embedding),
          };
        });
        libraryBits.push(...bits);
        // libraryBits = [...libraryBits, ...bits];
      } catch (e) {
        console.error(
          `Error reading or parsing library file "${filename}": ${e}`
        );
      }
    }
    return libraryBits;
  }

  // Given an embedding, find the bits with the most similar embeddings
  similarBits(embedding) {
    return (
      this._libraryBits
        .map((bit) => {
          return {
            ...bit,
            similarity: cosineSimilarity(embedding, bit.embedding),
          };
        })
        // sort by similarity descending
        .sort((a, b) => b.similarity - a.similarity)
    );
  }

  ask(queryEmbedding) {
    return this.similarBits(queryEmbedding);
  }
}

// Polymath, go back and help people!
export { Polymath, PolymathEndpoint };
