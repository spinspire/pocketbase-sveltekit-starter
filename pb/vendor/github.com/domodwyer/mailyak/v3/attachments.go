package mailyak

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/textproto"
)

// DetectContentType needs at most 512 bytes
const sniffLen = 512

type partCreator interface {
	CreatePart(header textproto.MIMEHeader) (io.Writer, error)
}

type writeWrapper interface {
	new(w io.Writer) io.Writer
}

type attachment struct {
	filename string
	content  io.Reader
	inline   bool
	mimeType string
}

// Attach adds the contents of r to the email as an attachment with name as the
// filename.
//
// r is not read until Send is called and the MIME type will be detected
// using https://golang.org/pkg/net/http/#DetectContentType
func (m *MailYak) Attach(name string, r io.Reader) {
	m.attachments = append(m.attachments, attachment{
		filename: name,
		content:  r,
		inline:   false,
	})
}

// AttachWithMimeType adds the contents of r to the email as an attachment with
// name as the filename and mimeType as the specified MIME type of the content.
// It is up to the user to ensure the mimeType is correct.
//
// r is not read until Send is called.
func (m *MailYak) AttachWithMimeType(name string, r io.Reader, mimeType string) {
	m.attachments = append(m.attachments, attachment{
		filename: name,
		content:  r,
		inline:   false,
		mimeType: mimeType,
	})
}

// AttachInline adds the contents of r to the email as an inline attachment.
// Inline attachments are typically used within the email body, such as a logo
// or header image. It is up to the user to ensure name is unique.
//
// Files can be referenced by their name within the email using the cid URL
// protocol:
//
//	<img src="cid:myFileName"/>
//
// r is not read until Send is called and the MIME type will be detected
// using https://golang.org/pkg/net/http/#DetectContentType
func (m *MailYak) AttachInline(name string, r io.Reader) {
	m.attachments = append(m.attachments, attachment{
		filename: name,
		content:  r,
		inline:   true,
	})
}

// AttachInlineWithMimeType adds the contents of r to the email as an inline attachment
// with mimeType as the specified MIME type of the content. Inline attachments are
// typically used within the email body, such as a logo or header image. It is up to the
// user to ensure name is unique and the specified mimeType is correct.
//
// Files can be referenced by their name within the email using the cid URL
// protocol:
//
//	<img src="cid:myFileName"/>
//
// r is not read until Send is called.
func (m *MailYak) AttachInlineWithMimeType(name string, r io.Reader, mimeType string) {
	m.attachments = append(m.attachments, attachment{
		filename: name,
		content:  r,
		inline:   true,
		mimeType: mimeType,
	})
}

// ClearAttachments removes all current attachments.
func (m *MailYak) ClearAttachments() {
	m.attachments = []attachment{}
}

// writeAttachments loops over the attachments, guesses their content-type and
// writes the data as a line-broken base64 string (using the splitter mutator).
func (m *MailYak) writeAttachments(mixed partCreator, splitter writeWrapper) error {
	h := make([]byte, sniffLen)

	for _, item := range m.attachments {
		hLen, err := io.ReadFull(item.content, h)
		if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
			return err
		}

		if item.mimeType == "" {
			item.mimeType = http.DetectContentType(h[:hLen])
		}

		ctype := fmt.Sprintf("%s;\n\tfilename=%q; name=%q", item.mimeType, item.filename, item.filename)

		part, err := mixed.CreatePart(getMIMEHeader(item, ctype))
		if err != nil {
			return err
		}

		encoder := base64.NewEncoder(base64.StdEncoding, splitter.new(part))
		if _, err := encoder.Write(h[:hLen]); err != nil {
			return err
		}

		// More to write?
		if hLen == sniffLen {
			if _, err := io.Copy(encoder, item.content); err != nil {
				return err
			}
		}

		if err := encoder.Close(); err != nil {
			return err
		}
	}

	return nil
}

func getMIMEHeader(a attachment, ctype string) textproto.MIMEHeader {
	var disp string
	var header textproto.MIMEHeader

	cid := fmt.Sprintf("<%s>", a.filename)
	if a.inline {
		disp = fmt.Sprintf("inline;\n\tfilename=%q; name=%q", a.filename, a.filename)
		header = textproto.MIMEHeader{
			"Content-Type":              {ctype},
			"Content-Disposition":       {disp},
			"Content-Transfer-Encoding": {"base64"},
			"Content-ID":                {cid},
		}
	} else {
		disp = fmt.Sprintf("attachment;\n\tfilename=%q; name=%q", a.filename, a.filename)
		header = textproto.MIMEHeader{
			"Content-Type":              {ctype},
			"Content-Disposition":       {disp},
			"Content-Transfer-Encoding": {"base64"},
			"Content-ID":                {cid},
		}
	}

	return header
}
