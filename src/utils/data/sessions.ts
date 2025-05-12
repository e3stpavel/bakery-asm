import type { Session } from '~/utils/domain/session'
import { db } from '~/utils/db'
import { sessionSchema } from '~/utils/domain/session'
import { partialUserSchema } from '~/utils/domain/user'

export async function insertSession(session: Session) {
  await db.execute({
    sql: 'INSERT INTO sessions (session_code, user_id, expires_at) VALUES (:id, :user_id, :expires_at)',
    args: {
      ...session,
      // libsql sdk only converts to number internally (milliseconds)
      expires_at: Math.floor(session.expires_at.getTime() / 1000),
    },
  })
}

export async function findSessionById(sessionId: Session['id']) {
  const result = await db.execute({
    sql: `
      SELECT
        s.session_code AS id,
        s.user_id,
        s.expires_at,
        u.firstname,
        u.lastname,
        u.email
      FROM sessions s
      INNER JOIN users u on s.user_id = u.user_id
      WHERE s.session_code = (:sessionId)
      LIMIT 1
    `,
    args: { sessionId },
  })

  const [row] = result.rows
  if (!row)
    return null

  const user = partialUserSchema.parse({ ...row, id: row.user_id })
  const session = sessionSchema.parse(row)

  return {
    user,
    session,
  }
}

export async function updateSessionById(sessionId: Session['id'], session: Partial<Session>) {
  await db.execute({
    sql: 'UPDATE sessions SET user_id = (:user_id), expires_at = (:expires_at) WHERE session_code = (:sessionId);',
    args: { sessionId, ...session },
  })
}

export async function removeSessionById(sessionId: Session['id']) {
  await db.execute({
    sql: 'DELETE FROM sessions WHERE session_code = (:sessionId)',
    args: { sessionId },
  })
}
