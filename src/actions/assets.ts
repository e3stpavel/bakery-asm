import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { removeAssetById } from '~/utils/data/assets'

export const assets = {
  remove: defineAction({
    accept: 'form',
    input: z.object({
      assetId: z.coerce.number().gt(0),
    }),
    handler: async ({ assetId }, context) => {
      if (context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
        })
      }

      await removeAssetById(assetId)
    },
  }),
}
