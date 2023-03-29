import { questionAnswerCommand } from "./commands.js";
import { config } from "dotenv";

import { Client, Events, GatewayIntentBits } from "discord.js";

async function main() {
  config();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, () => {
    console.log("Ready!");
  });

  client.on(
    Events.InteractionCreate,
    questionAnswerCommand(async ({ question, user }) => {
      return `${question}${user}`;
    })
  );

  client.login(process.env.DISCORD_TOKEN);
}

main();
