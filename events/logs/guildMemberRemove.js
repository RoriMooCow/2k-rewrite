/**
 * Event: guildMemberRemove
 * Logs when a member is kicked from the server, including moderator and reason.
 * - Only logs if the member was kicked (not if they left voluntarily).
 * - Uses audit logs to find the kick event and moderator.
 * - Skips logging if no log channel is set.
 */

const { AuditLogEvent, EmbedBuilder, GuildMember } = require("discord.js");
const { getAuditLogEntry } = require("../../functions/getAuditLogEntry.js");
const { getSettings } = require("../../functions/dbSettings.js");

module.exports = {
  name: "guildMemberRemove",
  /**
   * Handles the guildMemberRemove event.
   * @param {GuildMember} member - The member who left or was kicked.
   */
  async execute(member, client) {
    try {
      const { guild, user } = member;

      // Fetch the log channel from the database settings for this guild
      const settings = await getSettings(guild.id);
      const logChannelId = settings?.log_channel_id;
      const logChannel = logChannelId ? await guild.channels.fetch(logChannelId) : null;

      // If no log channel is set, skip logging
      if (!logChannel) return;

      let moderator = null;
      let reason = "None specified.";
      let time = Date.now();
      let kicked = false;

      // Check audit logs for a kick event for this user
      const kickLog = await getAuditLogEntry(
        guild,
        user.id,
        AuditLogEvent.MemberKick
      );

      if (kickLog) {
        moderator = kickLog.executor;
        reason = kickLog.reason || reason;
        time = kickLog.createdTimestamp;
        kicked = true;
      }

      // Only log if the member was kicked (not if they left voluntarily)
      if (!kicked) return;

      // Build and send the log embed
      const kickEmbed = new EmbedBuilder()
        .setColor(16753920)
        .setAuthor({
          name: "〘👢〙 Member Kicked",
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`**${user.tag}** (<@${user.id}>) has been kicked.`)
        .setFields(
          {
            name: "Moderator",
            value: moderator
              ? `${moderator.tag} (<@${moderator.id}>)`
              : "Unknown Moderator",
            inline: true,
          },
          {
            name: "Reason",
            value: reason || "No reason provided.",
            inline: true,
          }
        )
        .setFooter({ text: `User ID: ${user.id}` })
        .setTimestamp(time);

      logChannel.send({ embeds: [kickEmbed] });
    } catch (error) {
      console.error("Error handling guildMemberRemove:", error);
    }
  },
};
