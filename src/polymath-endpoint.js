import { EMBEDDING_VECTOR_LENGTH, encodeEmbedding } from "./polymath-utils.js";

//
// Talk to remote servers and ask for their bits
//
class PolymathEndpoint {
  constructor(server) {
    this._server = server;
  }

  async ask(queryEmbedding, askOptions) {
    if (!queryEmbedding) {
      throw new Error("You need to ask a question of the Polymath");
    }

    // Configure all of the options
    const form = new FormData();
    form.append("version", askOptions?.version || "1");
    form.append(
      "query_embedding_model",
      askOptions?.query_embedding_model || "openai.com:text-embedding-ada-002"
    );
    form.append("query_embedding", encodeEmbedding(queryEmbedding));

    if (askOptions?.count) form.append("count", "" + askOptions?.count);

    // TODO: let the consumer know if passing in something that isn't valid (not token nor bit)
    if (askOptions?.count_type == "token" || askOptions?.count_type == "bit")
      form.append("count_type", askOptions?.count_type);

    // TODO: validate that the string is a list of valid items to omit (e.g. "embeddings,similarity")
    if (askOptions?.omit) form.append("omit", "" + askOptions?.omit);

    if (askOptions?.access_token)
      form.append("access_token", "" + askOptions?.access_token);

    // Send it all over to the Endpoint
    const url = new URL(this._server);
    const result = await (
      await fetch(url, {
        method: "POST",
        body: form,
      })
    ).json();

    return result;
  }

  async validate() {
    // prepare a random embedding to send to the server
    const randomEmbedding = new Array(EMBEDDING_VECTOR_LENGTH)
      .fill(0)
      .map(() => Math.random());
    const result = await this.ask(randomEmbedding, {
      count: 500,
      count_type: "bit",
    });
    return true;
  }
}

export { PolymathEndpoint };
