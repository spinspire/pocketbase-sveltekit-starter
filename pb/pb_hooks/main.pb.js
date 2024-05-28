// Extending PocketBase with JS - @see https://pocketbase.io/docs/js-overview/

/// <reference path="../pb_data/types.d.ts" />

/**
 * Demo route implemented in JS. Says hello to the user's name or email.
 */
routerAdd(
  "GET",
  "/api/hello",
  (c) => {
    /** @type {models.Admin} */
    const admin = c.get("admin");
    /** @type {models.Record} */
    const record = c.get("authRecord");
    return c.json(200, {
      message: "Hello " + (record?.getString("name") ?? admin?.email),
      // the next var was injected by Go
      foo,
    });
  },
  // middleware(s)
  $apis.requireAdminOrRecordAuth()
);

/**
 * Sends email to the logged in user.
 */
routerAdd(
  "POST",
  "/api/sendmail",
  (c) => {
    /** @type {models.Admin} */
    const admin = c.get("admin");
    /** @type {models.Record} */
    const record = c.get("authRecord");
    record?.ignoreEmailVisibility(true); // required for user.get("email")
    const to =
      record?.get("email") ?? // works only after user.ignoreEmailVisibility(true)
      admin?.email;
    const name = $app.settings().meta.senderName;
    const address = $app.settings().meta.senderAddress;
    const message = new MailerMessage({
      from: {
        address,
        name,
      },
      to: [{ address: to }],
      subject: `test email from ${name}`,
      text: "Test email",
      html: "<strong>Test</strong> <em>email</em>",
    });
    $app.newMailClient().send(message);

    return c.json(200, { message });
  },
  // middleware(s)
  $apis.requireAdminOrRecordAuth()
);

// public config
routerAdd(
  "GET",
  "/api/config",
  (c) => {
    const { parseJSONFile } = require(`${__hooks}/util`);
    const config = parseJSONFile(`${__hooks}/config.json`);
    const settings = $app.settings();
    config.site.name = settings.meta.appName;
    config.site.copyright = settings.meta.appName;
    c.json(200, config);
  } /* no auth */
);

// auditlog generation
onRecordAfterCreateRequest((e) => {
  const { doAudit } = require(`${__hooks}/auditlog`);
  return doAudit("insert", e.record, e.httpContext);
});
onRecordAfterUpdateRequest((e) => {
  const { doAudit } = require(`${__hooks}/auditlog`);
  return doAudit("update", e.record, e.httpContext);
});
onRecordAfterDeleteRequest((e) => {
  const { doAudit } = require(`${__hooks}/auditlog`);
  doAudit("delete", e.record, e.httpContext);
});

onModelBeforeCreate((e) => {
  const { slugDefault } = require(`${__hooks}/util`);
  slugDefault(e.model);
}, "posts");

onModelBeforeUpdate((e) => {
  const { slugDefault } = require(`${__hooks}/util`);
  slugDefault(e.model);
}, "posts");

