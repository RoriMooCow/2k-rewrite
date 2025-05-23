/**
 * Functions for managing per-guild settings in MySQL.
 */

const db = require("./database.js");

// Ensure the settings table exists
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id VARCHAR(32) PRIMARY KEY,
      log_channel_id VARCHAR(32) DEFAULT NULL
    )
  `);
}

// Set a log channel for a guild.
async function setLogChannel(guildId, channelId) {
  await ensureTable();
  await db.query(
    `INSERT INTO guild_settings (guild_id, log_channel_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE log_channel_id = VALUES(log_channel_id)`,
    [guildId, channelId]
  );
}


// Get settings for a guild.
// Returns { log_channel_id } or null.
async function getSettings(guildId) {
  await ensureTable();
  const [rows] = await db.query(
    "SELECT * FROM guild_settings WHERE guild_id = ?",
    [guildId]
  );
  return rows[0] || null;
}

module.exports = { setLogChannel, getSettings };