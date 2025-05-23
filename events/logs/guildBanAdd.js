/**
 * Event: guildBanAdd
 * Logs when a user is banned from the server, including moderator and reason.
 * - Uses audit logs to find the ban event and moderator.
 * - Skips logging if no log channel is set.
 */

const { GuildBan, EmbedBuilder, AuditLogEvent } = require("discord.js");
const { getAuditLogEntry } = require("../../functions/getAuditLogEntry.js");
const { getSettings } = require("../../functions/dbSettings.js");

module.exports = {
  name: "guildBanAdd",
  /**
   * Handles the guildBanAdd event.
   * @param {GuildBan} ban - The ban object containing the user and guild.
   */
  async execute(ban, client) {
    try {
      const { user, guild } = ban;

      // Fetch the log channel from the database settings for this guild
      const settings = await getSettings(guild.id);
      const logChannelId = settings?.log_channel_id;
      const logChannel = logChannelId ? await guild.channels.fetch(logChannelId) : null;

      // If no log channel is set, skip logging
      if (!logChannel) return;

      let moderator = null;
      let reason = "None specified.";
      let time = Date.now();

      // Check audit logs for a ban event for this user
      const banLog = await getAuditLogEntry(
        guild,
        user.id,
        AuditLogEvent.MemberBanAdd
      );

      if (banLog) {
        moderator = banLog.executor;
        reason = banLog.reason || reason;
        time = banLog.createdTimestamp;
      }

      // Build and send the log embed
      const banEmbed = new EmbedBuilder()
        .setColor(16711680)
        .setAuthor({
          name: "〘⛔〙 Member Banned",
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`**${user.tag}** (<@${user.id}>) has been banned.`)
        .addFields(
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

      logChannel.send({ embeds: [banEmbed] });
    } catch (error) {
      console.error("Error handling guildBanAdd:", error);
    }
  },
};
