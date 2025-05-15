import { z } from 'astro/zod'
import { datetimeSchema } from './datetime'
import { userSchema } from './user'

export const sessionSchema = z.object({
  id: z.string().trim().min(1),
  user_id: userSchema.shape.id,
  expires_at: datetimeSchema,
})

export type Session = z.infer<typeof sessionSchema>
