import baseConfig, { restrictEnvAccess } from "@projeto/eslint-config/base"
import nextjsConfig from "@projeto/eslint-config/nextjs"
import reactConfig from "@projeto/eslint-config/react"

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: [".next/**"],
    },
    ...baseConfig,
    ...reactConfig,
    ...nextjsConfig,
    ...restrictEnvAccess,
]
