";" @punctuation
"," @punctuation.delimiter
"=>" @punctuation.delimiter
"(" @punctuation.bracket
")" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"#{" @punctuation.bracket


[
  "return"
  "let"
  "const"
  "export"
  "if"
  "else"
  "fn"
  "private"
  "import"
  "as"
] @keyword

(lit_bool) @boolean
(lit_str) @string
(lit_int) @number
(lit_float) @number
(Doc) @comment.doc

(binop) @operator

; (ObjectField
;   key: [(ident) (lit_str)] @property
;   value: (Expr))
(ObjectField
  key: [(ident) (lit_str)] @property
  value: (Expr))


(ident) @variable

(ExprCall fn_name: (Expr) @function.name)
(ExprFn fn_name: (ident) @function)
; (ExprObject ["#{" "}"]) @constructor
