export class CreateSessionError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const InvalidSessionErrorKind = {
  NOT_FOUND: "NOT_FOUND",
  EXPIRED: "EXPIRED",
} as const
export type InvalidSessionErrorKind =
  (typeof InvalidSessionErrorKind)[keyof typeof InvalidSessionErrorKind]

export class InvalidSessionError extends Error {
  public kind: InvalidSessionErrorKind

  constructor(kind: InvalidSessionErrorKind) {
    super("Invalid session")
    this.kind = kind
  }

  static expired() {
    return new InvalidSessionError(InvalidSessionErrorKind.EXPIRED)
  }
  static notFound() {
    return new InvalidSessionError(InvalidSessionErrorKind.NOT_FOUND)
  }
}
