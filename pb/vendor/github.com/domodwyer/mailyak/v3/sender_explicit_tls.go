package mailyak

import (
	"crypto/tls"
	"net"
)

// senderExplicitTLS connects to a SMTP server over a TLS connection, performs a
// handshake and validation according to the provided tls.Config before sending
// the email.
type senderExplicitTLS struct {
	hostAndPort string
	hostname    string

	// tlsConfig is always non-nil
	tlsConfig *tls.Config
}

// Connect to the SMTP host configured in m, and send the email.
func (s *senderExplicitTLS) Send(m sendableMail) error {
	conn, err := tls.Dial("tcp", s.hostAndPort, s.tlsConfig)
	if err != nil {
		return err
	}
	defer func() { _ = conn.Close() }()

	// Perform the SMTP protocol conversation, using the provided TLS ServerName
	// as the SMTP server name.
	return smtpExchange(m, conn, s.hostname, false)
}

// newSenderWithExplicitTLS constructs a new senderExplicitTLS.
//
// If tlsConfig is nil, a sensible default with maximum compatability is
// generated.
func newSenderWithExplicitTLS(hostAndPort string, tlsConfig *tls.Config) (*senderExplicitTLS, error) {
	// Split the hostname from the addr.
	//
	// This hostname is used during TLS negotiation and during SMTP
	// authentication.
	hostName, _, err := net.SplitHostPort(hostAndPort)
	if err != nil {
		return nil, err
	}

	if tlsConfig != nil {
		// Clone the user-provided TLS config to prevent it being
		// mutated by the caller.
		tlsConfig = tlsConfig.Clone()
	} else {
		// If there is no TLS config provided, initialise a default.
		//nolint:gosec // Maximum compatability but please use TLS >= 1.2
		tlsConfig = &tls.Config{
			ServerName: hostName,
		}
	}

	return &senderExplicitTLS{
		hostAndPort: hostAndPort,
		hostname:    hostName,

		tlsConfig: tlsConfig,
	}, nil
}
