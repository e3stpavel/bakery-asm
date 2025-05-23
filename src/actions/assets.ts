import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { removeAssetCategoriesByAssetId, updateAssetCategoriesByAssetId } from '~/utils/data/asset-categories'
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
    handler: async ({ assetId, categories, ...assetDetails }, context) => {
      const user = context.locals.user

      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
        })
      }

      // TODO: ideally we'd like to return the updated asset here,
      //  so we do not need to hit db one more time after update
      const detailsUpdateSuccess = await updateAssetDetailsById(assetId, assetDetails, user.id)
      if (!detailsUpdateSuccess) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update asset details.',
        })
      }

      let categoriesUpdateSuccess
      if (categories.length === 0) {
        categoriesUpdateSuccess = await removeAssetCategoriesByAssetId(assetId, user.id)
      }
      else {
        categoriesUpdateSuccess = await updateAssetCategoriesByAssetId(assetId, categories, user.id)
      }

      if (!categoriesUpdateSuccess) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update asset categories.',
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
