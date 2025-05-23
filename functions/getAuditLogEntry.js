const { AuditLogEvent, Guild, GuildAuditLogsEntry } = require("discord.js");

/**
 * @param {Guild} guild - The guild to fetch logs from.
 * @param {string} userId - The user ID to match as the target.
 * @param {AuditLogEvent} actionType - The audit log action type to filter.
 * @param {(GuildAuditLogsEntry) => boolean} [filterFn] - Optional additional filter.
 * @param {number} [maxAttempts=5] - How many times to retry.
 * @param {number} [delayMs=500] - Delay between attempts in ms.
 * @param {number} [freshnessMs=10000] - How recent the entry must be in ms.
 * @returns {Promise<import('discord.js').GuildAuditLogsEntry | null>}
 */
// Fetches a relevant audit log entry for a user and action type.
// Retries up to maxAttempts with a delay, and only returns entries newer than freshnessMs.
const getAuditLogEntry = async (
  guild,
  userId,
  actionType,
  filterFn = () => true,
  maxAttempts = 5,
  delayMs = 500,
  freshnessMs = 10000
) => {
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const logs = await guild.fetchAuditLogs({
        limit: 5,
        type: actionType,
      });

      const entry = logs.entries.find(
        (entry) =>
          entry?.target?.id === userId &&
          entry?.executor &&
          filterFn(entry) &&
          Date.now() - entry.createdTimestamp < freshnessMs
      );

      if (entry) return entry;
    } catch (err) {
      console.error(`[AuditLog] Fetch failed (attempt ${attempt}):`, err);
    }

    await wait(delayMs);
  }

  return null;
};

module.exports = { getAuditLogEntry };
