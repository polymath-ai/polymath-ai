#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";

import chalk from "chalk";
import inquirer from "inquirer";
import { Polymath } from "@polymath-ai/client";
import { Command, Option } from "commander";

import { Options } from "./options.js";
import { actor } from "./action.js";
import { Ask } from "./actions/ask.js";

// Allowing multiple values for a single option, collecting them in an array
const collect = (value, previous) => {
  return previous.concat([value]);
};

class CLI {
  program;

  constructor() {
    this.program = new Command();
  }

  loadVersionInfo() {
    // Get the description and version from our own package.json
    return JSON.parse(fs.readFileSync("./package.json", "utf8"));
  }

  run() {
    const program = this.program;
    const { version, description } = this.loadVersionInfo();

    program.name("polymath").description(description).version(version);

    program.option("-d, --debug", "output extra debugging");
    program.option("-c, --config <path>", "config file");
    program.addOption(
      new Option("--openai-api-key <key>", "OpenAI API key").env(
        "OPENAI_API_KEY"
      )
    );
    program.option(
      "-s, --server <endpoint>",
      "Polymath server endpoint",
      collect,
      []
    );
    program.option(
      "-l, --libraries <libOrDirectory>",
      "Library files or directory"
    );

    program.option("-p, --pinecone", "Use pinecone");
    program.addOption(
      new Option("--pinecone-api-key <key>", "pinecone api key").env(
        "PINECONE_API_KEY"
      )
    );
    program.addOption(
      new Option("--pinecone-base-url <url>", "pinecone base url").env(
        "PINECONE_BASE_URL"
      )
    );
    program.addOption(
      new Option("--pinecone-namespace <namespace>", "pinecone namespace").env(
        "PINECONE_NAMESPACE"
      )
    );

    //
    // SUB COMMANDS
    //

    program
      .command("ask")
      .description("Ask a question to a Polymath")
      .argument("[question]", "The question to ask")
      .action(actor(Ask, program));

    program
      .command("complete")
      .description("Ask a Polymath for a completion")
      .argument("[question]", "The question to ask")
      .option("-m, --completion-model <model>", "the completion model to use")
      .option(
        "--completion-system <system-message>",
        "add a system prompt for the chat message completion"
      )
      .option(
        "--completion-temperature <temp>",
        "the completion temperature (0-2)"
      )
      .option(
        "--completion-max-tokens <max-tokens>",
        "the max tokens for completion"
      )
      .option("--completion-top-p <top-p>", "the top_p for completion")
      .option("--completion-n <n>", "the n for completion")
      .option("--completion-stream <stream>", "the stream for completion")
      .option("--completion-stop <stop>", "the stop for completion")
      .option(
        "--completion-prompt-template <prompt>",
        "a prompt template to rewrite"
      )
      .alias("completion")
      .action(this.askOrComplete.bind(this));

    program.parse();
  }

  //
  // HELPERS
  //

  async askOrComplete(question, options, command) {
    const configOption = this.program.opts().config;

    const opts = new Options();

    const rawConfig = opts.loadRawConfig(configOption);
    let clientOptions = opts.normalizeClientOptions(
      this.program.opts(),
      rawConfig
    );

    // console.log("CLIENT OPTIONS", clientOptions);

    if (!question) {
      question = await this.promptForQuestion();
    }

    console.log(chalk.green("\nYou asked: ") + chalk.bold(question));

    try {
      let client = new Polymath(clientOptions);

      let output;

      if (command == "ask") {
        let results = await client.ask(question);
        output = results.context();
      } else {
        // completion
        let completionOptions = opts.normalizeCompletionOptions(
          options,
          rawConfig
        );

        let results = await client.completion(
          question,
          null,
          null,
          completionOptions
        );

        let sources = results.infos
          ?.map((info) => {
            return chalk.dim(
              "Source: " + (info.title || info.description) + "\n" + info.url
            );
          })
          .join("\n\n");

        output = results.completion + "\n\n" + sources;
      }

      console.log(
        chalk.green("\nThe Polymath answered with:\n\n  ") + chalk.bold(output)
      );
    } catch (e) {
      console.error(`ERROR: ${e}`);
    }
  }

  // Ask the dear listener for a question as they didn't provide one to the CLI
  async promptForQuestion() {
    let question = await inquirer.prompt({
      type: "input",
      name: "result",
      message: "What is your question?",
    });
    return question.result;
  }
}

new CLI().run();

// TODO: wrap the main in a function and allow this so folks could load it as a module
// export function cli(args) {
//   console.log(args);
// }
