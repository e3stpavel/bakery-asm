import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { db, eq, Session, User } from 'astro:db'

export function generateSessionToken() {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)

  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

function createSessionId(token: string) {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
}

const USER_SESSION_EXPIRATION = 1000 * 60 * 60 * 24 * 30

export async function createSession(token: string, userId: number) {
  const sessionId = createSessionId(token)
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + USER_SESSION_EXPIRATION),
  }

  await db.insert(Session).values(session)
  return session
}

export async function validateSessionToken(token: string) {
  const sessionId = createSessionId(token)
  const result = await db
    .select({
      user: User,
      session: Session,
    })
    .from(Session)
    .innerJoin(User, eq(Session.userId, User.id))
    .where(eq(Session.id, sessionId))
    .limit(1)

  const { user, session } = result.at(0) ?? {}

  if (!(user && session)) {
    return {
      success: false as const,
    }
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(Session).where(eq(Session.id, session.id))
    return {
      success: false as const,
    }
  }

  // extend session lifespan
  if (Date.now() >= session.expiresAt.getTime() - (USER_SESSION_EXPIRATION / 2)) {
    session.expiresAt = new Date(Date.now() + USER_SESSION_EXPIRATION)
    await db
      .update(Session)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(Session.id, session.id))
  }

  return {
    success: true as const,
    data: {
      user,
      session,
    },
  }
}

export async function invalidateSession(sessionId: string) {
  await db.delete(Session).where(eq(Session.id, sessionId))
}
