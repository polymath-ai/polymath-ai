import { User, Interaction } from "discord.js";

const MAX_MESSAGE_LENGTH = 2000;

const trim = (str: string) => {
  if (str.length < MAX_MESSAGE_LENGTH) {
    return str;
  }
  const truncated = " *(truncated)*";
  return `${str.substring(
    0,
    MAX_MESSAGE_LENGTH - truncated.length
  )}${truncated}`;
};

type QuestionAnswerHandler = (args: {
  question: string;
  user: User;
}) => Promise<string>;

// Captures the logic for handling a typical question-answer command.
// This function returns a function that can be passed to Discord.js's
// `client.on` method.
// Arguments:
//   handler: A function that takes an object with the following two properties:
//   - question -- The question that the user asked (string).
//   - user -- The Discord.js object representing user who asked the question.
export const questionAnswerCommand = (handler: QuestionAnswerHandler) => {
  return async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const question = interaction.options.getString("question") || "";
    try {
      await interaction.reply(`Question: **${question}**`);
      await interaction.channel?.sendTyping();
      const user = interaction.user;
      const reply = await handler({ question, user });
      await interaction.followUp(trim(reply));
    } catch (e) {
      const error = e as Error;
      console.log(error);
      await interaction.followUp({
        content: `An error has occurred:\n\`\`\`${error.message}\`\`\``,
        ephemeral: true,
      });
    }
  };
};
