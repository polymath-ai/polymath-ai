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

        #editor {
          display: flex;
        }

        #editor, pre {
          flex: 0.5;
          width: 50%;
        }

        pre {
          overflow: auto;
        }
      </style>
      <div id="playground">
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
      const response = await this.run({
        question: "Will it rain tomorrow?",
      });
      outputElement.textContent = response;
      runButton.disabled = false;
    });
  }

  connectedCallback() {
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
