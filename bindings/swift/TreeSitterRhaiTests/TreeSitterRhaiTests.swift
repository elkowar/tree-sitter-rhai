import XCTest
import SwiftTreeSitter
import TreeSitterRhai

final class TreeSitterRhaiTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_rhai())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Rhai grammar")
    }
}
