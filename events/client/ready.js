/**
 * Event: ready
 * Triggered once when the bot successfully logs in and is ready.
 * - Fetches and caches the bot owner's user ID for owner-only commands.
 * - Loads all slash commands into the client.
 */

const { loadCommands } = require("../../handlers/commandHandler.js");

module.exports = {
  name: "ready",
  once: true, // Only run once on startup
  async execute(client) {
    // Fetch and cache the bot owner's user ID for use in owner-only commands (like /reload)
    const app = await client.application.fetch();
    client.ownerId = app.owner.id;

    // Load all slash commands into the client (registers with Discord)
    loadCommands(client);
  },
};
