/** @type {import("@babel/core").ConfigFunction} */
module.exports = (api) => {
  api.cache(true)
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: ["@babel/plugin-syntax-import-attributes"],
  }
}
