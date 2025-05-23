/**
 * Provides functions for managing user warnings in a MySQL database.
 * This module allows you to add, retrieve, and remove warnings for users,
 * supporting per-guild moderation tracking.
 */

const db = require("./database.js");

// Ensures the warnings table exists in the database.
// This table stores all warnings issued to users, including moderator, reason, and timestamp.
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS warnings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      guild_id VARCHAR(32) NOT NULL,
      moderator_id VARCHAR(32) NOT NULL,
      reason TEXT NOT NULL,
      timestamp BIGINT NOT NULL
    )
  `);
}

// Adds a warning for a user in a specific guild.
async function addWarning(guildId, userId, moderatorId, reason, timestamp) {
  await ensureTable();
  await db.query(
    "INSERT INTO warnings (guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)",
    [guildId, userId, moderatorId, reason, timestamp]
  );
}

// Retrieves all warnings for a user in a specific guild, ordered by time.
async function getWarnings(guildId, userId) {
  await ensureTable();
  const [rows] = await db.query(
    "SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp ASC",
    [guildId, userId]
  );
  return rows;
}

// Removes a warning by its index (1-based) for a user in a guild.
// Returns the removed warning object, or null if not found.
async function removeWarning(guildId, userId, index) {
  await ensureTable();
  const [rows] = await db.query(
    "SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp ASC",
    [guildId, userId]
  );
  if (index < 1 || index > rows.length) return null;
  const warning = rows[index - 1];
  await db.query("DELETE FROM warnings WHERE id = ?", [warning.id]);
  return warning;
}

module.exports = { addWarning, getWarnings, removeWarning };