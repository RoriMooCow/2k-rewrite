/**
 * Loads all command files and registers them with the Discord client.
 * This enables dynamic, modular command loading and hot-reloading.
 */

const { loadFiles } = require("../functions/fileLoader.js");
const path = require("path");

// Loads and registers all commands for the client.
// - Loads all .js files from the Commands directory.
// - Clears their cache for hot-reloading.
// - Adds each command to the client's command collection.
// - Registers all commands with Discord's API.
async function loadCommands(client) {
  console.time("Commands Loaded");

  try {
    // Load all command files and clear their cache
    const files = await loadFiles("commands");
    const commands = await Promise.all(
      files.map(async (file) => {
        try {
          const command = require(file);
          client.commands.set(command.data.name, command);
          return { Command: command.data.name, Status: "   (:   " };
        } catch (error) {
          const fileName = path.basename(file, ".js");
          console.error(`Failed to load command: ${fileName}`, error);
          return { Command: fileName, Status: "   ):   " };
        }
      })
    );

    // Register commands with Discord API (global registration)
    const commandsArray = Array.from(client.commands.values()).map((cmd) =>
      cmd.data.toJSON()
    );
    await client.application.commands.set(commandsArray);

    // Print a table of loaded commands and their status
    console.table(commands, ["Command", "Status"]);
  } catch (error) {
    console.error("Error loading commands: ", error);
  }

  console.timeEnd("Commands Loaded");
}

module.exports = { loadCommands };
