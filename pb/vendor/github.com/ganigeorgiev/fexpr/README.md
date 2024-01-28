fexpr
[![Go Report Card](https://goreportcard.com/badge/github.com/ganigeorgiev/fexpr)](https://goreportcard.com/report/github.com/ganigeorgiev/fexpr)
[![GoDoc](https://godoc.org/github.com/ganigeorgiev/fexpr?status.svg)](https://pkg.go.dev/github.com/ganigeorgiev/fexpr)
================================================================================

**fexpr** is a filter query language parser that generates easy to work with AST structure so that you can create safely SQL, Elasticsearch, etc. queries from user input.

Or in other words, transform the string `"id > 1"` into the struct `[{&& {{identifier id} > {number 1}}}]`.

Supports parenthesis and various conditional expression operators (see [Grammar](https://github.com/ganigeorgiev/fexpr#grammar)).


## Example usage

```
go get github.com/ganigeorgiev/fexpr
```

```go
package main

import github.com/ganigeorgiev/fexpr

func main() {
    result, err := fexpr.Parse("id=123 && status='active'")
    // result: [{&& {{identifier id} = {number 123}}} {&& {{identifier status} = {text active}}}]
}
```

> Note that each parsed expression statement contains a join/union operator (`&&` or `||`) so that the result can be consumed on small chunks without having to rely on the group/nesting context.

> See the [package documentation](https://pkg.go.dev/github.com/ganigeorgiev/fexpr) for more details and examples.


## Grammar

**fexpr** grammar resembles the SQL `WHERE` expression syntax. It recognizes several token types (identifiers, numbers, quoted text, expression operators, whitespaces, etc.).

> You could find all supported tokens in [`scanner.go`](https://github.com/ganigeorgiev/fexpr/blob/master/scanner.go).

#### Operators

- **`=`**  Equal operator (eg. `a=b`)
- **`!=`** NOT Equal operator (eg. `a!=b`)
- **`>`**  Greater than operator (eg. `a>b`)
- **`>=`** Greater than or equal operator (eg. `a>=b`)
- **`<`**  Less than or equal operator (eg. `a<b`)
- **`<=`** Less than or equal operator (eg. `a<=b`)
- **`~`**  Like/Contains operator (eg. `a~b`)
- **`!~`** NOT Like/Contains operator (eg. `a!~b`)
- **`?=`**  Array/Any equal operator (eg. `a?=b`)
- **`?!=`** Array/Any NOT Equal operator (eg. `a?!=b`)
- **`?>`**  Array/Any Greater than operator (eg. `a?>b`)
- **`?>=`** Array/Any Greater than or equal operator (eg. `a?>=b`)
- **`?<`**  Array/Any Less than or equal operator (eg. `a?<b`)
- **`?<=`** Array/Any Less than or equal operator (eg. `a?<=b`)
- **`?~`**  Array/Any Like/Contains operator (eg. `a?~b`)
- **`?!~`** Array/Any NOT Like/Contains operator (eg. `a?!~b`)
- **`&&`** AND join operator (eg. `a=b && c=d`)
- **`||`** OR join operator (eg. `a=b || c=d`)
- **`()`** Parenthesis (eg. `(a=1 && b=2) || (a=3 && b=4)`)

#### Numbers
Number tokens are any integer or decimal numbers.

_Example_: `123`, `10.50`, `-14`.

#### Identifiers

Identifier tokens are literals that start with a letter, `_`, `@` or `#` and could contain further any number of letters, digits, `.` (usually used as a separator) or `:` (usually used as modifier) characters.

_Example_: `id`, `a.b.c`, `field123`, `@request.method`, `author.name:length`.

#### Quoted text

Text tokens are any literals that are wrapped by `'` or `"` quotes.

_Example_: `'Lorem ipsum dolor 123!'`, `"escaped \"word\""`, `"mixed 'quotes' are fine"`.

#### Comments

Comment tokens are any single line text literals starting with `//`.
Similar to whitespaces, comments are ignored by `fexpr.Parse()`.

_Example_: `// test`.


## Using only the scanner

The tokenizer (aka. `fexpr.Scanner`) could be used without the parser's state machine so that you can write your own custom tokens processing:

```go
s := fexpr.NewScanner(strings.NewReader("id > 123"))

// scan single token at a time until EOF or error is reached
for {
    t, err := s.Scan()
    if t.Type == fexpr.TokenEOF || err != nil {
        break
    }

    fmt.Println(t)
}

// Output:
// {identifier id}
// {whitespace  }
// {sign >}
// {whitespace  }
// {number 123}
```
