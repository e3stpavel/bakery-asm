import { z } from 'astro/zod'
import { classificatorSchema } from './classificator'
import { datetimeSchema } from './datetime'
import { userSchema } from './user'

export const assetSchema = z.object({
  id: z.string().cuid2(),
  name: z.string().trim().min(1),
  description: z.string().nullable(),
  status_code: classificatorSchema.shape.code,
  ownership_code: classificatorSchema.shape.code,
  condition_code: classificatorSchema.shape.code,
  acquired_at: datetimeSchema,
  acquisition_price: z.number().positive(),
  expected_lifespan: z.number().positive(),
  image_url: z.string().url().nullable(),
  created_by_id: userSchema.shape.id,
  updated_by_id: userSchema.shape.id,
  deleted_by_id: userSchema.shape.id.nullable(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  deleted_at: datetimeSchema.nullable(),
})

export type Asset = z.infer<typeof assetSchema>
