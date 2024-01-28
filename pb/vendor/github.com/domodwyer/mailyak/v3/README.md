[![Build
Status](https://travis-ci.org/domodwyer/mailyak.svg?branch=master)](https://travis-ci.org/domodwyer/mailyak)
[![GoDoc](https://godoc.org/github.com/domodwyer/mailyak?status.svg)](https://godoc.org/github.com/domodwyer/mailyak)

<p align="center">
<img src="https://s3-eu-west-1.amazonaws.com/iab-assets/mailyak-header.png" />
</p>
<p align="center">
<em>An elegant MIME mail library with support for attachments</em>
</p>
<br /><br /><br />
A simple, easy to use email library for Go (golang).

- Full attachment support (attach anything that implements `io.Reader`)
- Send to multiple addresses at the same time, including BCC addresses.
- Supports composing multi-part messages (HTML and plain text emails for older
  clients)
- Write templates directly to the email body (implements `io.Writer` for
  convenience)
- Production ready - several million emails sent in a production environment
- SMTP over TLS support, with automatic STARTTLS upgrades for plaintext
  connections

# Installation

If you're using  `go mod`:

```bash
go get -v github.com/domodwyer/mailyak/v3
```

Or with `GOPATH`:

```bash
go get -v github.com/domodwyer/mailyak
```

# Usage

```Go
// Create a new email - specify the SMTP host:port and auth (if needed)
mail := mailyak.New("mail.host.com:25", smtp.PlainAuth("", "user", "pass", "mail.host.com"))

mail.To("dom@itsallbroken.com")
mail.From("jsmith@example.com")
mail.FromName("Bananas for Friends")

mail.Subject("Business proposition")

// mail.HTML() and mail.Plain() implement io.Writer, so you can do handy things like
// parse a template directly into the email body
if err := t.ExecuteTemplate(mail.HTML(), "htmlEmail", data); err != nil {
    panic(" 💣 ")
}

// Or set the body using a string setter
mail.Plain().Set("Get a real email client")

// And you're done! 
if err := mail.Send(); err != nil {
    panic(" 💣 ")
}
```

To send an attachment:
```Go
mail := mailyak.New("mail.host.com:25", smtp.PlainAuth("", "user", "pass", "mail.host.com"))

mail.To("dom@itsallbroken.com")
mail.From("oops@itsallbroken.com")
mail.Subject("I am a teapot")
mail.HTML().Set("Don't panic")

// input can be a bytes.Buffer, os.File, os.Stdin, etc.
// call multiple times to attach multiple files
mail.Attach("filename.txt", &input)

if err := mail.Send(); err != nil {
    panic(" 💣 ")
}
```

# Notes

- Why "MailYak"? Because "MailyMcMailFace" is annoyingly long to type.
- You can use a single instance of mailyak to send multiple emails after
  changing the to/body/whatever fields, avoiding unnecessary allocation/GC
  pressure.
- Attachments are read when you call `Send()` to prevent holding onto multiple
  copies of the attachment in memory (source and email) - this means changing
  the attachment data between calling `Attach()` and `Send()` will change what's
  emailed out!
- For your own sanity you should vendor this, and any other libraries when going
  into production.


### Maintenance Status

This library is fully maintained. 

The (relatively) small API/scope and many years spent maturing means it doesn't
receive frequent code changes any more. Bug fixes are definitely accepted (and
appreciated!), and you can consider this a stable and maintained library.