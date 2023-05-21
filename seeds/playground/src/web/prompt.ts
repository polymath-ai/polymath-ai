import { markdown } from "@codemirror/lang-markdown";
import { openai } from "@polymath-ai/ai";
import { EditorView, basicSetup } from "codemirror";

const OPENAI_API_KEY = localStorage.getItem("OPENAI_API_KEY") || "";

interface IPromptPart {
  asPromptPart(params: Record<string, string>): string;
  textContent: string;
}

export class LlmPrompt extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: block;
        }
      </style>
      <div id="editor"></div>`;
    const editor = new EditorView({
      doc: "TEST",
      extensions: [basicSetup, markdown()],
      parent: root.getElementById("editor") || undefined,
    });
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

  async run(params: Record<string, string> = {}) {
    const prompt = this.assemblePrompt(params);
    const response = await fetch(
      openai(OPENAI_API_KEY).completion({
        model: "text-davinci-003",
        prompt: prompt,
      })
    );
    const result = await response.json();
    return result.choices[0].text?.trim() || "";
  }
}

customElements.define("llm-prompt", LlmPrompt);
