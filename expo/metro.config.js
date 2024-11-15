// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config")
const { FileStore } = require("metro-cache")
const { withNativeWind } = require("nativewind/metro")

const path = require("path")

/**
 * Add the monorepo paths to the Metro config.
 * This allows Metro to resolve modules from the monorepo.
 *
 * @see https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
 * @param {import('expo/metro-config').MetroConfig} config
 * @returns {import('expo/metro-config').MetroConfig}
 */
function withMonorepoPaths(config) {
  const projectRoot = __dirname
  const workspaceRoot = path.resolve(projectRoot, "..")

  // #1 - Watch all files in the monorepo
  config.watchFolders = [workspaceRoot]

  // #2 - Resolve modules within the project's `node_modules` first, then all monorepo modules
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ]

  return config
}

const config = withMonorepoPaths(
  withNativeWind(getDefaultConfig(__dirname), {
    input: "./src/styles.css",
    configPath: "./tailwind.config.ts",
  }),
)

// XXX: Resolve our exports in workspace packages
// https://github.com/expo/expo/issues/26926
config.resolver.unstable_enablePackageExports = true

// Config to make jotai work in react native
// https://github.com/pmndrs/zustand/discussions/1967#discussioncomment-9578159
config.resolver.unstable_conditionNames = ["browser", "require", "react-native"]

module.exports = config