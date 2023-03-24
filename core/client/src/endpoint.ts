import { EMBEDDING_VECTOR_LENGTH, encodeEmbedding } from "./utils.js";

import { Validator } from "@polymath-ai/validation";
import { validateResponse } from "@polymath-ai/validation";

import { AskOptions, PackedLibraryData, Server } from "@polymath-ai/types";

const discoverEndpoint = (url) => {
  // GET the curent URL/
  return fetch(url)
    .then(discoveryResponse => {
      if (discoveryResponse.ok) {
        return discoveryResponse.text();
      }
    })
    .then(body => {
      if (body != undefined) {
        // This is particularly brittle.
        const linkMatch = body.match(/<link rel=["']polymath["'] href=["']([^"']+)["']/);
        if (linkMatch) {
          // need to work out base.
          return new URL(linkMatch[1], url);
        }
      }
    });
};

//
// Talk to remote servers and ask for their bits
//
class PolymathEndpoint {
  #server: Server;

  constructor(server: Server) {
    this.#server = server;
  }

  async ask(askOptions: AskOptions): Promise<PackedLibraryData> {
    const queryEmbedding = askOptions.query_embedding;
    if (!queryEmbedding) {
      throw new Error("You need to ask a question of the Polymath");
    }

    // Configure all of the options
    const form = new FormData();
    form.append("version", "" + (askOptions?.version || 1));
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
    const url = new URL(this.#server);
    const result = await (
      await fetch(url, {
        method: "POST",
        body: form,
      })
    )
    .then((response: Response): Promise<Response> => {
      if (
        response.ok == false ||
        response.headers["content-type"] != "application/json"
      ) {
        // There was an error, so attempt a GET to see if there is a link rel.
        return discoverEndpoint(url)
          .then((newUrl: string): Promise<Response> => { return fetch(newUrl, { method: "POST", body: form })});
      }
      return response;
    })
    .then((response: Response): Promise<Response> => {
      if (response.ok == false) {
        throw new Error("Server responded with " + response.status);
      }
      return response;
    })
    .then((response: Response) => {
      return response.json();
    })
  );

    return validateResponse(result);
  }

  async validate() {
    // prepare a random embedding to send to the server
    const randomEmbedding = new Array(EMBEDDING_VECTOR_LENGTH)
      .fill(0)
      .map(() => Math.random());

    const ask = async (args?: AskOptions) => {
      args = args
        ? { ...args, query_embedding: randomEmbedding }
        : { query_embedding: randomEmbedding };
      return await this.ask(args);
    };

    const validator = new Validator(ask);
    return await validator.run();
  }
}

export { PolymathEndpoint };
