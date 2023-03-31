import { EmbeddingVector } from "@polymath-ai/types";
import {
  CreateCompletionRequest,
  Configuration,
  OpenAIApi,
  CreateEmbeddingRequest,
} from "openai";

export class AI {
  private openai: OpenAIApi;

  constructor({ apiKey }: { apiKey: string }) {
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey,
      })
    );
  }

  async completion(message: string): Promise<string> {
    const request: CreateCompletionRequest = {
      prompt: message,
      model: "text-davinci-003",
      temperature: 0.7,
      max_tokens: 256,
    };
    const response = await this.openai.createCompletion(request);
    return response.data.choices[0].text || "";
  }

  async embedding(input: string): Promise<EmbeddingVector> {
    const request: CreateEmbeddingRequest = {
      input,
      model: "text-embedding-ada-002",
    };
    const response = await this.openai.createEmbedding(request);
    return response.data.data[0].embedding;
  }
}
