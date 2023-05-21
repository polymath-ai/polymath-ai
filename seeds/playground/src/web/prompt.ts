import { JSONValue } from "../schemish.js";

export class LlmPrompt extends HTMLElement {
  has: JSONValue = [];
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `;
    const slot = root.querySelector("slot");
    slot?.addEventListener("slotchange", () => {
      this.has = Array.from(slot.assignedNodes()).map((node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent as JSONValue;
        }
        return node as unknown as JSONValue;
      });
      console.log("slotchange", this.has);
    });
  }
}

customElements.define("llm-prompt", LlmPrompt);
