/// <reference path="../pb_data/types.d.ts" />

// auditlog generation
onRecordCreateRequest((e) => {
  const { doAudit } = require(`${__hooks}/util`);
  doAudit("insert", e);
  return e.next();
});
onRecordUpdateRequest((e) => {
  const { doAudit } = require(`${__hooks}/util`);
  doAudit("update", e);
  return e.next();
});
onRecordDeleteRequest((e) => {
  const { doAudit } = require(`${__hooks}/util`);
  doAudit("delete", e);
  return e.next();
});
