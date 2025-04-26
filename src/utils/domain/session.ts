import { z } from 'astro/zod'
import { userSchema } from './user'

export const sessionSchema = z.object({
  id: z.string().trim().min(1),
  user_id: userSchema.shape.id,
  expires_at: z.coerce.date().min(new Date('1970-01-01')).max(new Date('2100-12-31')),
})

export type Session = z.infer<typeof sessionSchema>
