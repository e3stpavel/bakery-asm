import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { removeAssetById, restoreAssetById, updateAssetDetailsById } from '~/utils/data/assets'
import { assetDetailsSchema, assetSchema } from '~/utils/domain/asset'
import { classificatorSchema } from '~/utils/domain/classificator'

export const assets = {
  edit: defineAction({
    accept: 'form',
    input: assetDetailsSchema.extend({
      assetId: assetSchema.shape.id,
      categories: z.array(classificatorSchema.shape.code),
    }),
    handler: async ({assetId, categories, ...assetDetails}, context) => {
      const user = context.locals.user

      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
        })
      }

      // TODO: ideally we'd like to return the updated asset here, 
      //  so we do not need to hit db one more time after update
      const success = await updateAssetDetailsById(assetId, assetDetails, user.id)
      if (!success) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update asset details.'
        })
      }
    },
  }),

  restore: defineAction({
    accept: 'form',
    input: z.object({
      assetId: assetSchema.shape.id,
    }),
    handler: async ({ assetId }, context) => {
      const user = context.locals.user

      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
        })
      }

      // TODO: authorization
      const success = await restoreAssetById(assetId, user.id)
      if (!success) {
        throw new ActionError({
          code: 'CONFLICT',
          message: 'Entity cannot be updated.',
        })
      }
    },
  }),

  remove: defineAction({
    accept: 'form',
    input: z.object({
      assetId: assetSchema.shape.id,
    }),
    handler: async ({ assetId }, context) => {
      const user = context.locals.user

      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
        })
      }

      // TODO: authorization
      const success = await removeAssetById(assetId, user.id)
      if (!success) {
        throw new ActionError({
          code: 'CONFLICT',
          message: 'Entity cannot be updated.',
        })
      }
    },
  }),
}
