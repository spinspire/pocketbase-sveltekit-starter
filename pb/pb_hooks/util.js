/// <reference path="../pb_data/types.d.ts" />

// parses JSON values retrieved from pocketbase as byte-arrays
function parseJSON(bytes) {
  const str = bytes.map((c) => String.fromCharCode(c)).join("");
  return JSON.parse(str);
}

/**
 * @param {string} path
 */
function parseJSONFile(path) {
  return parseJSON($os.readFile(path));
}

module.exports = {
  parseJSON,
  parseJSONFile,
};
