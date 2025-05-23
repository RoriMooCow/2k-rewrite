# 2K Community Bot

A modular, scalable, and production-ready Discord moderation and utility bot designed for the 2K Games community and official servers.  
Built with [discord.js v14](https://discord.js.org/) and MySQL for robust, per-server configuration and logging.

---

## Features

- **Per-Server Settings:**  
  Each server can configure its own log channel and future settings via `/setup`.

- **Moderation Tools:**  
  - `/warn` — Warn a member and log the warning.
  - `/warnings` — View a member’s warnings with interactive navigation.
  - `/removewarning` — Remove a specific warning from a member.

- **Event Logging:**  
  - Logs bans, unbans, kicks, and message deletions to the configured log channel.
  - Uses Discord audit logs to attribute actions to moderators.

- **Utility Commands:**  
  - `/setup` — Configure server-specific settings (log channel).
  - `/reload` — Reload commands or events (bot owner only).
  - `/jsonembed` — Upload a JSON file to send custom embeds and buttons.

- **Scalable & Modular:**  
  - Easily add new commands, events, and settings.
  - All settings and logs are per-guild (no cross-server conflicts).

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/RoriMooCow/2k-community-bot.git
cd 2k-community-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Bot

Copy `exampleConfig.json` to `config.json` and fill in your Discord bot token and MySQL credentials:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "database": {
    "host": "your-mysql-host",
    "port": "3306",
    "username": "your-username",
    "password": "your-password",
    "dbname": "your-database"
  }
}
```

**PLEASE do not share your real `config.json` or bot token publicly!**

### 4. Start the Bot

```bash
node index.js
```

---

## Usage & Commands

### Setup

**/setup log_channel:**  
Set the channel where moderation logs and warnings will be posted.  
_Example:_  
`/setup log_channel: #mod-logs`

### Moderation

- **/warn user reason:**  
  Warn a member. The warning is stored in the database and logged.
  ```
  /warn user: @username reason: Spamming
  ```

- **/warnings user:**  
  View all warnings for a member. Use the navigation buttons to browse.
  ```
  /warnings user: @username
  ```

- **/removewarning user index:**  
  Remove a specific warning by its index (see `/warnings` for indices).
  ```
  /removewarning user: @username index: 1
  ```

### Utility

- **/jsonembed file:**  
  Upload a JSON file containing Discord embed(s) and button(s) to send them as a message.
  ```
  /jsonembed file: embed.json
  ```

- **/reload commands/events:**  
  Reload all commands or events without restarting the bot.  
  _Owner only!_
  ```
  /reload commands
  /reload events
  ```

---

## Event Logging

The bot automatically logs the following events to your configured log channel:

- **Message Deletions:**  
  Who deleted the message, whose message, and when.

- **Member Kicks:**  
  Who kicked whom, reason, and when.

- **Bans/Unbans:**  
  Who banned/unbanned whom, reason, and when.

All logs are attributed to the responsible moderator using Discord audit logs.

---

## Database

- Uses MySQL for persistent storage of warnings and per-guild settings.
- Tables are created automatically if they do not exist.

---

## Credits

- Developed by [RoriMooCow](https://github.com/RoriMooCow) (@RoriMooCow on Discord)
- Powered by [discord.js](https://discord.js.org/) and [mysql2](https://www.npmjs.com/package/mysql2)

---

## Support

For questions, issues, or feature requests, please use the [GitHub Issues](https://github.com/RoriMooCow/2k-community-bot/issues) page.
Otherwise, you can email me at contact@rori.rip, or message me on Discord(@RoriMooCow)

---

<3
