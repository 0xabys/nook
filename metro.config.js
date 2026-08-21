// https://docs.expo.dev/versions/v57.0.0/config/metro/
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config, {
  // inline variables phá PlatformColor khi nằm trong CSS variable
  inlineVariables: false,
  // className được bọc thủ công trong src/tw
  globalClassNamePolyfill: false,
});
