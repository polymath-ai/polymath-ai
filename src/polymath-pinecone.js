import { PineconeClient } from "pinecone-client";

// --------------------------------------------------------------------------
// Talk to Pinecone to do the vector search
// --------------------------------------------------------------------------
class PolymathPinecone {
  constructor(config) {
    this._pinecone = new PineconeClient(config);
    this._topK = config.topK || 10;
  }

  async ask(queryEmbedding) {
    const result = await this._pinecone.query({
      vector: queryEmbedding,
      topK: this._topK,
      includeMetadata: true,
    });

    // console.log("Pinecone Results: ", result);

    return result?.matches.map((pineconeResult) => {
      return this.makeBit(pineconeResult);
    });
  }

  makeBit(pineconeResult) {
    let bit = {
      id: pineconeResult.id,
      info: { url: pineconeResult.metadata?.url },
    };

    if (pineconeResult.metadata?.text) bit.text = pineconeResult.metadata.text;
    if (pineconeResult.metadata?.token_count)
      bit.token_count = pineconeResult.metadata?.token_count;
    if (pineconeResult.metadata?.access_tag)
      bit.access_tag = pineconeResult.metadata?.access_tag;
    if (pineconeResult.metadata?.image_url)
      bit.info.image_url = pineconeResult.metadata.image_url;
    if (pineconeResult.metadata?.title)
      bit.info.title = pineconeResult.metadata.title;
    if (pineconeResult.metadata?.description)
      bit.info.description = pineconeResult.metadata.description;
    if ('score' in pineconeResult) 
      bit.similarity = pineconeResult.score;

    return bit;
  }
}

export { PolymathPinecone };
