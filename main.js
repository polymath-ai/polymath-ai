import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

// --------------------------------------------------------------------------
//  Time for some help
// --------------------------------------------------------------------------
const DEFAULT_TOKEN_COUNT = 4000; // max tokens for text-davinci-003

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

// Return as many bits as can fit the number of tokens
function maxBits(bits, maxTokens) {
  let totalTokens = 0;
  const includedBits = [];
  for (let i = 0; i < bits.length; i++) {
    const bit = bits[i];
    if (totalTokens + bit.token_count > maxTokens) {
      return includedBits;
    }
    totalTokens += bit.token_count;
    includedBits.push(bit);
  }
  return includedBits;
}

// Given the array of bits, return info objects ordered by the most similarity, no duplicates
function infoSortedBySimilarity(bits) {
  const uniqueInfos = [];
  return bits
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

    let bits = this.similarBits(queryEmbedding);

    return {
      bits: bits,
      context: bits.map((bit) => bit.text).join("\n"),
    };
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

    let prompt = this.promptTemplate
      .replace("{context}", polymathResults.context)
      .replace("{query}", query);

    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 250,
      });

      // returning the first option for now
      return {
        bits: polymathResults.bits,
        infos: infoSortedBySimilarity(polymathResults.bits),
        completion: response.data.choices[0].text.trim(),
      };
    } catch (error) {
      return {
        error: error,
      };
    }
  }

  // Given an embedding, find the bits with the most similar embeddings
  similarBits(embedding, maxTokens = DEFAULT_TOKEN_COUNT) {
    const sortedBits = this.libraryBits
      .map((bit) => {
        return {
          ...bit,
          similarity: cosineSimilarity(embedding, bit.embedding),
        };
      })
      // sort by similarity descending
      .sort((a, b) => b.similarity - a.similarity);

    return maxBits(sortedBits, maxTokens);
  }
}

// Polymath, go back and help people!
export { Polymath };
