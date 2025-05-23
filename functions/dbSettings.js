/**
 * Functions for managing per-guild settings in MySQL.
 * This module provides helpers to set and get server-specific settings,
 * such as the log channel for moderation events.
 */

const db = require("./database.js");

// Ensures the guild_settings table exists in the database.
// This table stores per-guild configuration, such as log channel IDs.
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id VARCHAR(32) PRIMARY KEY,
      log_channel_id VARCHAR(32) DEFAULT NULL
    )
  `);
}

// Sets the log channel for a specific guild.
// If the guild already has a row, updates the log_channel_id.
async function setLogChannel(guildId, channelId) {
  await ensureTable();
  await db.query(
    `INSERT INTO guild_settings (guild_id, log_channel_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE log_channel_id = VALUES(log_channel_id)`,
    [guildId, channelId]
  );
}


// Retrieves all settings for a specific guild.
// Returns an object with log_channel_id, or null if not set.
async function getSettings(guildId) {
  await ensureTable();
  const [rows] = await db.query(
    "SELECT * FROM guild_settings WHERE guild_id = ?",
    [guildId]
  );
  return rows[0] || null;
}

module.exports = { setLogChannel, getSettings };