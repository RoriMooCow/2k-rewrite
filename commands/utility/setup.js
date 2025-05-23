/**
 * /setup command
 * Lets administrators set the log channel for the current server.
 * This channel will be used for moderation logs and warnings.
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const { setLogChannel } = require("../../functions/dbSettings.js");

module.exports = {
  // Register the /setup command with Discord, requiring Administrator permission
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configure server settings.")
    .addChannelOption(option =>
      option
        .setName("log_channel")
        .setDescription("Channel for moderation logs")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  // Executes the /setup command.
  async execute(interaction) {
    const channel = interaction.options.getChannel("log_channel");
    // Save the selected channel as the log channel for this guild
    await setLogChannel(interaction.guild.id, channel.id);

    await interaction.reply({
      content: `Log channel set to <#${channel.id}>.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};