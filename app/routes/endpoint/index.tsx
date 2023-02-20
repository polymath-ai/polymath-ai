import { ActionArgs, json } from "@remix-run/node";
import { Polymath } from "~/utils/polymath.server";

export async function loader() {
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
  for (const pair of body.entries()) {
    if (pair[0] !== "query") otherOptions[pair[0]] = pair[1];
  }

  // TODO: get these settings from a config file
  let client = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ["./libraries/knowledge-string.json"],
    debug: true,
  });

  let results = await client.ask(query, otherOptions);

  return json({ bits: results.bits() });
}
