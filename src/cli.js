import fs from "fs";
import os from "os";
import path from "path";

import chalk from "chalk";
import inquirer from "inquirer";
import { Polymath } from "@polymath-ai/client";
import { Command } from "commander";

//
// MAIN
//
const program = new Command();

// TODO Get the description and version from package.json
program.name("polymath").description("A CLI for Polymath").version("0.0.1");

program.option("-d, --debug", "output extra debugging");
program.option("-c, --config <path>", "config file");

program
  .command("ask")
  .description("Ask a question to a Polymath")
  .argument("[question]", "The question to ask")
  .action(askOrComplete);

program
  .command("complete")
  .description("Ask a Polymath for a completion")
  .argument("[question]", "The question to ask")
  .action(askOrComplete);

program.parse();

//
// HELPERS
//

async function askOrComplete(question, options, command) {
  let clientOptions = loadClientOptions(options.config);

  if (!question) {
    question = await promptForQuestion();
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
      output = results.completion;
    }

    console.log(
      chalk.green("\nThe Polymath answered with:\n\n  ") + chalk.bold(output)
    );
  } catch (e) {
    console.error(`ERROR: ${e}`);
  }
}

function debug(message) {
  if (program.opts().debug) {
    console.log(chalk.blue(`DEBUG: ${message}`));
  }
}

function loadClientOptions(configOption) {
  let rawConfig;

  // if there is a configOption:
  if (configOption) {
    // try to load it as a filename
    try {
      const filename = path.resolve(configOption);
      debug(`Looking for config at: ${filename}`);

      const config = fs.readFileSync(filename, "utf8");
      rawConfig = JSON.parse(config);
    } catch (e) {
      // if that fails, try to load ~/.polymath/config/<configOption>.json
      try {
        const homeDir = os.homedir();
        const configPath = path.join(
          homeDir,
          ".polymath",
          "config",
          `${configOption}.json`
        );
        debug(`Now, looking for config at: ${configPath}`);

        const config = fs.readFileSync(configPath, "utf8");
        rawConfig = JSON.parse(config);
      } catch (e) {}
    }
  } else {
    // if that fails, try to load ~/.polymath/config/default.json
    try {
      const homeDir = os.homedir();
      const configPath = path.join(
        homeDir,
        ".polymath",
        "config",
        "default.json"
      );
      debug(`Now, looking for a default config at: ${configPath}`);

      const config = fs.readFileSync(configPath, "utf8");
      rawConfig = JSON.parse(config);
    } catch (e) {
      // if that fails, throw an error
      throw new Error(`Failed to load config for ${configOption}`);
    }
  }

  // convert a main host config into the bits needed for the Polymath
  let clientOptions = {};
  clientOptions.apiKey =
    rawConfig.default_api_key || process.env.OPENAI_API_KEY;
  if (rawConfig.client_options) {
    if (rawConfig.client_options.libraryFiles)
      clientOptions.libraryFiles = rawConfig.client_options.libraryFiles;
    if (rawConfig.client_options.pinecone)
      clientOptions.pinecone = rawConfig.client_options.pinecone;
    if (rawConfig.client_options.servers)
      clientOptions.servers = rawConfig.client_options.servers;
    if (rawConfig.client_options.omit)
      clientOptions.omit = rawConfig.client_options.omit;
    if (rawConfig.client_options.debug)
      clientOptions.debug = rawConfig.client_options.debug;
  }

  return clientOptions;
}

async function promptForQuestion() {
  let question = await inquirer.prompt({
    type: "input",
    name: "result",
    message: "What is your question?",
  });
  return question.result;
}

// TODO: wrap the main in a function and allow this so folks could load it as a module
// export function cli(args) {
// }
