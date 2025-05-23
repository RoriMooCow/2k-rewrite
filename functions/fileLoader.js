/**
 * Utility functions for loading and clearing cached files (commands/events).
 * This module helps dynamically load all .js files from a directory,
 * and clears their require cache for hot-reloading.
 */

const { glob } = require("glob");
const path = require("path");

// Deletes a file from Node's require cache.
// This is necessary for hot-reloading commands/events.
async function deleteCachedFile(file) {
  const filePath = path.resolve(file);
  if (require.cache[filePath]) {
    console.log(`Clearing cache for: ${filePath}`);
    delete require.cache[filePath];
  }
}

// Loads all .js files from a given directory (recursively), clearing their cache.
// Returns an array of resolved file paths.
async function loadFiles(dirName) {
  if ((typeof dirName !== "string") | !dirName.trim()) {
    throw new Error("Invalid directory name provided.");
  }
  try {
    // Find all JS files recursively in the directory
    const files = await glob(
      path.posix.join(process.cwd(), dirName, "**/*.js")
    );
    const jsFiles = files.filter((file) => path.extname(file) === ".js");
    const resolvedFiles = jsFiles.map((file) => path.resolve(file));
    // Clear cache for all found files
    await Promise.all(resolvedFiles.map(deleteCachedFile));
    return resolvedFiles;
  } catch (error) {
    console.error(
      `Error loading files from directory "${dirName}". Stack trace: `,
      error
    );
    throw error;
  }
}

module.exports = { loadFiles };
