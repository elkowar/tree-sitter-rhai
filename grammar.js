/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  assignment: 1,
  range: 2,
  or: 3,
  and: 4,
  compare: 5,
  bit_or: 6,
  bit_xor: 7,
  bit_and: 8,
  shift: 9,
  add: 10,
  multiply: 11,
  exponent: 12,
  unary: 13,
  call: 14,
  member: 15,
};

function binary($, operator, precedence, associativity = "left") {
  const applyPrecedence = associativity === "right" ? prec.right : prec.left;

  return applyPrecedence(
    precedence,
    seq(
      field("left", $.Expr),
      field("operator", alias(operator, $.binop)),
      field("right", $.Expr),
    ),
  );
}

module.exports = grammar({
  name: "rhai",

  word: ($) => $.ident,

  extras: ($) => [/\s/, $.comment_line, $.comment_block],

  rules: {
    Rhai: ($) => seq(repeat($.Stmt)),

    Item: ($) => seq(repeat($.Doc), $.Expr),

    Doc: ($) => choice($.comment_line_doc, $.comment_block_doc),

    Stmt: ($) => choice(";", prec.right(seq($.Item, optional(";")))),

    Expr: ($) =>
      choice(
        $.ExprDotAccess,
        $.ExprIdent,
        $.ExprPath,
        $.ExprLit,
        $.ExprDeclareVar,
        $.ExprBlock,
        $.ExprUnary,
        $.ExprBinary,
        $.ExprParen,
        $.ExprArray,
        $.ExprIndex,
        $.ExprObject,
        $.ExprCall,
        $.ExprClosure,
        $.ExprIf,
        $.ExprLoop,
        $.ExprFor,
        $.ExprWhile,
        $.ExprDo,
        $.ExprBreak,
        $.ExprContinue,
        $.ExprSwitch,
        $.ExprReturn,
        $.ExprFn,
        $.ExprExportIdent,
        $.ExprImport,
        $.ExprTry,
        $.ExprThrow,
      ),

    ExprIdent: ($) => prec(2, $.ident),

    ExprPath: ($) => $.Path,

    Path: ($) => prec.left(3, seq($.ident, repeat(seq("::", $.ident)))),

    ExprLit: ($) => $.Lit,

    Lit: ($) =>
      choice($.lit_float, $.lit_int, $.lit_char, $.lit_str, $.lit_bool, $.LitUnit),
    LitUnit: ($) => seq("(", ")"),

    ExprDeclareVar: ($) =>
      prec.right(
        2,
        seq(
          optional("export"),
          choice("let", "const"),
          field("name", $.ident),
          optional(seq("=", field("value", $.Expr))),
        ),
      ),

    ExprBlock: ($) => seq("{", repeat($.Stmt), "}"),

    ExprUnary: ($) => prec(PREC.unary, seq(choice("+", "-", "!"), $.Expr)),

    binop: ($) =>
      choice(
        "..",
        "..=",
        "||",
        "&&",
        "==",
        "!=",
        "<=",
        ">=",
        "<",
        ">",
        "in",
        "+",
        "*",
        "**",
        "-",
        "/",
        "%",
        "<<",
        ">>",
        "^",
        "|",
        "&",
        "=",
        "+=",
        "/=",
        "*=",
        "**=",
        "%=",
        ">>=",
        "<<=",
        "-=",
        "|=",
        "&=",
        "^=",
        // ".",
        // "?.",
        "??",
      ),

    ExprDotAccess: ($) =>
      prec.left(PREC.member, seq($.Expr, choice(".", "?."), $.Expr)),
    ExprBinary: ($) =>
      choice(
        binary($, "**", PREC.exponent, "right"),
        binary($, choice("*", "/", "%"), PREC.multiply),
        binary($, choice("+", "-"), PREC.add),
        binary($, choice("<<", ">>"), PREC.shift),
        binary($, "&", PREC.bit_and),
        binary($, "^", PREC.bit_xor),
        binary($, "|", PREC.bit_or),
        binary(
          $,
          choice("==", "!=", "<", "<=", ">", ">=", "in"),
          PREC.compare,
        ),
        binary($, "&&", PREC.and),
        binary($, "||", PREC.or),
        binary($, choice("..", "..="), PREC.range),
        binary(
          $,
          choice(
            "=",
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
            "**=",
            "<<=",
            ">>=",
            "&=",
            "|=",
            "^=",
          ),
          PREC.assignment,
          "right",
        ),
        binary($, "??", PREC.or),
      ),

    ExprParen: ($) => seq("(", $.Expr, ")"),

    ExprArray: ($) =>
      seq(
        "[",
        optional(seq($.Expr, repeat(seq(",", $.Expr)), optional(","))),
        "]",
      ),

    ExprIndex: ($) =>
      prec.left(PREC.member, seq($.Expr, choice("[", "?["), $.Expr, "]")),

    ExprObject: ($) =>
      seq(
        "#{",
        optional(
          seq($.ObjectField, repeat(seq(",", $.ObjectField)), optional(",")),
        ),
        "}",
      ),

    ObjectField: ($) =>
      seq(
        field("key", choice($.ident, $.lit_str)),
        ":",
        field("value", $.Expr),
      ),

    ExprCall: ($) => prec(PREC.call, seq(field("fn_name", $.Expr), $.ArgList)),

    ArgList: ($) =>
      seq(
        "(",
        field(
          "args",
          optional(seq($.Expr, repeat(seq(",", $.Expr)), optional(","))),
        ),
        ")",
      ),

    ExprClosure: ($) => prec.right(2, seq($.ClosureParamList, $.Expr)),
    ClosureParamList: ($) =>
      seq(
        "|",
        optional(seq($.Param, repeat(seq(",", $.Param)), optional(","))),
        "|",
      ),

    ParamList: ($) =>
      choice(
        seq(
          "(",
          optional(seq($.Param, repeat(seq(",", $.Param)), optional(","))),
          ")",
        ),
      ),

    Param: ($) => $.ident,

    ExprIf: ($) =>
      seq(
        "if",
        $.Expr,
        $.ExprBlock,
        optional(seq("else", choice($.ExprIf, $.ExprBlock))),
      ),

    ExprLoop: ($) => seq("loop", $.ExprBlock),

    ExprFor: ($) => seq("for", $.Pat, "in", $.Expr, $.ExprBlock),

    ExprWhile: ($) => seq("while", $.Expr, $.ExprBlock),

    ExprDo: ($) =>
      seq("do", $.ExprBlock, prec.right(seq(choice("while", "until"), $.Expr))),

    ExprBreak: ($) => prec.right(1, seq("break", optional($.Expr))),

    ExprContinue: ($) => "continue",

    ExprSwitch: ($) => seq("switch", $.Expr, $.SwitchArmList),

    SwitchArmList: ($) =>
      seq(
        "{",
        optional(
          seq($.SwitchArm, repeat(seq(",", $.SwitchArm)), optional(",")),
        ),
        "}",
      ),

    SwitchArm: ($) =>
      seq(choice($.Expr, "_"), optional($.SwitchArmCondition), "=>", $.Expr),

    SwitchArmCondition: ($) => seq("if", $.Expr),

    ExprThrow: ($) => prec.right(2, seq("throw", $.Expr)),

    ExprReturn: ($) => prec.right(1, seq("return", optional($.Expr))),

    FnDeclName: ($) => seq($.ident, repeat(seq(".", $.ident))),
    ExprFn: ($) =>
      seq(
        optional("private"),
        "fn",
        field("fn_name", $.FnDeclName),
        field("params", $.ParamList),
        field("body", $.ExprBlock),
      ),

    ExprImport: ($) =>
      prec.right(2, seq("import", $.Expr, optional(seq("as", $.ident)))),

    ExprExportIdent: ($) =>
      seq("export", prec.right(2, seq($.ident, optional(seq("as", $.ident))))),

    ExprTry: ($) =>
      seq("try", $.ExprBlock, "catch", optional($.ParamList), $.ExprBlock),

    Pat: ($) => choice($.PatTuple, $.PatIdent),

    PatTuple: ($) =>
      seq(
        "(",
        optional(seq($.ident, repeat(seq(",", $.ident)), optional(","))),
        ")",
      ),

    PatIdent: ($) => $.ident,

    // string stuff

    _lit_str_dquote: ($) =>
      seq('"', optional(repeat1(choice(/([^"\\]|\\.)+/, "\\\n"))), '"'),

    _lit_str_backticks: ($) =>
      seq(
        "`",
        repeat(choice($.str_template_str_content, $.str_template_expr)),
        "`",
      ),
    str_template_str_content: ($) => choice(/([^\\`$]|\\.)+/, "$"),
    str_template_expr: ($) => seq("${", repeat1($.Stmt), "}"),

    // Tokens

    ident: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    lit_int: ($) => choice(/\d[\d_]*/, /0[xX][0-9a-fA-F][0-9a-fA-F_]*/),
    lit_float: ($) =>
      choice(
        /\d[\d_]*\.\d[\d_]*([eE][+-]?\d[\d_]*)?/,
        /\d[\d_]*[eE][+-]?\d[\d_]*/,
      ),
    lit_char: ($) => /'([^'\\\n]|\\(x[0-9a-fA-F]{2}|u\{[0-9a-fA-F_]+\}|.))'/,
    lit_str: ($) =>
      choice($._lit_str_dquote, $._lit_str_backticks),
    lit_bool: ($) => choice("true", "false"),
    comment_line: ($) => token(prec(-1, /\/\/[^\n]*/)),
    comment_block: ($) => token(prec(-1, /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//)),
    comment_line_doc: ($) => token(prec(1, /\/\/\/[^\n]*/)),
    comment_block_doc: ($) => token(prec(1, /\/\*\*[^*]*\*+(?:[^/*][^*]*\*+)*\//)),
  },
});
