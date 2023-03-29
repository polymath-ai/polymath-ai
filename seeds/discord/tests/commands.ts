import test from "ava";

import { questionAnswerCommand } from "../src/commands.js";

import { Interaction, CacheType } from "discord.js";

test("questionAnswerCommand returns results", async (t) => {
  const handler = questionAnswerCommand(async ({ question, user }) => {
    return `${user}:${question}`;
  });

  const interaction = {
    isChatInputCommand: () => true,
    options: {
      getString: () => "question",
    },
    user: "user",
    reply: async (message: string) => {
      t.is(message, "Question: **question**");
    },
    channel: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      sendTyping: async () => {},
    },
    followUp: async (message: string) => {
      t.is(message, "user:question");
    },
  };

  // TODO: Do something about this terrible cast abomination.
  await handler(interaction as unknown as Interaction<CacheType>);
});

test("questionAnswerCommand handles errors", async (t) => {
  const handler = questionAnswerCommand(async () => {
    throw new Error("error");
  });

  const interaction = {
    isChatInputCommand: () => true,
    options: {
      getString: () => "question",
    },
    user: "user",
    replied: true,
    reply: async (message: string) => {
      t.is(message, "Question: **question**");
    },
    channel: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      sendTyping: async () => {},
    },
    followUp: async ({
      content,
      ephemeral,
    }: {
      content: string;
      ephemeral: boolean;
    }) => {
      t.is(content, "An error has occurred:\n```error```");
      t.true(ephemeral);
    },
  };

  await handler(interaction as unknown as Interaction<CacheType>);
});

test("questionAnswerCommand handles long messages", async (t) => {
  const handler = questionAnswerCommand(async () => {
    return "a".repeat(2001);
  });

  const interaction = {
    isChatInputCommand: () => true,
    options: {
      getString: () => "question",
    },
    user: "user",
    reply: async (message: string) => {
      t.is(message, "Question: **question**");
    },
    channel: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      sendTyping: async () => {},
    },
    followUp: async (message: string) => {
      t.is(message.length, 2000);
      t.true(message.endsWith(" *(truncated)*"));
    },
  };

  await handler(interaction as unknown as Interaction<CacheType>);
});
