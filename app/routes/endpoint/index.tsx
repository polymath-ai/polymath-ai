import { ActionArgs, json } from "@remix-run/node";
import { Polymath } from "~/utils/polymath.server";

export async function loader() {
    return json({ name: "Loader / GET" });
}

export async function action({ request }: ActionArgs) {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }

  const body = await request.formData();
  const query = body.get("query");

  let client = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ["./libraries/knowledge-string.json"],
    debug: true,
  });

  // TODO: omit embeddings etc (add the otherOptions omit settings with the new client)
  let results = await client.ask(query);

  return json({ bits: results.bits() });
}
