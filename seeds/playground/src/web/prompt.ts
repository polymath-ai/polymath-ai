interface IPromptPart {
  asPromptPart(params: Record<string, string>): string;
  textContent: string;
}

export class Prompt extends HTMLElement {
  constructor() {
    super();
  }
  assemblePrompt(params: Record<string, string> = {}) {
    return Array.from(this.childNodes)
      .map((child) => {
        const part = child as unknown as IPromptPart;
        return part.asPromptPart ? part.asPromptPart(params) : part.textContent;
      })
      .join("")
      .trim();
  }
}

customElements.define("ai-prompt", Prompt);
