/**
 * Main entry point for the Discord bot.
 * Initializes the client, loads events, and logs in.
 */

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
  ],
});

const { loadEvents } = require("./handlers/eventHandler.js");

// Attach config and collections to client for global access
client.config = require("./config.json");
client.commands = new Collection();
client.events = new Collection();

// Load all event listeners
loadEvents(client);

// Log in to Discord
client.login(client.config.token).catch((error) => {
  console.error("Failed to login: ", error);
  process.exit(1);
});
