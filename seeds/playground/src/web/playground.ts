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
import { Prompt } from "./prompt.js";
import { Input } from "./input.js";

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

export class Playground extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }
        :host {
          display: flex;
        }
        #playground {
          display: flex;
          flex-direction: column;
        }
        #panels { 
          display: flex;
          flex-direction: row;
          overflow: auto;
        }

        /* .cm-editor { height: 500px; } */
        .cm-scroller { overflow: auto }

        #inputs, #controls {
          padding: 10px;
        }

        #editor {
          display: flex;
          overflow: auto;
        }

        #editor, pre {
          flex: 0.5;
          width: 50%;
        }

        pre {
          padding: 10px;
          overflow: auto;
        }
      </style>
      <div id="playground">
        <div id="inputs"></div>
        <div id="panels">
          <div id="editor"></div>
          <pre><code id="output"></code></pre>
        </div>
        <div id="controls">
          <button id="run">Run</button>
        </div>
      </div>`;
    const runButton = root.getElementById("run") as HTMLButtonElement;
    const outputElement = root.getElementById("output") as HTMLElement;
    runButton.addEventListener("click", async () => {
      runButton.disabled = true;
      const response = await this.run(this.getInputValues());
      outputElement.textContent = response;
      runButton.disabled = false;
    });
  }

  createEditor() {
    // TODO: Make work with more than one prompt.
    const prompt = this.querySelector("ai-prompt") as Prompt;
    if (!prompt) {
      console.error("No prompt found.");
      return;
    }
    const editorElement =
      (this.shadowRoot?.querySelector("#editor") as HTMLElement) || undefined;
    new EditorView({
      doc: prompt.assemblePrompt({}),
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        placeholders,
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
        }),
      ],
      parent: editorElement,
    });
  }

  createInputs() {
    const inputsElement =
      (this.shadowRoot?.querySelector("#inputs") as HTMLElement) || undefined;
    if (!inputsElement) return;
    const aiInputs = Array.from(this.querySelectorAll("ai-input")) as Input[];
    aiInputs.forEach((aiInput: Input) => {
      const inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.name = aiInput.name || "";
      inputElement.placeholder = aiInput.name || "";
      inputsElement.appendChild(inputElement);
    });
  }

  getInputValues() {
    const inputs = Array.from(this.shadowRoot?.querySelectorAll("input") || []);
    return Object.fromEntries(inputs.map((input) => [input.name, input.value]));
  }

  connectedCallback() {
    this.createEditor();
    this.createInputs();
  }

  async run(params: Record<string, string> = {}) {
    // TODO: Make work with more than one prompt.
    const promptElement = this.querySelector("ai-prompt") as Prompt;
    const prompt = promptElement.assemblePrompt(params);
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

customElements.define("ai-playground", Playground);
