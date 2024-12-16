(ExprFn
  fn_name: (FnDeclName) @name
  params: (ParamList) @context
  body: (ExprBlock)
  ) @item

(Item
  (Doc) @annotation
  (Expr
    (ExprFn
      fn_name: (FnDeclName) @name
      params: (ParamList) @context
      body: (ExprBlock)
    ) @item))

(ExprDeclareVar
  name: (ident) @name
  value: (Expr)) @item

(Item
  (Doc) @annotation
  (Expr
    (ExprDeclareVar
      name: (ident) @name
      value: (Expr)) @item
))
