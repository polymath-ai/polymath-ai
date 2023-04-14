import { discoverEndpoint } from "./discover.js";
import { encodeEmbedding } from "@polymath-ai/host";

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

import contentTypeParser from "content-type-parser";

/*
 Fetch the API response and check the content Type.

 Returns a valid response or undefined.
*/
async function fetchAPIResponse(
  url: URL,
  form: FormData
): Promise<PackedLibraryData | undefined> {
  const response = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (response.ok) {
    const rawContentType = response.headers.get("content-type");
    const contentType = contentTypeParser(rawContentType);

    if (contentType.type === "application" && contentType.subtype === "json") {
      return validateResponse(await response.json());
    }
  }

  return undefined;
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

  // Fetch the data, if it fails, try to discover the endpoint and retry.
  async ask(askOptions: AskOptions): Promise<PackedLibraryData> {
    const args = validateEndpointArgs(askOptions);
    const form = this.prepareFormData(args);

    const url = new URL(this.#server);

    let result = await fetchAPIResponse(url, form);

    if (result == undefined) {
      // Try to discover the endpoint - throws an error if not found.
      const newUrl = await discoverEndpoint(url);

      result = await fetchAPIResponse(newUrl, form);

      if (result == undefined) {
        throw new Error(
          `${url} failed and ${newUrl} did not respond with valid data`
        );
      }
    }

    // The result is validated, return it
    return result;
  }

  async validate() {
    const validator = new Validator(this.ask.bind(this));
    return await validator.run();
  }
}

export { PolymathEndpoint };
