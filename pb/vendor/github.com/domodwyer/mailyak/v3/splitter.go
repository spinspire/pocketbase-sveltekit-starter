package mailyak

import (
	"io"
)

const maxLineLen = 60

// lineSplitter breaks the given input into lines of maxLineLen characters
// before writing a "\r\n" newline
type lineSplitter struct {
	w      io.Writer
	wrote  uint
	maxLen int
}

type lineSplitterBuilder struct{}

func (b lineSplitterBuilder) new(w io.Writer) io.Writer {
	return &lineSplitter{w: w, maxLen: maxLineLen}
}

func (w *lineSplitter) Write(p []byte) (int, error) {
	// Calculate the previously wrote line length
	leftover := w.wrote % uint(w.maxLen)

	// Calculate the amount of bytes remaining for this line
	lineSize := w.maxLen - int(leftover)

	// Break p into chunks
	for i := 0; i < len(p); i += lineSize {

		// Reset linesize
		if i%w.maxLen != 0 && lineSize < w.maxLen {
			lineSize = w.maxLen
		}

		// Calculate the end of the chunk offset
		end := i + lineSize
		if end > len(p) {
			end = len(p)
		}

		// Slice chunk out of p
		chunk := p[i:end]
		// Increment the amount wrote so far by the chunk size
		w.wrote += uint(len(chunk))

		// Write the chunk
		if n, err := w.w.Write(chunk); err != nil {
			return i + n, err
		}

		// If this finishes a line, add linebreaks
		if end == i+lineSize {
			if _, err := w.w.Write([]byte("\r\n")); err != nil {
				// If this errors, return the bytes wrote so far from the
				// caller's perspective (it is unaware newlines are being added)
				return i + len(chunk), err
			}
		}
	}

	return len(p), nil
}
