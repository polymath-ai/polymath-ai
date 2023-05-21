export class LlmInput extends HTMLElement {
  name: string | null;

  constructor() {
    super();
    this.name = this.getAttribute("name");
  }
}

customElements.define("llm-input", LlmInput);
