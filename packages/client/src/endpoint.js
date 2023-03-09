import { EMBEDDING_VECTOR_LENGTH, encodeEmbedding } from "./utils.js";

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
    const log = [];

    // prepare a random embedding to send to the server
    const maxTokenCount = 1500;

    const randomEmbedding = new Array(EMBEDDING_VECTOR_LENGTH)
      .fill(0)
      .map(() => Math.random());

    let valid = false;
    let response = null;

    // See if it even responds.
    try {
      response = await this.ask(randomEmbedding, {
        count: maxTokenCount,
        count_type: "token",
      });
      log.push({
        message: "Server responded to request",
      });
    } catch (error) {
      log.push({
        message: "Server did not respond to request",
        error,
      });
      return {
        valid,
        log,
      };
    }

    // See if it counted tokens correctly.
    const tokenCount = response.bits.reduce(
      (acc, bit) => acc + bit.token_count,
      0
    );

    if (tokenCount > maxTokenCount) {
      log.push({
        message: "Does not seem to respond to 'token' parameter.",
      });
      return {
        valid,
        log,
      };
    }
    log.push({
      message: "Server correctly accounted for the 'token' parameter",
    });
    valid = true;
    return { valid, log };
  }
}

export { PolymathEndpoint };
