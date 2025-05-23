/**
 * Event: interactionCreate
 * Handles all incoming interactions (slash commands, context menus, etc).
 * - Only processes chat input (slash) commands.
 * - Looks up the command in the client's command collection and executes it.
 * - Replies with an error if the command is not found.
 */

const { ChatInputCommandInteraction, MessageFlags } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  // Handles the interactionCreate event.
  execute(interaction, client) {
    // Only handle chat input (slash) commands
    if (!interaction.isChatInputCommand()) return;

    // Look up the command by name
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "This command is outdated.",
        flags: MessageFlags.Ephemeral,
      });

    // Execute the command, passing both interaction and client
    command.execute(interaction, client);
  },
};
