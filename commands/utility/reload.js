/**
 * /reload command
 * Allows the bot owner to reload commands or events without restarting the bot.
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const { loadCommands } = require("../../handlers/commandHandler.js");
const { loadEvents } = require("../../handlers/eventHandler.js");

module.exports = {
  // Register the /reload command with Discord, requiring Administrator permission
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads commands/events.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options.setName("commands").setDescription("Reload commands.")
    )
    .addSubcommand((options) =>
      options.setName("events").setDescription("Reloads events.")
    ),

  // Executes the /reload command.
  async execute(interaction, client) {
    // Restrict command to bot owner only
    if (interaction.user.id !== client.ownerId) {
      return await interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const subCommand = interaction.options.getSubcommand();

    try {
      if (subCommand === "commands") {
        // Reload all commands by clearing cache and re-registering
        await loadCommands(client);
        await interaction.reply({
          content: `Reloaded ${client.commands.size} commands.`,
          flags: MessageFlags.Ephemeral,
        });
      } else if (subCommand === "events") {
        // Remove all current event listeners and reload events
        for (const [key, value] of client.events) {
          client.removeListener(key, value);
        }
        await loadEvents(client);
        await interaction.reply({
          content: `Reloaded ${client.events.size} events.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      console.error(`Failed to reload ${subCommand}:`, error);
      await interaction.reply({
        content: `Failed to reload ${subCommand}.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
