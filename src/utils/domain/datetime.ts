import { z } from 'astro/zod'

export const datetimeSchema = z.number().transform(seconds => seconds * 1000).pipe(
  z.coerce.date().min(new Date('1970-01-01')).max(new Date('2100-12-31')),
)
