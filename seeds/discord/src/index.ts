import { questionAnswerCommand } from "./commands.js";
import { config } from "dotenv";

import { Client, Events, GatewayIntentBits } from "discord.js";

import { Polymath } from "@polymath-ai/client";

async function main() {
  config();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, () => {
    console.log("Ready!");
  });

  client.on(
    Events.InteractionCreate,
    questionAnswerCommand(async ({ question, user }) => {
      const polylmath = new Polymath({
        apiKey: process.env.OPENAI_API_KEY,
        servers: ["https://polymath.glazkov.com"],
      });
      const result = await polylmath.completion(question);
      const answer = result.completion;
      return `**Answering the question for ${user}**:\n${answer}`;
    })
  );

  client.login(process.env.DISCORD_TOKEN);
}

main();
