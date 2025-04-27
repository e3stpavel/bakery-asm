import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { findUserByEmail } from '~/utils/data/users'
import { verifyPasswordHash } from '~/utils/password'
import { createSession, generateSessionToken, invalidateSession } from '~/utils/session'

export const auth = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    handler: async ({ email, password }, context) => {
      if (context.locals.user) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'User is already signed in.',
        })
      }

      const user = await findUserByEmail(email)
      if (!user) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Invalid email or password.',
        })
      }

      const isPasswordValid = await verifyPasswordHash(user.password_hash, password)
      if (!isPasswordValid) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Invalid email or password.',
        })
      }

      const token = generateSessionToken()
      const session = await createSession(token, user.id)

      context.cookies.set('auth_session', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: import.meta.env.PROD,
        path: '/',
        expires: session.expires_at,
      })
    },
  }),

  logout: defineAction({
    handler: async (_, context) => {
      const session = context.locals.session

      if (!session) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
        })
      }

      await invalidateSession(session.id)
      context.cookies.delete('auth_session')
    },
  }),
}
