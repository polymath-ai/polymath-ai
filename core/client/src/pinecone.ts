import { PineconeClient } from "pinecone-client";

import {
  BitInfo,
  EmbeddingVector,
  PackedBit,
  PineconeBit,
  PineconeConfig,
  PineconeResult,
} from "@polymath-ai/types";

// --------------------------------------------------------------------------
// Talk to Pinecone to do the vector search
// --------------------------------------------------------------------------
class PolymathPinecone {
  _pinecone: PineconeClient<PineconeBit>;
  _topK: number;

  constructor(config: PineconeConfig) {
    this._pinecone = new PineconeClient(config);
    this._topK = config.topK || 10;
  }

  async ask(queryEmbedding: EmbeddingVector): Promise<PackedBit[]> {
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

  makeBit(pineconeResult: PineconeResult) {
    const bit: PackedBit = {
      id: pineconeResult.id,
    };

    const info: BitInfo = { url: pineconeResult.metadata?.url };

    if (pineconeResult.metadata?.text) bit.text = pineconeResult.metadata.text;
    if (pineconeResult.metadata?.token_count)
      bit.token_count = pineconeResult.metadata?.token_count;
    if (pineconeResult.metadata?.access_tag)
      bit.access_tag = pineconeResult.metadata?.access_tag;
    if (pineconeResult.metadata?.image_url)
      info.image_url = pineconeResult.metadata.image_url;
    if (pineconeResult.metadata?.title)
      info.title = pineconeResult.metadata.title;
    if (pineconeResult.metadata?.description)
      info.description = pineconeResult.metadata.description;
    if ("score" in pineconeResult) bit.similarity = pineconeResult.score;

    bit.info = info;
    return bit;
  }
}

export { PolymathPinecone };
