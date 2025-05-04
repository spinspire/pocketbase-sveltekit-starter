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

// Cannot be placed within auditlog.pb.js
/**
 * 
 * @param {string} event 
 * @param {core.RecordRequestEvent} request 
 * @returns {void}
 */
function doAudit(event, request) {
  const record = request.record;
  const auth = request.auth;
  const collections = $os.getenv("AUDITLOG")?.split(",") ?? [];
  if (!record) {
    console.log("AuditLog: no record");
    return;
  }
  // list of collections that are to be audit-logged
  const collection = record.collection().name;
  // exclude logging "auditlog" and include only what's in AUDITLOG env var
  if (collection != "auditlog" && collections.includes(collection)) {
    const user = auth?.isSuperuser() ? null : auth;
    const admin = auth?.isSuperuser() ? auth : null;
    console.log("AuditLog", collection, record.id, event, user?.id, admin?.id);
    const auditlog = new Record($app.findCollectionByNameOrId("auditlog"));
    auditlog.set("collection", collection);
    auditlog.set("record", record.id);
    auditlog.set("event", event);
    auditlog.set("user", user?.id);
    auditlog.set("admin", admin?.id);
    // detect changes
    const original = record.original().publicExport();
    const recordExport = record.publicExport();
    for (const [k, v] of Object.entries(original)) {
      if (v == recordExport[k]) {
        // unchanged, then remove from "original"
        delete original[k];
      }
    }
    auditlog.set("data", recordExport);
    auditlog.set("original", original);
    $app.save(auditlog);
  }
}

module.exports = {
  parseJSON,
  parseJSONFile,
  slugDefault,
  doAudit,
};
