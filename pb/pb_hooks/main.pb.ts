// Extending PocketBase with JS - @see https://pocketbase.io/docs/js-overview/

/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/goodbye/:name", (c) => {
  let name = c.pathParam("name");
  return c.json(200, { message: "Goodbye " + name });
});

// sends email to the logged in user
routerAdd(
  "POST",
  "/api/sendmail",
  (c) => {
    const user = c.get("authRecord"); // obtain user record from context
    user.ignoreEmailVisibility(true); // required for user.get("email")
    const address = user.get("email"); // works only after user.ignoreEmailVisibility(true)
    const name = user.get("name");
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName,
      },
      to: [{ name, address }],
      subject: `test email from ${name}`,
      text: "Test email",
      html: "<strong>Test</strong> <em>email</em>",
    });
    $app.newMailClient().send(message);

    return c.json(200, { message });
  },
  // middleware(s)
  $apis.requireRecordAuth("users")
);
