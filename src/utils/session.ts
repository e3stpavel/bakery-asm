import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { findSessionById, insertSession, removeSessionById, updateSessionById } from './data/sessions'

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

export async function createSession(token: string, user_id: number) {
  const sessionId = createSessionId(token)
  const session = {
    id: sessionId,
    user_id,
    expires_at: new Date(Date.now() + USER_SESSION_EXPIRATION),
  }

  await insertSession(session)
  return session
}

export async function validateSessionToken(token: string) {
  const sessionId = createSessionId(token)
  const { user, session } = await findSessionById(sessionId) ?? {}

  if (!(user && session)) {
    return {
      success: false as const,
    }
  }

  if (Date.now() >= session.expires_at.getTime()) {
    await removeSessionById(session.id)
    return {
      success: false as const,
    }
  }

  // extend session lifespan
  if (Date.now() >= session.expires_at.getTime() - (USER_SESSION_EXPIRATION / 2)) {
    session.expires_at = new Date(Date.now() + USER_SESSION_EXPIRATION)
    await updateSessionById(session.id, {
      expires_at: session.expires_at,
    })
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
  await removeSessionById(sessionId)
}
