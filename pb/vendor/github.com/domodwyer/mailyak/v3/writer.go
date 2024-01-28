package mailyak

import "bytes"

// BodyPart is a buffer holding the contents of an email MIME part.
type BodyPart struct{ bytes.Buffer }

// Set accepts a string s as the contents of a BodyPart, replacing any existing
// data.
func (w *BodyPart) Set(s string) {
	w.Reset()
	w.WriteString(s)
}
