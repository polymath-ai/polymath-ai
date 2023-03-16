import { ActionArgs, json } from "@remix-run/node";
import { Polymath } from "~/utils/polymath.server";
import { polymathHostConfig } from "~/utils/polymath.config";

export async function loader() {
  console.log("GET: Complete Loader called.");
  // TODO: explain what the Endpoint is, settings, etc
  return json({ name: "Loader / GET" });
}

export async function action({ request }: ActionArgs) {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }

  const body = await request.formData();
  const query = body.get("query");

  const otherOptions: Record<string, any> = {};
  const servers = [];
  for (const pair of body.entries()) {
    if (pair[0] === "server") {
      servers.push(pair[1]);
    } else if (pair[0] !== "query") {
      otherOptions[pair[0]] = pair[1];
    }
  }

  // TODO: get these settings from a config file and switch to configuration system when ready
  let clientOptions: any = polymathHostConfig.client_options;
  clientOptions.apiKey =
    polymathHostConfig.default_api_key || process.env.OPENAI_API_KEY;

  if (servers.length > 0) {
    if (!clientOptions.servers) clientOptions.servers = [];
    clientOptions.servers = clientOptions.servers.concat(servers);
  }
  let client = new Polymath(clientOptions);

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
  let results = await client.completion(query, undefined, otherOptions);

  return json(results);
}
