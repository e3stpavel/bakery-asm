import { z } from 'astro/zod'

export const classificatorSchema = z.object({
  id: z.number().nonnegative(),
  name: z.string().trim().min(1),
})

export type Category = z.infer<typeof classificatorSchema>
