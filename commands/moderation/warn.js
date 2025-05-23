/**
 * /warn command
 * Adds a warning to a user and logs it to the database and the log channel.
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const { addWarning } = require("../../functions/dbWarnings.js");
const { getSettings } = require("../../functions/dbSettings.js");

module.exports = {
  // Register the /warn command with Discord, requiring Manage Messages permission
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to warn.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the warning.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // Executes the /warn command.
  async execute(interaction) {
    // Fetch the log channel for this guild from the database
    const settings = await getSettings(interaction.guild.id);
    const logChannelId = settings?.log_channel_id;
    const logChannel = logChannelId ? await interaction.guild.channels.fetch(logChannelId) : null;

    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const moderator = interaction.user;
    const time = Date.now();

    // Prevent warning bots
    if (target.bot) {
      return await interaction.reply({
        content: "You cannot warn bots.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Add the warning to the database
    await addWarning(
      interaction.guild.id,
      target.id,
      moderator.id,
      reason,
      time
    );

    // Build the warning embed for logging
    const warnEmbed = new EmbedBuilder()
      .setColor(16776960)
      .setAuthor({
        name: "〘⚠️〙 Member Warned",
        iconURL: target.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`**${target.tag}** (<@${target.id}>) has been warned.`)
      .addFields(
        {
          name: "Moderator",
          value: `${moderator.tag} (<@${moderator.id}>)`,
          inline: true,
        },
        { name: "Reason", value: reason || "No reason provided.", inline: true }
      )
      .setFooter({ text: `User ID: ${target.id}` })
      .setTimestamp(time);

    // Notify the moderator and log the warning
    await interaction.reply({
      content: "Member has been warned.",
      flags: MessageFlags.Ephemeral,
    });
    if (logChannel) logChannel.send({ embeds: [warnEmbed] });
  },
};
