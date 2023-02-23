import { ActionArgs, json } from "@remix-run/node";
import { Polymath } from "~/utils/polymath.server";
import { polymathHostConfig } from "~/utils/polymath.config";

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

  // results will contain:
  // {
  //     bits: polymathResults.bits(),
  //     infos: polymathResults.infoSortedBySimilarity(),
  //     completion: response.data.choices[0].text.trim(),
  // }

  let results = await client.completion(query, undefined, otherOptions);

  return json(results);
}
