export class LlmInput extends HTMLElement {
  name: string | null;

  constructor() {
    super();
    this.name = this.getAttribute("name");
  }

  asPromptPart(params: Record<string, string>): string {
    const name = this.name || "";
    const value = params[name] || "";
    return value;
  }
}

customElements.define("llm-input", LlmInput);
