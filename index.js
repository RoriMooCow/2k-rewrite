/**
 * Main entry point for the Discord bot.
 * 
 * - Initializes the Discord client with all required intents and partials.
 * - Loads all event handlers (commands, moderation, logging, etc).
 * - Attaches configuration and command/event collections to the client for global access.
 * - Logs in to Discord using the bot token from config.json.
 * 
 * This file should be run directly to start the bot.
 */

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

// Create a new Discord client instance with necessary intents and partials.
// Intents control which events the bot receives from Discord.
// Partials allow the bot to receive incomplete data for certain structures (useful for deleted messages, etc).
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,            // Guild (server) events
    GatewayIntentBits.GuildMembers,      // Member join/leave/update events
    GatewayIntentBits.GuildModeration,   // Ban/kick events
    GatewayIntentBits.GuildMessages,     // Message events in guilds
    GatewayIntentBits.MessageContent,    // Access to message content (required for moderation/logging)
  ],
  partials: [
    Partials.User,           // Allows handling of uncached users
    Partials.Channel,        // Allows handling of uncached channels
    Partials.Message,        // Allows handling of uncached/deleted messages
    Partials.GuildMember,    // Allows handling of uncached guild members
  ],
});

const { loadEvents } = require("./handlers/eventHandler.js");

// Attach config and collections to client for global access throughout the bot.
// - config: Bot configuration (token, database, etc).
// - commands: All loaded slash commands (Collection).
// - events: All loaded event handlers (Collection).
client.config = require("./config.json");
client.commands = new Collection();
client.events = new Collection();

// Load all event listeners (registers all event files in the Events directory).
loadEvents(client);

// Log in to Discord using the bot token from config.json.
// If login fails, log the error and exit the process.
client.login(client.config.token).catch((error) => {
  console.error("Failed to login: ", error);
  process.exit(1);
});
