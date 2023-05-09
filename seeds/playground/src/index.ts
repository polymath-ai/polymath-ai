import fs from "fs";

import { Prompts } from "@polymath-ai/ai";
import { intro, text, outro, spinner, confirm } from "@clack/prompts";
import { config } from "dotenv";
import { Command } from "commander";
import { Validator } from "jsonschema";
import type { Schema } from "jsonschema";
import { ChatCompleter, Completer, ICompleter } from "./completers.js";
import { Logger } from "./logger.js";

config();

const root = new URL("../../", import.meta.url);
const logger = new Logger(`${root.pathname}/experiment.log`);
const prompts = new Prompts(root.pathname);
const QUIT_VALUE = "<quit>";

const ask = async (
  completer: ICompleter,
  promptFile: string,
  context: Record<string, string>
): Promise<string> => {
  const s = spinner();
  s.start("Generating text...");
  const prompt = prompts.get(promptFile, context);
  const response = await fetch(completer.request(prompt));
  const result = await response.json();
  const reply = completer.response(result);
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
      return fetch(completer.request(prompt));
    })
  );
  const data = await Promise.all(responses.map((r) => r.json()));
  const replyList = data.map((r) => completer.response(r));
  const replies = replyList
    .map((reply, i) => `== REPLY ${i} ==\n${reply}`)
    .join("\n");
  divergeSpinner.stop(replies);

  const convergeSpinner = spinner();
  convergeSpinner.start("Converging ...");
  prompt = prompts.get(convergePromptFile, { ...context, replies });
  const response = await fetch(completer.request(prompt));
  const result = await response.json();
  const reply = completer.response(result);
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

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

// Because literally that's what it is.
type Schemish = JSONValue;

// TODO: This is not a great converter. But it'll do for now.
const toSchemish = (schema: Schema) => {
  const walker = (schema: Schema): Schemish => {
    if (schema.type === "string") {
      return schema.description || "";
    }
    if (schema.type === "object") {
      const result: Schemish = {};
      const properties = schema.properties as Record<string, Schema>;
      for (const [name, property] of Object.entries(properties)) {
        result[name] = walker(property);
      }
      return result;
    }
    if (schema.type === "array") {
      const items = (schema.items as Schema) || {};
      return [walker(items)];
    }
    console.log(schema);
    throw new Error(
      "I am just a simple Schemish converter. I don't understand your fancy types and formats. Yet."
    );
  };

  return walker(schema);
};

const reason = async (
  completer: ICompleter,
  question: string,
  config: string
) => {
  logger.log(`\nconfig: ${config}`);

  const configUrl = new URL(`./boxes/${config}.json`, root);
  const data = await fs.promises.readFile(configUrl, "utf8");

  const { prompt, schema } = JSON.parse(data);
  const promptURL = new URL(prompt, configUrl);
  const preamble = await fs.promises.readFile(promptURL, "utf8");
  const schemish = JSON.stringify(toSchemish(schema), null, 2);

  const box = prompts.get("prompts/proto-box", {
    preamble,
    schemish,
    question,
  });

  const response = await fetch(completer.request(box));
  const result = await response.json();
  const reply = completer.response(result);

  const output = JSON.parse(reply);
  const validator = new Validator();
  const validationResult = validator.validate(output, schema);
  return `${
    validationResult.valid ? "Valid" : "Invalid"
  } JSON response:\n${reply}`;
};

const cycleBox = async (completer: ICompleter, config: string) => {
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
  const s = spinner();
  s.start("Reasoning...");

  const reply = await reason(completer, question, config);

  s.stop(reply);
};

const program = new Command();
program.option("-c, --chat", "Use chat mode");

program
  .command("reason")
  .argument("[config]", "The reasoning box configuration to use")
  .action(async (config: string) => {
    const opts = program.opts();
    const completer = opts.chat ? new ChatCompleter() : new Completer();
    intro(`Let's reason. ${opts.chat ? "(uses chat)" : ""}`);
    while (!(await cycleBox(completer, config)));
    outro("Awesome reasoning!");
    await logger.save();
  });

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
