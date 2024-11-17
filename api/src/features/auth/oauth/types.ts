import type { Session } from "../../user/user.schema.ts";

export interface CreatedSession {
  session: Session;
  token: string;
}
