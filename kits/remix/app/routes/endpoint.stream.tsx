import type { LoaderArgs } from "@remix-run/node";
import { Polymath } from "~/utils/polymath.server";
import { polymathHostConfig } from "~/utils/polymath.config";
import { eventStream } from "remix-utils";
import type { CompletionResult } from "@polymath-ai/types";

class SSEStreamProcessor {
  #send;

  constructor(send) {
    this.#send = send;
  }

  processDelta(delta: string | Uint8Array) {
    if (delta) this.#send({ data: JSON.stringify({ answer: delta }) });
  }

  processResults(finalResults: CompletionResult) {
    this.#send({
      data: JSON.stringify({ final: finalResults }),
    });
  }
}

export async function loader({ request }: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("query");
  const servers = searchParams.getAll("server");

  // TODO: get these settings from a config file and switch to configuration system when ready
  const clientOptions = polymathHostConfig.client_options || {};
  clientOptions.apiKey =
    polymathHostConfig.default_api_key || process.env.OPENAI_API_KEY;

  if (servers.length > 0) {
    if (!clientOptions.servers) clientOptions.servers = [];
    clientOptions.servers = clientOptions.servers.concat(servers);
  }
  const client = new Polymath(clientOptions);

  if (!client.validate()) {
    client.servers = [];
    if (polymathHostConfig.server_options) {
      polymathHostConfig.server_options.forEach((server) => {
        if (server.default) client.servers.push(server.url);
      });
      if (client.servers.length < 1) {
        // dire, use the first one
        client.servers.push(polymathHostConfig.server_options[0].url);
      }
    }
  }

  // results will contain:
  // {
  //     bits: polymathResults.bits(),
  //     infos: polymathResults.infoSortedBySimilarity(),
  //     completion: response.data.choices[0].text.trim(),
  // }
  //   const results = await client.completion(query, undefined, otherOptions);

  const completionOptions = polymathHostConfig.completion_options || {};
  completionOptions.stream = true; // force it to be true

  return eventStream(request.signal, function setup(send) {
    const streamProcessor = new SSEStreamProcessor(send);

    client.completion(
      query,
      undefined, // we don't have existing polymath results
      undefined, // we don't need no ask Options
      completionOptions, // completion options
      streamProcessor
    );

    return function clear() {};
  });
}
