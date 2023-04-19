// Playing with porcelains.
export class CompletionStreamer implements TransformStream<Uint8Array, string> {
  writable: WritableStream<Uint8Array>;
  readable: ReadableStream<string>;
  controller: ReadableStreamDefaultController<string> | null = null;

  constructor() {
    this.writable = new WritableStream({
      write: (chunk) => this.write(chunk),
    });
    this.readable = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
    });
  }

  write(chunk: Uint8Array) {
    const decoder = new TextDecoder();
    const s = decoder.decode(chunk);
    s.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const pos = line.indexOf(":");
        const name = line.substring(0, pos);
        if (name !== "data") return;
        const content = line.substring(pos + 1).trim();
        if (content.length == 0) return;
        if (content === "[DONE]") {
          this.controller?.close();
          return;
        }
        const parsed = JSON.parse(content);
        this.controller?.enqueue(parsed);
      });
  }
}

class OpenAIRequest extends Request {
  #params: object;

  constructor(url: string, init: RequestInit, params: object) {
    init.body = JSON.stringify(params);
    super(url, init);
    this.#params = params;
  }

  prompt(prompt: string) {
    return new OpenAIRequest(
      this.url,
      { headers: this.headers, method: this.method },
      { ...this.#params, prompt }
    );
  }
}

class OpenAI {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  completion(params: object) {
    const url = "https://api.openai.com/v1/completions";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    return new OpenAIRequest(url, { headers, method: "POST" }, params);
  }

  embedding(params: object) {
    const url = "https://api.openai.com/v1/embeddings";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
    return new OpenAIRequest(url, { headers, method: "POST" }, params);
  }
}

export const openai = (apiKey: string) => new OpenAI(apiKey);
