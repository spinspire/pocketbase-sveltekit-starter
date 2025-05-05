/// <reference path="../pb_data/types.d.ts" />

// auditlog generation
onRecordCreateRequest((e) => {
  const { doAudit } = require(`${__hooks}/util`);
  e.next();
  doAudit("insert", e);
  return e.next();
});
onRecordUpdateRequest((e) => {
  const { doAudit } = require(`${__hooks}/util`);
  e.next();
  doAudit("update", e);
  return e.next();
});
onRecordDeleteRequest((e) => {
  const { doAudit } = require(`${__hooks}/util`);
  e.next();
  doAudit("delete", e);
  return e.next();
});
