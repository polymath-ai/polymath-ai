import { openai, Prompts } from "@polymath-ai/ai";
import { intro, text, outro, spinner, confirm } from "@clack/prompts";
import { config } from "dotenv";
import { Command } from "commander";

config();

const root = new URL("../../", import.meta.url);
const prompts = new Prompts(root.pathname);
const QUIT_VALUE = "<quit>";

const single = async (promptFile: string, context: Record<string, string>) => {
  const prompt = prompts.get(promptFile, context);
  const response = await fetch(
    openai(process.env.OPENAI_API_KEY).completion({
      prompt,
      model: "text-davinci-003",
    })
  );
  const result = await response.json();
  return result.choices[0].text.trim();
};

const ask = async (
  promptFile: string,
  context: Record<string, string>
): Promise<string> => {
  const s = spinner();
  s.start("Generating text...");
  const reply = await single(promptFile, context);
  s.stop(reply);
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
      return fetch(
        openai(process.env.OPENAI_API_KEY).completion({
          prompt,
          model,
        })
      );
    })
  );
  const data = await Promise.all(responses.map((r) => r.json()));
  const replyList = data.map((d) => d.choices[0].text.trim());
  const replies = replyList
    .map((reply, i) => `== REPLY ${i} ==\n${reply}`)
    .join("\n");
  divergeSpinner.stop(replies);

  const convergeSpinner = spinner();
  convergeSpinner.start("Converging ...");
  prompt = prompts.get(convergePromptFile, { ...context, replies });
  const response = await fetch(
    openai(process.env.OPENAI_API_KEY).completion({
      prompt,
      model,
    })
  );
  const result = await response.json();
  const reply = result.choices[0].text.trim();
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
  }); 


program.parse();

