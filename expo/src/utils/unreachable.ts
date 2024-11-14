export function unreachable(msg: string): never {
  throw new Error(msg)
}
