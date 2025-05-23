/**
 * Provides functions for managing user warnings in a MySQL database.
 */

const db = require("./database.js");

// Ensures the warnings table exists.
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

// Adds a warning for a user.
async function addWarning(guildId, userId, moderatorId, reason, timestamp) {
  await ensureTable();
  await db.query(
    "INSERT INTO warnings (guild_id, user_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)",
    [guildId, userId, moderatorId, reason, timestamp]
  );
}

// Gets all warnings for a user in a guild.
async function getWarnings(guildId, userId) {
  await ensureTable();
  const [rows] = await db.query(
    "SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp ASC",
    [guildId, userId]
  );
  return rows;
}

// Removes a warning by its index (1-based) for a user in a guild.
// Returns the removed warning or null.
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