// Extending PocketBase with JS - @see https://pocketbase.io/docs/js-overview/

/// <reference path="../pb_data/types.d.ts" />

// Return 404 for unmatched /api/* routes (prevents SPA fallback serving index.html)
routerAdd("GET", "/api/{path...}", (c) => {
  throw new NotFoundError("API route not found");
});
routerAdd("POST", "/api/{path...}", (c) => {
  throw new NotFoundError("API route not found");
});
routerAdd("PUT", "/api/{path...}", (c) => {
  throw new NotFoundError("API route not found");
});
routerAdd("PATCH", "/api/{path...}", (c) => {
  throw new NotFoundError("API route not found");
});
routerAdd("DELETE", "/api/{path...}", (c) => {
  throw new NotFoundError("API route not found");
});

/**
 * Demo route implemented in JS. Says hello to the user's name or email.
 */
routerAdd(
  "GET",
  "/api/hello",
  (c) => {
    const auth = c.auth;
    return c.json(200, {
      message: "Hello " + (auth?.getString("name") ?? auth?.email()),
    });
  },
  // middleware(s)
  $apis.requireAuth(),
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
  $apis.requireAuth(),
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
    return c.json(200, config);
  } /* no auth */,
);

onModelCreate((e) => {
  const { slugDefault } = require(`${__hooks}/util`);
  slugDefault(e.model);
  e.next();
}, "posts");

onModelUpdate((e) => {
  const { slugDefault } = require(`${__hooks}/util`);
  slugDefault(e.model);
  e.next();
}, "posts");

routerAdd(
  "POST",
  "/api/generate",
  (c) => {
    const url =
      "https://generate-random.org/api/v1/generate/strings?type=lorem&lorem_type=paragraph&count=3";
    const response = $http.send({ url });
    const { data } = response.json;
    const body = data.join("\n\n");
    // first sentence become the title
    const [title] = data[0].match(/^[^\.]+/);
    const slug = title.toLowerCase().replaceAll(" ", "-");
    const coll = $app.findCollectionByNameOrId("posts");
    const record = new Record(coll, { title, body, slug, user: c.auth?.id });
    const form = new RecordUpsertForm($app, record);
    record.set("files", [
      $filesystem.fileFromURL("https://picsum.photos/500/300"),
      $filesystem.fileFromURL("https://picsum.photos/500/300"),
    ]);
    form.submit();
    // $app.dao().saveRecord(record);
    c.json(200, record);
  },
  $apis.requireAuth(),
);
