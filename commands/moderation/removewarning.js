/**
 * /removewarning command
 * This command removes a warning from the database and logs the removal.
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const { removeWarning, getWarnings } = require("../../functions/dbWarnings.js");
const { getSettings } = require("../../functions/dbSettings.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewarning")
    .setDescription("Remove a warning from a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to remove the warning from.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("index")
        .setDescription("The index of the warning to remove.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // Executes the /removewarning command.
  async execute(interaction) {
    // Fetch the log channel for this guild from the database
    const settings = await getSettings(interaction.guild.id);
    const logChannelId = settings?.log_channel_id;
    const logChannel = logChannelId ? await interaction.guild.channels.fetch(logChannelId) : null;

    const target = interaction.options.getUser("user");
    const inputIndex = interaction.options.getInteger("index");
    const moderator = interaction.user;

    // Get all warnings for the user
    const warnings = await getWarnings(interaction.guild.id, target.id);

    if (!warnings || warnings.length === 0) {
      return await interaction.reply({
        content: "No warnings found for this member.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (inputIndex < 1 || inputIndex > warnings.length) {
      return await interaction.reply({
        content: `Invalid index. Try using /warnings to review this member's warnings.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // Remove the warning from the database
    const removedWarning = await removeWarning(
      interaction.guild.id,
      target.id,
      inputIndex
    );

    if (!removedWarning) {
      return await interaction.reply({
        content: "Failed to remove warning. Please try again.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Build the embed for logging the removal
    const unwarnEmbed = new EmbedBuilder()
      .setColor(65280)
      .setAuthor({
        name: "〘🟢〙 Warning Removed",
        iconURL: target.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `A warning was removed from **${target.tag}** (<@${target.id}>).`
      )
      .addFields(
        {
          name: "Removed by",
          value: `${moderator.tag} (<@${moderator.id}>)`,
          inline: true,
        },
        {
          name: "Originally warned by",
          value: `<@${removedWarning.moderator_id}> (ID: ${removedWarning.moderator_id})`,
          inline: true,
        },
        { name: "Warning Index", value: `#${inputIndex}`, inline: true },
        {
          name: "Original Reason",
          value: removedWarning.reason || "No reason provided.",
          inline: false,
        },
        {
          name: "Original Date",
          value: `<t:${Math.floor(removedWarning.timestamp / 1000)}:F>`,
          inline: false,
        }
      )
      .setFooter({ text: `User ID: ${target.id}` })
      .setTimestamp();

    // Log the removal and notify the moderator
    if (logChannel) logChannel.send({ embeds: [unwarnEmbed] });
    return await interaction.reply({
      content: `Removed warning #${inputIndex} from ${target.tag}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
