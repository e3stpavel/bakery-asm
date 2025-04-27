import { db } from '~/utils/db'
import { userSchema } from '~/utils/domain/user'

export async function findUserByEmail(email: string) {
  const result = await db.execute({
    sql: 'SELECT * FROM Users WHERE email = (:email) LIMIT 1',
    args: { email },
  })

  const [row] = result.rows
  if (!row)
    return null

  return userSchema.parse(row)
}
