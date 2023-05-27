export type Data = Record<string, string>;

export interface IVertice {
  run(input: Data): Promise<Data>;
}

export type InputHandler = (s: string) => string;

export class Graph extends HTMLElement implements IVertice {
  connectedCallback() {
    console.log("Graph connected");
  }

  getInputs(): Record<string, InputHandler> {
    const f = (s: string): string => {
      console.log(`Processing input: ${s}`);
      return "42";
    };
    return {
      question: f,
    };
  }

  getOutputs(): Record<string, string> {
    return { answer: "42" };
  }

  async run(input: Data): Promise<Data> {
    console.log("Graph run", input);

    const result: Data = {};
    const inputs = this.getInputs();
    const outputs = this.getOutputs();
    for (const [key, value] of Object.entries(input)) {
      const handler = inputs[key];
      if (handler) result[key] = handler(value);
    }
    return Promise.resolve(result);
  }
}

customElements.define("ai-graph", Graph);
