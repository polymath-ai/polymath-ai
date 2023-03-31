import { config } from "dotenv";
import { Client, Events, GatewayIntentBits } from "discord.js";

import { PolymathEndpoint } from "@polymath-ai/client";
import { Bit, EndpointArgs } from "@polymath-ai/types";

import { questionAnswerCommand } from "./commands.js";
import { AI } from "./ai.js";

const REASONABLE_CONTEXT_WINDOW = 4000;
const MAX_SOURCES_PER_PARTICIPANT = 3;

const knownParticipants: Record<string, string> = {
  Dion: "https://polymath.almaer.com",
  // For some reasone, this all barfs when Alex's endpoint is included.
  // TODO: Figure out why.
  // Alex: "https://polymath.komoroske.com",
  Dimitri: "https://polymath.glazkov.com",
};

type Context = {
  participant: string;
  context: string;
  urls: string[];
};

const createDirectionsPrompt = (question: string) => {
  const names = Object.keys(knownParticipants).join(", ");
  return `Given a request, analyze it and discern participants in this request using the list of all known participants, then synthesize the "general request" that each individual participant must be asked in order to fulfill the request, so that their answers could be later compared. This "general request" must be the same for each participant. The "general request" must not mention participants by name, addressing them as "you". The "general request" must not mention other participants.

The list of all known participants is: ${names}. Reply with only the participants that are part of the request or an empty list if none of these participants were mentioned. If an unknown participant was mentioned, omit them from the list.
  
Reply as a JSON object with these keys: "participants" (a list),  "request".
  
Request: "${question}"
Answer:`;
};

const createSynthesisPrompt = (question: string, context: Context[]) => {
  return `Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "I don't know". 

Context is partitioned into sections of multiple participant. Each section begins with "<participant's name> says:" and denotes the perspective, presented by this participant. When answering the question, make sure to acknowledge each participant's perspective in your answer.
  
Context:

${context
  .map(
    (c) => `${c.participant} says:
${c.context}`
  )
  .join("\n\n")}
  
Question: "${question}"
Answer:`;
};

async function main() {
  config();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, () => {
    console.log("Ready!");
  });

  client.on(
    Events.InteractionCreate,
    questionAnswerCommand(async ({ question, user }) => {
      const ai = new AI({
        apiKey: process.env.OPENAI_API_KEY || "",
      });
      const directionPrompt = createDirectionsPrompt(question);
      const directionsResult = await ai.completion(directionPrompt);
      console.log(directionsResult);

      const directions = JSON.parse(directionsResult);
      console.log(directions);

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
            console.log("Asking server: ", server);
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
      console.log("context", context);
      const synthesisPrompt = createSynthesisPrompt(question, context);
      const synthesisResult = await ai.completion(synthesisPrompt);
      const sources = []
        .concat(...context.map((c) => c.urls))
        .map((url) => `:link: <${url}>`)
        .join("\n");
      console.log(synthesisResult);
      return `**Answering the question for ${user}**:\n
${synthesisResult}\n
**Sources**:
      ${sources}`;
    })
  );

  client.login(process.env.DISCORD_TOKEN);
}

main();
