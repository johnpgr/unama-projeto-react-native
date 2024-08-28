import baseConfig, { restrictEnvAccess } from "@projeto/eslint-config/base"

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: [],
    },
    ...baseConfig,
    ...restrictEnvAccess,
]
