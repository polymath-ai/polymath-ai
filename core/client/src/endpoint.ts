import { discoverEndpoint } from "./discover.js";
import { encodeEmbedding } from "./utils.js";

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

/*
 Fetch the API response, but if it fails, try to discover the endpoint.

 We will only do one attempt at discovery, and if that fails, we will throw.
*/
async function fetchAPIResponse(
  url: URL,
  form: FormData
): Promise<PackedLibraryData | undefined> {
  const response = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (
    response.ok &&
    response.headers.get("content-type") === "application/json"
  ) {
    return response.json();
  }

  const newUrl = await discoverEndpoint(url);

  // Call what we think is the API.
  const newResponse = await fetch(newUrl, { method: "POST", body: form });
  if (!newResponse.ok) {
    throw new Error("Server responded with " + newResponse.status);
  }

  return newResponse.json();
}

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

    const url = new URL(this.#server);
    const result = await fetchAPIResponse(url, form);

    return validateResponse(result);
  }

  async validate() {
    const validator = new Validator(this.ask.bind(this));
    return await validator.run();
  }
}

export { PolymathEndpoint };
