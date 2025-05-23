/**
 * Event: messageDelete
 * Logs deleted messages to the server's log channel, including moderator info if available.
 * - Only logs if the message is not partial, not from a bot, and has a valid guild.
 * - Uses audit logs to attempt to find the moderator who deleted the message.
 * - Skips logging if no log channel is set or if the deleter is a bot.
 */

const { AuditLogEvent, EmbedBuilder, Message } = require("discord.js");
const { getAuditLogEntry } = require("../../functions/getAuditLogEntry.js");
const { getSettings } = require("../../functions/dbSettings.js");

module.exports = {
  name: "messageDelete",
  /**
   * Handles the messageDelete event.
   * @param {Message} message - The deleted message object.
   */
  async execute(message, client) {
    try {
      // Ignore partials, bot messages, or missing data
      if (!message.guild || message.partial || message.author.bot || !message)
        return;

      const { guild, author } = message;

      // Fetch the log channel from the database settings for this guild
      const settings = await getSettings(guild.id);
      const logChannelId = settings?.log_channel_id;
      const logChannel = logChannelId ? await guild.channels.fetch(logChannelId) : null;

      // If no log channel is set, skip logging
      if (!logChannel) return;

      let moderator = null;
      let time = Date.now();

      // Attempt to find who deleted the message via audit logs
      const deleteLog = await getAuditLogEntry(
        guild,
        author.id,
        AuditLogEvent.MessageDelete
      );

      if (deleteLog) {
        moderator = deleteLog.executor;
        time = deleteLog.createdTimestamp;
      } else {
        // If no audit log entry, skip logging (could be self-deleted or not enough permissions)
        return;
      }

      // If the moderator is a bot, skip logging
      if (moderator.bot) return;

      // Build and send the log embed
      const deleteEmbed = new EmbedBuilder()
        .setColor(16776960)
        .setAuthor({
          name: "〘🗑️〙 Message Deleted",
          iconURL: author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `A message from **${author.tag}** (<@${author.id}>) was deleted.`
        )
        .addFields({
          name: "Moderator",
          value: moderator
            ? `${moderator.tag} (<@${moderator.id}>)`
            : "Unknown Moderator",
          inline: true,
        })
        .setFooter({ text: `User ID: ${author.id}` })
        .setTimestamp(time);

      logChannel.send({ embeds: [deleteEmbed] });
    } catch (error) {
      console.error("Error handling messageDelete:", error);
    }
  },
};
