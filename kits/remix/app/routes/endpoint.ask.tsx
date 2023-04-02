import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Polymath } from "~/utils/polymath.server";
import { polymathHostConfig } from "~/utils/polymath.config";

export async function loader() {
  console.log("GET: Ask Loader called.");
  // TODO: explain what the Endpoint is, settings, etc
  return json({ name: "Loader / GET" });
}

export async function action({ request }: ActionArgs) {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }

  const body = await request.formData();
  const query = body.get("query");

  const otherOptions: Record<string, unknown> = {};
  for (const pair of body.entries()) {
    if (pair[0] !== "query") otherOptions[pair[0]] = pair[1];
  }

  // TODO: get these settings from a config file and switch to configuration system when ready
  const clientOptions = polymathHostConfig.client_options || {};
  clientOptions.apiKey =
    polymathHostConfig.default_api_key || process.env.OPENAI_API_KEY;
  const client = new Polymath(clientOptions);

  const results = await client.ask(query, otherOptions);

  return json({ bits: results.bits() });
}
