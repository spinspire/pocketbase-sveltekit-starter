package fexpr

import (
	"errors"
	"fmt"
	"strings"
)

var ErrEmpty = errors.New("empty filter expression")
var ErrIncomplete = errors.New("invalid or incomplete filter expression")

// Expr represents an individual tokenized expression consisting
// of left operand, operator and a right operand.
type Expr struct {
	Left  Token
	Op    SignOp
	Right Token
}

func (e Expr) IsZero() bool {
	return e.Op == "" && e.Left.Literal == "" && e.Left.Type == "" && e.Right.Literal == "" && e.Right.Type == ""
}

// ExprGroup represents a wrapped expression and its join type.
//
// The group's Item could be either an `Expr` instance or `[]ExprGroup` slice (for nested expressions).
type ExprGroup struct {
	Join JoinOp
	Item interface{}
}

// parser's state machine steps
const (
	stepBeforeSign = iota
	stepSign
	stepAfterSign
	StepJoin
)

// Parse parses the provided text and returns its processed AST
// in the form of `ExprGroup` slice(s).
//
// Comments and whitespaces are ignored.
func Parse(text string) ([]ExprGroup, error) {
	result := []ExprGroup{}
	scanner := NewScanner(strings.NewReader(text))
	step := stepBeforeSign
	join := JoinAnd

	var expr Expr

	for {
		t, err := scanner.Scan()
		if err != nil {
			return nil, err
		}

		if t.Type == TokenEOF {
			break
		}

		if t.Type == TokenWS || t.Type == TokenComment {
			continue
		}

		if t.Type == TokenGroup {
			groupResult, err := Parse(t.Literal)
			if err != nil {
				return nil, err
			}

			// append only if non-empty group
			if len(groupResult) > 0 {
				result = append(result, ExprGroup{Join: join, Item: groupResult})
			}

			step = StepJoin
			continue
		}

		switch step {
		case stepBeforeSign:
			if t.Type != TokenIdentifier && t.Type != TokenText && t.Type != TokenNumber {
				return nil, fmt.Errorf("expected left operand (identifier, text or number), got %q (%s)", t.Literal, t.Type)
			}

			expr = Expr{Left: t}

			step = stepSign
		case stepSign:
			if t.Type != TokenSign {
				return nil, fmt.Errorf("expected a sign operator, got %q (%s)", t.Literal, t.Type)
			}

			expr.Op = SignOp(t.Literal)
			step = stepAfterSign
		case stepAfterSign:
			if t.Type != TokenIdentifier && t.Type != TokenText && t.Type != TokenNumber {
				return nil, fmt.Errorf("expected right operand (identifier, text or number), got %q (%s)", t.Literal, t.Type)
			}

			expr.Right = t
			result = append(result, ExprGroup{Join: join, Item: expr})

			step = StepJoin
		case StepJoin:
			if t.Type != TokenJoin {
				return nil, fmt.Errorf("expected && or ||, got %q (%s)", t.Literal, t.Type)
			}

			join = JoinAnd
			if t.Literal == "||" {
				join = JoinOr
			}

			step = stepBeforeSign
		}
	}

	if step != StepJoin {
		if len(result) == 0 && expr.IsZero() {
			return nil, ErrEmpty
		}

		return nil, ErrIncomplete
	}

	return result, nil
}
