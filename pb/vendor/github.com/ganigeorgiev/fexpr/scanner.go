package fexpr

import (
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"io"
	"regexp"
	"strconv"
	"strings"
)

// eof represents a marker rune for the end of the reader.
const eof = rune(0)

// JoinOp represents a join type operator.
type JoinOp string

// supported join type operators
const (
	JoinAnd JoinOp = "&&"
	JoinOr  JoinOp = "||"
)

// SignOp represents an expression sign operator.
type SignOp string

// supported expression sign operators
const (
	SignEq    SignOp = "="
	SignNeq   SignOp = "!="
	SignLike  SignOp = "~"
	SignNlike SignOp = "!~"
	SignLt    SignOp = "<"
	SignLte   SignOp = "<="
	SignGt    SignOp = ">"
	SignGte   SignOp = ">="

	// array/any operators
	SignAnyEq    SignOp = "?="
	SignAnyNeq   SignOp = "?!="
	SignAnyLike  SignOp = "?~"
	SignAnyNlike SignOp = "?!~"
	SignAnyLt    SignOp = "?<"
	SignAnyLte   SignOp = "?<="
	SignAnyGt    SignOp = "?>"
	SignAnyGte   SignOp = "?>="
)

// TokenType represents a Token type.
type TokenType string

// token type constants
const (
	TokenUnexpected TokenType = "unexpected"
	TokenEOF        TokenType = "eof"
	TokenWS         TokenType = "whitespace"
	TokenJoin       TokenType = "join"
	TokenSign       TokenType = "sign"
	TokenIdentifier TokenType = "identifier" // variable, column name, placeholder, etc.
	TokenNumber     TokenType = "number"
	TokenText       TokenType = "text"  // ' or " quoted string
	TokenGroup      TokenType = "group" // groupped/nested tokens
	TokenComment    TokenType = "comment"
)

// Token represents a single scanned literal (one or more combined runes).
type Token struct {
	Type    TokenType
	Literal string
}

// Scanner represents a filter and lexical scanner.
type Scanner struct {
	r *bufio.Reader
}

// NewScanner creates and returns a new scanner instance with the specified io.Reader.
func NewScanner(r io.Reader) *Scanner {
	return &Scanner{bufio.NewReader(r)}
}

// Scan reads and returns the next available token value from the scanner's buffer.
func (s *Scanner) Scan() (Token, error) {
	ch := s.read()

	if isWhitespaceRune(ch) {
		s.unread()
		return s.scanWhitespace()
	}

	if isGroupStartRune(ch) {
		s.unread()
		return s.scanGroup()
	}

	if isIdentifierStartRune(ch) {
		s.unread()
		return s.scanIdentifier()
	}

	if isNumberStartRune(ch) {
		s.unread()
		return s.scanNumber()
	}

	if isTextStartRune(ch) {
		s.unread()
		return s.scanText()
	}

	if isSignStartRune(ch) {
		s.unread()
		return s.scanSign()
	}

	if isJoinStartRune(ch) {
		s.unread()
		return s.scanJoin()
	}

	if isCommentStartRune(ch) {
		s.unread()
		return s.scanComment()
	}

	if ch == eof {
		return Token{Type: TokenEOF, Literal: ""}, nil
	}

	return Token{Type: TokenUnexpected, Literal: string(ch)}, fmt.Errorf("unexpected character %q", ch)
}

// scanWhitespace consumes all contiguous whitespace runes.
func (s *Scanner) scanWhitespace() (Token, error) {
	var buf bytes.Buffer

	// Reads every subsequent whitespace character into the buffer.
	// Non-whitespace runes and EOF will cause the loop to exit.
	for {
		ch := s.read()

		if ch == eof {
			break
		}

		if !isWhitespaceRune(ch) {
			s.unread()
			break
		}

		// write the whitespace rune
		buf.WriteRune(ch)
	}

	return Token{Type: TokenWS, Literal: buf.String()}, nil
}

// scanIdentifier consumes all contiguous ident runes.
func (s *Scanner) scanIdentifier() (Token, error) {
	var buf bytes.Buffer

	// Read every subsequent identifier rune into the buffer.
	// Non-ident runes and EOF will cause the loop to exit.
	for {
		ch := s.read()

		if ch == eof {
			break
		}

		if !isIdentifierStartRune(ch) && !isDigitRune(ch) && ch != '.' && ch != ':' {
			s.unread()
			break
		}

		// write the ident rune
		buf.WriteRune(ch)
	}

	literal := buf.String()

	var err error
	if !isIdentifier(literal) {
		err = fmt.Errorf("Invalid identifier %q", literal)
	}

	return Token{Type: TokenIdentifier, Literal: literal}, err
}

// scanNumber consumes all contiguous digit runes.
func (s *Scanner) scanNumber() (Token, error) {
	var buf bytes.Buffer

	// read the number first rune to skip the sign (if exist)
	buf.WriteRune(s.read())

	// Read every subsequent digit rune into the buffer.
	// Non-digit runes and EOF will cause the loop to exit.
	for {
		ch := s.read()

		if ch == eof {
			break
		}

		if !isDigitRune(ch) && ch != '.' {
			s.unread()
			break
		}

		// write the digit rune
		buf.WriteRune(ch)
	}

	literal := buf.String()

	var err error
	if !isNumber(literal) {
		err = fmt.Errorf("invalid number %q", literal)
	}

	return Token{Type: TokenNumber, Literal: literal}, err
}

// scanText consumes all contiguous quoted text runes.
func (s *Scanner) scanText() (Token, error) {
	var buf bytes.Buffer

	// read the first rune to determine the quotes type
	firstCh := s.read()
	buf.WriteRune(firstCh)
	var prevCh rune
	var hasMatchingQuotes bool

	// Read every subsequent text rune into the buffer.
	// EOF and matching unescaped ending quote will cause the loop to exit.
	for {
		ch := s.read()

		if ch == eof {
			break
		}

		// write the text rune
		buf.WriteRune(ch)

		// unescaped matching quote, aka. the end
		if ch == firstCh && prevCh != '\\' {
			hasMatchingQuotes = true
			break
		}

		prevCh = ch
	}

	literal := buf.String()

	var err error
	if !hasMatchingQuotes {
		err = fmt.Errorf("invalid quoted text %q", literal)
	} else {
		// unquote
		literal = literal[1 : len(literal)-1]
		// remove escaped quotes prefix (aka. \)
		firstChStr := string(firstCh)
		literal = strings.Replace(literal, `\`+firstChStr, firstChStr, -1)
	}

	return Token{Type: TokenText, Literal: literal}, err
}

// scanSign consumes all contiguous sign operator runes.
func (s *Scanner) scanSign() (Token, error) {
	var buf bytes.Buffer

	// Read every subsequent sign rune into the buffer.
	// Non-sign runes and EOF will cause the loop to exit.
	for {
		ch := s.read()

		if ch == eof {
			break
		}

		if !isSignStartRune(ch) {
			s.unread()
			break
		}

		// write the sign rune
		buf.WriteRune(ch)
	}

	literal := buf.String()

	var err error
	if !isSignOperator(literal) {
		err = fmt.Errorf("invalid sign operator %q", literal)
	}

	return Token{Type: TokenSign, Literal: literal}, err
}

// scanJoin consumes all contiguous join operator runes.
func (s *Scanner) scanJoin() (Token, error) {
	var buf bytes.Buffer

	// Read every subsequent join operator rune into the buffer.
	// Non-join runes and EOF will cause the loop to exit.
	for {
		ch := s.read()

		if ch == eof {
			break
		}

		if !isJoinStartRune(ch) {
			s.unread()
			break
		}

		// write the join operator rune
		buf.WriteRune(ch)
	}

	literal := buf.String()

	var err error
	if !isJoinOperator(literal) {
		err = fmt.Errorf("invalid join operator %q", literal)
	}

	return Token{Type: TokenJoin, Literal: literal}, err
}

// scanGroup consumes all runes within a group/parenthesis.
func (s *Scanner) scanGroup() (Token, error) {
	var buf bytes.Buffer

	// read the first group bracket without writing it to the buffer
	firstChar := s.read()
	openGroups := 1

	// Read every subsequent text rune into the buffer.
	// EOF and matching unescaped ending quote will cause the loop to exit.
	for {
		ch := s.read()

		if ch == eof {
			break
		}

		if isGroupStartRune(ch) {
			// nested group
			openGroups++
			buf.WriteRune(ch)
		} else if isTextStartRune(ch) {
			s.unread()
			t, err := s.scanText()
			if err != nil {
				// write the errored literal as it is
				buf.WriteString(t.Literal)
				return Token{Type: TokenGroup, Literal: buf.String()}, err
			}

			// quote the literal to preserve the text start/end runes
			buf.WriteString("\"" + t.Literal + "\"")
		} else if ch == ')' {
			openGroups--

			if openGroups <= 0 {
				// main group end
				break
			} else {
				buf.WriteRune(ch)
			}
		} else {
			buf.WriteRune(ch)
		}
	}

	literal := buf.String()

	var err error
	if !isGroupStartRune(firstChar) || openGroups > 0 {
		err = fmt.Errorf("invalid formatted group - missing %d closing bracket(s)", openGroups)
	}

	return Token{Type: TokenGroup, Literal: literal}, err
}

// scanComment consumes all contiguous single line comment runes until
// a new character (\n) or EOF is reached.
func (s *Scanner) scanComment() (Token, error) {
	var buf bytes.Buffer

	// Read the first 2 characters without writting them to the buffer.
	if !isCommentStartRune(s.read()) || !isCommentStartRune(s.read()) {
		return Token{Type: TokenComment}, errors.New("invalid comment")
	}

	// Read every subsequent comment text rune into the buffer.
	// \n and EOF will cause the loop to exit.
	for i := 0; ; i++ {
		ch := s.read()

		if ch == eof || ch == '\n' {
			break
		}

		buf.WriteRune(ch)
	}

	literal := strings.TrimSpace(buf.String())

	return Token{Type: TokenComment, Literal: literal}, nil
}

// read reads the next rune from the buffered reader.
// Returns the `rune(0)` if an error or `io.EOF` occurs.
func (s *Scanner) read() rune {
	ch, _, err := s.r.ReadRune()
	if err != nil {
		return eof
	}
	return ch
}

// unread places the previously read rune back on the reader.
func (s *Scanner) unread() error {
	return s.r.UnreadRune()
}

// Lexical helpers:
// -------------------------------------------------------------------

// isWhitespaceRune checks if a rune is a space, tab, or newline.
func isWhitespaceRune(ch rune) bool { return ch == ' ' || ch == '\t' || ch == '\n' }

// isLetterRune checks if a rune is a letter.
func isLetterRune(ch rune) bool {
	return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

// isDigitRune checks if a rune is a digit.
func isDigitRune(ch rune) bool {
	return (ch >= '0' && ch <= '9')
}

// isIdentifierStartRune checks if a rune is valid identifier's first character.
func isIdentifierStartRune(ch rune) bool {
	return isLetterRune(ch) || ch == '_' || ch == '@' || ch == '#'
}

// isTextStartRune checks if a rune is a valid quoted text first character
// (aka. single or double quote).
func isTextStartRune(ch rune) bool {
	return ch == '\'' || ch == '"'
}

// isNumberStartRune checks if a rune is a valid number start character (aka. digit).
func isNumberStartRune(ch rune) bool {
	return ch == '-' || isDigitRune(ch)
}

// isSignStartRune checks if a rune is a valid sign operator start character.
func isSignStartRune(ch rune) bool {
	return ch == '=' ||
		ch == '?' ||
		ch == '!' ||
		ch == '>' ||
		ch == '<' ||
		ch == '~'
}

// isJoinStartRune checks if a rune is a valid join type start character.
func isJoinStartRune(ch rune) bool {
	return ch == '&' || ch == '|'
}

// isGroupStartRune checks if a rune is a valid group/parenthesis start character.
func isGroupStartRune(ch rune) bool {
	return ch == '('
}

// isCommentStartRune checks if a rune is a valid comment start character.
func isCommentStartRune(ch rune) bool {
	return ch == '/'
}

// isSignOperator checks if a literal is a valid sign operator.
func isSignOperator(literal string) bool {
	switch SignOp(literal) {
	case
		SignEq,
		SignNeq,
		SignLt,
		SignLte,
		SignGt,
		SignGte,
		SignLike,
		SignNlike,
		SignAnyEq,
		SignAnyNeq,
		SignAnyLike,
		SignAnyNlike,
		SignAnyLt,
		SignAnyLte,
		SignAnyGt,
		SignAnyGte:
		return true
	}

	return false
}

// isJoinOperator checks if a literal is a valid join type operator.
func isJoinOperator(literal string) bool {
	op := JoinOp(literal)

	return op == JoinAnd || op == JoinOr
}

// isNumber checks if a literal is numeric.
func isNumber(literal string) bool {
	// strconv.ParseFloat() considers numerics with dot suffix
	// a valid floating point number (eg. "123."), but we don't want this
	if literal == "" || literal[len(literal)-1] == '.' {
		return false
	}

	_, err := strconv.ParseFloat(literal, 64)

	return err == nil
}

var identifierRegex = regexp.MustCompile(`^[\@\#\_]?[\w\.\:]*\w+$`)

// isIdentifier checks if a literal is properly formatted identifier.
func isIdentifier(literal string) bool {
	return identifierRegex.MatchString(literal)
}
