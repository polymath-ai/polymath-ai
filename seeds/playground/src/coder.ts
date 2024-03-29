import vm, { Context } from "node:vm";

import { Prompts } from "./prompts.js";
import { ICompleter } from "./completers.js";

// Possible problems with LLM-generated code:
// - the code is wrong (wrong approach/algo, etc.)
// - code doesn't run (throws an error, etc.)

export class Coder {
  private prompts: Prompts;
  private completer: ICompleter;

  constructor(prompts: Prompts, completer: ICompleter) {
    this.prompts = prompts;
    this.completer = completer;
  }

  async generate(promptFile: string, question: string) {
    const { completer, prompts } = this;
    const prompt = prompts.get(promptFile, { question });
    const response = await fetch(completer.request(prompt));
    const result = await response.json();
    return completer.response(result);
  }

  async run(code: string, context: Context) {
    const wrappedCode = `(async () => {
      ${code}
      await getAnswer(this);
    })();`;
    await vm.runInNewContext(wrappedCode, context);
  }

  async fix(code: string, error: string) {
    const { completer, prompts } = this;
    const prompt = prompts.get("prompts/fix-code-errors", {
      code,
      error,
    });
    const response = await fetch(completer.request(prompt));
    const result = await response.json();
    return completer.response(result);
  }
}
