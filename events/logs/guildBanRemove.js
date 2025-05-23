/**
 * Event: guildBanRemove
 * Logs when a user is unbanned from the server, including moderator info if available.
 * - Uses audit logs to find the unban event and moderator.
 * - Skips logging if no log channel is set.
 */

const { GuildBan, EmbedBuilder, AuditLogEvent } = require("discord.js");
const { getAuditLogEntry } = require("../../functions/getAuditLogEntry.js");
const { getSettings } = require("../../functions/dbSettings.js");

module.exports = {
  name: "guildBanRemove",
  /**
   * Handles the guildBanRemove event.
   * @param {GuildBan} unban - The unban object containing the user and guild.
   */
  async execute(unban, client) {
    try {
      const { user, guild } = unban;

      // Fetch the log channel from the database settings for this guild
      const settings = await getSettings(guild.id);
      const logChannelId = settings?.log_channel_id;
      const logChannel = logChannelId ? await guild.channels.fetch(logChannelId) : null;

      // If no log channel is set, skip logging
      if (!logChannel) return;

      let moderator = null;
      let time = Date.now();

      // Check audit logs for an unban event for this user
      const unbanLog = await getAuditLogEntry(
        guild,
        user.id,
        AuditLogEvent.MemberBanRemove
      );

      if (unbanLog) {
        moderator = unbanLog.executor;
        time = unbanLog.createdTimestamp;
      }

      // Build and send the log embed
      const unbanEmbed = new EmbedBuilder()
        .setColor(65280)
        .setAuthor({
          name: "〘🟢〙Member Unbanned",
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`**${user.tag}** (<@${user.id}>) has been unbanned.`)
        .setFields({
          name: "Moderator",
          value: moderator
            ? `${moderator.tag} (<@${moderator.id}>)`
            : "Unknown Moderator",
          inline: true,
        })
        .setFooter({ text: `User ID: ${user.id}` })
        .setTimestamp(time);

      logChannel.send({ embeds: [unbanEmbed] });
    } catch (error) {
      console.error("Error handling guildBanRemove:", error);
    }
  },
};
