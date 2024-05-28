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

// if obj.slug is empty, make it same as obj.id
function slugDefault(obj) {
  if (obj) {
    const slug = obj.get("slug");
    if (!slug) {
      obj.set("slug", obj.id);
    }
  }
}

module.exports = {
  parseJSON,
  parseJSONFile,
  slugDefault,
};
