package mailyak

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"mime/multipart"
	"mime/quotedprintable"
	"net/textproto"
	"strings"
)

func (m *MailYak) buildMime(w io.Writer) error {
	mb, err := randomBoundary()
	if err != nil {
		return err
	}

	ab, err := randomBoundary()
	if err != nil {
		return err
	}

	return m.buildMimeWithBoundaries(w, mb, ab)
}

// randomBoundary returns a random hexadecimal string used for separating MIME
// parts.
//
// The returned string must be sufficiently random to prevent malicious users
// from performing content injection attacks.
func randomBoundary() (string, error) {
	buf := make([]byte, 30)
	_, err := io.ReadFull(rand.Reader, buf)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

// buildMimeWithBoundaries creates the MIME message using mb and ab as MIME
// boundaries, and returns the generated MIME data as a buffer.
func (m *MailYak) buildMimeWithBoundaries(w io.Writer, mb, ab string) error {
	if err := m.writeHeaders(w); err != nil {
		return err
	}

	var (
		hasBody        = m.html.Len() != 0 || m.plain.Len() != 0
		hasAttachments = len(m.attachments) != 0
	)

	// if we don't have text/html body or attachments we can skip Content-Type header
	// in that case next default will be assumed
	//    Content-type: text/plain; charset=us-ascii
	// See https://datatracker.ietf.org/doc/html/rfc2045#page-14
	if !hasBody && !hasAttachments {
		// The RFC said that body can be ommited: https://datatracker.ietf.org/doc/html/rfc822#section-3.1
		// but for example mailhog can't correctly read message without any body.
		// This CRLF just separate header section.
		_, err := fmt.Fprint(w, "\r\n")
		return err
	}
	// Start our multipart/mixed part
	mixed := multipart.NewWriter(w)
	if err := mixed.SetBoundary(mb); err != nil {
		return err
	}

	// To avoid deferring a mixed.Close(), run the write in a closure and
	// close the mixed after.
	tryWrite := func() error {
		fmt.Fprintf(w, "Content-Type: multipart/mixed;\r\n\tboundary=\"%s\"; charset=UTF-8\r\n\r\n", mixed.Boundary())

		if hasBody {
			if err := m.writeAlternativePart(mixed, ab); err != nil {
				return err
			}
		}
		if hasAttachments {
			if err := m.writeAttachments(mixed, lineSplitterBuilder{}); err != nil {
				return err
			}
		}
		return nil
	}

	if err := tryWrite(); err != nil {
		return err
	}

	return mixed.Close()
}

// writeHeaders writes the MIME-Version, Date, Reply-To, From, To and Subject headers,
// plus any custom headers set via AddHeader().
func (m *MailYak) writeHeaders(w io.Writer) error {
	if _, err := w.Write([]byte(m.fromHeader())); err != nil {
		return err
	}

	if _, err := w.Write([]byte("MIME-Version: 1.0\r\n")); err != nil {
		return err
	}

	fmt.Fprintf(w, "Date: %s\r\n", m.date)

	if m.replyTo != "" {
		fmt.Fprintf(w, "Reply-To: %s\r\n", m.replyTo)
	}

	fmt.Fprintf(w, "Subject: %s\r\n", m.subject)

	if len(m.toAddrs) > 0 {
		commaSeparatedToAddrs := strings.Join(m.toAddrs, ",")
		fmt.Fprintf(w, "To: %s\r\n", commaSeparatedToAddrs)
	}

	if len(m.ccAddrs) > 0 {
		commaSeparatedCCAddrs := strings.Join(m.ccAddrs, ",")
		fmt.Fprintf(w, "CC: %s\r\n", commaSeparatedCCAddrs)
	}

	if m.writeBccHeader && len(m.bccAddrs) > 0 {
		commaSeparatedBCCAddrs := strings.Join(m.bccAddrs, ",")
		fmt.Fprintf(w, "BCC: %s\r\n", commaSeparatedBCCAddrs)
	}

	for k, values := range m.headers {
		for _, v := range values {
			fmt.Fprintf(w, "%s: %s\r\n", k, v)
		}
	}

	return nil
}

// fromHeader returns a correctly formatted From header, optionally with a name
// component.
func (m *MailYak) fromHeader() string {
	if m.fromName == "" {
		return fmt.Sprintf("From: %s\r\n", m.fromAddr)
	}

	return fmt.Sprintf("From: %s <%s>\r\n", m.fromName, m.fromAddr)
}

func (m *MailYak) writeAlternativePart(mixed *multipart.Writer, boundary string) error {
	ctype := fmt.Sprintf("multipart/alternative;\r\n\tboundary=\"%s\"", boundary)

	altPart, err := mixed.CreatePart(textproto.MIMEHeader{"Content-Type": {ctype}})
	if err != nil {
		return err
	}

	return m.writeBody(altPart, boundary)
}

// writeBody writes the text/plain and text/html mime parts.
// It's incorrect to call writeBody without html or plain content.
func (m *MailYak) writeBody(w io.Writer, boundary string) error {
	alt := multipart.NewWriter(w)

	if err := alt.SetBoundary(boundary); err != nil {
		return err
	}

	var err error
	writePart := func(ctype string, data []byte) {
		if len(data) == 0 || err != nil {
			return
		}

		c := fmt.Sprintf("%s; charset=UTF-8", ctype)

		var part io.Writer
		part, err = alt.CreatePart(textproto.MIMEHeader{"Content-Type": {c}, "Content-Transfer-Encoding": {"quoted-printable"}})
		if err != nil {
			return
		}

		var buf bytes.Buffer
		qpw := quotedprintable.NewWriter(&buf)
		_, _ = qpw.Write(data)
		_ = qpw.Close()

		_, err = part.Write(buf.Bytes())
	}

	writePart("text/plain", m.plain.Bytes())
	writePart("text/html", m.html.Bytes())

	// If closing the alt fails, and there's not already an error set, return the
	// close error.
	if closeErr := alt.Close(); err == nil && closeErr != nil {
		return closeErr
	}

	return err
}
