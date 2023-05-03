import { openai, Prompts } from "@polymath-ai/ai";
import { intro, text, outro, spinner, confirm } from "@clack/prompts";
import { config } from "dotenv";
import { Command } from "commander";

config();

const root = new URL("../../", import.meta.url);
const prompts = new Prompts(root.pathname);
const QUIT_VALUE = "<quit>";

const ask = async (
  promptFile: string,
  context: Record<string, string>
): Promise<string> => {
  const prompt = prompts.get(promptFile, context);
  const s = spinner();
  s.start("Generating text...");
  const response = await fetch(
    openai(process.env.OPENAI_API_KEY).completion({
      prompt,
      model: "text-davinci-003",
    })
  );
  const result = await response.json();
  const reply = result.choices[0].text.trim();
  s.stop(reply);
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
  });
program.parse();

