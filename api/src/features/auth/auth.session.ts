import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { eq } from "drizzle-orm";

import { db } from "../../drizzle/index.ts";
import { Session, User } from "../user/user.schema.ts";
import { InvalidSessionError } from "./auth.error.ts";

export class SessionService {
  private static instance: SessionService;
  private textEncoder = new TextEncoder();

  constructor() {
    if (SessionService.instance) {
      return SessionService.instance;
    }
    SessionService.instance = this;
  }

  static getInstance() {
    return new SessionService();
  }

  generateSessionToken(): string {
    return crypto.randomUUID();
  }

  async createSession(
    userId: string,
  ): Promise<{ session: Session; token: string }> {
    const token = this.generateSessionToken();
    const sessionId = encodeHexLowerCase(
      sha256(this.textEncoder.encode(token)),
    );
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await db.insert(Session).values(session);
    return { session, token };
  }

  async validateSessionToken(
    token: string,
  ): Promise<InvalidSessionError | { session: Session; user: User }> {
    const sessionId = encodeHexLowerCase(
      sha256(this.textEncoder.encode(token)),
    );

    const [found] = await db
      .select({ user: User, session: Session })
      .from(Session)
      .innerJoin(User, eq(Session.userId, User.id))
      .where(eq(Session.id, sessionId));

    if (!found) {
      return InvalidSessionError.notFound();
    }

    const { session, user } = found;

    // Delete the session if it's expired
    if (Date.now() >= session.expiresAt.getTime()) {
      await db.delete(Session).where(eq(Session.id, session.id));
      return InvalidSessionError.expired();
    }

    // Refresh the session if it's within 15 days of expiring
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      await db
        .update(Session)
        .set({
          expiresAt: session.expiresAt,
        })
        .where(eq(Session.id, session.id));
    }
    return { session, user };
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await db.delete(Session).where(eq(Session.id, sessionId));
  }
}

export const sessionService = SessionService.getInstance();
