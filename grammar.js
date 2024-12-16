/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "rhai",

  extras: ($) => [/\s/, $.comment_line_doc, $.comment_block_doc],

  rules: {
    Rhai: ($) => seq(repeat($.Stmt)),
    RhaiDef: ($) => seq($.DefModuleDecl, repeat($.DefStmt)),

    Item: ($) => prec(2, seq(repeat($.Doc), $.Expr)),

    Doc: ($) => choice($.comment_line_doc, $.comment_block_doc),

    Stmt: ($) => choice(";", prec.right(2, seq($.Item, optional(";")))),

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
      choice($.lit_int, $.lit_float, $.lit_str, $.lit_bool, $.LitUnit),
    LitUnit: ($) => seq("(", ")"),

    // TODO: unsure
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

    // ExprConst: ($) =>
    //   prec.right(
    //     2,
    //     seq("const", field("name", $.ident), "=", field("value", $.Expr)),
    //   ),

    ExprBlock: ($) => seq("{", repeat($.Stmt), "}"),

    ExprUnary: ($) => prec(2, seq(choice("+", "-", "!"), $.Expr)),

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

    ExprDotAccess: ($) => prec.left(3, seq($.Expr, choice(".", "?."), $.Expr)),
    // TODO: very unsure about prec.right here, was because Expr = Expr = Expr
    ExprBinary: ($) =>
      prec.right(
        1,
        seq(
          field("left", $.Expr),
          field("operator", $.binop),
          field("right", $.Expr),
        ),
      ),

    ExprParen: ($) => seq("(", $.Expr, ")"),

    ExprArray: ($) =>
      seq(
        "[",
        optional(seq($.Expr, repeat(seq(",", $.Expr)), optional(","))),
        "]",
      ),

    ExprIndex: ($) => seq($.Expr, choice("[", "?["), $.Expr, "]"),

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

    ExprCall: ($) => prec(3, seq(field("fn_name", $.Expr), $.ArgList)),

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

    DefStmt: ($) => choice(";", prec.left(2, seq($.DefItem, optional(";")))),

    DefItem: ($) => seq(repeat($.Doc), $.Def),

    DefModuleDecl: ($) => seq(repeat($.Doc), $.DefModule),

    Def: ($) =>
      choice(
        $.DefModuleInline,
        $.DefImport,
        $.DefConst,
        $.DefLet,
        $.DefFn,
        $.DefOp,
        $.DefType,
      ),

    DefModuleInline: ($) => seq("module", $.ident, "{", repeat($.DefStmt), "}"),

    DefModule: ($) =>
      prec.right(seq("module", optional(choice($.ident, $.lit_str, "static")))),

    DefImport: ($) => seq("import", $.Expr, optional(seq("as", $.ident))),

    DefConst: ($) => seq("const", $.ident, optional(seq(":", $.Type))),

    DefLet: ($) => seq("let", $.ident, optional(seq(":", $.Type))),

    DefOp: ($) =>
      seq(
        $.ident,
        choice($.ident, $.binop),
        $.TypeList,
        optional(seq("->", $.Type)),
        optional($.DefOpPrecedence),
      ),

    DefOpPrecedence: ($) =>
      seq(
        "with",
        "(",
        optional(seq($.lit_int, repeat(seq(",", $.lit_int)), optional(","))),
        ")",
      ),

    DefType: ($) => seq($.ident, $.ident, "=", choice($.Type, "...")),

    DefFn: ($) =>
      seq(
        "fn",
        optional($.ident),
        $.ident,
        $.TypedParamList,
        optional(seq("->", $.Type)),
      ),

    Type: ($) =>
      choice(
        $.TypeIdent,
        $.TypeLit,
        $.TypeObject,
        $.TypeArray,
        $.TypeTuple,
        $.TypeUnknown,
      ),

    TypeIdent: ($) => seq($.ident, optional($.TypeGenerics)),

    TypeGenerics: ($) =>
      seq(
        "<",
        optional(seq($.Type, repeat(seq(",", $.Type)), optional(","))),
        ">",
      ),

    TypeTuple: ($) =>
      seq(
        "(",
        optional(seq($.Type, repeat(seq(",", $.Type)), optional(","))),
        ")",
      ),

    TypeLit: ($) => $.Lit,

    TypeObject: ($) =>
      seq(
        "#{",
        optional(
          seq(
            $.TypeObjectField,
            repeat(seq(",", $.TypeObjectField)),
            optional(","),
          ),
        ),
        "}",
      ),

    TypeObjectField: ($) =>
      seq(repeat($.Doc), choice($.ident, $.Lit), ":", $.Type),

    TypedParamList: ($) =>
      seq(
        "(",
        optional(
          seq($.TypedParam, repeat(seq(",", $.TypedParam)), optional(",")),
        ),
        ")",
      ),

    TypedParam: ($) => seq(optional("..."), $.ident, ":", $.Type),

    TypeList: ($) =>
      seq(
        "(",
        optional(seq($.Type, repeat(seq(",", $.Type)), optional(","))),
        ")",
      ),

    TypeUnion: ($) => seq($.Type, "|", $.Type),

    TypeUnknown: ($) => "?",

    TypeArray: ($) =>
      seq("[", $.Type, repeat(seq(",", $.Type)), optional(","), "]"),

    // string stuff

    _lit_str_dquote: ($) =>
      seq('"', optional(repeat1(choice(/([^"\\]|\\.)+/, "\\\n"))), '"'),
    _lit_str_squote: ($) => /'([^'\\]|\\.)*'/,

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
    lit_int: ($) => /\d+(_\d\d\d)*/,
    lit_float: ($) => /\d+\.\d+/,
    lit_str: ($) =>
      choice($._lit_str_dquote, $._lit_str_squote, $._lit_str_backticks),
    lit_bool: ($) => choice("true", "false"),
    comment_line_doc: ($) => /\/\/[^\n]*/,
    comment_block_doc: ($) => /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//,
  },
});
