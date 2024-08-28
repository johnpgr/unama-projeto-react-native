import baseConfig from "@projeto/eslint-config/base"
import reactConfig from "@projeto/eslint-config/react"

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: ["dist/**"],
    },
    ...baseConfig,
    ...reactConfig,
]
