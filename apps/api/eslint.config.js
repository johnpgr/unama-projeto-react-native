import baseConfig from "@projeto/eslint-config/base"

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: [".expo/**", "expo-plugins/**"],
    },
    ...baseConfig,
]
