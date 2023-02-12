import { Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-3-encoder";
import fs from "fs";

// --------------------------------------------------------------------------
//  Time for some help
// --------------------------------------------------------------------------
const DEFAULT_MAX_TOKENS_COMPLETION = 1024; // tokens reserved for the answer
const DEFAULT_MODEL_TOKEN_COUNT = 4000; // max tokens for text-davinci-003
const MAX_TOKENS_FOR_MODEL = {
    "text-davinci-003": 4000,
    "text-embedding-ada-002": 8191
}

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
// let r = await p.results("How long is a piece of string?");
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

    // An array of JSON library filenames
    this.libraryBits = this.loadLibraryBits(options.libraryFiles);

    // An array of Polymath server endpoints
    this.servers = options.servers;
    if (!this.libraryBits && !options.servers) {
      throw new Error("Polymath requires at least one library or server");
    }

    // The prompt template. {context} and {query} will be replaced
    // The default is the classic from: https://github.com/openai/openai-cookbook/blob/main/examples/Question_answering_using_embeddings.ipynb
    this.promptTemplate =
      options.promptTemplate ||
      'Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "I don\'t know"\n\nnContext:{context}\n\nestion: {query}\n\nAnswer:';
  }

  // Load up all of the library bits from the given library JSON files
  loadLibraryBits(libraryFiles) {
    let libraryBits = [];
    for (const filename of libraryFiles) {
      try {
        const data = fs.readFileSync(filename, "utf8");
        const json = JSON.parse(data);
        const bits = json.bits.map((bit) => {
          return {
            ...bit,
            embedding: decodeEmbedding(bit.embedding),
          };
        });
        libraryBits = [...libraryBits, ...bits];
      } catch (e) {
        console.error(
          `Error reading or parsing library file "${filename}": ${e}`
        );
      }
    }
    return libraryBits;
  }

  // Given a users query, return the Polymath results which contain the bits that will make a good context for a completion
  async results(query) {
    let queryEmbedding = await this.generateEmbedding(query);

    return new PolymathResults(this.similarBits(queryEmbedding));
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
      return {
        error: error,
      };
    }
  }

  // Given a users query, return a completion with polymath results and the answer
  async completion(query, polymathResults) {
    if (!polymathResults) {
      // get the polymath results here
      polymathResults = await this.results(query);
    }

    // How much room do we have for the content?
    // 4000 - 1024 - tokens for the prompt with the query without the context 
    let contextTokenCount = DEFAULT_MODEL_TOKEN_COUNT - DEFAULT_MAX_TOKENS_COMPLETION - this.getPromptTokenCount(query);

    let prompt = this.getPrompt(query, polymathResults.context(contextTokenCount));

    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: DEFAULT_MAX_TOKENS_COMPLETION,
      });

      // returning the first option for now
      return {
        bits: polymathResults.bits(),
        infos: polymathResults.infoSortedBySimilarity(),
        completion: response.data.choices[0].text.trim(),
      };
    } catch (error) {
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

  // Given an embedding, find the bits with the most similar embeddings
  similarBits(embedding) {
    return (
      this.libraryBits
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
}

//
// A container for the resulting bits
//
// 
// let p = new Polymath({..})
// let pr = await p.results("How long is a piece of string?");
// pr.context(DEFAULT_MAX_TOKENS_COMPLETION) // return the string of context limited to 1025 tokens
//
class PolymathResults {
  constructor(bits) {
    this._bits = bits;
  }

  bits(maxTokensWorth = 0) {
    let bits = (maxTokensWorth > 0) ? this.maxBits(maxTokensWorth) : this._bits;
    return bits;
  }

  context(maxTokensWorth = 0) {
    return this.bits(maxTokensWorth).map((bit) => bit.text).join("\n");
  }

  // Return as many bits as can fit the number of tokens
  maxBits(maxTokens = DEFAULT_MODEL_TOKEN_COUNT) {
    let totalTokens = 0;
    const includedBits = [];
    for (let i = 0; i < this._bits.length; i++) {
      const bit = this._bits[i];
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
    this._bits = [...this._bits, ...bits];
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

// Polymath, go back and help people!
export { Polymath };
