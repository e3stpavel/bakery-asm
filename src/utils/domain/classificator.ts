import { z } from 'astro/zod'

export const classificatorSchema = z.object({
  id: z.number().positive(),
  name: z.string().trim().min(1),
})

export type Category = z.infer<typeof classificatorSchema>
