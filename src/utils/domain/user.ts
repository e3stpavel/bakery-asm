import { z } from 'astro/zod'

export const userSchema = z.object({
  id: z.number().positive(),
  firstname: z.string().trim().min(1),
  lastname: z.string().trim().min(1),
  email: z.string().email(),
  password_hash: z.string().trim().min(1),
})

export const partialUserSchema = userSchema.omit({
  password_hash: true,
})

export type User = z.infer<typeof userSchema>

export type PartialUser = z.infer<typeof partialUserSchema>
