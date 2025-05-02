import { z } from 'astro/zod'

export const userSchema = z.object({
  id: z.number().nonnegative(),
  firstname: z.string().trim().min(1).nullable(),
  lastname: z.string().trim().min(1).nullable(),
  email: z.string().email(),
  password_hash: z.string().trim().min(1),
})

export const partialUserSchema = userSchema.omit({
  password_hash: true,
})

export type User = z.infer<typeof userSchema>

export type PartialUser = z.infer<typeof partialUserSchema>
