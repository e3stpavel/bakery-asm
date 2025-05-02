import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { removeAssetById } from '~/utils/data/assets'
import { assetSchema } from '~/utils/domain/asset'

export const assets = {
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
          message: 'Entity cannot be updated due to its current state.',
        })
      }
    },
  }),
}
