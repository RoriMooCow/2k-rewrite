/**
 * Utility for fetching a relevant audit log entry for a user and action type.
 * This is used to attribute moderation actions (ban, kick, delete, etc.) to the responsible moderator.
 * Retries up to maxAttempts with a delay, and only returns entries newer than freshnessMs.
 */

const { AuditLogEvent, Guild, GuildAuditLogsEntry } = require("discord.js");

// Fetches a relevant audit log entry for a user and action type.
const getAuditLogEntry = async (
  guild,
  userId,
  actionType,
  filterFn = () => true,
  maxAttempts = 5,
  delayMs = 500,
  freshnessMs = 10000
) => {
  // Helper to wait for a specified number of milliseconds
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Fetch the most recent audit logs for the given action type
      const logs = await guild.fetchAuditLogs({
        limit: 5,
        type: actionType,
      });

      // Find the first entry matching the user, action, and filter, and within the freshness window
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

    // Wait before retrying
    await wait(delayMs);
  }

  // Return null if no matching entry is found after all attempts
  return null;
};

module.exports = { getAuditLogEntry };
