// Native setup the Bridgefy SDK needs and does not provide as a config plugin.
//   Android: core library desugaring (required by the SDK README). The SDK
//            adds its own Maven repository to every project at build time.
//   iOS:     Bluetooth background modes so the mesh keeps relaying.
// Kept as a plugin because android/ and ios/ are generated, never edited.

const { withAppBuildGradle, withInfoPlist } = require("expo/config-plugins");

const DESUGAR_LIB = "com.android.tools:desugar_jdk_libs:2.1.5";

function withDesugaring(config) {
  return withAppBuildGradle(config, (mod) => {
    let gradle = mod.modResults.contents;
    if (!gradle.includes("coreLibraryDesugaringEnabled")) {
      gradle = gradle.replace(
        /android\s*\{/,
        "android {\n    compileOptions {\n        coreLibraryDesugaringEnabled true\n    }",
      );
    }
    if (!gradle.includes(DESUGAR_LIB)) {
      gradle = gradle.replace(
        /dependencies\s*\{/,
        `dependencies {\n    coreLibraryDesugaring("${DESUGAR_LIB}")`,
      );
    }
    mod.modResults.contents = gradle;
    return mod;
  });
}

function withBluetoothBackground(config) {
  return withInfoPlist(config, (mod) => {
    const modes = new Set(mod.modResults.UIBackgroundModes ?? []);
    modes.add("bluetooth-central");
    modes.add("bluetooth-peripheral");
    mod.modResults.UIBackgroundModes = [...modes];
    return mod;
  });
}

module.exports = function withBridgefy(config) {
  return withBluetoothBackground(withDesugaring(config));
};
