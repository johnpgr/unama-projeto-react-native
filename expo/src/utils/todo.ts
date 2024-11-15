export function TODO(message: string): never {
  throw new Error(`TODO: ${message}`)
}
