/**
 * MySQL database connection pool using mysql2/promise.
 * Exports a pool for use throughout the bot.
 */

const mysql = require("mysql2/promise");
const config = require("../config.json").database;

// Create a connection pool for database access.
const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.username,
  password: config.password,
  database: config.dbname,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
