/**
 * MySQL database connection pool using mysql2/promise.
 * Exports a pool for use throughout the bot.
 * Useful for efficienct, concurrent database access.
 */

const mysql = require("mysql2/promise");
const config = require("../config.json").database;

// Create a connection pool for database access.
// The pool manages multiple connections for performance and reliability.
const pool = mysql.createPool({
  host: config.host,          // MySQL server host
  port: config.port,          // MySQL server port
  user: config.username,      // MySQL username
  password: config.password,  // MySQL password
  database: config.dbname,    // Database name
  waitForConnections: true,   // Wait if all connections are busy
  connectionLimit: 10,        // Max number of concurrent connections
  queueLimit: 0,              // Unlimited queueing
});

module.exports = pool;
