import fs from "fs";

import {
  ChatCompletionResponse,
  CompletionRequest,
  CompletionResponse,
  openai,
  OpenAIRequest,
  Prompts,
} from "@polymath-ai/ai";
import { intro, text, outro, spinner, confirm } from "@clack/prompts";
import { config } from "dotenv";
import { Command } from "commander";

config();

class Logger {
  private filename: string;
  private lines: string[] = [];

  constructor(filename: string) {
    this.filename = filename;
  }

  log(message: string) {
    this.lines.push(message);
  }

  async save() {
    await new Promise<void>((resolve) => {
      fs.appendFile(this.filename, this.lines.join("\n"), (err) => {
        if (err) throw err;
        resolve();
      });
    });
  }
}

interface ICompleter {
  ask(prompt: string): Request;
  data(response: unknown): string;
}

class Completer implements ICompleter {
  request: OpenAIRequest<CompletionRequest>;
  constructor() {
    this.request = openai(process.env.OPENAI_API_KEY).completion({
      model: "text-davinci-003",
    });
  }

  ask(prompt: string) {
    return this.request.prompt(prompt);
  }

  data(response: unknown): string {
    return (response as CompletionResponse).choices[0].text?.trim() || "";
  }
}

class ChatCompleter implements ICompleter {
  ask(prompt: string) {
    const messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [];
    messages.push({
      role: "user",
      content: prompt,
    });
    return openai(process.env.OPENAI_API_KEY).chatCompletion({
      model: "gpt-4",
      messages,
    });
  }

  data(response: unknown): string {
    return (
      (response as ChatCompletionResponse).choices[0].message?.content || ""
    );
  }
}

const root = new URL("../../", import.meta.url);
const logger = new Logger(`${root.pathname}/experiment.log`);
const prompts = new Prompts(root.pathname);
const QUIT_VALUE = "<quit>";

const single = async (
  completer: ICompleter,
  promptFile: string,
  context: Record<string, string>
) => {
  const prompt = prompts.get(promptFile, context);
  const response = await fetch(completer.ask(prompt));
  const result = await response.json();
  return completer.data(result);
};

const ask = async (
  completer: ICompleter,
  promptFile: string,
  context: Record<string, string>
): Promise<string> => {
  const s = spinner();
  s.start("Generating text...");
  const reply = await single(completer, promptFile, context);
  s.stop(reply);
  logger.log(`\npromptFile: ${promptFile}\n${reply}`);
  return reply;
};

const diamond = async (
  completer: ICompleter,
  divergePromptFile: string,
  convergePromptFile: string,
  spread: number,
  context: Record<string, string>
) => {
  let prompt = prompts.get(divergePromptFile, context);
  const divergeSpinner = spinner();
  divergeSpinner.start("Generating divergent ideas ...");
  const responses = await Promise.all(
    Array.from({ length: spread }).map(() => {
      return fetch(completer.ask(prompt));
    })
  );
  const data = await Promise.all(responses.map((r) => r.json()));
  const replyList = data.map((r) => completer.data(r));
  const replies = replyList
    .map((reply, i) => `== REPLY ${i} ==\n${reply}`)
    .join("\n");
  divergeSpinner.stop(replies);

  const convergeSpinner = spinner();
  convergeSpinner.start("Converging ...");
  prompt = prompts.get(convergePromptFile, { ...context, replies });
  const response = await fetch(completer.ask(prompt));
  const result = await response.json();
  const reply = completer.data(result);
  convergeSpinner.stop(reply);
  return reply;
};

const cycle = async (completer: ICompleter, promptFiles: string[]) => {
  const question = (await text({
    message: "Type a message or hit <Enter> to exit",
    defaultValue: QUIT_VALUE,
  })) as string;
  if (question === QUIT_VALUE) {
    const shouldQuit = await confirm({
      message: "Are you sure you want to quit?",
    });
    return shouldQuit;
  }
  logger.log(`\nquestion: ${question}`);

  let context = "";
  for (const promptFile of promptFiles) {
    context = await ask(completer, promptFile, { question, context });
  }
};

const program = new Command();
program.option("-c, --chat", "Use chat mode");

program
  .command("cycle")
  .argument("[prompt...]", "The prompt file to use while cycling")
  .action(async (prompts: string[]) => {
    const opts = program.opts();
    const completer = opts.chat ? new ChatCompleter() : new Completer();
    intro(`Let's cycle. ${opts.chat ? "(uses chat)" : ""}`);
    while (!(await cycle(completer, prompts)));
    outro("Awesome cycling!");
    await logger.save();
  });

program
  .command("diamond")
  .argument("[prompt...]", "The prompt file(s) to use while diamonding")
  .action(async (prompts: string[]) => {
    const opts = program.opts();
    const completer = opts.chat ? new ChatCompleter() : new Completer();
    intro(`Let's diamond. ${opts.chat ? "(uses chat)" : ""}.`);
    const question = (await text({
      message: "Type a message or hit <Enter> to exit",
      defaultValue: QUIT_VALUE,
    })) as string;
    if (question === QUIT_VALUE) return;

    await diamond(completer, prompts[0], prompts[1], 5, { question });
    outro("Awesome diamonding!");
    await logger.save();
  });

program.parse();
