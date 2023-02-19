import { Form, useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";

export const loader = async () => {
  // if there is a query param, load it up and return
  return json({
    name: "Dion",
  });
};

export default function ClientSingle() {
  const { name } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Polymath: Single Endpoint Client</h1>

      <p>TODO: This will have a client that will get results with sources from one endpoint.</p>

      {/* <fetcher.Form method="post" action="/endpoint">
        <input
          type="text"
          name="query"
          id="query"
          defaultValue="How long is a piece of string?"
          style={{ padding:"1em", width:"90%" }}
        ></input>
        <button type="submit" style={{ display:"block", padding:"1em", marginTop:"10px" }}>Ask</button>
      </fetcher.Form>

      {fetcher?.data?.bits && <h2>Context Results</h2>}
      {fetcher?.data?.bits && fetcher.data.bits.map((bit: { text: string; info: { title: any; url: any; }; }, index: string) => (

        <ul key={index}>
        <li>Text: {bit.text}</li>
        <li>Source: <a href="{bit?.info?.url}">{bit?.info?.title || bit?.info?.url}</a></li>
        </ul>
      ))} */}
    </div>
  );
}
