import { EMBEDDING_VECTOR_LENGTH, encodeEmbedding } from "./utils.js";

import { Validator } from "@polymath-ai/validation";
import {
  validateResponse,
  validateEndpointArgs,
} from "@polymath-ai/validation";

import {
  AskOptions,
  EndpointArgs,
  PackedLibraryData,
  Server,
  TypedObject,
} from "@polymath-ai/types";

//
// Talk to remote servers and ask for their bits
//
class PolymathEndpoint {
  #server: Server;

  constructor(server: Server) {
    this.#server = server;
  }

  prepareFormData(args: EndpointArgs): FormData {
    const form = new FormData();
    TypedObject.keys(args).forEach((key) =>
      form.append(
        key,
        key == "query_embedding"
          ? encodeEmbedding(args[key])
          : String(args[key])
      )
    );
    return form;
  }

  async ask(askOptions: AskOptions): Promise<PackedLibraryData> {
    const args = validateEndpointArgs(askOptions);
    const form = this.prepareFormData(args);

    // Send it all over to the Endpoint
    const url = new URL(this.#server);
    const result = await (
      await fetch(url, {
        method: "POST",
        body: form,
      })
    ).json();

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
