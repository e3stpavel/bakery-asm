import { db, eq, User } from 'astro:db'

export async function findUserByEmail(email: string) {
  const result = await db
    .select()
    .from(User)
    .where(eq(User.email, email))
    .limit(1)

  return result.at(0)
}
