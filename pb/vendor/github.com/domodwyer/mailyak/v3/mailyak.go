package mailyak

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"net/mail"
	"net/smtp"
	"regexp"
	"strings"
	"time"
)

// MailYak is an easy-to-use email builder.
type MailYak struct {
	html  BodyPart
	plain BodyPart

	localName      string
	toAddrs        []string
	ccAddrs        []string
	bccAddrs       []string
	subject        string
	fromAddr       string
	fromName       string
	replyTo        string
	headers        map[string][]string // arbitrary headers
	attachments    []attachment
	trimRegex      *regexp.Regexp
	auth           smtp.Auth
	host           string
	sender         emailSender
	writeBccHeader bool
	date           string
}

// Email Date timestamp format
const mailDateFormat = time.RFC1123Z

// New returns an instance of MailYak using host as the SMTP server, and
// authenticating with auth if non-nil.
//
// host must include the port number (i.e. "smtp.itsallbroken.com:25")
//
//	mail := mailyak.New("smtp.itsallbroken.com:25", smtp.PlainAuth(
//	    "",
//	    "username",
//	    "password",
//	    "smtp.itsallbroken.com",
//	))
//
// MailYak instances created with New will switch to using TLS after connecting
// if the remote host supports the STARTTLS command. For an explicit TLS
// connection, or to provide a custom tls.Config, use NewWithTLS() instead.
func New(host string, auth smtp.Auth) *MailYak {
	return &MailYak{
		headers:        map[string][]string{},
		host:           host,
		auth:           auth,
		sender:         newSenderWithStartTLS(host),
		trimRegex:      regexp.MustCompile("\r?\n"),
		writeBccHeader: false,
		date:           time.Now().Format(mailDateFormat),
	}
}

// NewWithTLS returns an instance of MailYak using host as the SMTP server over
// an explicit TLS connection, and authenticating with auth if non-nil.
//
// host must include the port number (i.e. "smtp.itsallbroken.com:25")
//
//	mail := mailyak.NewWithTLS("smtp.itsallbroken.com:25", smtp.PlainAuth(
//	    "",
//	    "username",
//	    "password",
//	    "smtp.itsallbroken.com",
//	), tlsConfig)
//
// If tlsConfig is nil, a sensible default is generated that can connect to
// host.
func NewWithTLS(host string, auth smtp.Auth, tlsConfig *tls.Config) (*MailYak, error) {
	// Construct a default MailYak instance
	m := New(host, auth)

	// Initialise the TLS sender with the (potentially nil) TLS config, swapping
	// it with the default STARTTLS sender.
	var err error
	m.sender, err = newSenderWithExplicitTLS(host, tlsConfig)
	if err != nil {
		return nil, err
	}

	return m, nil
}

// Send attempts to send the built email via the configured SMTP server.
//
// Attachments are read and the email timestamp is created when Send() is
// called, and any connection/authentication errors will be returned by Send().
func (m *MailYak) Send() error {
	m.date = time.Now().Format(mailDateFormat)

	return m.sender.Send(m)
}

// MimeBuf returns the buffer containing all the RAW MIME data.
//
// MimeBuf is typically used with an API service such as Amazon SES that does
// not use an SMTP interface.
func (m *MailYak) MimeBuf() (*bytes.Buffer, error) {
	m.date = time.Now().Format(mailDateFormat)

	buf := &bytes.Buffer{}
	if err := m.buildMime(buf); err != nil {
		return nil, err
	}

	return buf, nil
}

// String returns a redacted description of the email state, typically for
// logging or debugging purposes.
//
// Authentication information is not included in the returned string.
func (m *MailYak) String() string {
	var (
		att    []string
		custom string
	)
	for _, a := range m.attachments {
		att = append(att, "{filename: "+a.filename+"}")
	}

	if len(m.headers) > 0 {
		var hdrs []string
		for k, v := range m.headers {
			hdrs = append(hdrs, fmt.Sprintf("%s: %q", k, v))
		}
		custom = strings.Join(hdrs, ", ") + ", "
	}

	_, isTLSSender := m.sender.(*senderExplicitTLS)

	return fmt.Sprintf(
		"&MailYak{date: %q, from: %q, fromName: %q, html: %v bytes, plain: %v bytes, toAddrs: %v, "+
			"bccAddrs: %v, subject: %q, %vhost: %q, attachments (%v): %v, auth set: %v, explicit tls: %v}",
		m.date,
		m.fromAddr,
		m.fromName,
		len(m.HTML().String()),
		len(m.Plain().String()),
		m.toAddrs,
		m.bccAddrs,
		m.subject,
		custom,
		m.host,
		len(att),
		att,
		m.auth != nil,
		isTLSSender,
	)
}

// HTML returns a BodyPart for the HTML email body.
func (m *MailYak) HTML() *BodyPart {
	return &m.html
}

// Plain returns a BodyPart for the plain-text email body.
func (m *MailYak) Plain() *BodyPart {
	return &m.plain
}

// getLocalName should return the sender domain to be used in the EHLO/HELO
// command.
func (m *MailYak) getLocalName() string {
	return m.localName
}

// getToAddrs should return a slice of email addresses to be added to the
// RCPT TO command.
func (m *MailYak) getToAddrs() []string {
	// Pre-allocate the slice to avoid growing it, we already know how big it
	// needs to be.
	addrs := len(m.toAddrs) + len(m.ccAddrs) + len(m.bccAddrs)
	out := make([]string, 0, addrs)

	out = append(out, stripNames(m.toAddrs)...)
	out = append(out, stripNames(m.ccAddrs)...)
	out = append(out, stripNames(m.bccAddrs)...)

	return out
}

// getFromAddr should return the address to be used in the MAIL FROM
// command.
func (m *MailYak) getFromAddr() string {
	return m.fromAddr
}

// getAuth should return the smtp.Auth if configured, nil if not.
func (m *MailYak) getAuth() smtp.Auth {
	return m.auth
}

// stripNames returns a new slice with only the email parts from the RFC 5322 addresses.
//
// Or in other words, converts:
// ["a@example.com", "John <b@example.com>", "invalid"]
// to
// ["a@example.com", "b@example.com", "invalid"].
//
// Note that invalid addresses are kept as they are.
func stripNames(addresses []string) []string {
	result := make([]string, 0, len(addresses))

	for _, original := range addresses {
		addr, err := mail.ParseAddress(original)

		if err != nil {
			// add as it is
			result = append(result, original)
		} else {
			// add only the email part
			result = append(result, addr.Address)
		}
	}

	return result
}
