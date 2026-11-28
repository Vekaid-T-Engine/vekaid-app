// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "VEKAIDNative", platforms: [.iOS(.v16)], products: [.library(name: "VEKAIDNative", targets: ["VEKAIDNative"])], targets: [.target(name: "VEKAIDNative"), .testTarget(name: "VEKAIDNativeTests", dependencies: ["VEKAIDNative"])])
