import type { Session, User } from "lucia"

import type { DatabaseUserAttributes } from "./auth"

interface Variables {
    user: (User & DatabaseUserAttributes) | null
    session: Session | null
}

export interface AppContext {
    Variables: Variables
}
