import { defineMiddleware } from 'astro:middleware'
import { validateSessionToken } from '~/utils/session'

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null
  context.locals.session = null

  const token = context.cookies.get('auth_session')?.value
  if (!token)
    return next()

  const validation = await validateSessionToken(token)
  if (!validation.success) {
    context.cookies.delete('auth_session')
    return next()
  }

  const { user, session } = validation.data
  context.locals.user = user
  context.locals.session = session

  return next()
})
