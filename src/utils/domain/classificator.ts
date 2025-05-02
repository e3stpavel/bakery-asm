import { z } from 'astro/zod'

export const classificatorSchema = z.object({
  code: z.string().regex(/[A-Z]{1,5}/),
  name: z.string().trim().min(1),
})

export type Category = z.infer<typeof classificatorSchema>
