package mailyak

import (
	"bufio"
	"crypto/tls"
	"io"
	"net"
	"net/smtp"
)

// emailSender abstracts the connection and protocol conversation required to
// send an email with a remote SMTP server.
type emailSender interface {
	Send(m sendableMail) error
}

// sendableMail provides a set of methods to describe an email to a SMTP server.
type sendableMail interface {
	// getLocalName should return the sender domain to be used in the EHLO/HELO
	// command.
	getLocalName() string

	// getToAddrs should return a slice of email addresses to be added to the
	// RCPT TO command.
	getToAddrs() []string

	// getFromAddr should return the address to be used in the MAIL FROM
	// command.
	getFromAddr() string

	// getAuth should return the smtp.Auth if configured, nil if not.
	getAuth() smtp.Auth

	// buildMime should write the generated MIME to w.
	//
	// The emailSender implementation is responsible for providing appropriate
	// buffering of writes.
	buildMime(w io.Writer) error
}

// smtpExchange performs the SMTP protocol conversation necessary to send m over
// conn.
//
// serverName must be the hostname (or IP address) of the remote endpoint.
func smtpExchange(m sendableMail, conn net.Conn, serverName string, tryTLSUpgrade bool) error {
	// Connect to the SMTP server
	c, err := smtp.NewClient(conn, serverName)
	if err != nil {
		return err
	}
	defer func() { _ = c.Quit() }()

	if localName := m.getLocalName(); localName != "" {
		if err := c.Hello(localName); err != nil {
			return err
		}
	}

	if tryTLSUpgrade {
		if ok, _ := c.Extension("STARTTLS"); ok {
			//nolint:gosec
			config := &tls.Config{
				ServerName: serverName,
			}
			if err = c.StartTLS(config); err != nil {
				return err
			}
		}
	}

	// Attempt to authenticate if credentials were provided
	var nilAuth smtp.Auth
	if auth := m.getAuth(); auth != nilAuth {
		if err = c.Auth(auth); err != nil {
			return err
		}
	}

	// Set the from address
	if err = c.Mail(m.getFromAddr()); err != nil {
		return err
	}

	// Add all the recipients
	for _, to := range m.getToAddrs() {
		if err = c.Rcpt(to); err != nil {
			return err
		}
	}

	// Start the data session and write the email body
	dataSession, err := c.Data()
	if err != nil {
		return err
	}

	// Wrap the socket in a small buffer (~4k) to avoid making lots of small
	// syscalls and therefore reducing CPU usage.
	buf := bufio.NewWriter(dataSession)
	if err := m.buildMime(buf); err != nil {
		return err
	}
	if err := buf.Flush(); err != nil {
		return err
	}

	return dataSession.Close()
}
