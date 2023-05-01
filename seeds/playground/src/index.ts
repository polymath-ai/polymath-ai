import { openai, Prompts } from "@polymath-ai/ai";
import { intro, text, outro, spinner, confirm } from "@clack/prompts";
import { config } from "dotenv";

config();

const root = new URL("../../prompts", import.meta.url);
const prompts = new Prompts(root.pathname);
const QUIT_VALUE = "<quit>";

const cycle = async () => {
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

  const prompt = prompts.get("situation", { question });
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
};

intro("Let's experiment.");

while (!(await cycle()));

outro("Awesome experimenting!");
