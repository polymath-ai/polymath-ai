import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { openai } from "@polymath-ai/ai";
import { EditorView, basicSetup } from "codemirror";
import {
  MatchDecorator,
  ViewPlugin,
  WidgetType,
  Decoration,
  ViewUpdate,
} from "@codemirror/view";

class PlaceholderWidget extends WidgetType {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
  eq(other: PlaceholderWidget) {
    return this.name == other.name;
  }
  toDOM() {
    const span = document.createElement("span");
    span.style.cssText = `
    border: none;
    border-radius: 3px;
    padding: 0 3px;
    background: lightblue;`;
    span.textContent = this.name;
    return span;
  }
  ignoreEvent() {
    return false;
  }
}

const placeholders = ViewPlugin.fromClass(
  class {
    placeholders;

    constructor(view: EditorView) {
      this.placeholders = placeholderMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.placeholders = placeholderMatcher.updateDeco(
        update,
        this.placeholders
      );
    }
  },
  {
    decorations: (instance) => instance.placeholders,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholders || Decoration.none;
      }),
  }
);

const placeholderMatcher = new MatchDecorator({
  regexp: /\$\{(\w+)\}/g,
  decoration: (match) =>
    Decoration.replace({
      widget: new PlaceholderWidget(match[1]),
    }),
});

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
      </style>`;
  }

  connectedCallback() {
    new EditorView({
      doc: this.assemblePrompt({}),
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        placeholders,
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
        }),
      ],

      parent: this.shadowRoot || undefined,
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
