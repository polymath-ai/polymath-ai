import { config } from "dotenv";
import { Client, Events, GatewayIntentBits } from "discord.js";

import { PolymathEndpoint } from "@polymath-ai/client";
import { Bit, EndpointArgs } from "@polymath-ai/types";

import { questionAnswerCommand } from "./commands.js";
import { AI } from "./ai.js";
import { Prompts } from "./prompts.js";

const REASONABLE_CONTEXT_WINDOW = 4000;
const MAX_SOURCES_PER_PARTICIPANT = 3;

// TODO: Don't hardcode this.
const knownParticipants: Record<string, string> = {
  Dion: "https://polymath.almaer.com",
  // Currently returns "Could not discover endpoint"
  // TODO: Figure out why.
  // Paul: "https://paul.kinlan.me/polymath",
  // For some reasons, this all barfs when Alex's endpoint is included.
  // TODO: Figure out why.
  // Alex: "https://polymath.komoroske.com",
  Dimitri: "https://polymath.glazkov.com",
};

type Context = {
  participant: string;
  context: string;
  urls: string[];
};

const root = new URL("../..", import.meta.url);
const prompts = new Prompts(root.pathname);

const createDirectionsPrompt = (question: string) => {
  const names = Object.keys(knownParticipants).join(", ");
  return prompts.get("directions", {
    names,
    question,
  });
};

const createSummarizingPrompt = (question: string, contexts: Context[]) => {
  const context = contexts
    .map((c) => `==${c.participant} says==\n${c.context}`)
    .join("\n\n");
  return prompts.get("summarize", {
    context,
    question,
  });
};

async function main() {
  config();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  });

  client.once(Events.ClientReady, () => {
    console.log("Ready!");
  });

  client.on(Events.MessageCreate, async (message) => {
    console.log("message", message.content);
  });

  client.on(
    Events.InteractionCreate,
    questionAnswerCommand(async ({ question, user }) => {
      const ai = new AI({
        apiKey: process.env.OPENAI_API_KEY || "",
      });
      const directionsResult = await ai.completion(
        createDirectionsPrompt(question)
      );

      const directions = JSON.parse(directionsResult);

      if (directions.participants?.length === 0) {
        directions.participants.concat(knownParticipants);
      }

      const query_embedding = await ai.embedding(directions.request);
      const token_count =
        REASONABLE_CONTEXT_WINDOW / directions.participants.length;

      const context = (
        await Promise.all(
          directions.participants.map((name: string) => {
            if (!knownParticipants[name]) {
              throw new Error(`Unknown participant: ${name}`);
            }
            const server = knownParticipants[name];
            const endpoint = new PolymathEndpoint(server);
            const args: EndpointArgs = {
              version: 1,
              query_embedding_model: "openai.com:text-embedding-ada-002",
              query_embedding,
              count_type: "token",
              count: token_count,
            };
            return endpoint.ask(args);
          })
        )
      ).map((data, i) => {
        return {
          participant: directions.participants[i],
          context: data.bits.map((bit: Bit) => bit.text).join("\n"),
          urls: data.bits
            .map((bit: Bit) => bit.info?.url)
            .slice(0, MAX_SOURCES_PER_PARTICIPANT),
        };
      });
      const summary = await ai.completion(
        createSummarizingPrompt(question, context)
      );
      const sources = []
        .concat(...context.map((c) => c.urls))
        .map((url) => `:link: <${url}>`)
        .join("\n");
      return `**Answering the question for ${user}**:\n
${summary}\n
**Sources**:
${sources}`;
    })
  );

  client.login(process.env.DISCORD_TOKEN);
}

main();
