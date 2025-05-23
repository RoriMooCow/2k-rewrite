/**
 * Loads all event files and registers them with the Discord client.
 * This enables dynamic, modular event loading and hot-reloading.
 */

const { loadFiles } = require("../functions/fileLoader.js");

// Loads and registers all events for the client.
// - Loads all .js files from the Events directory.
// - Clears their cache for hot-reloading.
// - Adds each event to the client's event collection.
// - Registers each event with the Discord client (once or on).
async function loadEvents(client) {
  console.time("Events Loaded");

  try {
    // Load all event files and clear their cache
    const files = await loadFiles("Events");
    const events = await Promise.all(
      files.map(async (file) => {
        const event = require(file);
        // Wrap execute to always pass client as last argument
        const execute = (...args) => event.execute(...args, client);
        const target = event.rest ? client.rest : client;

        // Register event listener (once or on)
        target[event.once ? "once" : "on"](event.name, execute);
        client.events.set(event.name, execute);

        return { Event: event.name, Status: "   (:   " };
      })
    );

    // Print a table of loaded events and their status
    console.table(events, ["Event", "Status"]);
  } catch (error) {
    console.error("Error loading events: ", error);
  }

  console.timeEnd("Events Loaded");
}

module.exports = { loadEvents };
