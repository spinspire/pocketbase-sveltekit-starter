package mailyak

import (
	"bytes"
	"net"
)

// senderWithStartTLS connects to the remote SMTP server, upgrades the
// connection using STARTTLS if available, and sends the email.
type senderWithStartTLS struct {
	hostAndPort string
	hostname    string
	buf         *bytes.Buffer
}

func (s *senderWithStartTLS) Send(m sendableMail) error {
	conn, err := net.Dial("tcp", s.hostAndPort)
	if err != nil {
		return err
	}
	defer func() { _ = conn.Close() }()

	return smtpExchange(m, conn, s.hostname, true)
}

func newSenderWithStartTLS(hostAndPort string) *senderWithStartTLS {
	hostName, _, err := net.SplitHostPort(hostAndPort)
	if err != nil {
		// Really this should be an error, but we can't return it from the New()
		// constructor without breaking compatability. Fortunately by the time
		// it gets to the dial() the user will get a pretty clear error as this
		// hostAndPort value is almost certainly invalid.
		//
		// This hostname must be split from the port so the correct value is
		// used when performing the SMTP AUTH as the Go SMTP implementation
		// refuses to send credentials over non-localhost plaintext connections,
		// and including the port messes this check up (and is probably the
		// wrong thing to be sending anyway).
		hostName = hostAndPort
	}

	return &senderWithStartTLS{
		hostAndPort: hostAndPort,
		hostname:    hostName,
		buf:         &bytes.Buffer{},
	}
}
