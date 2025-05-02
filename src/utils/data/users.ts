import type { User } from '~/utils/domain/user'
import { db } from '~/utils/db'
import { userSchema } from '~/utils/domain/user'

export async function findUserByEmail(email: User['email']) {
  const result = await db.execute({
    sql: 'SELECT user_id AS id, * FROM users WHERE email = (:email) LIMIT 1',
    args: { email },
  })

  const [row] = result.rows
  if (!row)
    return null

  return userSchema.parse(row)
}
