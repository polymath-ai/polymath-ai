import fs from "fs";

import { openai, Prompts } from "@polymath-ai/ai";
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

const root = new URL("../../", import.meta.url);
const logger = new Logger(`${root.pathname}/experiment.log`);
const prompts = new Prompts(root.pathname);
const QUIT_VALUE = "<quit>";

const request = openai(process.env.OPENAI_API_KEY).completion({
  model: "text-davinci-003",
});

const getData = (result: any) => result.choices[0].text.trim();

const single = async (promptFile: string, context: Record<string, string>) => {
  const prompt = prompts.get(promptFile, context);
  const response = await fetch(request.prompt(prompt));
  const result = await response.json();
  return getData(result);
};

const ask = async (
  promptFile: string,
  context: Record<string, string>
): Promise<string> => {
  const s = spinner();
  s.start("Generating text...");
  const reply = await single(promptFile, context);
  s.stop(reply);
  logger.log(`\npromptFile: ${promptFile}\n${reply}`);
  return reply;
};

const diamond = async (
  divergePromptFile: string,
  convergePromptFile: string,
  spread: number,
  context: Record<string, string>
) => {
  let prompt = prompts.get(divergePromptFile, context);
  const model = "text-davinci-003";
  const divergeSpinner = spinner();
  divergeSpinner.start("Generating divergent ideas ...");
  const responses = await Promise.all(
    Array.from({ length: spread }).map(() => {
      return fetch(request.prompt(prompt));
    })
  );
  const data = await Promise.all(responses.map((r) => r.json()));
  const replyList = data.map(getData);
  const replies = replyList
    .map((reply, i) => `== REPLY ${i} ==\n${reply}`)
    .join("\n");
  divergeSpinner.stop(replies);

  const convergeSpinner = spinner();
  convergeSpinner.start("Converging ...");
  prompt = prompts.get(convergePromptFile, { ...context, replies });
  const response = await fetch(request.prompt(prompt));
  const result = await response.json();
  const reply = getData(result);
  convergeSpinner.stop(reply);
  return reply;
};

const cycle = async (promptFiles: string[]) => {
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
    context = await ask(promptFile, { question, context });
  }
};

const program = new Command();
program
  .command("cycle")
  .argument("[prompt...]", "The prompt file to use while cycling")
  .action(async (prompts: string[]) => {
    intro("Let's experiment.");
    while (!(await cycle(prompts)));
    outro("Awesome experimenting!");
    await logger.save();
  });

program
  .command("diamond")
  .argument("[prompt...]", "The prompt file(s) to use while diamonding")
  .action(async (prompts: string[]) => {
    intro("Let's diamond.");

    const question = (await text({
      message: "Type a message or hit <Enter> to exit",
      defaultValue: QUIT_VALUE,
    })) as string;
    if (question === QUIT_VALUE) return;

    await diamond(prompts[0], prompts[1], 5, { question });
    outro("Awesome diamonding!");
    await logger.save();
  });

program.parse();
