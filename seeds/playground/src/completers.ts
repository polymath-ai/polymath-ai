import {
  ChatCompletionResponse,
  CompletionRequest,
  CompletionResponse,
  openai,
  OpenAIRequest,
} from "@polymath-ai/ai";

export interface ICompleter {
  request(prompt: string): Request;
  response(response: unknown): string;
}

export class Completer implements ICompleter {
  #request: OpenAIRequest<CompletionRequest>;
  constructor() {
    this.#request = openai(process.env.OPENAI_API_KEY).completion({
      model: "text-davinci-003",
    });
  }

  request(prompt: string) {
    return this.#request.prompt(prompt);
  }

  response(response: unknown): string {
    const completionResponse = response as CompletionResponse;
    return completionResponse.choices[0].text?.trim() || "";
  }
}

export class ChatCompleter implements ICompleter {
  request(prompt: string) {
    const messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [];
    messages.push({
      role: "user",
      content: prompt,
    });
    return openai(process.env.OPENAI_API_KEY).chatCompletion({
      model: "gpt-4",
      messages,
    });
  }

  response(response: unknown): string {
    const chatCompletionResponse = response as ChatCompletionResponse;
    return chatCompletionResponse.choices[0].message?.content || "";
  }
}
