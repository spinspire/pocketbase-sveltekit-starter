/// <reference path="../pb_data/types.d.ts" />

const collections = $os.getenv("AUDITLOG")?.split(",") ?? [];

/**
 * Inserts an auditlog record for the given event (insert/update/delete)
 * that happens on the given record.
 *
 * @param {string} event
 * @param {models.Record} record
 * @param {echo.Context} c
 */
function doAudit(event, record, c) {
  // list of collections that are to be audit-logged
  const collection = record.collection().name;
  // exclude logging "auditlog" and include only what's in AUDITLOG env var
  if (collection != "auditlog" && collections.includes(collection)) {
    /** @type {models.Admin} */
    const admin = c.get("admin");
    /** @type {models.Record} */
    const user = c.get("authRecord");
    console.log("AuditLog", collection, record.id, event, user, admin);
    const auditlog = new Record(
      $app.dao().findCollectionByNameOrId("auditlog")
    );
    auditlog.set("collection", collection);
    auditlog.set("record", record.id);
    auditlog.set("event", event);
    auditlog.set("user", user?.id);
    auditlog.set("admin", admin?.id);
    // detect changes
    const original = record.originalCopy().publicExport();
    const recordExport = record.publicExport();
    for (const [k, v] of Object.entries(original)) {
      if (v == recordExport[k]) {
        // unchanged, then remove from "original"
        delete original[k];
      }
    }
    auditlog.set("data", recordExport);
    auditlog.set("original", original);
    $app.dao().save(auditlog);
  }
}

module.exports = {
  doAudit,
};
