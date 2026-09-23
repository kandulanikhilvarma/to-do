// Windows builds fail when a C++ object path passes 260 characters, and
// react-native-gesture-handler's codegen produces one near 370. The Android
// toolchain leaves CMAKE_OBJECT_PATH_MAX unset, so CMake never shortens it;
// setting it makes CMake hash over-long object names. CMake keeps the file
// name plus a 32-char md5, so the limit must leave room for both: 255 gives a
// 252-char path here, under Windows' 260. No effect on macOS/Linux
// builds beyond shorter intermediate file names.

const { withAppBuildGradle } = require("expo/config-plugins");

const ARG = '"-DCMAKE_OBJECT_PATH_MAX=255"';

module.exports = function withShortObjectPaths(config) {
  return withAppBuildGradle(config, (mod) => {
    const gradle = mod.modResults.contents;
    if (!gradle.includes("CMAKE_OBJECT_PATH_MAX")) {
      mod.modResults.contents = gradle.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {\n        externalNativeBuild {\n            cmake {\n                arguments ${ARG}\n            }\n        }`,
      );
    }
    return mod;
  });
};
