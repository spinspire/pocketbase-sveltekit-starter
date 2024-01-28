// Package mailyak provides a simple interface for generating MIME compliant
// emails, and optionally sending them over SMTP.
//
// Both plain-text and HTML email body content is supported, and their types
// implement io.Writer allowing easy composition directly from templating
// engines, etc.
//
// Attachments are fully supported including inline attachments, with anything
// that implements io.Reader suitable as a source (like files on disk, in-memory
// buffers, etc).
//
// The raw MIME content can be retrieved using MimeBuf(), typically used with an
// API service such as Amazon SES that does not require using an SMTP interface.
//
// MailYak supports both plain-text SMTP (which is automatically upgraded to a
// secure connection with STARTTLS if supported by the SMTP server) and explicit
// TLS connections.
package mailyak
