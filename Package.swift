// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterRhai",
    products: [
        .library(name: "TreeSitterRhai", targets: ["TreeSitterRhai"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterRhai",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterRhaiTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterRhai",
            ],
            path: "bindings/swift/TreeSitterRhaiTests"
        )
    ],
    cLanguageStandard: .c11
)
