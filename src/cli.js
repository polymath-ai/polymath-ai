#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";

import chalk from "chalk";
import inquirer from "inquirer";
import { Polymath } from "@polymath-ai/client";
import { Command, Option } from "commander";
import { config } from "process";

// Allowing multiple values for a single option, collecting them in an array
const collect = (value, previous) => {
  return previous.concat([value]);
}

class CLI {
  program

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

    program
      .name("polymath")
      .description(description)
      .version(version);

    program.option("-d, --debug", "output extra debugging");
    program.option("-c, --config <path>", "config file");
    program.addOption(
      new Option("--openai-api-key <key>", "OpenAI API key").env("OPENAI_API_KEY")
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
      .action(this.askOrComplete.bind(this));

    program
      .command("complete")
      .description("Ask a Polymath for a completion")
      .argument("[question]", "The question to ask")
      .alias("completion")
      .action(this.askOrComplete.bind(this));

    program.parse();
  }

  //
  // HELPERS
  //

  async askOrComplete(question, options, command) {
    const configOption = this.program.opts().config;

    const rawConfig = this.loadRawConfig(configOption);
    let clientOptions = this.normalizeClientOptions(this.program.opts(), rawConfig);

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
        let results = await client.completion(question);

        // console.log("RESULTS: ", results);

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

  debug(message) {
    if (this.program.opts().debug) {
      console.log(chalk.blue(`DEBUG: ${message}`));
    }
  }


  // Hunt around the filesystem for a config file
  loadRawConfig(configOption) {
    let rawConfig;

    // if there is a configOption:
    if (configOption) {
      // try to load it as a filename
      try {
        const filename = path.resolve(configOption);
        this.debug(`Looking for config at: ${filename}`);

        const config = fs.readFileSync(filename, "utf8");
        rawConfig = JSON.parse(config);
      } catch (e) {
        // if that fails, try to load ~/.polymath/config/<configOption>.json
        const homeDir = os.homedir();
        const configPath = path.join(
          homeDir,
          ".polymath",
          "config",
          `${configOption}.json`
        );
        this.debug(`Now, looking for config at: ${configPath}`);

        const config = fs.readFileSync(configPath, "utf8");
        rawConfig = JSON.parse(config);
      }
    } else {
      // if that fails, try to load ~/.polymath/config/default.json
      const homeDir = os.homedir();
      const configPath = path.join(
        homeDir,
        ".polymath",
        "config",
        "default.json"
      );

      this.debug(`Now, looking for a default config at ${configPath}`);

      const config = fs.readFileSync(configPath, "utf8");
      rawConfig = JSON.parse(config);
    }
    
    return rawConfig;
  }

  // Munge together a clientOptions object from the config file and the command line
  normalizeClientOptions(programOptions, rawConfig) {
    // convert a main host config into the bits needed for the Polymath
    let clientOptions = {};

    clientOptions.apiKey =
      programOptions.openaiApiKey || rawConfig.default_api_key;

    clientOptions.servers =
      programOptions.server || rawConfig.client_options.servers || undefined;

    clientOptions.libraryFiles =
      programOptions.libraries ||
      rawConfig.client_options?.libraryFiles ||
      undefined;

    if (programOptions.pinecone) {
      clientOptions.pinecone = {
        apiKey: programOptions.pineconeApiKey,
        baseUrl: programOptions.pineconeBaseUrl,
        namespace: programOptions.pineconeNamespace,
      };
    } else if (rawConfig.client_options?.pinecone) {
      clientOptions.pinecone = rawConfig.client_options.pinecone;
    }

    if (rawConfig.client_options?.omit)
      clientOptions.omit = rawConfig.client_options.omit;

    if (rawConfig.client_options?.debug)
      clientOptions.debug = rawConfig.client_options.debug;

    return clientOptions;
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
