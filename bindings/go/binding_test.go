package tree_sitter_rhai_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_rhai "github.com/tree-sitter/tree-sitter-rhai/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_rhai.Language())
	if language == nil {
		t.Errorf("Error loading Rhai grammar")
	}
}
